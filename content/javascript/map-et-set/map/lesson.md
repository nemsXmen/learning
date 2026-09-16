---
id: javascript-map
title: "La Map : associer des clés de n'importe quel type"
slug: map
technology: javascript
level: intermediate
module: map-et-set
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-objets-creer
skills:
  - map-collection
tags:
  - javascript
  - map-et-set
---

## Objectifs

- Créer une `Map`, y écrire et y lire des valeurs associées à une clé.
- Utiliser des clés qui ne sont pas des chaînes, y compris des objets.
- Choisir entre une `Map` et un objet littéral, et convertir de l'un à l'autre.

## Introduction

Un objet associe déjà des clés à des valeurs. Mais ses clés sont forcément des chaînes, il
hérite de propriétés qu'on n'a pas écrites, et compter ses entrées demande un détour. La
`Map` est la structure d'association complète : n'importe quelle valeur comme clé, un ordre
d'insertion garanti, une taille immédiate, et des ajouts et suppressions pensés pour être
fréquents.

## Concept

| Opération | Syntaxe | Renvoie |
| --- | --- | --- |
| Créer | `new Map()` ou `new Map([[cle, valeur]])` | la `Map` |
| Écrire | `carte.set(cle, valeur)` | la `Map`, donc chaînable |
| Lire | `carte.get(cle)` | la valeur, ou `undefined` |
| Tester | `carte.has(cle)` | `true` / `false` |
| Retirer | `carte.delete(cle)` | `true` si la clé existait |
| Compter | `carte.size` | un nombre |
| Parcourir | `for (const [cle, valeur] of carte)` | — |
| Vers un objet | `Object.fromEntries(carte)` | un objet |
| Depuis un objet | `new Map(Object.entries(objet))` | une `Map` |

## Exemple

```js
const stock = new Map([
  ['clavier', 12],
  ['souris', 0],
]);

stock.set('ecran', 3).set('souris', 5);
console.log(stock.get('souris')); // 5
console.log(stock.get('inconnu')); // undefined
console.log(stock.has('ecran'), stock.size); // true 3

for (const [produit, quantite] of stock) {
  console.log(`${produit} : ${quantite}`);
}

const ada = { id: 1 };
const grace = { id: 2 };
const derniereVisite = new Map();
derniereVisite.set(ada, '2026-01-15');
derniereVisite.set(grace, '2026-02-03');
console.log(derniereVisite.get(ada)); // '2026-01-15'
console.log(derniereVisite.get({ id: 1 })); // undefined : autre objet

console.log(Object.fromEntries(stock)); // { clavier: 12, souris: 5, ecran: 3 }
console.log([...stock.keys()]); // ['clavier', 'souris', 'ecran']
```

## Comment ça fonctionne

Une `Map` compare ses clés avec *SameValueZero*, comme le `Set` : `1` et `'1'` sont deux
clés différentes, `NaN` est une clé utilisable, et deux objets de même contenu sont deux
clés distinctes. C'est ce qui permet d'associer des données à un objet précis, sans avoir à
lui inventer un identifiant.

L'ordre d'itération est celui des insertions, sans exception — contrairement à l'objet, qui
remonte les clés entières en premier. `carte.keys()`, `carte.values()` et `carte.entries()`
renvoient des itérateurs ; `[...carte]` donne directement un tableau de paires, prêt pour
`map` ou `filter`.

Une `Map` n'hérite d'aucune clé : `carte.has('toString')` vaut `false` sur une carte vide,
là où `'toString' in {}` vaut `true`. Une clé nommée `__proto__` s'y range normalement,
alors qu'elle a un effet spécial sur un objet littéral. Pour des données dont les clés
viennent de l'extérieur, c'est un vrai gain de sûreté.

En contrepartie, `JSON.stringify(new Map([['a', 1]]))` renvoie `'{}'` : une `Map` ne se
sérialise pas. Pour l'envoyer en JSON, on la convertit avec `Object.fromEntries(carte)`, ou
`[...carte]` si les clés ne sont pas des chaînes.

Enfin, `set` renvoie la `Map`, ce qui permet de chaîner les écritures ; `get` renvoie
`undefined` pour une clé absente, valeur qu'il faut distinguer d'une entrée valant
réellement `undefined` avec `has`.

## Erreurs fréquentes

**Écrire `carte[cle] = valeur`.** Cela ajoute une propriété à l'objet `Map`, pas une entrée :
`size` reste à 0. Utilise `set`.

**Attendre que `JSON.stringify` sérialise une `Map`.** Convertis-la d'abord.

**Utiliser un objet comme clé, puis en recréer un identique.** Deux littéraux de même
contenu sont deux clés différentes.

**Choisir une `Map` pour un enregistrement aux champs fixes.** Un objet littéral reste plus
simple à lire et à destructurer.

## À retenir

- `set`, `get`, `has`, `delete`, `size` ; `set` est chaînable.
- N'importe quelle valeur peut être une clé, objets compris.
- Ordre d'insertion garanti, aucune clé héritée.
- `Object.fromEntries(carte)` et `new Map(Object.entries(objet))` convertissent.
- Une `Map` ne se sérialise pas telle quelle en JSON.

## Exercices

1. Compte les occurrences de chaque mot de `['js', 'css', 'js', 'html', 'js']` dans une
   `Map`.

   :::indice
   Pour chaque mot, lis son compte actuel — `0` s'il est absent — et réécris-le.
   :::

   :::solution
   ```js
   const mots = ['js', 'css', 'js', 'html', 'js'];
   const compte = new Map();

   for (const mot of mots) {
     compte.set(mot, (compte.get(mot) ?? 0) + 1);
   }

   console.log(compte.get('js')); // 3
   console.log([...compte]); // [['js', 3], ['css', 1], ['html', 1]]
   ```
   :::

2. Associe une date de dernière connexion à des objets utilisateurs, sans ajouter de
   propriété à ces objets.

   :::indice
   Une `Map` accepte un objet comme clé : c'est l'objet lui-même qui sert d'identifiant.
   :::

   :::solution
   ```js
   const ada = { nom: 'Ada' };
   const grace = { nom: 'Grace' };

   const derniereConnexion = new Map();
   derniereConnexion.set(ada, '2026-01-15');
   derniereConnexion.set(grace, '2026-02-03');

   console.log(derniereConnexion.get(ada)); // '2026-01-15'
   console.log(Object.keys(ada)); // ['nom'] : l'objet n'a pas été modifié
   ```
   :::

3. Convertis un objet de configuration en `Map`, ajoute une entrée, puis renvoie le tout au
   format JSON.

   :::indice
   `Object.entries` dans un sens, `Object.fromEntries` dans l'autre.
   :::

   :::indice
   `JSON.stringify` appliqué directement à une `Map` renvoie `'{}'`.
   :::

   :::solution
   ```js
   const config = { theme: 'clair', langue: 'fr' };

   const carte = new Map(Object.entries(config));
   carte.set('animations', false);

   console.log(JSON.stringify(carte)); // '{}' : la Map ne se sérialise pas
   console.log(JSON.stringify(Object.fromEntries(carte)));
   // '{"theme":"clair","langue":"fr","animations":false}'
   ```
   :::

## Questions d'entretien

- Quand préférer une `Map` à un objet littéral ?

  :::indice
  Regarde d'où viennent les clés, et ce qu'on en fait.
  :::

  :::reponse
  Quand les clés sont des **données** plutôt que des noms de champs écrits dans le code :
  clés inconnues à l'avance, nombreuses, ajoutées et supprimées souvent, ou qui ne sont pas
  des chaînes. La `Map` offre en plus `size`, un ordre d'insertion strict et aucune clé
  héritée, ce qui évite les collisions avec `toString` ou `__proto__`. On garde l'objet pour
  décrire une entité aux champs connus, parce qu'il se destructure et se sérialise en JSON.
  :::

- Pourquoi `carte['cle'] = valeur` ne fonctionne-t-il pas ?

  :::indice
  Qu'est-ce qu'une `Map`, du point de vue du langage ?
  :::

  :::reponse
  Une `Map` reste un objet : les crochets ajoutent une propriété **à cet objet**, sans passer
  par le stockage interne de la collection. `size` ne bouge pas, `get` ne trouve rien et
  l'itération ignore cette propriété. Les entrées ne s'écrivent qu'avec `set` et ne se lisent
  qu'avec `get` — c'est la contrepartie de pouvoir utiliser n'importe quelle valeur comme
  clé.
  :::

- Comment envoyer une `Map` en JSON ?

  :::indice
  Que renvoie `JSON.stringify` sur une `Map`, et pourquoi ?
  :::

  :::reponse
  `JSON.stringify(carte)` renvoie `'{}'`, car le format JSON ne connaît que les objets et les
  tableaux, et les entrées d'une `Map` sont internes. On convertit avant :
  `Object.fromEntries(carte)` si les clés sont des chaînes, sinon `[...carte]`, qui donne un
  tableau de paires reconstructible avec `new Map(paires)`. Une classe peut aussi définir
  `toJSON` pour automatiser cette conversion.
  :::
