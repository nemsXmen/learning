---
id: javascript-objets-creer
title: "Créer et manipuler un objet"
slug: creer-et-manipuler-un-objet
technology: javascript
level: beginner
module: objets
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-primitives-references
skills:
  - objects-basics
tags:
  - javascript
  - objets
---

## Objectifs

- Créer un objet littéral, et lire ses propriétés avec le point ou les crochets.
- Ajouter, modifier et supprimer une propriété, y compris avec un nom calculé.
- Tester l'existence d'une propriété et lire une structure imbriquée sans erreur.

## Introduction

Un tableau range des valeurs par position ; un **objet** les range par **nom**. C'est la
structure de données centrale de JavaScript : une réponse d'API, la configuration d'une
application, l'état d'un composant, tout est objet. Ce chapitre couvre les gestes
quotidiens — lire, écrire, supprimer — et les pièges qui vont avec.

## Concept

Un objet est un ensemble de paires **clé / valeur**. La clé est une chaîne ; la valeur est
n'importe quoi, y compris un autre objet ou une fonction.

| Opération | Syntaxe | Exemple |
| --- | --- | --- |
| Créer | `{ cle: valeur }` | `{ nom: 'Ada', age: 36 }` |
| Lire | `objet.cle` | `utilisateur.nom` |
| Lire avec un nom calculé | `objet[expression]` | `utilisateur[champ]` |
| Ajouter ou modifier | `objet.cle = valeur` | `utilisateur.role = 'admin'` |
| Supprimer | `delete objet.cle` | `delete utilisateur.age` |
| Tester la présence | `'cle' in objet` | `'role' in utilisateur` |
| Tester une propriété propre | `Object.hasOwn(objet, 'cle')` | — |
| Lire sans risque | `objet.a?.b` | `utilisateur.adresse?.ville` |

La notation par point veut un nom écrit littéralement ; les crochets acceptent n'importe
quelle expression, donc une variable.

## Exemple

```js
const utilisateur = {
  nom: 'Ada',
  age: 36,
  adresse: { ville: 'Londres', pays: 'UK' },
  saluer() {
    return `Bonjour ${this.nom}`;
  },
};

console.log(utilisateur.nom); // 'Ada'
console.log(utilisateur['nom']); // 'Ada'
console.log(utilisateur.adresse.ville); // 'Londres'
console.log(utilisateur.saluer()); // 'Bonjour Ada'

const champ = 'age';
console.log(utilisateur[champ]); // 36
console.log(utilisateur.champ); // undefined : la clé 'champ' n'existe pas

utilisateur.role = 'admin'; // ajoute
utilisateur.age = 37; // modifie
delete utilisateur.age; // supprime

console.log('role' in utilisateur); // true
console.log(Object.hasOwn(utilisateur, 'age')); // false
console.log(utilisateur.telephone?.mobile); // undefined, sans erreur
```

## Comment ça fonctionne

Les clés d'un objet sont toujours des **chaînes** — ou des symboles, vus plus tard. Une clé
numérique est convertie : `{ 1: 'a' }` a la clé `'1'`, et `objet[1]` et `objet['1']`
désignent la même propriété.

L'**ordre des clés** n'est pas l'ordre d'insertion dans tous les cas : les clés qui
ressemblent à des entiers positifs viennent d'abord, en ordre croissant, puis les autres
dans leur ordre d'insertion. `Object.keys({ b: 1, 2: 2, a: 3, 1: 4 })` donne
`['1', '2', 'b', 'a']`.

Lire une propriété absente renvoie `undefined`, sans erreur. Mais lire une propriété **de
cette valeur** échoue : `utilisateur.telephone.mobile` lève
`TypeError: Cannot read properties of undefined`. Le chaînage optionnel `?.` interrompt
l'évaluation et renvoie `undefined` dès que la valeur à gauche est `null` ou `undefined`.

`'cle' in objet` regarde aussi les propriétés héritées : `'toString' in {}` vaut `true`.
`Object.hasOwn(objet, 'cle')` ne regarde que les propriétés propres, et c'est ce qu'on veut
la plupart du temps.

Une propriété qui existe avec la valeur `undefined` n'est pas la même chose qu'une propriété
absente : `in` et `Object.hasOwn` les distinguent, pas la lecture directe.

## Erreurs fréquentes

**Utiliser le point avec une variable.** `utilisateur.champ` cherche la clé littérale
`'champ'`. Avec une variable, il faut `utilisateur[champ]`.

**Traverser une structure imbriquée sans précaution.** Dès qu'un niveau peut manquer,
utilise `?.`, éventuellement avec `??` pour la valeur de repli.

**Confondre « valeur `undefined` » et « propriété absente ».** Utilise `Object.hasOwn` si
la distinction compte.

**Appeler `objet.hasOwnProperty(...)`.** La méthode peut être masquée par une propriété du
même nom. `Object.hasOwn(objet, cle)` est la forme moderne et sûre.

## À retenir

- Objet = paires clé / valeur ; clés toujours des chaînes.
- Point pour un nom littéral, crochets pour un nom calculé.
- Propriété absente : `undefined` ; propriété **de** `undefined` : `TypeError`.
- `?.` pour lire sans risque, `??` pour la valeur de repli.
- `Object.hasOwn` pour les propriétés propres ; `in` regarde aussi l'héritage.

## Exercices

1. Crée un objet `livre` avec un titre, un auteur et une année. Ajoute un booléen `emprunte`,
   change l'année, puis supprime l'auteur. Affiche les clés restantes.

   :::indice
   `Object.keys(objet)` renvoie le tableau des noms de propriétés.
   :::

   :::solution
   ```js
   const livre = { titre: 'Clean Code', auteur: 'Martin', annee: 2008 };

   livre.emprunte = true;
   livre.annee = 2009;
   delete livre.auteur;

   console.log(Object.keys(livre)); // ['titre', 'annee', 'emprunte']
   ```
   :::

2. Écris une fonction `lire(objet, champ)` qui renvoie la valeur du champ demandé, ou
   `'Champ inconnu'` si la propriété n'existe pas.

   :::indice
   Le nom du champ est dans une variable : la notation par point ne convient pas.
   :::

   :::indice
   Pour distinguer une propriété absente d'une propriété valant `undefined`, teste son
   existence plutôt que sa valeur.
   :::

   :::solution
   ```js
   function lire(objet, champ) {
     return Object.hasOwn(objet, champ) ? objet[champ] : 'Champ inconnu';
   }

   const utilisateur = { nom: 'Ada', surnom: undefined };
   console.log(lire(utilisateur, 'nom')); // 'Ada'
   console.log(lire(utilisateur, 'surnom')); // undefined : la clé existe
   console.log(lire(utilisateur, 'age')); // 'Champ inconnu'
   ```
   :::

3. Affiche la ville d'un utilisateur, ou `'Ville inconnue'`, sachant que `adresse` peut être
   absente.

   :::indice
   Deux opérateurs se combinent : l'un évite l'erreur, l'autre fournit la valeur de repli.
   :::

   :::solution
   ```js
   const sansAdresse = { nom: 'Grace' };
   const avecAdresse = { nom: 'Ada', adresse: { ville: 'Londres' } };

   console.log(sansAdresse.adresse?.ville ?? 'Ville inconnue'); // 'Ville inconnue'
   console.log(avecAdresse.adresse?.ville ?? 'Ville inconnue'); // 'Londres'
   ```

   Sans `?.`, la première ligne lèverait une `TypeError`. Avec `||` au lieu de `??`, une
   ville valant `''` serait remplacée à tort.
   :::

## Questions d'entretien

- Quand faut-il utiliser les crochets plutôt que le point ?

  :::indice
  Qu'est-ce que le point accepte comme nom de propriété ?
  :::

  :::reponse
  Le point exige un nom d'identifiant écrit littéralement. Les crochets évaluent une
  expression : ils sont nécessaires quand le nom est dans une variable, quand il est calculé,
  ou quand il n'est pas un identifiant valide — `objet['mon-champ']`, `objet['2 clés']`. Le
  point reste préférable quand le nom est connu, car il est plus lisible et permet une
  meilleure vérification par les outils.
  :::

- Quelle différence entre `'cle' in objet` et `objet.cle !== undefined` ?

  :::indice
  Que se passe-t-il pour une propriété qui existe mais vaut `undefined` ? Et pour une
  propriété héritée ?
  :::

  :::reponse
  `in` teste l'existence de la propriété, y compris quand sa valeur est `undefined`, et
  regarde aussi la chaîne de prototypes — `'toString' in {}` vaut `true`. Comparer à
  `undefined` teste la valeur : une propriété absente et une propriété valant `undefined`
  donnent le même résultat. Pour tester une propriété **propre**, la forme recommandée est
  `Object.hasOwn(objet, 'cle')`.
  :::

- Dans quel ordre les clés d'un objet sont-elles parcourues ?

  :::indice
  Essaie avec un objet mêlant des clés numériques et des clés textuelles.
  :::

  :::reponse
  Les clés qui ressemblent à des entiers positifs viennent en premier, en ordre numérique
  croissant, puis les clés textuelles dans leur ordre d'insertion, puis les symboles. Ce
  comportement est spécifié depuis ES2015 et vaut pour `Object.keys`, `for...in` et
  `JSON.stringify`. Il surprend avec des identifiants numériques : si l'ordre d'insertion
  doit être respecté, on utilise une `Map`, vue au module suivant.
  :::
