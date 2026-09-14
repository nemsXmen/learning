---
id: javascript-syntaxe
title: "Syntaxe : instructions, expressions et commentaires"
slug: syntaxe-instructions-expressions
technology: javascript
level: beginner
module: introduction
order: 3
estimatedMinutes: 25
difficulty: 1
xp: 60
prerequisites: []
skills:
  - syntax-expressions
tags:
  - javascript
  - introduction
---

## Objectifs

- Distinguer une expression, qui produit une valeur, d'une instruction, qui effectue une
  action.
- Savoir où placer les points-virgules, et quand leur absence change le sens du code.
- Écrire des commentaires utiles et respecter les conventions de nommage courantes.

## Introduction

Un programme JavaScript est une suite de phrases que le moteur lit de haut en bas. Comme
dans une langue, il y a une grammaire : certaines phrases **produisent une valeur**,
d'autres **font quelque chose**. Confondre les deux mène à des erreurs de syntaxe
déroutantes, et ignorer la façon dont JavaScript ajoute des points-virgules à ta place
mène à des bugs silencieux.

## Concept

Une **expression** produit une valeur. On peut la placer partout où une valeur est
attendue : à droite d'un `=`, dans les parenthèses d'un appel, dans `${ }` d'un template
literal.

```js
2 + 3            // 5
prix * quantite  // un nombre
nom              // la valeur de la variable
estMajeur(age)   // la valeur renvoyée
total = 10       // une affectation est aussi une expression : elle vaut 10
```

Une **instruction** effectue une action et ne produit pas de valeur utilisable :

```js
let total = 0;               // déclaration
if (total > 3) { total = 3 } // condition
for (;;) { break }           // boucle
return total;                // retour de fonction
```

Une expression suivie d'un point-virgule forme une **instruction-expression** :
`total += 5;` ou `console.log(total);`.

| Élément | Rôle | Exemples |
| --- | --- | --- |
| Expression | produit une valeur | `a + b`, `appel()`, `x = 1` |
| Instruction | effectue une action | `let`, `if`, `for`, `return` |
| Bloc `{ }` | regroupe des instructions | corps d'un `if` ou d'une boucle |
| Commentaire | ignoré par le moteur | `// ligne`, `/* bloc */` |

Les conventions de nommage attendues dans un code professionnel :

- `camelCase` pour les variables et les fonctions : `prixTotal`, `calculerRemise` ;
- `PascalCase` pour les classes : `Utilisateur`, `PanierService` ;
- `MAJUSCULES_AVEC_TIRETS_BAS` pour les constantes de configuration : `TAUX_TVA` ;
- des noms qui disent **ce que la valeur représente** : `utilisateursActifs` plutôt que
  `liste2`.

## Exemple

```js
/**
 * Prix TTC d'un article. La TVA est passée en paramètre, car elle dépend
 * du pays de livraison.
 */
const TAUX_TVA = 0.2;

const prixHT = 50;
const prixTTC = prixHT * (1 + TAUX_TVA); // expression à droite du =

// L'affichage attend une expression : on peut y mettre un calcul
console.log(`Prix TTC : ${prixTTC.toFixed(2)} €`); // Prix TTC : 60.00 €

if (prixTTC > 55) {
  // Seuil fixé par le service commercial, pas une règle technique
  console.log('Livraison offerte');
}
```

## Comment ça fonctionne

Avant d'exécuter quoi que ce soit, le moteur **analyse** tout le texte du fichier et en
construit un arbre syntaxique. Une phrase mal formée à la ligne 200 empêche donc
l'exécution de la ligne 1 : c'est une `SyntaxError`, levée avant le moindre effet.

Les points-virgules sont en partie **insérés automatiquement** (*Automatic Semicolon
Insertion*, ASI). Quand une ligne se termine et que la suivante ne peut pas prolonger la
phrase, le moteur ajoute un `;`. Cette règle a deux pièges célèbres :

```js
function creerUtilisateur(nom) {
  return      // un ; est inséré ici
  {
    nom: nom,
  };
}
console.log(creerUtilisateur('Ada')); // undefined
```

```js
const total = 10
[1, 2].forEach((n) => console.log(n)) // TypeError
```

Dans le second cas, aucune insertion n'a lieu : le moteur lit
`10[1, 2].forEach(...)`, soit « la propriété `2` du nombre `10` », qui vaut `undefined`.
Écrire ses points-virgules, ou laisser un outil comme Prettier les ajouter, supprime ces
ambiguïtés.

## Erreurs fréquentes

**Aller à la ligne juste après `return`.** Le moteur insère un point-virgule et la
fonction renvoie `undefined`. Ouvre l'accolade ou commence l'expression sur la même
ligne que `return`.

**Commencer une ligne par `(` ou `[` sans point-virgule à la ligne précédente.** Les
deux lignes sont lues comme une seule expression.

**Écrire `=` au lieu de `===` dans une condition.** `if (age = 18)` affecte 18 et la
condition est toujours vraie, puisque l'affectation vaut 18.

**Commenter ce que le code dit déjà.** `// ajoute 1 à i` au-dessus de `i += 1`
n'apporte rien. Un bon commentaire explique **pourquoi**.

## À retenir

- Une expression produit une valeur ; une instruction effectue une action.
- Une erreur de syntaxe empêche l'exécution de tout le fichier.
- Ne jamais aller à la ligne juste après `return`.
- `camelCase` pour les variables et fonctions, `PascalCase` pour les classes.
- Un commentaire explique le pourquoi, pas le quoi.

## Exercices

1. Pour chaque ligne, dis s'il s'agit d'une expression, d'une instruction ou d'une
   instruction-expression : `3 * 4`, `let total = 0;`, `total += 5;`,
   `if (total > 3) {}`, `console.log(total)`.

   :::indice
   Essaie mentalement de placer chaque morceau dans `${ }` d'un template literal : seule
   une expression y a sa place.
   :::

   :::solution
   - `3 * 4` : une expression, qui vaut `12`.
   - `let total = 0;` : une instruction de déclaration.
   - `total += 5;` : une instruction-expression — l'affectation est une expression,
     suivie d'un point-virgule.
   - `if (total > 3) {}` : une instruction.
   - `console.log(total)` : une expression (un appel), qui devient une
     instruction-expression quand elle est seule sur sa ligne.
   :::

2. Cette fonction renvoie `undefined` au lieu d'un objet. Corrige-la.

   ```js
   function creerProduit(nom) {
     return
     {
       nom: nom,
     };
   }
   ```

   :::indice
   Regarde ce que le moteur insère à la fin de la ligne qui contient seulement `return`.
   :::

   :::solution
   ```js
   function creerProduit(nom) {
     return {
       nom: nom,
     };
   }
   ```

   Le moteur ajoutait un point-virgule après `return`, qui renvoyait donc `undefined`.
   L'accolade ouvrante sur la même ligne indique que l'expression continue.
   :::

3. Ce code lit un fichier CSV dont la première ligne contient les noms de colonnes.
   Réécris le commentaire pour qu'il soit utile.

   ```js
   // ajoute 1 à i
   i += 1;
   ```

   :::indice
   Le code dit déjà ce qu'il fait. Le commentaire doit dire ce que le code ne peut pas
   dire tout seul.
   :::

   :::solution
   ```js
   // La première ligne du CSV contient les noms de colonnes, pas des données.
   i += 1;
   ```

   Un lecteur comprend désormais pourquoi on saute une ligne, et saura qu'il faut modifier
   ce code si le format du fichier change.
   :::

## Questions d'entretien

- Quelle est la différence entre une expression et une instruction ?

  :::indice
  Laquelle des deux peut-on passer en argument à une fonction ?
  :::

  :::reponse
  Une expression produit une valeur : `a + b`, un appel de fonction, une affectation. On
  peut l'utiliser partout où une valeur est attendue. Une instruction effectue une action
  sans produire de valeur : `let`, `if`, `for`, `return`. Une expression suivie d'un
  point-virgule forme une instruction-expression. C'est pour cela qu'on ne peut pas écrire
  `console.log(let x = 1)`, mais qu'on peut écrire `console.log(x = 1)`.
  :::

- Qu'est-ce que l'insertion automatique de points-virgules, et quand pose-t-elle
  problème ?

  :::indice
  Pense à ce qui se passe après un `return` seul sur sa ligne, et à une ligne qui
  commence par un crochet.
  :::

  :::reponse
  Quand une fin de ligne rend la phrase complète, le moteur insère un point-virgule. Le
  piège le plus connu : un `return` suivi d'un retour à la ligne renvoie `undefined`. À
  l'inverse, aucune insertion n'a lieu quand la ligne suivante commence par `(` ou `[` :
  les deux lignes sont alors lues comme une seule expression. Écrire les points-virgules,
  ou confier le formatage à Prettier, élimine ces cas.
  :::

- Quelles conventions de nommage attend-on dans un code JavaScript professionnel ?

  :::indice
  Il y a une convention pour les variables, une pour les classes et une pour les
  constantes de configuration.
  :::

  :::reponse
  `camelCase` pour les variables et les fonctions, `PascalCase` pour les classes et
  `MAJUSCULES_AVEC_TIRETS_BAS` pour les constantes de configuration. Au-delà de la casse,
  un nom doit dire ce que la valeur représente (`utilisateursActifs` plutôt que `data2`),
  et un booléen se lit comme une question (`estConnecte`, `aDesDroits`). Ces règles sont
  généralement vérifiées par ESLint.
  :::
