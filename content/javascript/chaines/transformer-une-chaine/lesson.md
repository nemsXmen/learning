---
id: javascript-chaines-transformer
title: "Transformer une chaîne : casse, slice, substring et trim"
slug: transformer-une-chaine
technology: javascript
level: beginner
module: chaines
order: 3
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-chaines-creer
skills:
  - strings-transform
tags:
  - javascript
  - chaines
---

## Objectifs

- Changer la casse d'un texte avec `toUpperCase` et `toLowerCase`.
- Supprimer les espaces superflus avec `trim`, `trimStart` et `trimEnd`.
- Extraire une partie d'un texte avec `slice`, et savoir en quoi `substring` diffère.

## Introduction

Une saisie utilisateur est rarement propre : `"  Ada@Exemple.FR "` doit devenir
`"ada@exemple.fr"` avant d'être comparée ou enregistrée. Un numéro de carte doit être
masqué sauf ses quatre derniers chiffres. Un prénom doit commencer par une majuscule.
Ces transformations s'enchaînent en une ligne, à une condition : se souvenir qu'aucune
d'elles ne modifie la chaîne d'origine.

## Concept

| Méthode | Effet | Exemple | Résultat |
| --- | --- | --- | --- |
| `toUpperCase()` | tout en majuscules | `'Ada'.toUpperCase()` | `'ADA'` |
| `toLowerCase()` | tout en minuscules | `'Ada'.toLowerCase()` | `'ada'` |
| `trim()` | retire les espaces aux deux extrémités | `'  ada '.trim()` | `'ada'` |
| `trimStart()` / `trimEnd()` | au début / à la fin seulement | `'  ada '.trimStart()` | `'ada '` |
| `slice(debut, fin)` | extrait de `debut` inclus à `fin` exclu | `'JavaScript'.slice(0, 4)` | `'Java'` |
| `substring(debut, fin)` | presque pareil, voir ci-dessous | `'JavaScript'.substring(4)` | `'Script'` |

Chaque méthode **renvoie une nouvelle chaîne**. On peut donc les enchaîner :
`saisie.trim().toLowerCase()`.

`slice` accepte des **index négatifs**, comptés depuis la fin : `texte.slice(-4)` renvoie
les quatre derniers caractères.

## Exemple

```js
const saisie = '  Ada@Exemple.FR ';
const email = saisie.trim().toLowerCase();
console.log(email); // 'ada@exemple.fr'

const numeroCarte = '4970123412345678';
const carteMasquee = `**** **** **** ${numeroCarte.slice(-4)}`;
console.log(carteMasquee); // '**** **** **** 5678'

const prenom = 'ada';
const prenomAffiche = prenom.charAt(0).toUpperCase() + prenom.slice(1);
console.log(prenomAffiche); // 'Ada'

console.log(saisie); // '  Ada@Exemple.FR ' : l'original n'a pas changé
```

## Comment ça fonctionne

`slice(debut, fin)` et `substring(debut, fin)` extraient tous deux les caractères de
`debut` (inclus) à `fin` (exclu). Ils diffèrent sur les cas limites :

| Appel | `slice` | `substring` |
| --- | --- | --- |
| index négatif `(-3)` sur `'abcdef'` | `'def'` : compté depuis la fin | `'abcdef'` : ramené à 0 |
| `debut > fin`, `(4, 1)` | `''` : chaîne vide | `'bcd'` : les bornes sont inversées |

`slice` a un comportement plus prévisible, et il fonctionne de la même façon sur les
tableaux : c'est lui qu'on utilise par défaut.

`charAt(0)` renvoie le premier caractère, ou `''` pour une chaîne vide, alors que
`texte[0]` renverrait `undefined` — et `undefined.toUpperCase()` lèverait une erreur.

Les changements de casse suivent les règles Unicode, qui réservent quelques surprises :
`'ß'.toUpperCase()` vaut `'SS'`, une chaîne plus longue que l'original. Pour une langue
précise, `toLocaleUpperCase('tr')` applique par exemple les règles turques du i.

## Erreurs fréquentes

**Appeler une méthode sans garder son résultat.** `email.trim();` seul sur sa ligne ne
change rien : écris `email = email.trim()`, ou utilise directement la valeur renvoyée.

**Croire que `fin` est inclus.** `'JavaScript'.slice(0, 4)` renvoie `'Java'`, soit les
index 0 à 3.

**Utiliser `substring` avec des index négatifs.** Ils sont ramenés à 0. Pour compter
depuis la fin, `slice`.

**Mettre en majuscule avec `texte[0]` sur une chaîne potentiellement vide.** `''[0]` vaut
`undefined`. `charAt(0)` renvoie `''`, sans erreur.

## À retenir

- Aucune méthode ne modifie la chaîne : garde le résultat.
- `trim()` avant toute comparaison ou validation d'une saisie.
- `slice(debut, fin)` : `fin` exclu, index négatifs depuis la fin.
- Préfère `slice` à `substring`.
- Les méthodes s'enchaînent : `saisie.trim().toLowerCase()`.

## Exercices

1. Normalise l'adresse e-mail saisie `"  Ada@Exemple.FR "` pour obtenir `"ada@exemple.fr"`.

   :::indice
   Deux transformations sont nécessaires : retirer les espaces, puis uniformiser la casse.
   :::

   :::solution
   ```js
   const saisie = '  Ada@Exemple.FR ';
   const email = saisie.trim().toLowerCase();
   console.log(email); // 'ada@exemple.fr'
   ```

   On normalise avant d'enregistrer ou de comparer : sinon la même adresse, tapée avec une
   majuscule, créerait deux comptes.
   :::

2. Masque un numéro de carte : `'4970123412345678'` doit s'afficher
   `'**** **** **** 5678'`.

   :::indice
   Tu n'as besoin que des quatre derniers caractères : un index négatif les désigne
   directement.
   :::

   :::solution
   ```js
   const numero = '4970123412345678';
   const masque = `**** **** **** ${numero.slice(-4)}`;
   console.log(masque); // '**** **** **** 5678'
   ```
   :::

3. Mets la première lettre d'un prénom en majuscule : `'ada'` doit devenir `'Ada'`, et une
   chaîne vide doit rester vide sans erreur.

   :::indice
   Découpe le texte en deux : le premier caractère, que tu passes en majuscule, et le reste,
   que tu gardes tel quel.
   :::

   :::indice
   Pour le premier caractère, `charAt(0)` renvoie `''` sur une chaîne vide, là où `[0]`
   renverrait `undefined`.
   :::

   :::solution
   ```js
   const capitaliser = (texte) => texte.charAt(0).toUpperCase() + texte.slice(1);

   console.log(capitaliser('ada')); // 'Ada'
   console.log(capitaliser('')); // ''
   ```
   :::

## Questions d'entretien

- Quelle est la différence entre `slice` et `substring` ?

  :::indice
  Compare leur comportement avec un index négatif, puis avec un début plus grand que la fin.
  :::

  :::reponse
  Les deux extraient de `debut` inclus à `fin` exclu. `slice` interprète un index négatif
  comme une position depuis la fin, et renvoie une chaîne vide si `debut` dépasse `fin`.
  `substring` ramène les index négatifs à 0 et inverse les bornes quand `debut` dépasse
  `fin`. `slice` est plus prévisible et existe aussi sur les tableaux : c'est le choix par
  défaut. `substr`, un troisième cousin, est obsolète.
  :::

- Pourquoi `texte.trim();` seul sur une ligne ne change-t-il rien ?

  :::indice
  Que fait `trim` de la chaîne d'origine ?
  :::

  :::reponse
  Les chaînes sont immuables : `trim` ne modifie pas `texte`, il renvoie une nouvelle
  chaîne. Si ce résultat n'est ni affecté ni utilisé, il est perdu. Il faut écrire
  `texte = texte.trim()`, ou utiliser directement la valeur renvoyée. Certaines règles
  ESLint signalent justement les appels dont le résultat est ignoré.
  :::

- Comment mettre en majuscule la première lettre de chaque mot d'une phrase ?

  :::indice
  Découpe la phrase en mots, transforme chacun, puis rassemble-les.
  :::

  :::reponse
  On découpe avec `split(' ')`, on transforme chaque mot avec
  `mot.charAt(0).toUpperCase() + mot.slice(1)` via `map`, puis on rassemble avec
  `join(' ')`. Pour du texte multilingue ou des noms composés (« jean-pierre »), il faut
  aussi traiter les tirets, et les règles de casse propres à certaines langues avec
  `toLocaleUpperCase`.
  :::
