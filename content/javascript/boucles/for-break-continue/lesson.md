---
id: javascript-boucle-for
title: "for, break, continue et boucles imbriquées"
slug: for-break-continue
technology: javascript
level: beginner
module: boucles
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 70
prerequisites:
  - javascript-while
skills:
  - loops
  - loop-control
tags:
  - javascript
  - boucles
---

## Objectifs

- Écrire une boucle `for` et connaître l'ordre d'exécution de ses trois parties.
- Sortir d'une boucle avec `break`, passer au tour suivant avec `continue`.
- Imbriquer des boucles et sortir de plusieurs niveaux à la fois.

## Introduction

La boucle `for` regroupe sur une seule ligne tout ce qui pilote une répétition :
l'initialisation du compteur, la condition de continuation et la mise à jour. Quand le
nombre de tours est connu, ou qu'on a besoin d'un index, c'est la forme la plus lisible.
Deux mots-clés en contrôlent le déroulement : `break` pour arrêter dès que le résultat est
trouvé, `continue` pour ignorer un cas sans arrêter la boucle.

## Concept

```js
for (initialisation; condition; miseAJour) {
  // corps
}
```

| Partie | Quand elle s'exécute | Exemple |
| --- | --- | --- |
| initialisation | une seule fois, au début | `let i = 0` |
| condition | avant chaque tour ; fausse, la boucle s'arrête | `i < 5` |
| corps | à chaque tour | `console.log(i)` |
| mise à jour | après chaque tour, avant la condition suivante | `i++` |

| Mot-clé | Effet |
| --- | --- |
| `break` | sort immédiatement de la boucle la plus proche |
| `continue` | abandonne le tour en cours et passe au suivant |

Dans des boucles imbriquées, `break` et `continue` ne concernent que la boucle **la plus
intérieure**. Pour agir sur une boucle extérieure, on la nomme avec une **étiquette** :
`recherche: for (...)`, puis `break recherche`.

## Exemple

```js
const temperatures = [12, 15, -3, 8, -1];

// break : s'arrêter au premier résultat
let indexPremierNegatif = -1;
for (let i = 0; i < temperatures.length; i++) {
  if (temperatures[i] < 0) {
    indexPremierNegatif = i;
    break;
  }
}
console.log(indexPremierNegatif); // 2

// continue : ignorer certains cas
let sommePositives = 0;
for (let i = 0; i < temperatures.length; i++) {
  if (temperatures[i] < 0) continue;
  sommePositives += temperatures[i];
}
console.log(sommePositives); // 35

// Boucles imbriquées : une table de multiplication
for (let ligne = 1; ligne <= 3; ligne++) {
  let affichage = '';
  for (let colonne = 1; colonne <= 3; colonne++) {
    affichage += `${ligne * colonne}\t`;
  }
  console.log(affichage);
}
```

## Comment ça fonctionne

L'ordre exact est : initialisation, puis condition, corps, mise à jour, condition, corps,
mise à jour… jusqu'à ce que la condition soit fausse. Une boucle `for` équivaut donc à :

```js
let i = 0;
while (i < 5) {
  // corps
  i++;
}
```

À une différence près : dans un `for`, `continue` saute directement **à la mise à jour**.
Dans l'équivalent `while`, un `continue` placé avant `i++` saute aussi l'incrémentation,
et crée une boucle infinie.

Déclaré avec `let` dans l'initialisation, le compteur est limité à la boucle, et chaque
tour reçoit sa propre liaison : une fonction créée dans le corps capture la valeur de son
tour.

Pour sortir de deux boucles d'un coup, l'étiquette est la solution la plus directe :

```js
const grille = [[1, 2], [3, 4]];
recherche: for (let i = 0; i < grille.length; i++) {
  for (let j = 0; j < grille[i].length; j++) {
    if (grille[i][j] === 3) {
      console.log(`Trouvé en ${i}, ${j}`);
      break recherche; // sort des deux boucles
    }
  }
}
```

## Erreurs fréquentes

**Aller un tour trop loin.** `i <= tableau.length` accède à `tableau[tableau.length]`, qui
vaut `undefined`. Les index vont de `0` à `length - 1` : écris `i < tableau.length`.

**Utiliser `continue` dans un `while` avant l'incrémentation.** Le compteur n'avance plus.
Place l'incrémentation avant le `continue`, ou utilise un `for`.

**Croire que `break` sort de toutes les boucles.** Il ne sort que de la plus intérieure.
Utilise une étiquette, ou extrais les boucles dans une fonction et fais un `return`.

**Continuer après avoir trouvé.** Parcourir toute la liste alors que le résultat est connu
au troisième élément gaspille du travail : `break` dès que possible.

## À retenir

- `for` : initialisation une fois, puis condition, corps, mise à jour à chaque tour.
- `break` sort de la boucle la plus proche ; `continue` passe au tour suivant.
- Dans un `for`, `continue` n'empêche pas la mise à jour ; dans un `while`, attention.
- Les index vont de `0` à `length - 1`.
- `break etiquette` sort de plusieurs boucles imbriquées.

## Exercices

1. Affiche les nombres de 1 à 20, sauf les multiples de 3, en utilisant `continue`.

   :::indice
   Un nombre est multiple de 3 quand le reste de sa division par 3 vaut 0.
   :::

   :::solution
   ```js
   for (let n = 1; n <= 20; n++) {
     if (n % 3 === 0) continue;
     console.log(n);
   }
   // 1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20
   ```
   :::

2. Trouve l'index du premier nombre négatif de `[4, 9, -2, 7, -5]` et arrête la boucle dès
   qu'il est trouvé. Si aucun nombre n'est négatif, le résultat doit valoir `-1`.

   :::indice
   Initialise le résultat à `-1` avant la boucle, et ne le modifie que lorsque tu trouves un
   nombre négatif.
   :::

   :::solution
   ```js
   const nombres = [4, 9, -2, 7, -5];

   let index = -1;
   for (let i = 0; i < nombres.length; i++) {
     if (nombres[i] < 0) {
       index = i;
       break;
     }
   }

   console.log(index); // 2
   ```

   Sans `break`, la boucle continuerait et `index` finirait à `4`, l'index du **dernier**
   négatif. La méthode `findIndex`, vue au module 07, fait la même chose en une ligne.
   :::

3. Dans `[3, 8, 4, 6, 1]`, trouve la première paire de nombres dont la somme vaut 10, et
   arrête les deux boucles dès qu'elle est trouvée.

   :::indice
   La boucle intérieure peut commencer à `i + 1`, pour ne pas additionner un nombre avec
   lui-même ni tester deux fois la même paire.
   :::

   :::indice
   Pour sortir des deux boucles d'un coup, nomme la boucle extérieure avec une étiquette.
   :::

   :::solution
   ```js
   const nombres = [3, 8, 4, 6, 1];
   let paire = null;

   recherche: for (let i = 0; i < nombres.length; i++) {
     for (let j = i + 1; j < nombres.length; j++) {
       if (nombres[i] + nombres[j] === 10) {
         paire = [nombres[i], nombres[j]];
         break recherche;
       }
     }
   }

   console.log(paire); // [4, 6]
   ```
   :::

## Questions d'entretien

- Quelle est la différence entre `break` et `continue` ?

  :::indice
  L'un arrête la boucle, l'autre seulement le tour en cours.
  :::

  :::reponse
  `break` sort immédiatement de la boucle la plus proche : aucun tour supplémentaire n'a
  lieu. `continue` abandonne le tour en cours et passe au suivant : dans un `for`, il saute
  à la mise à jour puis à la condition. Tous deux ne concernent que la boucle la plus
  intérieure, sauf s'ils sont suivis d'une étiquette.
  :::

- Comment sortir de deux boucles imbriquées à la fois ?

  :::indice
  Il existe une syntaxe dédiée, et une alternative fondée sur les fonctions.
  :::

  :::reponse
  On nomme la boucle extérieure avec une étiquette, `recherche: for (...)`, et on écrit
  `break recherche` dans la boucle intérieure. L'alternative, souvent plus lisible, consiste
  à placer les boucles dans une fonction et à faire `return` dès que le résultat est trouvé.
  Un drapeau booléen testé dans la boucle extérieure fonctionne aussi, mais ajoute du bruit.
  :::

- Pourquoi `continue` peut-il créer une boucle infinie dans un `while`, mais pas dans un
  `for` ?

  :::indice
  Où se trouve l'incrémentation dans chacune des deux boucles ?
  :::

  :::reponse
  Dans un `for`, la mise à jour fait partie de l'en-tête : `continue` y saute directement,
  le compteur avance donc toujours. Dans un `while`, l'incrémentation est une instruction du
  corps ; si `continue` se trouve avant elle, elle est sautée, le compteur n'avance plus et
  la condition reste vraie indéfiniment.
  :::
