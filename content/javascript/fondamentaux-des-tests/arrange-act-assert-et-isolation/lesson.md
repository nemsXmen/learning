---
id: javascript-aaa-isolation
title: "Arrange, Act, Assert et isolation des tests"
slug: arrange-act-assert-et-isolation
technology: javascript
level: intermediate
module: fondamentaux-des-tests
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-pourquoi-tester
skills:
  - test-structure
tags:
  - javascript
  - tests
---

## Objectifs

- Structurer chaque test en trois temps : préparer, agir, vérifier.
- Écrire un test par comportement, avec un nom qui décrit ce comportement.
- Isoler les tests les uns des autres : aucun état partagé, aucun ordre imposé.
- Rendre un test déterministe en maîtrisant le temps et le hasard.

## Introduction

Un test qu'on ne comprend pas est un test qu'on finit par supprimer, ou par « corriger » en changeant la valeur
attendue. Un test qui passe seul mais échoue avec les autres fait perdre des heures. Un test qui échoue une fois sur
dix apprend à l'équipe à ignorer le rouge. Ces trois problèmes ont des remèdes simples et systématiques : une structure
lisible, des tests indépendants et des résultats reproductibles.

## Concept

| Principe | Règle | Symptôme quand il manque |
| --- | --- | --- |
| Arrange / Act / Assert | préparer les données, exécuter une action, vérifier le résultat | test long où l'on ne voit pas ce qui est testé |
| Un comportement par test | un nom qui dit la règle vérifiée | échec qui ne dit pas ce qui est cassé |
| Isolation | chaque test crée son propre état | test qui dépend de l'ordre ou d'un autre test |
| Déterminisme | temps, hasard et réseau sont contrôlés | test instable, vert puis rouge sans modification |
| Données minimales | seules les données utiles au cas testé | bruit qui cache la cause |

## Exemple

```js
import { describe, it, expect, beforeEach } from 'vitest';

function creerCompteur({ horloge, limite }) {
  const tentatives = new Map();
  return {
    enregistrerEchec(email) {
      const maintenant = horloge();
      const recentes = (tentatives.get(email) ?? []).filter((date) => maintenant - date < 60_000);
      tentatives.set(email, [...recentes, maintenant]);
    },
    estBloque(email) {
      const maintenant = horloge();
      const recentes = (tentatives.get(email) ?? []).filter((date) => maintenant - date < 60_000);
      return recentes.length >= limite;
    },
  };
}

describe('compteur de tentatives de connexion', () => {
  let maintenant;
  let compteur;

  beforeEach(() => {
    // Un état neuf pour chaque test, et une horloge que le test contrôle.
    maintenant = 1_000_000;
    compteur = creerCompteur({ horloge: () => maintenant, limite: 3 });
  });

  it('bloque après trois échecs en moins d’une minute', () => {
    // Arrange
    compteur.enregistrerEchec('ada@exemple.fr');
    compteur.enregistrerEchec('ada@exemple.fr');
    // Act
    compteur.enregistrerEchec('ada@exemple.fr');
    // Assert
    expect(compteur.estBloque('ada@exemple.fr')).toBe(true);
  });

  it('débloque une minute après les échecs', () => {
    for (let i = 0; i < 3; i += 1) compteur.enregistrerEchec('ada@exemple.fr');

    maintenant += 60_000;

    expect(compteur.estBloque('ada@exemple.fr')).toBe(false);
  });

  it('compte les échecs séparément pour chaque email', () => {
    for (let i = 0; i < 3; i += 1) compteur.enregistrerEchec('ada@exemple.fr');

    const bloque = compteur.estBloque('alan@exemple.fr');

    expect(bloque).toBe(false);
  });
});
```

## Comment ça fonctionne

**Arrange, Act, Assert** découpe un test en trois blocs séparés par une ligne vide. *Arrange* met le système dans
l'état voulu ; *Act* exécute **une** action, celle qu'on teste ; *Assert* vérifie le résultat. Le lecteur voit
immédiatement quelle action est testée et ce qu'on attend d'elle. Les commentaires `// Arrange` du premier test sont
pédagogiques : dans les tests suivants, les lignes vides suffisent. Quand un test enchaîne plusieurs actions et
plusieurs vérifications, c'est généralement qu'il contient plusieurs tests.

Le **nom** du test décrit une règle, pas une méthode : « débloque une minute après les échecs » plutôt que « test
estBloque 2 ». En cas d'échec, le rapport dit alors quelle règle métier est cassée. Plusieurs `expect` dans un même
test restent acceptables s'ils vérifient ensemble le même comportement.

L'**isolation** signifie que chaque test peut s'exécuter seul, dans n'importe quel ordre, et donner le même résultat.
Si `compteur` était créé une seule fois au niveau du `describe`, le deuxième test hériterait des trois échecs du
premier : il passerait ou échouerait selon l'ordre d'exécution. `beforeEach` recrée l'état avant chaque test.
Vitest isole déjà chaque **fichier** — chacun a ses propres modules chargés — et exécute les fichiers en parallèle,
mais les tests d'un même fichier partagent leurs variables. L'option `--sequence.shuffle` mélange l'ordre des tests
pour débusquer ces dépendances cachées.

Le **déterminisme** exige de contrôler tout ce qui varie d'une exécution à l'autre. Le temps d'abord : si
`creerCompteur` appelait `Date.now()` directement, le test « débloque une minute après » devrait attendre une vraie
minute. En injectant `horloge`, le test avance le temps d'une ligne. Même principe pour le hasard (injecter la source
aléatoire ou une graine), le réseau (un faux client), le fuseau horaire ou la langue de la machine. Vitest propose aussi
de faux minuteurs, vus au module suivant.

Les **données minimales** rendent la cause évidente : le troisième test n'a besoin que de deux adresses. Un objet
utilisateur de trente champs copié d'un test à l'autre cache le seul champ qui compte. Quand beaucoup de tests ont
besoin d'un objet complet, une petite fabrique `creerUtilisateur({ ...surcharges })` fournit des valeurs par défaut
valides et laisse chaque test préciser ce qui le concerne.

## Erreurs fréquentes

**Créer l'état partagé une seule fois pour tous les tests.** Recrée-le dans `beforeEach`, ou dans chaque test.

**Tester plusieurs comportements dans un seul test.** Le premier échec masque les suivants.

**Appeler `Date.now()` ou `Math.random()` dans le code testé sans pouvoir les remplacer.** Injecte-les.

**Relancer un test instable jusqu'à ce qu'il passe.** Trouve la source de non-déterminisme.

**Copier de grosses données de test partout.** Utilise une fabrique avec des valeurs par défaut.

## À retenir

- Un test : préparer, agir une fois, vérifier.
- Le nom décrit la règle vérifiée.
- Chaque test crée son état : `beforeEach` plutôt qu'une variable partagée et modifiée.
- Temps, hasard et réseau doivent être contrôlables par le test.
- Des données minimales, avec une fabrique pour les objets complexes.

## Exercices

1. Ce test vérifie trop de choses à la fois. Découpe-le en tests nommés, chacun structuré en Arrange, Act, Assert.

   ```js
   it('panier', () => {
     const panier = creerPanier();
     panier.ajouter({ sku: 'A', prix: 1000 }, 2);
     expect(panier.total()).toBe(2000);
     panier.ajouter({ sku: 'A', prix: 1000 }, 1);
     expect(panier.lignes().length).toBe(1);
     panier.retirer('A');
     expect(panier.total()).toBe(0);
   });
   ```

   :::indice
   Il y a trois règles : le total, la fusion des lignes d'un même produit, le retrait. Chaque test prépare seul l'état
   dont il a besoin.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   function creerPanier() {
     const lignes = new Map();
     return {
       ajouter(produit, quantite) {
         const ligne = lignes.get(produit.sku) ?? { produit, quantite: 0 };
         lignes.set(produit.sku, { ...ligne, quantite: ligne.quantite + quantite });
       },
       retirer(sku) {
         lignes.delete(sku);
       },
       lignes: () => [...lignes.values()],
       total: () => [...lignes.values()].reduce((somme, l) => somme + l.produit.prix * l.quantite, 0),
     };
   }

   const stylo = { sku: 'A', prix: 1000 };

   describe('panier', () => {
     it('calcule le total à partir du prix et de la quantité', () => {
       const panier = creerPanier();

       panier.ajouter(stylo, 2);

       expect(panier.total()).toBe(2000);
     });

     it('fusionne les ajouts d’un même produit en une seule ligne', () => {
       const panier = creerPanier();
       panier.ajouter(stylo, 2);

       panier.ajouter(stylo, 1);

       expect(panier.lignes()).toEqual([{ produit: stylo, quantite: 3 }]);
     });

     it('retire toute la ligne d’un produit', () => {
       const panier = creerPanier();
       panier.ajouter(stylo, 2);

       panier.retirer('A');

       expect(panier.total()).toBe(0);
     });
   });
   ```
   :::

2. Ces deux tests passent. Pourtant, le second dépend du premier et ne vérifie pas vraiment sa règle. Explique
   pourquoi, puis corrige.

   ```js
   const favoris = creerFavoris();

   it('ajoute un favori', () => {
     favoris.ajouter('closures');
     expect(favoris.liste()).toEqual(['closures']);
   });

   it('ignore un doublon', () => {
     favoris.ajouter('closures');
     expect(favoris.liste()).toEqual(['closures']);
   });
   ```

   :::indice
   Que contient `favoris` au début du second test, selon qu'il tourne seul ou après le premier ?
   :::

   :::solution
   Le second test ne crée un doublon que parce que le premier a déjà ajouté `'closures'` dans l'objet partagé. Lancé
   seul, il n'ajoute qu'une fois : il passerait même si les doublons étaient acceptés. Et un nouveau test inséré entre
   les deux, qui ajouterait un autre favori, le ferait échouer. Chaque test doit préparer lui-même son état.

   ```js
   import { describe, it, expect, beforeEach } from 'vitest';

   function creerFavoris() {
     const elements = new Set();
     return { ajouter: (id) => elements.add(id), liste: () => [...elements] };
   }

   describe('favoris', () => {
     let favoris;

     beforeEach(() => {
       favoris = creerFavoris();
     });

     it('ajoute un favori', () => {
       favoris.ajouter('closures');

       expect(favoris.liste()).toEqual(['closures']);
     });

     it('ignore un doublon', () => {
       favoris.ajouter('closures');

       favoris.ajouter('closures');

       expect(favoris.liste()).toEqual(['closures']);
     });
   });
   ```
   :::

3. `genererCodePromo()` renvoie un code comme `'SEP-4821'` : le mois courant en trois lettres, puis quatre chiffres
   aléatoires. Rends la fonction testable de façon déterministe, et écris deux tests.

   ```js
   function genererCodePromo() {
     const mois = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];
     const nombre = 1000 + Math.floor(Math.random() * 9000);
     return `${mois[new Date().getMonth()]}-${nombre}`;
   }
   ```

   :::indice
   Passe `maintenant` et `aleatoire` en paramètres, avec les vraies sources comme valeurs par défaut.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   const MOIS = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];

   function genererCodePromo({ maintenant = () => new Date(), aleatoire = Math.random } = {}) {
     const nombre = 1000 + Math.floor(aleatoire() * 9000);
     return `${MOIS[maintenant().getMonth()]}-${nombre}`;
   }

   describe('genererCodePromo', () => {
     it('préfixe le code par le mois courant', () => {
       const code = genererCodePromo({ maintenant: () => new Date(2026, 8, 17), aleatoire: () => 0 });

       expect(code).toBe('SEP-1000');
     });

     it('produit toujours quatre chiffres, même aux bornes du hasard', () => {
       const options = { maintenant: () => new Date(2026, 0, 1) };

       const minimum = genererCodePromo({ ...options, aleatoire: () => 0 });
       const maximum = genererCodePromo({ ...options, aleatoire: () => 0.9999 });

       expect(minimum).toBe('JAN-1000');
       expect(maximum).toBe('JAN-9999');
     });
   });
   ```

   Les valeurs par défaut gardent l'appel de production inchangé : `genererCodePromo()` fonctionne comme avant.
   `new Date(2026, 8, 17)` utilise le fuseau local, ce qui suffit ici puisque seul le mois compte, en plein milieu du
   mois.
   :::

## Questions d'entretien

- Qu'est-ce qu'un test instable, et comment le corriges-tu ?

  :::indice
  Cherche ce qui peut varier entre deux exécutions sans changement de code.
  :::

  :::reponse
  C'est un test qui passe ou échoue sans modification du code. Les causes habituelles : dépendance au temps réel ou au
  hasard, état partagé entre tests et donc dépendance à l'ordre, attente d'une opération asynchrone non attendue,
  réseau ou service externe, fuseau horaire de la machine. Je le reproduis, en le lançant en boucle ou avec un ordre
  mélangé, puis je supprime la source : injection de l'horloge, faux minuteurs, état recréé par test, `await`
  manquant. Relancer automatiquement les tests échoués masque le problème sans le résoudre.
  :::

- Pourquoi structurer un test en Arrange, Act, Assert ?

  :::indice
  Pense à la personne qui lit le test quand il échoue.
  :::

  :::reponse
  Parce qu'on lit un test surtout quand il échoue, souvent sans connaître le code. Trois blocs séparés montrent
  immédiatement l'état de départ, l'unique action testée et le résultat attendu. La structure force aussi à ne tester
  qu'une action : si plusieurs actions et vérifications s'enchaînent, c'est le signe qu'il faut plusieurs tests, dont
  les noms diront précisément quelle règle est cassée.
  :::

- Que signifie « tests isolés », et comment Vitest y contribue-t-il ?

  :::indice
  Distingue l'isolation entre fichiers et entre tests d'un même fichier.
  :::

  :::reponse
  Chaque test peut s'exécuter seul et dans n'importe quel ordre avec le même résultat. Vitest isole les fichiers : chacun
  charge ses propres modules, et les fichiers s'exécutent en parallèle. À l'intérieur d'un fichier, les variables sont
  partagées : c'est au développeur de recréer l'état dans `beforeEach` ou dans chaque test, et de remettre en place ce
  qu'il modifie globalement. `--sequence.shuffle` permet de vérifier qu'aucun test ne dépend de l'ordre.
  :::
