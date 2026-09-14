---
id: javascript-mini-projet-interactif
title: "Mini-projet : un programme interactif"
slug: mini-projet-programme-interactif
technology: javascript
level: beginner
module: introduction
order: 5
estimatedMinutes: 40
difficulty: 2
xp: 100
prerequisites:
  - javascript-premier-programme
skills:
  - console-devtools
  - syntax-expressions
tags:
  - javascript
  - introduction
  - projet
---

## Objectifs

- Écrire un petit programme complet : lire une saisie, la traiter, afficher un résultat.
- Faire tourner le même programme dans le navigateur puis dans Node.js.
- Repérer et corriger les pièges d'une saisie utilisateur : texte au lieu de nombre,
  saisie vide, annulation.

## Introduction

Assez de notions isolées : construisons quelque chose. Ce mini-projet est un
**convertisseur de températures**. Il est volontairement petit, mais il contient déjà
la structure de presque tous les programmes : **une entrée, un traitement, une
sortie**. Il montre aussi un fait que tu retrouveras partout : une donnée qui vient d'un
utilisateur est toujours du texte, et ce texte ne ressemble pas toujours à ce qu'on
attend.

## Concept

Un programme interactif enchaîne trois étapes :

| Étape | Rôle | Dans ce projet |
| --- | --- | --- |
| Entrée | obtenir une donnée | la température saisie |
| Traitement | calculer | Celsius vers Fahrenheit : `c × 9 / 5 + 32` |
| Sortie | présenter le résultat | un message lisible |

Dans le navigateur, `prompt` affiche une boîte de saisie et `alert` un message. Ces
fonctions bloquent la page tant qu'on n'a pas répondu : pratiques pour apprendre, on ne
les utilise jamais dans une vraie application. Dans Node.js, elles n'existent pas ; on
lit le terminal avec le module `node:readline/promises`.

Point essentiel : `prompt` renvoie toujours **une chaîne**, ou `null` si l'utilisateur
annule. Il faut convertir cette chaîne en nombre avec `Number(...)`, puis vérifier que
la conversion a réussi.

## Exemple

La version navigateur, dans un fichier `convertisseur.html` :

```html
<!doctype html>
<html lang="fr">
  <body>
    <script>
      const saisie = prompt('Température en °C ?');
      const celsius = Number(saisie);
      const fahrenheit = (celsius * 9) / 5 + 32;

      alert(`${celsius} °C = ${fahrenheit} °F`);
      console.log({ saisie, celsius, fahrenheit });
    </script>
  </body>
</html>
```

Tape `20` : le programme affiche `20 °C = 68 °F`. Le `console.log` final, avec un objet
qui regroupe les trois valeurs, est une habitude précieuse : il montre d'un coup d'œil
chaque étape du calcul.

## Comment ça fonctionne

`Number` convertit une chaîne en nombre, mais pas toujours comme on l'imagine :

| Saisie | `Number(saisie)` | Pourquoi |
| --- | --- | --- |
| `'20'` | `20` | conversion normale |
| `'12.5'` | `12.5` | le point est le séparateur décimal |
| `'12,5'` | `NaN` | la virgule n'est pas reconnue |
| `'abc'` | `NaN` | ce n'est pas un nombre |
| `''` | `0` | chaîne vide |
| `null` (Annuler) | `0` | piège : l'annulation devient zéro degré |

`NaN` (*Not a Number*) signale une conversion ratée. On le détecte avec
`Number.isNaN(valeur)`.

La version Node.js lit le terminal. Enregistre ce code dans un fichier `.mjs`, qui
autorise `await` au premier niveau :

```js
// convertisseur.mjs — lancer avec : node convertisseur.mjs
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const lecteur = readline.createInterface({ input, output });
const saisie = await lecteur.question('Température en °C ? ');
lecteur.close();

const celsius = Number(saisie.replace(',', '.'));

if (Number.isNaN(celsius)) {
  console.error(`« ${saisie} » n'est pas un nombre.`);
} else {
  console.log(`${celsius} °C = ${(celsius * 9) / 5 + 32} °F`);
}
```

Même traitement, entrée et sortie différentes : c'est l'environnement qui change, pas le
langage.

## Erreurs fréquentes

**Additionner une saisie sans la convertir.** `prompt('Âge ?') + 1` avec `30` donne
`'301'` : `+` entre une chaîne et un nombre concatène.

**Oublier l'annulation.** Si l'utilisateur clique sur Annuler, `prompt` renvoie `null` et
`Number(null)` vaut `0` : le programme affiche fièrement `0 °C = 32 °F`.

**Ignorer la virgule décimale.** Un utilisateur français tape souvent `12,5`, que
`Number` transforme en `NaN`. Remplace la virgule par un point avant de convertir.

**Utiliser `prompt` dans Node.js.** Il n'existe pas dans cet environnement :
`ReferenceError: prompt is not defined`.

## À retenir

- Un programme, c'est une entrée, un traitement et une sortie.
- Une saisie utilisateur est toujours une chaîne : convertis-la avec `Number`.
- Vérifie la conversion avec `Number.isNaN`, et traite le cas de l'annulation.
- Afficher un objet `{ saisie, resultat }` dans la console montre chaque étape d'un coup.

## Exercices

1. Ajoute la conversion inverse : si la saisie se termine par la lettre « F », convertis
   de Fahrenheit en Celsius.

   :::indice
   `saisie.trim().toUpperCase().endsWith('F')` indique si l'unité Fahrenheit est
   présente.
   :::

   :::indice
   Retire la dernière lettre avec `slice(0, -1)` avant de convertir le nombre. La formule
   inverse est `(f - 32) × 5 / 9`.
   :::

   :::solution
   ```js
   const saisie = prompt('Température (ajoute F pour des Fahrenheit) ?').trim();

   if (saisie.toUpperCase().endsWith('F')) {
     const fahrenheit = Number(saisie.slice(0, -1));
     const celsius = ((fahrenheit - 32) * 5) / 9;
     alert(`${fahrenheit} °F = ${celsius} °C`);
   } else {
     const celsius = Number(saisie);
     const fahrenheit = (celsius * 9) / 5 + 32;
     alert(`${celsius} °C = ${fahrenheit} °F`);
   }
   ```
   :::

2. Empêche le programme d'afficher « 0 °C = 32 °F » quand l'utilisateur annule ou ne tape
   rien, et affiche plutôt un message clair.

   :::indice
   `prompt` renvoie `null` quand on clique sur Annuler, et une chaîne vide si on valide
   sans rien taper. Teste ces deux cas avant de convertir.
   :::

   :::solution
   ```js
   const saisie = prompt('Température en °C ?');

   if (saisie === null || saisie.trim() === '') {
     alert('Aucune température saisie.');
   } else {
     const celsius = Number(saisie.replace(',', '.'));

     if (Number.isNaN(celsius)) {
       alert(`« ${saisie} » n'est pas un nombre.`);
     } else {
       alert(`${celsius} °C = ${(celsius * 9) / 5 + 32} °F`);
     }
   }
   ```

   L'ordre compte : on écarte `null` avant d'appeler `trim`, qui n'existe pas sur `null`.
   :::

3. Arrondis le résultat affiché à une décimale.

   :::indice
   Un nombre possède une méthode `toFixed(n)` qui renvoie une chaîne arrondie à `n`
   décimales.
   :::

   :::solution
   ```js
   const celsius = 21.7;
   const fahrenheit = (celsius * 9) / 5 + 32; // 71.06
   alert(`${celsius} °C = ${fahrenheit.toFixed(1)} °F`); // 21.7 °C = 71.1 °F
   ```

   `toFixed` renvoie une chaîne : garde le nombre non arrondi si tu dois encore calculer
   avec, et n'arrondis qu'au moment de l'affichage.
   :::

## Questions d'entretien

- Pourquoi `prompt('Âge ?') + 1` peut-il afficher « 301 » ?

  :::indice
  Quel est le type de la valeur renvoyée par `prompt` ?
  :::

  :::reponse
  `prompt` renvoie toujours une chaîne. Avec une chaîne d'un côté, l'opérateur `+`
  concatène au lieu d'additionner : `'30' + 1` donne `'301'`. Il faut convertir la saisie
  avec `Number(...)` avant de calculer, puis vérifier le résultat avec `Number.isNaN`. Les
  autres opérateurs arithmétiques convertissent en nombre, ce qui rend le piège encore plus
  sournois : `'30' - 1` vaut bien `29`.
  :::

- Pourquoi `prompt` et `alert` ne fonctionnent-ils pas dans Node.js ?

  :::indice
  Qui fournit ces deux fonctions : le langage ou l'environnement ?
  :::

  :::reponse
  `prompt` et `alert` sont des API du navigateur, liées à la fenêtre affichée. Elles ne
  font pas partie d'ECMAScript. Node.js n'a pas de fenêtre : pour lire une saisie, il
  propose le module `node:readline`, qui lit le terminal. Le traitement peut rester
  identique ; seules l'entrée et la sortie changent.
  :::

- Comment déboguer un programme qui affiche un mauvais résultat sans aucun message
  d'erreur ?

  :::indice
  Il faut rendre visible chaque étape entre la saisie et le résultat.
  :::

  :::reponse
  On affiche les valeurs intermédiaires, par exemple
  `console.log({ saisie, celsius, fahrenheit })`, pour trouver la première étape où la
  valeur n'est plus celle qu'on attend — typiquement une chaîne là où l'on attendait un
  nombre. On vérifie aussi les types avec `typeof`. Pour aller plus loin, on pose un point
  d'arrêt dans les outils de développement et on exécute le code pas à pas.
  :::
