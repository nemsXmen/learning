---
id: javascript-premier-programme
title: "Premier programme : console.log et outils de développement"
slug: premier-programme
technology: javascript
level: beginner
module: introduction
order: 2
estimatedMinutes: 20
difficulty: 1
xp: 50
prerequisites: []
skills:
  - console-devtools
tags:
  - javascript
  - introduction
---

## Objectifs

- Exécuter un fichier JavaScript avec Node.js et dans un navigateur.
- Utiliser `console.log`, `console.table`, `console.warn`, `console.error` et
  `console.time`.
- Ouvrir les outils de développement et lire ce qu'affiche la console.

## Introduction

Programmer, c'est surtout observer : écrire une ligne, l'exécuter, regarder ce qui se
passe. Avant d'apprendre la moindre règle du langage, il faut donc savoir **où exécuter
son code** et **comment voir ce qu'il fait**. C'est le rôle de la console, l'outil que
tu utiliseras tous les jours, du premier programme au debugging d'une application en
production.

## Concept

Il existe deux façons courantes d'exécuter du JavaScript :

| Environnement | Comment lancer | Où s'affiche la console |
| --- | --- | --- |
| Node.js | `node app.js` dans un terminal | dans le terminal |
| Navigateur | un fichier HTML avec `<script src="app.js"></script>`, ou la console des outils de développement | onglet Console (F12 ou Ctrl+Maj+I) |

L'objet `console` propose bien plus que `log` :

| Méthode | Usage |
| --- | --- |
| `console.log(...)` | afficher une ou plusieurs valeurs |
| `console.warn(...)` | signaler un problème non bloquant |
| `console.error(...)` | signaler une erreur |
| `console.table(tableau)` | afficher un tableau d'objets sous forme de tableau |
| `console.group(label)` / `console.groupEnd()` | regrouper des messages |
| `console.time(label)` / `console.timeEnd(label)` | mesurer une durée |

## Exemple

```html
<!doctype html>
<html lang="fr">
  <body>
    <script src="app.js"></script>
  </body>
</html>
```

```js
// app.js
const produit = { nom: 'Clavier', prix: 49.9, stock: 12 };
console.log('Produit :', produit);

console.table([
  { nom: 'Clavier', prix: 49.9, stock: 12 },
  { nom: 'Souris', prix: 19.9, stock: 0 },
]);

console.warn('Stock bas pour', produit.nom);

console.time('préparation');
const references = Array.from({ length: 100000 }, (_, index) => `REF-${index}`);
console.timeEnd('préparation'); // par exemple « préparation: 12.4ms »
console.log(references.length); // 100000
```

Ouvre le fichier HTML dans un navigateur puis la console, ou lance `node app.js` : les
mêmes messages apparaissent, présentés différemment.

## Comment ça fonctionne

`console` n'appartient pas au langage : c'est une API fournie par l'environnement.
Dans Node.js, `console.log` écrit sur la **sortie standard** (*stdout*) et
`console.error` comme `console.warn` sur la **sortie d'erreur** (*stderr*). On peut donc
les séparer :

```bash
node app.js > sortie.txt
```

Les messages de `console.log` partent dans `sortie.txt`, les erreurs restent affichées
dans le terminal.

Dans le navigateur, un objet affiché n'est pas copié au moment de l'appel. La ligne
montre un aperçu, mais quand tu **déplies** l'objet, la console lit son état **à ce
moment-là**. Si l'objet a changé entre-temps, tu vois la nouvelle valeur :

```js
const panier = { total: 10 };
console.log(panier); // déplié plus tard, affichera total: 99
panier.total = 99;
```

Pour figer l'état au moment de l'appel, affiche une copie :
`console.log(structuredClone(panier))`.

## Erreurs fréquentes

**Concaténer un objet dans une chaîne.** `console.log('Produit : ' + produit)` affiche
`Produit : [object Object]`. Passe plutôt l'objet en argument séparé :
`console.log('Produit :', produit)`.

**Se fier à un objet déplié dans le navigateur.** Il montre l'état au dépliage, pas au
moment du `console.log`. Affiche une copie si l'objet change ensuite.

**Oublier d'enregistrer ou de recharger.** Le navigateur exécute la dernière version
chargée du fichier : après une modification, recharge la page.

**Laisser des `console.log` en production.** Ils ralentissent légèrement le code et
peuvent exposer des données. Retire-les une fois le problème compris.

## À retenir

- `node fichier.js` exécute un script dans le terminal ; la console du navigateur
  s'ouvre avec F12.
- `console` offre `table`, `warn`, `error`, `group` et `time`, pas seulement `log`.
- Dans Node.js, `log` écrit sur stdout, `warn` et `error` sur stderr.
- Dans le navigateur, un objet déplié montre son état actuel, pas celui du moment de
  l'appel.

## Exercices

1. Affiche trois élèves (nom et moyenne) avec `console.table`, puis leur nombre avec
   `console.log`.

   :::indice
   `console.table` accepte un tableau d'objets : chaque propriété devient une colonne.
   :::

   :::solution
   ```js
   const eleves = [
     { nom: 'Ada', moyenne: 16 },
     { nom: 'Grace', moyenne: 14.5 },
     { nom: 'Linus', moyenne: 12 },
   ];

   console.table(eleves);
   console.log('Nombre d’élèves :', eleves.length); // Nombre d’élèves : 3
   ```
   :::

2. Mesure le temps que met `Array.from({ length: 100000 }, (_, i) => i * 2)` à
   s'exécuter.

   :::indice
   `console.time(label)` démarre un chronomètre ; `console.timeEnd(label)`, avec le même
   libellé, l'arrête et affiche la durée.
   :::

   :::solution
   ```js
   console.time('doubles');
   const doubles = Array.from({ length: 100000 }, (_, i) => i * 2);
   console.timeEnd('doubles'); // doubles: 4.1ms (la durée varie d'une machine à l'autre)
   console.log(doubles.length); // 100000
   ```
   :::

3. Affiche un objet, modifie une de ses propriétés juste après, puis compare ce que
   montrent le terminal Node.js et la console du navigateur quand tu déplies l'objet.

   :::indice
   Dans le navigateur, un objet affiché est relu au moment où tu le déplies.
   :::

   :::solution
   ```js
   const utilisateur = { nom: 'Ada', connecte: false };
   console.log(utilisateur);
   utilisateur.connecte = true;
   ```

   Node.js affiche `{ nom: 'Ada', connecte: false }` : l'objet est converti en texte au
   moment de l'appel. Dans le navigateur, l'aperçu indique `connecte: false`, mais l'objet
   déplié montre `connecte: true`. Pour figer l'état, écris
   `console.log(structuredClone(utilisateur))`.
   :::

## Questions d'entretien

- Quelle différence entre `console.log` et `console.error` dans Node.js ?

  :::indice
  Pense aux deux flux de sortie d'un programme en ligne de commande.
  :::

  :::reponse
  `console.log` écrit sur la sortie standard (*stdout*), `console.error` et `console.warn`
  sur la sortie d'erreur (*stderr*). On peut rediriger les deux flux séparément : avec
  `node app.js > sortie.txt`, les messages normaux vont dans le fichier et les erreurs
  restent à l'écran. C'est aussi ce qui permet aux outils de journalisation de distinguer
  les erreurs.
  :::

- Pourquoi un objet affiché dans la console du navigateur peut-il montrer des valeurs
  qu'il n'avait pas au moment du `console.log` ?

  :::indice
  Qu'est-ce que la console garde en mémoire : une copie, ou une référence ?
  :::

  :::reponse
  La console garde une référence vers l'objet et n'en montre qu'un aperçu. Quand on le
  déplie, elle relit l'objet dans son état actuel. Si le code l'a modifié entre-temps, on
  voit les nouvelles valeurs. Pour observer l'état exact au moment de l'appel, on affiche
  une copie (`structuredClone`) ou une chaîne (`JSON.stringify`).
  :::

- Comment mesurer rapidement la durée d'une opération sans outil externe ?

  :::indice
  L'objet `console` a une méthode prévue pour cela.
  :::

  :::reponse
  `console.time('label')` avant l'opération et `console.timeEnd('label')` après affichent
  la durée écoulée. Pour une mesure plus précise, on utilise `performance.now()`, et pour
  comprendre où le temps est passé, le profileur de l'onglet Performance des outils de
  développement.
  :::
