---
id: javascript-es-modules
title: "Pourquoi les modules : export et import"
slug: export-et-import
technology: javascript
level: intermediate
module: es-modules
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-portees
skills:
  - es-modules
tags:
  - javascript
  - modules
---

## Objectifs

- Découper un programme en fichiers qui exposent explicitement ce qu'ils partagent.
- Écrire des exports nommés et un export par défaut, et les importer, avec ou sans renommage.
- Comprendre les propriétés d'un module : portée propre, mode strict, évaluation unique, liaisons vivantes.

## Introduction

Un programme d'une certaine taille ne tient pas dans un fichier. Pendant des années, JavaScript n'a eu
aucun système de modules : les scripts partageaient l'espace global, et l'ordre des balises `<script>`
décidait de ce qui fonctionnait. Les **modules ES**, standardisés en 2015 et disponibles partout
aujourd'hui, règlent la question : chaque fichier a sa propre portée, et ne partage que ce qu'il
**exporte** explicitement.

## Concept

| Écriture | Rôle |
| --- | --- |
| `export const TAUX = 0.2;` | export nommé d'une déclaration |
| `export { calculer, TAUX };` | export nommé d'éléments déjà déclarés |
| `export default function formater() {}` | export par défaut : un seul par module |
| `import { calculer } from './prix.js';` | import nommé : le nom doit correspondre |
| `import { calculer as calculerPrix } from './prix.js';` | import renommé |
| `import formater from './format.js';` | import du défaut : le nom est libre |
| `import * as Prix from './prix.js';` | tous les exports, dans un objet espace de noms |

Propriétés d'un module :

- **portée propre** : ses variables ne sont pas globales ;
- **mode strict** d'office ;
- **évaluation unique** : importé dix fois, il ne s'exécute qu'une fois ;
- **liaisons vivantes** : un import reflète la valeur actuelle de l'export, et ne peut pas être réaffecté.

Dans Node.js, un fichier est un module ES s'il porte l'extension `.mjs`, ou si le `package.json` contient
`"type": "module"`. Dans un navigateur : `<script type="module">`.

## Exemple

```js
// compteur.js
export let valeur = 0;

export function incrementer() {
  valeur += 1;
}

export default function reinitialiser() {
  valeur = 0;
}

// principal.js
import reinitialiser, { valeur, incrementer } from './compteur.js';
import * as Compteur from './compteur.js';

incrementer();
incrementer();
console.log(valeur, Compteur.valeur); // 2 2 : l'import suit la valeur actuelle

try {
  valeur = 10; // un import ne peut pas être réaffecté
} catch (erreur) {
  console.log(erreur.name); // 'TypeError'
}

reinitialiser();
console.log(valeur); // 0
```

## Comment ça fonctionne

Un module est chargé en trois temps. Le moteur **analyse** d'abord chaque fichier et lit ses `import` et
`export`, sans rien exécuter : c'est pourquoi `import` et `export` doivent apparaître au niveau supérieur,
avec des chemins écrits en toutes lettres. Il **relie** ensuite les imports aux exports correspondants —
un nom importé qui n'existe pas est une erreur avant toute exécution. Il **évalue** enfin chaque module,
une seule fois, dans l'ordre des dépendances. Tous les fichiers qui importent `compteur.js` partagent
donc la même instance : le module est un singleton naturel.

Un import n'est pas une copie de la valeur, mais une **liaison vivante** vers la variable exportée.
Quand `incrementer` modifie `valeur` dans son module, les modules qui l'importent voient la nouvelle valeur.
En revanche, seul le module qui déclare la variable peut la modifier : l'import est en lecture seule, et
l'affecter lève une `TypeError`. Pour modifier un état, le module exporte une fonction qui le fait.

Exports **nommés** ou **par défaut** ? Les exports nommés imposent un nom identique à l'import, ce qui
permet aux éditeurs de proposer l'import automatiquement et rend les recherches dans le code fiables.
L'export par défaut laisse l'appelant choisir le nom, ce qui produit souvent des noms différents pour la
même chose selon les fichiers. Beaucoup d'équipes privilégient donc les exports nommés, et réservent le
défaut aux cas où un fichier expose une seule chose évidente, comme un composant.

Les chemins relatifs doivent inclure l'**extension** : `'./compteur.js'`, et non `'./compteur'`. Node.js
et les navigateurs résolvent les chemins exactement comme écrits ; ce sont les outils de build qui, souvent,
ajoutent l'extension manquante. Un nom sans chemin, comme `'lodash'`, désigne un paquet installé.

Node.js connaît aussi l'ancien système **CommonJS** : `require` et `module.exports`. Il reste courant dans
le code existant. Un module ES peut importer un module CommonJS ; l'inverse est plus limité. Pour du code
nouveau, on écrit des modules ES.

## Erreurs fréquentes

**Oublier l'extension dans un chemin relatif.** Node.js répond `ERR_MODULE_NOT_FOUND`.

**Réaffecter une variable importée.** Exporte une fonction qui modifie l'état.

**Importer un export nommé sans accolades.** `import calculer from` lit l'export par défaut.

**Placer un `import` dans une condition.** C'est une erreur de syntaxe : utilise `import()`, vu au
chapitre suivant.

**Compter sur des variables globales entre modules.** Chaque module a sa propre portée.

## À retenir

- Un module a sa portée, est en mode strict, et n'est évalué qu'une fois.
- Exports nommés entre accolades ; un seul export par défaut, importé sans accolades.
- Un import est une liaison vivante, en lecture seule.
- Chemins relatifs avec extension dans Node.js et les navigateurs.
- Node.js : `.mjs` ou `"type": "module"` ; navigateur : `<script type="module">`.

## Exercices

1. Ce fichier unique mélange le calcul des prix et l'affichage d'un panier. Découpe-le en deux modules :
   `prix.js`, qui exporte `TVA` et `prixTTC`, et `panier.js`, qui les importe.

   ```js
   const TVA = 0.2;
   function prixTTC(prixHT) {
     return Math.round(prixHT * (1 + TVA) * 100) / 100;
   }
   console.log(`Clavier : ${prixTTC(50)} €`);
   ```

   :::indice
   `prix.js` utilise des exports nommés ; `panier.js` les importe entre accolades, avec l'extension dans
   le chemin.
   :::

   :::solution
   ```js
   // prix.js
   export const TVA = 0.2;

   export function prixTTC(prixHT) {
     return Math.round(prixHT * (1 + TVA) * 100) / 100;
   }

   // panier.js
   import { prixTTC } from './prix.js';

   console.log(`Clavier : ${prixTTC(50)} €`); // 'Clavier : 60 €'
   ```
   :::

2. Ce code échoue avant même de s'exécuter. Lis le message, explique-le, et propose deux corrections.

   ```js
   // prix.js exporte : export function prixTTC(prixHT) { … }
   import prixTTC from './prix.js';
   ```

   :::indice
   Sans accolades, quel export l'instruction cherche-t-elle ?
   :::

   :::solution
   L'erreur est `SyntaxError: The requested module './prix.js' does not provide an export named 'default'`.
   Sans accolades, `import prixTTC` demande l'export **par défaut**, et `prix.js` n'en a pas. La liaison des
   modules échoue avant toute exécution.

   ```js
   // Correction 1 : importer l'export nommé.
   import { prixTTC } from './prix.js';

   // Correction 2 : renommer à l'import si le nom local doit différer.
   import { prixTTC as calculerTTC } from './prix.js';
   ```

   Ajouter un `export default` dans `prix.js` fonctionnerait aussi, mais multiplierait les façons d'importer
   la même fonction.
   :::

3. `config.js` affiche un message quand il est évalué, puis exporte un objet. Deux modules l'importent. Combien
   de fois le message apparaît-il, et une modification de l'objet faite dans l'un est-elle visible dans
   l'autre ?

   ```js
   // config.js
   console.log('configuration chargée');
   export const configuration = { langue: 'fr' };
   ```

   :::indice
   Un module est-il évalué une fois par import, ou une fois en tout ?
   :::

   :::solution
   Le message n'apparaît **qu'une fois** : un module est évalué une seule fois, et tous les imports partagent
   le même résultat. Les deux modules reçoivent donc le **même objet**, et une modification faite par l'un est
   visible par l'autre :

   ```js
   // a.js
   import { configuration } from './config.js';
   configuration.langue = 'en';

   // b.js
   import './a.js';
   import { configuration } from './config.js';
   console.log(configuration.langue); // 'en'
   ```

   C'est pratique pour une configuration partagée, et dangereux pour un état modifiable : pour l'éviter, on
   exporte un objet figé avec `Object.freeze`, ou des fonctions qui contrôlent les modifications.
   :::

## Questions d'entretien

- Quelle différence entre un export nommé et un export par défaut ?

  :::indice
  Qui choisit le nom à l'import ?
  :::

  :::reponse
  Un module peut avoir plusieurs exports nommés, importés entre accolades sous leur nom exact, éventuellement
  renommés avec `as`. Il ne peut avoir qu'un export par défaut, importé sans accolades sous le nom que choisit
  l'appelant. Les exports nommés rendent le code plus cohérent et plus facile à outiller — import automatique,
  recherche, refactorisation — ; le défaut convient à un module qui expose une seule chose évidente.
  :::

- Qu'est-ce qu'une liaison vivante ?

  :::indice
  Un import est-il une copie de la valeur au moment de l'import ?
  :::

  :::reponse
  Un import n'est pas une copie : c'est une référence vers la variable exportée. Si le module qui l'exporte
  modifie la variable, les modules qui l'importent voient la nouvelle valeur. La liaison est en lecture
  seule du côté de l'importateur : réaffecter un import lève une `TypeError`. Seul le module d'origine peut
  modifier la variable, en général par une fonction qu'il exporte.
  :::

- Qu'apportent les modules ES par rapport aux scripts classiques ?

  :::indice
  Pense à l'espace global, au mode strict et à l'ordre de chargement.
  :::

  :::reponse
  Chaque module a sa propre portée : plus de collisions dans l'espace global. Les dépendances sont
  déclarées explicitement par `import`, donc l'ordre de chargement est calculé par le moteur au lieu de
  dépendre de l'ordre des balises `<script>`. Les modules sont en mode strict, évalués une seule fois, et
  leur structure statique permet aux outils de détecter les imports invalides et d'éliminer le code inutilisé.
  :::
