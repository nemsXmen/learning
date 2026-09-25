---
id: javascript-couches-et-modules
title: "Architecture en couches, architecture modulaire et frontières de dépendances"
slug: couches-et-modules
technology: javascript
level: advanced
module: architecture-applicative
order: 1
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-composition-et-inversion-des-dependances
  - javascript-modules-cycles
skills:
  - js-layered-modular
tags:
  - javascript
  - architecture
---

## Objectifs

- Décrire une architecture en couches, et la règle qui régit ses dépendances.
- Découper une application en modules métier, avec une interface publique et des détails privés.
- Combiner les deux : des modules par fonctionnalité, des couches à l'intérieur.
- Faire respecter les frontières automatiquement, plutôt que par la seule discipline.

## Introduction

Une **architecture**, c'est l'ensemble des décisions difficiles à changer plus tard : comment le code est découpé, et qui
a le droit de dépendre de qui. Un petit projet peut s'en passer ; une application qui grandit pendant des années, avec
plusieurs développeurs, finit sinon en « grande boule de boue », où tout dépend de tout et où chaque changement en
casse un autre.

Deux découpages dominent. Le découpage **horizontal**, en couches techniques : présentation, application, domaine,
infrastructure. Le découpage **vertical**, en modules métier : catalogue, commandes, facturation. Les applications
robustes combinent les deux, et surtout, elles font respecter les frontières.

## Concept

| Couche | Contient | Dépend de |
| --- | --- | --- |
| présentation, ou interface | routes HTTP, commandes en ligne, sérialisation des réponses | application |
| application | cas d'utilisation : orchestrer, autoriser, gérer les transactions | domaine |
| domaine | entités, règles métier, valeurs, événements | rien d'extérieur |
| infrastructure | base de données, e-mail, fichiers, API externes | domaine, pour en implémenter les contrats |

**La règle des dépendances** : une couche ne dépend que des couches plus proches du domaine. Le domaine, au centre, ne
dépend de rien de technique. L'infrastructure implémente les contrats que le domaine et l'application déclarent : c'est
l'inversion des dépendances vue plus tôt.

| Module métier | |
| --- | --- |
| interface publique | un fichier d'entrée, `index.js`, qui exporte ce que les autres modules peuvent utiliser |
| détails privés | tout le reste : entités, dépôts, adaptateurs internes |
| communication | par l'interface publique, ou par des événements, jamais en important un fichier interne |
| données | chaque module possède ses données ; les autres les demandent, ne les lisent pas directement |

## Exemple

Une boutique organisée en modules métier, avec des couches à l'intérieur de chacun :

```text
src/
├── catalogue/
│   ├── index.js              interface publique : rechercherProduits, produitParId
│   ├── domaine/produit.js
│   ├── application/rechercher.js
│   └── infrastructure/depot-produits-sql.js
├── commandes/
│   ├── index.js              interface publique : passerCommande, commandesDuClient
│   ├── domaine/commande.js
│   ├── application/passer-commande.js
│   ├── infrastructure/depot-commandes-sql.js
│   └── http/routes.js
└── partage/                  configuration, journalisation, erreurs communes
```

Les règles s'écrivent comme des données, et un script les vérifie à partir des imports de chaque fichier :

```js
// verifier-frontieres.js
const ORDRE_DES_COUCHES = ['domaine', 'application', 'infrastructure', 'http'];

function decrire(chemin) {
  const [, module, couche] = chemin.split('/'); // 'src/commandes/domaine/commande.js'
  return { module, couche: ORDRE_DES_COUCHES.includes(couche) ? couche : 'index' };
}

export function violations(importsParFichier) {
  const erreurs = [];
  for (const [fichier, imports] of Object.entries(importsParFichier)) {
    const source = decrire(fichier);
    for (const cible of imports) {
      const destination = decrire(cible);
      if (destination.module === 'partage') continue;

      if (destination.module !== source.module) {
        // Entre modules : seulement par l'interface publique.
        if (destination.couche !== 'index') {
          erreurs.push(`${fichier} importe un fichier interne de « ${destination.module} » : ${cible}`);
        }
        continue;
      }
      // Dans un module : le domaine n'importe que le domaine, l'application pas l'infrastructure ni HTTP.
      const interdit =
        (source.couche === 'domaine' && destination.couche !== 'domaine') ||
        (source.couche === 'application' && ['infrastructure', 'http'].includes(destination.couche));
      if (interdit) erreurs.push(`${fichier} (${source.couche}) ne doit pas dépendre de ${cible} (${destination.couche})`);
    }
  }
  return erreurs;
}

console.log(
  violations({
    'src/commandes/application/passer-commande.js': ['src/commandes/domaine/commande.js', 'src/catalogue/index.js'],
    'src/commandes/domaine/commande.js': ['src/commandes/infrastructure/depot-commandes-sql.js'],
    'src/commandes/http/routes.js': ['src/catalogue/infrastructure/depot-produits-sql.js'],
  }),
);
// [
//   'src/commandes/domaine/commande.js (domaine) ne doit pas dépendre de src/commandes/infrastructure/depot-commandes-sql.js (infrastructure)',
//   'src/commandes/http/routes.js importe un fichier interne de « catalogue » : src/catalogue/infrastructure/depot-produits-sql.js'
// ]
```

La première dépendance est autorisée : l'application utilise son domaine, et le catalogue par son interface publique.
Les deux autres sont refusées, et le script, lancé en intégration continue, fait échouer la vérification.

## Comment ça fonctionne

**Pourquoi des couches.** Chaque couche a une raison de changer différente : l'interface change avec le design ou le
protocole, l'infrastructure avec les choix techniques, le domaine avec les règles du métier. En les séparant, et en
orientant les dépendances vers le domaine, on protège la partie la plus précieuse du code : les règles métier se
testent sans base ni serveur, et survivent à un changement de framework.

**Couches strictes ou souples.** Dans une architecture stricte, une couche n'utilise que la couche immédiatement
inférieure. En pratique, on accepte souvent qu'une route HTTP appelle un cas d'utilisation qui utilise le domaine, mais
jamais qu'une route lise directement la base en contournant l'application. L'important est la direction : aucune
flèche ne remonte vers l'interface, et le domaine ne dépend d'aucune technologie.

**Le piège des couches seules.** Une application découpée uniquement en `controllers/`, `services/`, `repositories/`
disperse chaque fonctionnalité dans tous les dossiers : c'est une faible cohésion, vue plus tôt. Et chaque service
peut appeler n'importe quel dépôt : les frontières métier n'existent pas. Les modules verticaux y remédient.

**Des modules métier.** Un module regroupe tout ce qui concerne une capacité métier : ses règles, ses cas
d'utilisation, son stockage, ses routes. Il expose une interface publique réduite, son `index.js`, et garde le reste
privé. Le module `commandes` demande au catalogue un produit par `produitParId`, il ne lit pas la table des produits.
Ainsi, le catalogue peut changer sa base, son cache ou son modèle interne sans casser les commandes. Une application
organisée ainsi, déployée en un seul processus, est un **monolithe modulaire** : il a la simplicité de déploiement d'un
monolithe, et des frontières assez nettes pour extraire un module en service séparé le jour où ce sera nécessaire.

**Faire respecter les frontières.** Une règle d'architecture qui n'est vérifiée que par la revue de code finit par être
contournée, un soir de livraison. On la vérifie automatiquement : un script comme celui de l'exemple, qui lit les
imports ; des outils dédiés, comme `dependency-cruiser` ou la règle `import/no-restricted-paths` d'ESLint ; ou, dans
un monorepo, des paquets séparés dont les dépendances sont déclarées dans le `package.json`. La violation devient une
erreur de build, et on la corrige au moment où elle apparaît.

**Le dossier `partage`.** Le code vraiment transversal, configuration, journalisation, types d'erreur communs, peut être
importé partout. On le garde petit : dès qu'une règle métier s'y glisse, elle appartient à un module.

## Erreurs fréquentes

**Un domaine qui importe l'infrastructure.** Une entité qui appelle la base ou `fetch` ne se teste plus seule, et lie les
règles métier à une technologie.

**Des routes qui lisent directement la base.** Les règles du cas d'utilisation sont contournées.

**Importer un fichier interne d'un autre module.** Le module ne peut plus évoluer ; passe par son interface publique.

**Organiser uniquement par couche technique.** Chaque fonctionnalité est dispersée dans quatre dossiers.

**Un module qui lit les tables d'un autre.** Les données appartiennent à leur module ; demande-les par son interface.

**Des règles d'architecture seulement écrites dans un document.** Vérifie-les dans l'intégration continue.

**Un dossier `partage` qui grossit sans fin.** Il redevient un `utils.js` ; renvoie la logique métier dans son module.

## À retenir

- Couches : présentation, application, domaine, infrastructure ; les dépendances vont vers le domaine.
- Le domaine ne dépend d'aucune technologie ; l'infrastructure implémente ses contrats.
- Modules métier : une interface publique réduite, des détails privés, des données possédées.
- Des modules par fonctionnalité, des couches à l'intérieur : c'est le monolithe modulaire.
- Les frontières se vérifient automatiquement, par un script, un outil ou des paquets séparés.

## Exercices

1. Classe chaque élément dans sa couche : domaine, application, infrastructure ou présentation.
   - a) La règle « une commande ne peut plus être modifiée après expédition ».
   - b) Le gestionnaire de `POST /commandes` qui lit le corps JSON et renvoie 201.
   - c) La fonction qui enregistre une commande dans PostgreSQL.
   - d) « Passer une commande » : vérifier le stock, calculer le total, enregistrer, publier `CommandePassee`.
   - e) Le client de l'API du transporteur qui calcule les délais de livraison.
   - f) Le calcul du montant de TVA d'une ligne.

   :::indice
   Qui change quand le métier change ? Quand la technologie change ? Quand le protocole change ?
   :::

   :::solution
   - a) Domaine : une règle métier, indépendante de toute technologie.
   - b) Présentation : elle traduit HTTP vers le cas d'utilisation, et son résultat vers HTTP.
   - c) Infrastructure : elle implémente le contrat du dépôt de commandes avec une technologie précise.
   - d) Application : un cas d'utilisation qui orchestre le domaine et les contrats.
   - e) Infrastructure : un adaptateur vers un service externe, derrière un contrat comme `delaisDeLivraison(adresse)`.
   - f) Domaine : un calcul métier pur.
   :::

2. Étends `violations` avec une règle supplémentaire : la couche `http` d'un module ne doit pas importer son
   `infrastructure` directement, elle doit passer par `application`. Ajoute un cas qui la viole, et vérifie qu'un cas
   autorisé ne produit aucune erreur.

   :::indice
   Une condition de plus dans le calcul de `interdit`.
   :::

   :::solution
   ```js
   const ORDRE_DES_COUCHES = ['domaine', 'application', 'infrastructure', 'http'];

   function decrire(chemin) {
     const [, module, couche] = chemin.split('/');
     return { module, couche: ORDRE_DES_COUCHES.includes(couche) ? couche : 'index' };
   }

   function violations(importsParFichier) {
     const erreurs = [];
     for (const [fichier, imports] of Object.entries(importsParFichier)) {
       const source = decrire(fichier);
       for (const cible of imports) {
         const destination = decrire(cible);
         if (destination.module === 'partage') continue;
         if (destination.module !== source.module) {
           if (destination.couche !== 'index') erreurs.push(`${fichier} → interne de ${destination.module}`);
           continue;
         }
         const interdit =
           (source.couche === 'domaine' && destination.couche !== 'domaine') ||
           (source.couche === 'application' && ['infrastructure', 'http'].includes(destination.couche)) ||
           (source.couche === 'http' && destination.couche === 'infrastructure');
         if (interdit) erreurs.push(`${fichier} (${source.couche}) → ${cible} (${destination.couche})`);
       }
     }
     return erreurs;
   }

   console.log(violations({ 'src/commandes/http/routes.js': ['src/commandes/infrastructure/depot-commandes-sql.js'] }));
   // [ 'src/commandes/http/routes.js (http) → src/commandes/infrastructure/depot-commandes-sql.js (infrastructure)' ]
   console.log(
     violations({
       'src/commandes/http/routes.js': ['src/commandes/application/passer-commande.js', 'src/partage/erreurs.js'],
     }),
   );
   // []
   ```

   Qui assemble alors l'application et l'infrastructure ? La racine de composition, hors des modules, qui a le droit
   de tout importer.
   :::

3. Le module `facturation` doit connaître le total et le client d'une commande pour produire une facture. Aujourd'hui,
   il lit directement la table `commandes`. Propose deux façons de faire communiquer les deux modules proprement, avec
   leurs avantages.

   :::indice
   Une question synchrone à l'interface publique, ou une réaction à un événement.
   :::

   :::solution
   - **Par l'interface publique**, de façon synchrone : le module `commandes` exporte `resumePourFacturation(id)`, qui
     renvoie `{ id, clientId, total, lignes }`. La facturation l'appelle quand elle en a besoin. C'est simple et
     toujours à jour, mais la facturation dépend de la disponibilité du module `commandes` à ce moment-là.
   - **Par un événement** : quand une commande est payée, le module `commandes` publie `CommandePayee` avec les données
     nécessaires, et la facturation y réagit en créant la facture, en gardant sa propre copie des informations utiles.
     Les modules sont plus découplés, et la facturation fonctionne même si `commandes` évolue ; en contrepartie, les
     données sont copiées, et le flux se lit moins directement dans le code.

   Dans les deux cas, la facturation ne connaît plus le schéma de la table `commandes`, qui peut changer librement.
   :::

## Questions d'entretien

- Décris une architecture en couches, et la règle de dépendance qui la régit.

  :::indice
  Quatre couches, et une direction.
  :::

  :::reponse
  On sépare la présentation, qui parle HTTP ou la ligne de commande ; l'application, qui orchestre les cas
  d'utilisation ; le domaine, qui porte les règles métier ; et l'infrastructure, qui parle à la base, aux fichiers et aux
  services externes. Les dépendances du code vont vers le domaine : la présentation utilise l'application, l'application
  utilise le domaine, et l'infrastructure implémente les contrats déclarés par le domaine ou l'application. Le domaine ne
  dépend d'aucune technologie : il se teste seul, et survit aux changements techniques.
  :::

- Qu'est-ce qu'un monolithe modulaire ?

  :::indice
  Un déploiement, plusieurs modules aux frontières nettes.
  :::

  :::reponse
  C'est une application déployée d'un seul bloc, mais découpée en modules métier aux frontières nettes : chacun a son
  interface publique, ses détails privés et ses propres données, et les autres modules ne communiquent avec lui que par
  cette interface ou par des événements. On garde la simplicité d'un monolithe, un seul déploiement, des appels en
  mémoire, des transactions simples, tout en évitant l'enchevêtrement. Et si un module doit un jour devenir un service
  séparé, ses frontières existent déjà.
  :::

- Comment faire respecter des règles d'architecture dans une équipe ?

  :::indice
  La revue de code ne suffit pas.
  :::

  :::reponse
  En les rendant vérifiables automatiquement : un outil comme `dependency-cruiser`, des règles ESLint sur les chemins
  d'import, un script maison qui analyse les imports, ou des paquets séparés dans un monorepo, dont les dépendances
  sont déclarées. La vérification tourne dans l'intégration continue, et une violation fait échouer le build. Les règles
  sont documentées avec leur raison, et on accepte de les faire évoluer, mais par une décision explicite, pas par un
  contournement discret.
  :::
