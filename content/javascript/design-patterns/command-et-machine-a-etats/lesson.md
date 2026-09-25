---
id: javascript-command-et-machine-a-etats
title: "Command et machines à états"
slug: command-et-machine-a-etats
technology: javascript
level: advanced
module: design-patterns
order: 2
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-strategie-observateur
  - javascript-responsabilite-cohesion-couplage
skills:
  - js-command-state-machine
tags:
  - javascript
  - architecture
  - design-patterns
---

## Objectifs

- Représenter une action comme un objet avec le pattern *Command*, pour l'annuler, la rejouer ou la mettre en file.
- Écrire un historique d'annulation et de rétablissement.
- Modéliser un cycle de vie avec une machine à états explicite : états, événements, transitions autorisées.
- Rendre les états impossibles impossibles à représenter.
- Savoir quand une bibliothèque comme XState devient utile.

## Introduction

Deux questions reviennent dans toutes les applications. La première : « peut-on annuler ? ». Annuler la dernière
modification d'un document, rejouer une action qui a échoué, garder la trace de ce qui a été fait. Tant que les actions
sont des appels de fonctions dispersés, c'est impossible. Le pattern **Command** en fait des objets, qu'on peut
stocker, annuler et rejouer.

La seconde : « dans quel état est cette commande, et que peut-il lui arriver ? ». Une commande payée peut être expédiée,
mais pas une commande annulée. Quand ces règles sont réparties dans des `if` sur des booléens, `estPayee`,
`estAnnulee`, `estExpediee`, des combinaisons absurdes finissent par apparaître. Une **machine à états** rend le cycle de
vie explicite.

## Concept

| Command | |
| --- | --- |
| une commande | un objet qui sait `executer()` et, si possible, `annuler()` |
| l'invocateur | exécute les commandes et garde l'historique |
| l'historique | une pile pour annuler, une autre pour rétablir |
| usages | annuler et rétablir, file de tâches, réessais, journal d'audit, macros |

| Machine à états | |
| --- | --- |
| états | une liste finie : `brouillon`, `payee`, `expediee`, `livree`, `annulee` |
| événements | ce qui arrive : `PAYER`, `EXPEDIER`, `LIVRER`, `ANNULER` |
| transitions | pour chaque état, les événements acceptés et l'état d'arrivée |
| gardes | des conditions supplémentaires sur une transition |
| états finaux | `livree`, `annulee` : plus aucun événement accepté |

## Exemple

**Command** : un éditeur de liste de courses, avec annulation et rétablissement.

```js
function commandeAjouter(liste, article) {
  return {
    libelle: `ajouter ${article}`,
    executer: () => liste.push(article),
    annuler: () => liste.splice(liste.lastIndexOf(article), 1),
  };
}

function commandeRenommer(liste, index, nouveau) {
  const ancien = liste[index];
  return {
    libelle: `renommer ${ancien} en ${nouveau}`,
    executer: () => (liste[index] = nouveau),
    annuler: () => (liste[index] = ancien),
  };
}

function creerHistorique() {
  const faites = [];
  const annulees = [];
  return {
    executer(commande) {
      commande.executer();
      faites.push(commande);
      annulees.length = 0; // une nouvelle action efface ce qu'on pouvait rétablir
    },
    annuler() {
      const commande = faites.pop();
      if (!commande) return;
      commande.annuler();
      annulees.push(commande);
    },
    retablir() {
      const commande = annulees.pop();
      if (!commande) return;
      commande.executer();
      faites.push(commande);
    },
    journal: () => faites.map((c) => c.libelle),
  };
}

const liste = [];
const historique = creerHistorique();
historique.executer(commandeAjouter(liste, 'pain'));
historique.executer(commandeAjouter(liste, 'lait'));
historique.executer(commandeRenommer(liste, 1, 'lait d’avoine'));
console.log(liste); // [ 'pain', 'lait d’avoine' ]
historique.annuler();
historique.annuler();
console.log(liste); // [ 'pain' ]
historique.retablir();
console.log(liste, historique.journal()); // [ 'pain', 'lait' ] [ 'ajouter pain', 'ajouter lait' ]
```

**Machine à états** : le cycle de vie d'une commande client.

```js
const TRANSITIONS = {
  brouillon: { PAYER: 'payee', ANNULER: 'annulee' },
  payee: { EXPEDIER: 'expediee', ANNULER: 'annulee' },
  expediee: { LIVRER: 'livree' },
  livree: {},
  annulee: {},
};

function transition(etat, evenement) {
  const suivant = TRANSITIONS[etat]?.[evenement];
  if (!suivant) {
    throw new Error(`Événement ${evenement} impossible dans l'état ${etat}`);
  }
  return suivant;
}

let etat = 'brouillon';
for (const evenement of ['PAYER', 'EXPEDIER', 'LIVRER']) {
  etat = transition(etat, evenement);
  console.log(evenement, '→', etat);
}
// PAYER → payee
// EXPEDIER → expediee
// LIVRER → livree

try {
  transition('expediee', 'ANNULER');
} catch (erreur) {
  console.log(erreur.message); // Événement ANNULER impossible dans l'état expediee
}
console.log(Object.keys(TRANSITIONS.payee)); // [ 'EXPEDIER', 'ANNULER' ] : les actions à proposer à l'écran
```

## Comment ça fonctionne

**Une action devient une donnée.** Une commande regroupe ce qu'il faut pour agir, et pour défaire. L'historique n'a pas
besoin de connaître les types de commandes : il appelle `executer` et `annuler`. Ajouter une nouvelle action annulable,
c'est écrire une nouvelle commande, sans toucher à l'historique. Chaque commande capture ce dont elle aura besoin pour
annuler, comme l'ancien nom dans `commandeRenommer`, au moment où on la crée.

**Les règles de l'historique.** Annuler dépile la dernière commande faite et la place sur la pile à rétablir ; rétablir
fait l'inverse. Une nouvelle action vide la pile à rétablir : on ne peut pas rétablir une branche d'historique
abandonnée. On borne souvent la taille de l'historique pour limiter la mémoire.

**Au-delà de l'annulation.** Une commande qui ne sait pas s'annuler reste utile : on peut la mettre en file pour
l'exécuter plus tard, la réessayer après un échec, la journaliser pour l'audit, ou en grouper plusieurs dans une macro.
Sous forme de simple donnée, `{ type: 'AJOUTER_ARTICLE', sku, quantite }`, elle peut même traverser le réseau ou être
stockée : c'est l'idée des actions de Redux et des files de messages. Un gestionnaire par type l'exécute.

**Une machine à états rend le cycle de vie visible.** Toute la règle tient dans la table `TRANSITIONS` : on la lit, on
la relit en revue, on peut la dessiner. Un événement non prévu est refusé explicitement, au lieu de produire un état
incohérent. Et la table répond à la question de l'interface : quelles actions afficher pour cette commande ?
`Object.keys(TRANSITIONS[etat])`.

**Des états impossibles, impossibles à représenter.** Avec trois booléens, `estPayee`, `estExpediee`, `estAnnulee`, il
existe huit combinaisons, dont certaines absurdes : expédiée mais pas payée, annulée et livrée. Avec un seul champ
`statut` parmi cinq valeurs, elles n'existent pas. Le même principe vaut pour l'état d'un chargement : plutôt que
`chargement`, `erreur` et `donnees` indépendants, un objet `{ statut: 'chargement' }`, `{ statut: 'erreur', erreur }` ou
`{ statut: 'succes', donnees }`. Chaque état ne porte que les données qui ont un sens pour lui.

**Gardes et actions.** Une transition peut dépendre d'une condition : on ne peut expédier que si l'adresse est
complète. On l'exprime comme une garde, vérifiée avant la transition. Et une transition peut déclencher des effets :
envoyer un e-mail à l'expédition. On garde la fonction de transition pure, et on déclenche les effets après, selon
l'état d'arrivée, ce qui la rend triviale à tester.

**Quand une bibliothèque ?** Pour quelques états, une table suffit. Quand apparaissent des états imbriqués, des états
parallèles, des délais, des appels asynchrones à orchestrer, une bibliothèque comme XState fournit un format de
description standard, des outils de visualisation et de test.

## Erreurs fréquentes

**Une commande qui ne capture pas de quoi s'annuler.** Si `annuler` lit l'état au moment de l'annulation, il est déjà
modifié ; capture l'ancienne valeur à la création.

**Oublier de vider la pile à rétablir.** Rétablir après une nouvelle action produit un état incohérent.

**Des booléens pour un cycle de vie.** Ils permettent des combinaisons impossibles ; un seul champ d'état les exclut.

**Des transitions dispersées dans le code.** Chaque `if (commande.statut === …)` est une règle cachée ; centralise dans
la table.

**Accepter silencieusement un événement invalide.** Ignorer `ANNULER` sur une commande livrée cache un bug ; refuse-le
explicitement.

**Mettre les effets dans la fonction de transition.** Garde-la pure, et déclenche les effets selon le résultat.

## À retenir

- Command : une action devient un objet avec `executer` et `annuler`, stockable et rejouable.
- Historique : deux piles ; une nouvelle action vide la pile à rétablir.
- Machine à états : états finis, événements, table des transitions autorisées, refus explicite du reste.
- Un seul champ d'état plutôt que des booléens : les états impossibles disparaissent.
- Transitions pures, effets déclenchés après ; les gardes conditionnent une transition.
- XState pour les machines complexes : états imbriqués, parallèles, délais.

## Exercices

1. Ajoute à l'éditeur une commande `commandeSupprimer(liste, index)` annulable, qui remet l'article à sa place exacte.
   Vérifie avec une suite : ajouter `pain`, `lait`, `oeufs`, supprimer `lait`, annuler, rétablir.

   :::indice
   Capture l'article et son index à la création ; `splice` pour retirer et pour réinsérer.
   :::

   :::solution
   ```js
   function commandeSupprimer(liste, index) {
     const article = liste[index];
     return {
       libelle: `supprimer ${article}`,
       executer: () => liste.splice(index, 1),
       annuler: () => liste.splice(index, 0, article),
     };
   }

   function creerHistorique() {
     const faites = [];
     const annulees = [];
     return {
       executer(c) { c.executer(); faites.push(c); annulees.length = 0; },
       annuler() { const c = faites.pop(); if (c) { c.annuler(); annulees.push(c); } },
       retablir() { const c = annulees.pop(); if (c) { c.executer(); faites.push(c); } },
     };
   }

   const liste = ['pain', 'lait', 'oeufs'];
   const historique = creerHistorique();
   historique.executer(commandeSupprimer(liste, 1));
   console.log(liste); // [ 'pain', 'oeufs' ]
   historique.annuler();
   console.log(liste); // [ 'pain', 'lait', 'oeufs' ]
   historique.retablir();
   console.log(liste); // [ 'pain', 'oeufs' ]
   ```

   L'index est capturé à la création : l'annulation réinsère au même endroit, et non à la fin. Cela suppose que les
   commandes sont annulées dans l'ordre inverse de leur exécution, ce que garantit la pile.
   :::

2. Remplace ces trois booléens par un état unique, et écris la fonction `afficher(etat)` qui renvoie le texte à
   montrer. Montre qu'un état absurde de l'ancienne version n'est plus représentable.

   ```js
   let chargement = false;
   let erreur = null;
   let produits = [];
   ```

   :::indice
   Trois formes d'objet, distinguées par un champ `statut`, plus un état initial.
   :::

   :::solution
   ```js
   // { statut: 'inactif' } | { statut: 'chargement' } | { statut: 'erreur', message } | { statut: 'succes', produits }

   function afficher(etat) {
     switch (etat.statut) {
       case 'inactif':
         return 'Lancez une recherche.';
       case 'chargement':
         return 'Chargement…';
       case 'erreur':
         return `Erreur : ${etat.message}`;
       case 'succes':
         return etat.produits.length === 0 ? 'Aucun produit.' : `${etat.produits.length} produit(s)`;
       default:
         throw new Error(`État inconnu : ${etat.statut}`);
     }
   }

   console.log(afficher({ statut: 'chargement' })); // Chargement…
   console.log(afficher({ statut: 'succes', produits: [{ id: 1 }] })); // 1 produit(s)
   console.log(afficher({ statut: 'erreur', message: 'réseau' })); // Erreur : réseau
   ```

   Dans l'ancienne version, `chargement = true` avec `erreur` renseignée et des produits affichés était possible :
   quel message montrer ? Ici, un objet n'a qu'un statut, et chaque statut ne porte que ses données : il n'y a pas
   d'erreur dans un état « chargement ». En TypeScript, cette union se déclare comme un type discriminé, et le
   compilateur vérifie que chaque cas est traité.
   :::

3. Ajoute à la machine des commandes une garde : l'événement `EXPEDIER` n'est accepté que si la commande a une adresse
   complète (`adresse.rue`, `adresse.codePostal`, `adresse.ville`). Écris `transition(commande, evenement)`, pure, qui
   renvoie une nouvelle commande, et un appel qui déclenche l'e-mail d'expédition seulement quand le statut devient
   `expediee`.

   :::indice
   La table peut associer à un événement un objet `{ cible, garde }`. Les effets viennent après, dans une autre
   fonction.
   :::

   :::solution
   ```js
   const adresseComplete = ({ adresse }) => Boolean(adresse?.rue && adresse?.codePostal && adresse?.ville);

   const TRANSITIONS = {
     brouillon: { PAYER: { cible: 'payee' }, ANNULER: { cible: 'annulee' } },
     payee: { EXPEDIER: { cible: 'expediee', garde: adresseComplete }, ANNULER: { cible: 'annulee' } },
     expediee: { LIVRER: { cible: 'livree' } },
     livree: {},
     annulee: {},
   };

   function transition(commande, evenement) {
     const regle = TRANSITIONS[commande.statut]?.[evenement];
     if (!regle) throw new Error(`${evenement} impossible dans l'état ${commande.statut}`);
     if (regle.garde && !regle.garde(commande)) {
       throw new Error(`${evenement} refusé : condition non remplie`);
     }
     return { ...commande, statut: regle.cible };
   }

   async function traiter(commande, evenement, { envoyerEmail }) {
     const suivante = transition(commande, evenement);
     if (suivante.statut === 'expediee' && commande.statut !== 'expediee') {
       await envoyerEmail(suivante.email, 'Votre commande est en route.');
     }
     return suivante;
   }

   const envoyes = [];
   const effets = { envoyerEmail: async (a, m) => envoyes.push(`${a} : ${m}`) };
   const sansAdresse = { id: 'c1', statut: 'payee', email: 'ana@exemple.fr', adresse: { rue: '1 rue Neuve' } };

   await traiter(sansAdresse, 'EXPEDIER', effets).catch((e) => console.log(e.message));
   // EXPEDIER refusé : condition non remplie
   const complete = { ...sansAdresse, adresse: { rue: '1 rue Neuve', codePostal: '69001', ville: 'Lyon' } };
   console.log((await traiter(complete, 'EXPEDIER', effets)).statut, envoyes);
   // expediee [ 'ana@exemple.fr : Votre commande est en route.' ]
   ```

   `transition` reste pure : elle se teste sans e-mail ni base. `traiter` décide des effets à partir du résultat.
   :::

## Questions d'entretien

- À quoi sert le pattern Command ?

  :::indice
  Que peut-on faire d'une action quand elle devient un objet ?
  :::

  :::reponse
  Il transforme une action en objet qui contient ce qu'il faut pour l'exécuter, et souvent pour l'annuler. On peut
  alors la stocker, l'annuler et la rétablir avec un historique, la mettre en file pour plus tard, la réessayer après un
  échec, la journaliser pour l'audit, ou en composer plusieurs en macro. L'invocateur ne connaît que l'interface
  `executer` et `annuler` : ajouter une action ne le modifie pas. Sous forme de donnée sérialisable, c'est aussi le
  principe des actions Redux ou des messages dans une file.
  :::

- Pourquoi modéliser un cycle de vie avec une machine à états plutôt qu'avec des booléens ?

  :::indice
  Combien de combinaisons permettent trois booléens ?
  :::

  :::reponse
  Trois booléens permettent huit combinaisons, dont plusieurs n'ont aucun sens métier, comme « annulée et livrée ». Le
  code finit par les produire, par un chemin qu'on n'avait pas prévu. Une machine à états n'autorise qu'un état à la
  fois, parmi une liste finie, et centralise les transitions permises dans une table qu'on peut lire, tester et
  dessiner. Les événements invalides sont refusés explicitement, et l'interface sait quelles actions proposer dans
  chaque état.
  :::

- Qu'entend-on par « rendre les états impossibles impossibles à représenter » ?

  :::indice
  Pense à `chargement`, `erreur` et `donnees`.
  :::

  :::reponse
  C'est choisir une structure de données où les combinaisons invalides ne peuvent pas exister, plutôt que de vérifier
  partout qu'elles n'arrivent pas. Au lieu de trois champs indépendants, `chargement`, `erreur` et `donnees`, on
  utilise une union d'états, chacun avec un `statut` et seulement les données qui ont un sens pour lui. Le code qui
  consomme l'état traite chaque cas explicitement, et en TypeScript, le compilateur vérifie qu'aucun cas n'est oublié.
  :::
