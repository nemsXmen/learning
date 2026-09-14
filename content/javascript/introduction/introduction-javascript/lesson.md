---
id: javascript-introduction
title: "Qu'est-ce que JavaScript : navigateur, Node.js et moteur"
slug: introduction-javascript
technology: javascript
level: beginner
module: introduction
order: 1
estimatedMinutes: 20
difficulty: 1
xp: 50
prerequisites: []
skills:
  - js-runtime
tags:
  - javascript
  - introduction
---

## Objectifs

- Situer JavaScript : un langage, une norme (ECMAScript) et plusieurs environnements.
- Distinguer le moteur (V8, SpiderMonkey, JavaScriptCore) de l'environnement
  d'exécution (navigateur, Node.js).
- Savoir si un identifiant vient du langage ou de l'environnement : `Array` contre
  `document` ou `process`.

## Introduction

JavaScript est né en 1995 pour animer des pages web. Aujourd'hui, il tourne aussi sur
des serveurs, en ligne de commande et dans des applications de bureau. Le langage n'a
pas été réinventé pour chacun de ces usages : ce qui change, c'est **l'environnement**
qui l'exécute.

Cette séparation évite une confusion très répandue : croire que `document` ou
`setTimeout` font partie de JavaScript. Ils n'en font pas partie — et c'est exactement
pour cela qu'un code écrit pour le navigateur peut planter dans Node.js.

## Concept

Un programme JavaScript s'exécute grâce à trois couches distinctes :

| Couche | Rôle | Exemples |
| --- | --- | --- |
| Le langage (ECMAScript) | syntaxe, types, objets natifs | `let`, `Array`, `Promise`, `JSON`, `Math` |
| Le moteur | lire, compiler et exécuter le code | V8 (Chrome, Node.js, Deno), SpiderMonkey (Firefox), JavaScriptCore (Safari, Bun) |
| L'environnement d'exécution | fournir l'accès au monde extérieur | navigateur : `document`, `localStorage` ; Node.js : `fs`, `process` |

**ECMAScript** est la norme publiée chaque année par Ecma International. Elle décrit ce
qu'est le langage, rien de plus : elle ne sait ni afficher une page, ni lire un fichier,
ni attendre une seconde.

Le **moteur** implémente cette norme. Il ne connaît que le langage.

L'**environnement d'exécution** embarque un moteur et lui ajoute des API : le DOM et
`fetch` dans le navigateur, le système de fichiers et le réseau dans Node.js. `console`
et `setTimeout` sont fournis par les deux environnements, mais ils ne font pas partie
d'ECMAScript.

## Exemple

```js
// Du langage : fonctionne dans tous les environnements
const notes = [12, 15, 9];
const moyenne = notes.reduce((total, note) => total + note, 0) / notes.length;
console.log(moyenne); // 12

// De l'environnement navigateur : n'existe pas dans Node.js
document.title = `Moyenne : ${moyenne}`;

// De l'environnement Node.js : n'existe pas dans un navigateur
console.log(process.version); // par exemple 'v22.11.0'
```

Exécuté dans Node.js, ce fichier affiche `12` puis s'arrête sur
`ReferenceError: document is not defined`. Collé dans la console d'un navigateur, il
change le titre de l'onglet puis s'arrête sur `ReferenceError: process is not defined`.

## Comment ça fonctionne

Quand tu lances un script, le moteur le **lit** (analyse syntaxique) pour en construire
une représentation en arbre, puis le **transforme en bytecode** qu'il commence à
interpréter tout de suite. Pendant l'exécution, il observe les fonctions appelées très
souvent et les types réellement utilisés, puis compile ces fonctions en code machine
optimisé : c'est la compilation à la volée, ou *JIT* (*just-in-time*). Si une hypothèse
devient fausse — une fonction qui recevait toujours des nombres reçoit une chaîne —, le
moteur revient au code non optimisé.

L'environnement, lui, fournit ce que le moteur ne sait pas faire : une boucle
d'événements pour attendre un clic ou une réponse réseau, et des objets globaux pour
parler au monde extérieur. On peut vérifier ce qui existe sans provoquer d'erreur :

```js
console.log(typeof document); // 'object' dans un navigateur, 'undefined' dans Node.js
console.log(typeof process); // 'undefined' dans un navigateur, 'object' dans Node.js
```

`typeof` appliqué à un identifiant jamais déclaré renvoie `'undefined'` au lieu de lever
une `ReferenceError` : c'est ce qui en fait un test d'environnement sûr.

## Erreurs fréquentes

**Croire que `document` ou `window` font partie du langage.** Ils appartiennent au
navigateur. Un script qui les utilise échoue dans Node.js avec
`ReferenceError: document is not defined`.

**Confondre moteur et environnement.** Node.js et Chrome partagent V8, mais pas leurs
API. Même moteur ne veut pas dire mêmes objets disponibles.

**Supposer qu'une fonctionnalité récente marche partout.** Une nouveauté d'ECMAScript
arrive dans les moteurs à des dates différentes. Vérifie la version de Node.js ou la
compatibilité des navigateurs avant de t'en servir.

**Confondre JavaScript et Java.** Le nom est un choix marketing de 1995 ; les deux
langages n'ont presque rien en commun.

## À retenir

- ECMAScript est la norme ; JavaScript est le langage qui l'implémente.
- Le moteur exécute le langage ; l'environnement ajoute les API du monde extérieur.
- `document` vient du navigateur, `process` et `fs` de Node.js, `Array` et `JSON` du
  langage.
- `typeof identifiant` permet de tester l'existence d'un objet sans erreur.

## Exercices

1. Classe ces identifiants selon leur origine — langage, navigateur ou Node.js :
   `Math`, `document`, `fs`, `JSON`, `localStorage`, `process`, `Promise`.

   :::indice
   Demande-toi si l'identifiant aurait encore un sens dans un moteur seul, sans page web
   ni système de fichiers.
   :::

   :::solution
   - Langage : `Math`, `JSON`, `Promise`.
   - Navigateur : `document`, `localStorage`.
   - Node.js : `process` (objet global) et `fs` (module à importer avec
     `import fs from 'node:fs'`).
   :::

2. Écris un script qui affiche « navigateur » ou « Node.js » selon l'environnement où il
   s'exécute.

   :::indice
   `typeof` ne lève pas d'erreur sur un identifiant qui n'existe pas.
   :::

   :::indice
   Teste la présence d'un objet propre à chaque environnement, comme `window` ou
   `process`.
   :::

   :::solution
   ```js
   if (typeof window !== 'undefined') {
     console.log('navigateur');
   } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
     console.log('Node.js');
   } else {
     console.log('environnement inconnu');
   }
   ```

   Vérifier `process.versions.node` évite de se laisser tromper par un outil qui
   définirait un faux `process` dans le navigateur.
   :::

3. Écris un fichier `bonjour.js` qui affiche la date du jour avec `console.log`,
   exécute-le avec Node.js, puis colle le même code dans la console du navigateur.

   :::indice
   Pour lancer un fichier avec Node.js, ouvre un terminal dans son dossier et tape
   `node` suivi du nom du fichier.
   :::

   :::solution
   ```js
   const aujourdHui = new Date().toLocaleDateString('fr-FR');
   console.log(`Bonjour, nous sommes le ${aujourdHui}`);
   ```

   ```bash
   node bonjour.js
   ```

   Le résultat est identique : `Date`, les template literals et `console.log` existent
   dans les deux environnements. Seul le lieu d'affichage change — le terminal pour
   Node.js, l'onglet Console des outils de développement pour le navigateur.
   :::

## Questions d'entretien

- Quelle est la différence entre ECMAScript et JavaScript ?

  :::indice
  L'un est une spécification, l'autre une implémentation.
  :::

  :::reponse
  ECMAScript est la spécification publiée par Ecma International (norme ECMA-262) : elle
  définit la syntaxe, les types et les objets natifs, et une nouvelle édition paraît
  chaque année. JavaScript est le langage qui implémente cette norme, auquel chaque
  environnement ajoute ses propres API : le DOM dans le navigateur, `fs` ou `process`
  dans Node.js.
  :::

- Pourquoi `document` n'existe-t-il pas dans Node.js alors que Node.js utilise le même
  moteur que Chrome ?

  :::indice
  Qu'est-ce que V8 sait faire à lui seul ?
  :::

  :::reponse
  V8 n'exécute que le langage. `document` est une API fournie par le navigateur pour
  représenter la page affichée. Node.js n'a pas de page : il fournit à la place un accès
  au système de fichiers, au réseau et au processus. Même moteur, environnements
  différents, donc objets globaux différents.
  :::

- Qu'est-ce qu'un compilateur JIT, et pourquoi les moteurs JavaScript en utilisent-ils
  un ?

  :::indice
  Compare un code exécuté une seule fois et une fonction appelée un million de fois.
  :::

  :::reponse
  Un compilateur à la volée (*just-in-time*) compile le code pendant l'exécution. Les
  moteurs commencent par interpréter pour démarrer vite, observent les fonctions les plus
  appelées et les types qu'elles reçoivent, puis compilent ces fonctions en code machine
  optimisé. Si une hypothèse se révèle fausse, ils désoptimisent. On obtient à la fois un
  démarrage rapide et un code chaud performant.
  :::
