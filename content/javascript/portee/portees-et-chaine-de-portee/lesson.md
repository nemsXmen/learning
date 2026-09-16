---
id: javascript-portees
title: "Portées et chaîne de portée"
slug: portees-et-chaine-de-portee
technology: javascript
level: intermediate
module: portee
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-functions
skills:
  - scope-chain
tags:
  - javascript
  - portee
---

## Objectifs

- Distinguer portée globale, portée de fonction et portée de bloc.
- Suivre la chaîne de portée que le moteur remonte pour résoudre un nom.
- Comprendre pourquoi la portée dépend de l'endroit où le code est **écrit**.

## Introduction

« Pourquoi cette variable est-elle `undefined` ici alors qu'elle existe deux lignes plus
haut ? » Presque toutes les questions de ce genre se répondent avec une seule notion : la
**portée**, c'est-à-dire la zone du code où un nom est visible. C'est aussi le socle des
closures, du hoisting et de la moitié des erreurs qu'on rencontre au quotidien.

## Concept

| Portée | Créée par | Visible depuis |
| --- | --- | --- |
| Globale | le niveau supérieur d'un script | partout |
| Module | le niveau supérieur d'un module ES | ce module seulement |
| Fonction | chaque appel de fonction | la fonction et ce qu'elle contient |
| Bloc | une paire d'accolades, pour `let` et `const` | ce bloc et ce qu'il contient |

Deux règles gouvernent tout le reste :

1. Une portée intérieure voit les portées extérieures ; l'inverse est faux.
2. La portée est **lexicale** : elle dépend de l'endroit où la fonction est écrite, pas de
   l'endroit d'où elle est appelée.

## Exemple

```js
const application = 'Atelier'; // portée du module

function afficherEntete() {
  const titre = 'Bienvenue'; // portée de la fonction

  function ligne() {
    return `${titre} — ${application}`; // voit les deux portées extérieures
  }

  return ligne();
}

console.log(afficherEntete()); // 'Bienvenue — Atelier'
// console.log(titre); // ReferenceError : titre n'existe pas ici

if (true) {
  let bloc = 'visible dans le bloc';
  var fonction = 'visible dans toute la fonction';
  console.log(bloc); // 'visible dans le bloc'
}
// console.log(bloc); // ReferenceError
console.log(fonction); // 'visible dans toute la fonction' : var ignore les blocs

const message = 'extérieur';
function lire() {
  return message; // résolu là où lire est écrite
}
function appeler() {
  const message = 'intérieur';
  return lire(); // 'extérieur', et non 'intérieur'
}
console.log(appeler()); // 'extérieur'
```

## Comment ça fonctionne

Chaque appel de fonction crée un **environnement** : une table des variables déclarées dans
cette fonction, et un lien vers l'environnement où la fonction a été **écrite**. Quand le
moteur rencontre un nom, il le cherche dans l'environnement courant ; s'il ne le trouve pas,
il suit le lien vers l'environnement parent, et ainsi de suite jusqu'au niveau supérieur.
Cette suite de liens est la **chaîne de portée**. Si le nom n'existe nulle part, c'est
`ReferenceError: x is not defined`.

Comme le lien pointe vers le lieu d'**écriture** et non d'appel, la portée est dite
lexicale : c'est visible dans l'exemple, où `lire` renvoie `'extérieur'` même appelée depuis
une fonction qui possède un `message` local. Certains langages font l'inverse — portée
dynamique — et JavaScript ne le fait pas, ce qui rend le code prévisible à la lecture.

`let` et `const` sont limités au **bloc** : toute paire d'accolades, y compris celle d'un
`if` ou d'une boucle, crée une portée. `var` ignore les blocs et appartient à la fonction
entière, ce qui explique qu'une variable déclarée dans un `if` reste visible après lui.
C'est la principale raison pour laquelle `var` n'est plus utilisé.

Au niveau supérieur, un script classique déclare des variables globales ; un **module ES**,
lui, a sa propre portée : ses variables ne polluent pas l'espace global, ce qui évite les
collisions entre fichiers.

Une portée intérieure peut déclarer un nom déjà pris à l'extérieur : c'est le masquage, vu
en détail au chapitre suivant. Elle ne peut pas, en revanche, rendre visible un nom vers
l'extérieur — sauf en le renvoyant, ce qui mène tout droit aux closures.

## Erreurs fréquentes

**Déclarer avec `var` dans un bloc en attendant qu'il y reste.** `var` appartient à la
fonction : utilise `let` ou `const`.

**Affecter sans déclarer.** `compteur = 0` crée une globale en mode non strict, et lève une
`ReferenceError` en mode strict. Déclare toujours.

**Croire qu'une fonction voit les variables de son appelant.** La portée suit le lieu
d'écriture, pas d'appel.

**Tout déclarer au niveau supérieur « au cas où ».** Chaque nom global est une collision
potentielle : garde les variables au plus près de leur usage.

## À retenir

- Portées : globale ou module, fonction, bloc ; l'intérieur voit l'extérieur.
- La chaîne de portée est remontée jusqu'à trouver le nom, sinon `ReferenceError`.
- La portée est lexicale : elle dépend d'où le code est écrit.
- `let` et `const` sont limités au bloc, `var` à la fonction.
- Un module ES a sa propre portée, il ne pollue pas l'espace global.

## Exercices

1. Dis, pour chaque `console.log`, s'il affiche une valeur ou lève une erreur, et pourquoi.

   ```js
   const a = 1;
   function externe() {
     const b = 2;
     function interne() {
       const c = 3;
       console.log(a, b, c);
     }
     interne();
     console.log(c);
   }
   externe();
   console.log(b);
   ```

   :::indice
   Une portée intérieure voit l'extérieur ; l'inverse n'est jamais vrai.
   :::

   :::solution
   `console.log(a, b, c)` affiche `1 2 3` : `interne` voit sa propre variable et remonte la
   chaîne pour les deux autres. `console.log(c)` lève `ReferenceError: c is not defined`,
   car `c` appartient à `interne`. `console.log(b)` échoue de même, `b` appartenant à
   `externe`.
   :::

2. Corrige ce code pour que la variable de configuration reste confinée au bloc.

   ```js
   if (process.env.NODE_ENV === 'production') {
     var niveau = 'error';
   }
   console.log(niveau);
   ```

   :::indice
   Quelle déclaration respecte les accolades ?
   :::

   :::solution
   ```js
   const niveau = process.env.NODE_ENV === 'production' ? 'error' : 'debug';
   console.log(niveau);
   ```

   Avec `var`, la variable appartient à la fonction entière et vaut `undefined` hors
   production. Avec `let` dans le bloc, elle ne serait plus visible après : il faut donc
   déclarer à l'extérieur, et le ternaire dit clairement les deux cas.
   :::

3. Écris une fonction `creerCompteur()` dont la variable interne n'est pas accessible de
   l'extérieur, mais qui incrémente à chaque appel de la fonction renvoyée.

   :::indice
   Déclare la variable dans la fonction externe, et renvoie une fonction qui la modifie.
   :::

   :::solution
   ```js
   function creerCompteur() {
     let valeur = 0;
     return () => {
       valeur += 1;
       return valeur;
     };
   }

   const compter = creerCompteur();
   console.log(compter(), compter(), compter()); // 1 2 3
   // console.log(valeur); // ReferenceError : inaccessible de l'extérieur
   ```

   La fonction renvoyée garde accès à la portée où elle a été écrite, même après le retour de
   `creerCompteur` : c'est une closure, sujet du module 13.
   :::

## Questions d'entretien

- Qu'est-ce que la chaîne de portée ?

  :::indice
  Que fait le moteur quand il ne trouve pas un nom dans la portée courante ?
  :::

  :::reponse
  C'est la suite d'environnements que le moteur remonte pour résoudre un nom : d'abord la
  portée courante, puis celle qui la contient lexicalement, jusqu'au niveau supérieur. Le
  premier environnement qui contient le nom l'emporte ; si aucun ne le contient, c'est
  `ReferenceError`. Cette chaîne est construite à partir de l'endroit où le code est écrit, et
  elle ne change jamais d'un appel à l'autre.
  :::

- Portée lexicale ou dynamique : quelle différence ?

  :::indice
  Une fonction voit-elle les variables de celle qui l'appelle ?
  :::

  :::reponse
  En portée lexicale — celle de JavaScript —, une fonction résout ses noms là où elle est
  **écrite** : elle ne voit jamais les variables locales de son appelant. En portée dynamique,
  elle les verrait, et son comportement dépendrait du chemin d'appel. Le choix lexical rend le
  code lisible statiquement : on sait ce qu'une fonction voit en regardant son fichier, sans
  chercher qui l'appelle.
  :::

- Pourquoi `var` pose-t-il problème dans un bloc ?

  :::indice
  À quelle portée `var` appartient-il ?
  :::

  :::reponse
  `var` est lié à la **fonction**, pas au bloc : une variable déclarée dans un `if` ou une
  boucle reste visible après, et vaut `undefined` si la branche n'a pas été prise. Combiné au
  hoisting, cela produit des variables qui existent avant leur ligne et survivent à leur bloc.
  `let` et `const`, limités au bloc, expriment exactement la durée de vie voulue — et c'est
  aussi ce qui corrige le piège des closures dans les boucles.
  :::
