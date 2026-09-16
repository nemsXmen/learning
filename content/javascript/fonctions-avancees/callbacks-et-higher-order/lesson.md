---
id: javascript-callbacks
title: "Callbacks et fonctions d'ordre supérieur"
slug: callbacks-et-higher-order
technology: javascript
level: intermediate
module: fonctions-avancees
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-fonctions-flechees
skills:
  - callbacks
  - higher-order-functions
tags:
  - javascript
  - fonctions
---

## Objectifs

- Traiter une fonction comme une valeur : la stocker, la passer, la renvoyer.
- Écrire une fonction d'ordre supérieur qui reçoit un comportement en argument.
- Distinguer passer une fonction et appeler une fonction.

## Introduction

`map`, `filter`, `sort`, `addEventListener`, `setTimeout` : toutes ces fonctions ont un
point commun, elles prennent **une fonction en argument**. C'est le mécanisme d'extension
de JavaScript : plutôt que de prévoir tous les comportements, une fonction laisse l'appelant
fournir la partie variable. Comprendre ce mécanisme, c'est pouvoir écrire ses propres
abstractions au lieu de seulement consommer celles des autres.

## Concept

| Terme | Définition |
| --- | --- |
| Fonction comme valeur | une fonction se range dans une variable, un tableau, un objet |
| Callback | une fonction passée en argument, appelée par celle qui la reçoit |
| Fonction d'ordre supérieur | une fonction qui reçoit une fonction, en renvoie une, ou les deux |

La distinction la plus importante du chapitre :

| Écriture | Sens |
| --- | --- |
| `traiter(action)` | passe la fonction, qui sera appelée plus tard |
| `traiter(action())` | appelle la fonction **maintenant** et passe son résultat |

## Exemple

```js
const crier = (texte) => texte.toUpperCase();
const chuchoter = (texte) => texte.toLowerCase();

const styles = { crier, chuchoter };
console.log(styles.crier('bonjour')); // 'BONJOUR'

function repeter(nombre, action) {
  for (let i = 0; i < nombre; i++) {
    action(i);
  }
}
repeter(3, (i) => console.log(`tour ${i}`)); // tour 0, tour 1, tour 2

function appliquer(valeur, ...transformations) {
  let resultat = valeur;
  for (const transformation of transformations) {
    resultat = transformation(resultat);
  }
  return resultat;
}
console.log(appliquer(' Ada ', (t) => t.trim(), crier)); // 'ADA'

const produits = [{ prix: 30 }, { prix: 10 }];
console.log(produits.toSorted((a, b) => a.prix - b.prix)[0].prix); // 10

console.log(['1', '7', '11'].map(parseInt)); // [1, NaN, 3] : surprise expliquée plus bas
```

## Comment ça fonctionne

Passer une fonction, c'est passer sa **référence** : `repeter(3, action)` transmet la
fonction elle-même, que `repeter` appellera au moment voulu. Ajouter des parenthèses,
`repeter(3, action())`, l'appelle immédiatement et transmet son résultat — le plus souvent
`undefined`. C'est l'erreur la plus fréquente avec les gestionnaires d'événements.

La fonction qui reçoit le callback décide **quand** l'appeler, **combien de fois**, et avec
**quels arguments**. C'est la clé de la surprise de l'exemple : `map` appelle son callback
avec trois arguments — élément, index, tableau — et `parseInt` en accepte deux, la chaîne et
la **base**. `parseInt('7', 1)` est invalide et donne `NaN`, `parseInt('11', 2)` lit du
binaire et donne 3. La correction est d'écrire un callback qui ne prend que ce qu'il veut :
`['1', '7', '11'].map((n) => parseInt(n, 10))`.

Un callback n'est pas forcément asynchrone. Celui de `map` est appelé immédiatement, dans
l'ordre ; celui de `setTimeout` ou d'un écouteur d'événement est appelé plus tard, une fois
la pile vidée. C'est la partie Asynchronous qui détaille ce mécanisme ; ici, retiens
seulement que rien ne garantit le moment de l'appel.

En Node.js historique, les callbacks suivent la convention **erreur d'abord** :
`lire(chemin, (erreur, donnees) => …)`. L'imbrication de ces callbacks a donné le fameux
« callback hell », que les promesses et `async`/`await` ont résolu.

Enfin, un callback nommé rend les piles d'appels lisibles et le code testable séparément :
`bouton.addEventListener('click', envoyerFormulaire)` se relit mieux qu'une fonction
anonyme de vingt lignes.

## Erreurs fréquentes

**Appeler au lieu de passer.** `setTimeout(afficher(), 1000)` exécute tout de suite ; il
faut `setTimeout(afficher, 1000)`.

**Passer une fonction qui accepte plus d'arguments que prévu.** `map(parseInt)` en est
l'exemple canonique : enveloppe-la.

**Supposer qu'un callback s'exécute immédiatement.** Un résultat lu juste après l'appel
peut ne pas encore exister.

**Empiler les callbacks anonymes.** Au-delà de deux niveaux, nomme-les, ou passe aux
promesses.

## À retenir

- Une fonction est une valeur : elle se stocke, se passe, se renvoie.
- Callback : fonction passée à une autre, qui décide quand l'appeler.
- Fonction d'ordre supérieur : elle reçoit ou renvoie une fonction.
- `f` passe la fonction, `f()` passe son résultat.
- La fonction receveuse impose les arguments du callback : `map(parseInt)` en est la preuve.

## Exercices

1. Écris `repeter(nombre, action)` qui appelle `action` autant de fois que demandé, en lui
   passant le numéro du tour.

   :::indice
   `action` est une fonction reçue en paramètre : appelle-la dans la boucle avec l'index.
   :::

   :::solution
   ```js
   function repeter(nombre, action) {
     for (let i = 0; i < nombre; i++) {
       action(i);
     }
   }

   repeter(3, (tour) => console.log(`tour ${tour}`));
   // tour 0
   // tour 1
   // tour 2
   ```
   :::

2. Écris ta propre version de `filter`, sous la forme `filtrer(tableau, predicat)`, sans
   utiliser la méthode native.

   :::indice
   Le prédicat est une fonction qui renvoie vrai ou faux pour chaque élément.
   :::

   :::solution
   ```js
   function filtrer(tableau, predicat) {
     const resultat = [];
     for (let i = 0; i < tableau.length; i++) {
       if (predicat(tableau[i], i, tableau)) {
         resultat.push(tableau[i]);
       }
     }
     return resultat;
   }

   console.log(filtrer([1, 2, 3, 4], (n) => n % 2 === 0)); // [2, 4]
   ```

   En passant aussi l'index et le tableau, la fonction respecte la convention des méthodes
   natives.
   :::

3. Explique pourquoi `['1', '7', '11'].map(parseInt)` renvoie `[1, NaN, 3]`, et corrige.

   :::indice
   Avec combien d'arguments `map` appelle-t-il son callback ? Et que fait `parseInt` du
   deuxième ?
   :::

   :::solution
   `map` appelle son callback avec trois arguments : élément, index, tableau. `parseInt` en
   accepte deux : la chaîne et la **base**. Les appels réels sont donc `parseInt('1', 0)`,
   `parseInt('7', 1)` et `parseInt('11', 2)`. La base 0 est traitée comme 10, la base 1
   n'existe pas — d'où `NaN` —, et `'11'` en binaire vaut 3.

   ```js
   console.log(['1', '7', '11'].map((n) => parseInt(n, 10))); // [1, 7, 11]
   console.log(['1', '7', '11'].map(Number)); // [1, 7, 11]
   ```
   :::

## Questions d'entretien

- Qu'est-ce qu'une fonction d'ordre supérieur ?

  :::indice
  Regarde ce qu'elle prend en entrée et ce qu'elle renvoie.
  :::

  :::reponse
  Une fonction qui reçoit une fonction en argument, en renvoie une, ou les deux. `map`,
  `filter`, `sort`, `setTimeout` et `addEventListener` en sont : elles laissent l'appelant
  fournir la partie variable du comportement. C'est possible parce qu'en JavaScript une
  fonction est une valeur de première classe, qu'on peut stocker et transmettre comme un
  nombre ou un objet.
  :::

- Quelle différence entre passer `f` et passer `f()` ?

  :::indice
  À quel moment la fonction s'exécute-t-elle dans chaque cas ?
  :::

  :::reponse
  `f` passe la fonction elle-même : c'est le destinataire qui l'appellera, quand il le
  décidera. `f()` l'exécute immédiatement et passe sa **valeur de retour**, souvent
  `undefined`. D'où `setTimeout(afficher, 1000)` et non `setTimeout(afficher(), 1000)`. Quand
  il faut passer une fonction avec des arguments figés, on l'enveloppe :
  `setTimeout(() => afficher('salut'), 1000)`.
  :::

- Un callback s'exécute-t-il toujours de façon asynchrone ?

  :::indice
  Compare celui de `map` et celui de `setTimeout`.
  :::

  :::reponse
  Non. Le callback de `map`, `filter` ou `sort` est appelé immédiatement et dans l'ordre :
  tout est terminé quand la méthode renvoie. Celui de `setTimeout`, d'une requête réseau ou
  d'un écouteur d'événement est appelé plus tard. La règle de prudence est de ne rien
  supposer : on lit le résultat là où le callback le produit, pas sur la ligne qui suit
  l'appel.
  :::
