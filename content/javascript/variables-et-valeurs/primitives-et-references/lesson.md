---
id: javascript-primitives-references
title: "Valeurs primitives, références et mutabilité"
slug: primitives-et-references
technology: javascript
level: beginner
module: variables-et-valeurs
order: 4
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-types-primitifs
skills:
  - references-mutability
tags:
  - javascript
  - types
---

## Objectifs

- Comprendre ce qui est copié quand on affecte une primitive, puis un objet.
- Savoir pourquoi deux objets identiques ne sont pas égaux avec `===`.
- Distinguer copie superficielle et copie profonde, et choisir la bonne.

## Introduction

`const b = a; b.total = 99;` — et soudain `a.total` vaut 99 aussi. Ce comportement
surprend tous les débutants, et il cause encore des bugs chez des développeurs
confirmés : un objet modifié « à distance », un état partagé par erreur entre deux
parties d'une application. Tout s'explique par une seule règle : une variable ne
contient jamais un objet, elle contient une **référence** vers cet objet.

## Concept

| | Primitives | Objets (dont tableaux et fonctions) |
| --- | --- | --- |
| Ce que contient la variable | la valeur elle-même | une référence vers l'objet |
| Ce que copie `b = a` | la valeur | la référence : les deux noms désignent le même objet |
| Ce que compare `===` | les valeurs | l'identité : est-ce le même objet ? |
| Peut-on modifier la valeur ? | non, elle est immuable | oui, l'objet est mutable |

JavaScript copie **toujours** la valeur contenue dans la variable. Pour une primitive,
c'est la donnée ; pour un objet, c'est l'adresse de l'objet. D'où la formule exacte :
les objets sont passés **par partage** — on partage l'objet, pas la variable.

Une primitive est **immuable** : `'abc'.toUpperCase()` ne modifie pas `'abc'`, elle
renvoie une nouvelle chaîne. Un objet est **mutable** : on peut changer ses propriétés
sans changer la référence.

## Exemple

```js
// Primitives : la valeur est copiée
let prixA = 10;
let prixB = prixA;
prixB += 5;
console.log(prixA, prixB); // 10 15

// Objets : la référence est copiée, l'objet est partagé
const panier = { total: 10 };
const memePanier = panier;
memePanier.total = 99;
console.log(panier.total); // 99

// === compare l'identité, pas le contenu
console.log({ total: 99 } === { total: 99 }); // false : deux objets distincts
console.log(panier === memePanier); // true : le même objet

// Une copie superficielle crée un nouvel objet
const copie = { ...panier };
copie.total = 0;
console.log(panier.total); // 99 : l'original est intact
```

## Comment ça fonctionne

Un objet vit quelque part en mémoire ; la variable garde l'adresse. Affecter la
variable à une autre copie l'adresse, si bien que les deux noms pointent vers le même
objet. Réaffecter l'un des deux noms, en revanche, ne touche pas l'autre :

```js
let a = { n: 1 };
let b = a;
b = { n: 2 }; // b pointe maintenant vers un autre objet
console.log(a.n); // 1
```

Le spread `{ ...objet }` crée une **copie superficielle** : un nouvel objet au premier
niveau, mais les objets imbriqués restent partagés.

```js
const original = { nom: 'Ada', adresse: { ville: 'Londres' } };
const superficielle = { ...original };
superficielle.adresse.ville = 'Paris';
console.log(original.adresse.ville); // 'Paris' : l'adresse était partagée

const profonde = structuredClone(original);
profonde.adresse.ville = 'Rome';
console.log(original.adresse.ville); // 'Paris' : intact
```

`structuredClone` copie en profondeur les objets, tableaux, dates, `Map` et `Set`, mais
refuse les fonctions : il lève alors une erreur.

Les chaînes ne se modifient jamais en place. En mode strict, écrire dans un caractère lève
une `TypeError` ; en mode normal, l'écriture est ignorée silencieusement.

## Erreurs fréquentes

**Modifier un objet reçu en croyant travailler sur une copie.** L'objet d'origine change
aussi. Crée une copie avant de modifier, ou construis un nouvel objet.

**Comparer deux objets avec `===` pour vérifier leur contenu.** `===` ne compare que
l'identité. Compare les propriétés qui comptent, une à une.

**Croire que le spread copie en profondeur.** `{ ...objet }` ne copie que le premier
niveau. Pour des données imbriquées, utilise `structuredClone`.

**Penser que `const` protège le contenu.** `const` empêche de réaffecter la référence,
pas de modifier l'objet.

## À retenir

- Une variable contient une valeur primitive, ou une référence vers un objet.
- `b = a` avec un objet partage l'objet : les deux noms modifient la même chose.
- `===` sur des objets compare l'identité, jamais le contenu.
- `{ ...objet }` copie un niveau ; `structuredClone` copie en profondeur.
- Les primitives sont immuables : leurs méthodes renvoient de nouvelles valeurs.

## Exercices

1. Prévois ce qu'affiche ce code, puis explique pourquoi.

   ```js
   const original = { nom: 'Ada', competences: ['maths'] };
   const copie = { ...original };
   copie.nom = 'Grace';
   copie.competences.push('code');
   console.log(original);
   ```

   :::indice
   Le spread crée un nouvel objet, mais jusqu'à quelle profondeur ?
   :::

   :::solution
   ```js
   // { nom: 'Ada', competences: ['maths', 'code'] }
   ```

   `copie` est un nouvel objet : changer `copie.nom` ne touche pas l'original. Mais le
   tableau `competences` n'a pas été copié ; les deux objets partagent le même tableau, et
   `push` le modifie pour les deux. `structuredClone(original)` aurait évité le partage.
   :::

2. Deux produits `a` et `b` ont les propriétés `id` et `prix`. Écris une comparaison qui
   renvoie `true` quand ils ont le même contenu.

   :::indice
   `a === b` compare l'identité. Il faut comparer les propriétés une par une.
   :::

   :::solution
   ```js
   const a = { id: 7, prix: 20 };
   const b = { id: 7, prix: 20 };

   console.log(a === b); // false : deux objets distincts
   const memeContenu = a.id === b.id && a.prix === b.prix;
   console.log(memeContenu); // true
   ```

   `JSON.stringify(a) === JSON.stringify(b)` semble plus court, mais il dépend de l'ordre
   des propriétés : `{ id, prix }` et `{ prix, id }` donneraient des chaînes différentes.
   :::

3. Montre qu'une chaîne ne peut pas être modifiée en place.

   :::indice
   Essaie de remplacer le premier caractère avec `mot[0] = 'X'`, puis affiche `mot`.
   :::

   :::solution
   ```js
   'use strict';

   const mot = 'java';
   try {
     mot[0] = 'J';
   } catch (erreur) {
     console.log(erreur.constructor.name); // 'TypeError'
   }
   console.log(mot); // 'java'

   const corrige = 'J' + mot.slice(1);
   console.log(corrige); // 'Java' : une nouvelle chaîne
   ```

   Hors mode strict, l'écriture est simplement ignorée. Dans tous les cas, on obtient une
   chaîne modifiée en en construisant une nouvelle.
   :::

## Questions d'entretien

- JavaScript passe-t-il les objets par référence ?

  :::indice
  Que se passe-t-il si une fonction réaffecte son paramètre, puis si elle modifie une
  propriété de ce paramètre ?
  :::

  :::reponse
  Pas au sens strict. JavaScript passe toujours par valeur, mais pour un objet cette
  valeur est une référence : on parle de passage par partage. Si une fonction modifie une
  propriété du paramètre, l'appelant voit la modification, puisque l'objet est partagé. Si
  elle réaffecte le paramètre à un autre objet, l'appelant ne voit rien, car seule la copie
  locale de la référence a changé.
  :::

- Quelle est la différence entre une copie superficielle et une copie profonde ?

  :::indice
  Que devient un objet imbriqué dans chacun des deux cas ?
  :::

  :::reponse
  Une copie superficielle crée un nouvel objet de premier niveau, mais ses propriétés
  objets restent partagées avec l'original : `{ ...objet }`, `Object.assign` ou
  `[...tableau]`. Une copie profonde duplique récursivement tous les niveaux :
  `structuredClone`, qui gère les dates, `Map` et `Set` mais refuse les fonctions. On
  choisit la profondeur selon qu'on va modifier ou non les données imbriquées.
  :::

- Pourquoi `[] === []` vaut-il `false` ?

  :::indice
  Combien de tableaux cette expression crée-t-elle ?
  :::

  :::reponse
  Chaque littéral `[]` crée un nouveau tableau en mémoire. `===` appliqué à des objets
  compare leur identité — est-ce le même objet ? — et non leur contenu. Deux tableaux
  vides distincts ne sont donc jamais égaux. Pour comparer des contenus, il faut parcourir
  les éléments, ou comparer une représentation contrôlée.
  :::
