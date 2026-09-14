---
id: javascript-mode-strict-erreurs
title: "Mode strict et erreurs : syntaxe ou exécution"
slug: mode-strict-et-erreurs
technology: javascript
level: beginner
module: introduction
order: 4
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-syntaxe
skills:
  - strict-mode-errors
tags:
  - javascript
  - introduction
---

## Objectifs

- Activer le mode strict et connaître ce qu'il change.
- Distinguer une erreur de syntaxe, levée avant l'exécution, d'une erreur d'exécution.
- Reconnaître `ReferenceError`, `TypeError` et `RangeError`, et lire une trace d'erreur.

## Introduction

Une erreur n'est pas un échec : c'est le moteur qui te signale précisément ce qui ne va
pas. Encore faut-il qu'il le signale. Historiquement, JavaScript laissait passer
silencieusement beaucoup de fautes — une variable mal orthographiée devenait une
nouvelle variable globale. Le **mode strict** a été créé pour transformer ces fautes
silencieuses en erreurs visibles.

## Concept

Le mode strict s'active avec la directive `'use strict'` placée **tout en haut** d'un
fichier ou d'une fonction. Il est automatique dans les modules ES (`import` / `export`)
et dans le corps des classes.

| Situation | Mode normal | Mode strict |
| --- | --- | --- |
| Affecter une variable jamais déclarée | crée une variable globale | `ReferenceError` |
| `this` dans une fonction appelée seule | l'objet global | `undefined` |
| Deux paramètres de même nom | autorisé | `SyntaxError` |
| Modifier une propriété en lecture seule | ignoré | `TypeError` |
| Instruction `with` | autorisée | `SyntaxError` |

Les erreurs se rangent en deux familles :

| Moment | Type | Cause typique |
| --- | --- | --- |
| Avant l'exécution | `SyntaxError` | parenthèse jamais fermée, mot-clé mal placé |
| Pendant l'exécution | `ReferenceError` | identifiant qui n'existe pas |
| Pendant l'exécution | `TypeError` | opération impossible sur ce type : appeler `undefined`, lire une propriété de `null` |
| Pendant l'exécution | `RangeError` | valeur hors limites : `new Array(-1)`, récursion infinie |

## Exemple

```js
'use strict';

function calculerTotal(prix, quantite) {
  totl = prix * quantite; // ReferenceError: totl is not defined
  return totl;
}

console.log(calculerTotal(10, 3));
```

Sans `'use strict'`, ce code affiche `30` et crée au passage une variable globale
`totl`, source de bugs difficiles à retrouver. Avec le mode strict, la faute de frappe
est signalée immédiatement, à la bonne ligne.

## Comment ça fonctionne

L'exécution d'un script se fait en deux temps.

1. **L'analyse syntaxique.** Le moteur lit tout le fichier. Une `SyntaxError` à
   n'importe quelle ligne empêche l'exécution de l'ensemble du fichier : rien ne
   s'affiche, pas même un `console.log` placé en première ligne.
2. **L'exécution.** Les instructions s'exécutent dans l'ordre. Une erreur d'exécution
   interrompt le script **à la ligne où elle se produit** ; tout ce qui précède a déjà eu
   lieu.

Une erreur non interceptée affiche une **trace** (*stack trace*) :

```text
TypeError: Cannot read properties of undefined (reading 'email')
    at afficherContact (app.js:14:22)
    at main (app.js:30:3)
```

- la première ligne donne le **type** et le **message** ;
- la première ligne `at` indique **où** l'erreur a été levée (fichier, ligne, colonne) ;
- les lignes suivantes indiquent **qui a appelé qui**, du plus récent au plus ancien.

## Erreurs fréquentes

**Placer `'use strict'` après une autre instruction.** La directive doit être la
première instruction du fichier ou de la fonction ; ailleurs, elle est ignorée sans
avertissement.

**Lire le message sans lire la valeur en cause.**
`Cannot read properties of undefined (reading 'email')` ne dit pas que `email` est
absent : il dit que l'objet sur lequel on lit `email` vaut `undefined`.

**Chercher l'erreur à la dernière ligne de la trace.** Le point de départ est la
**première** ligne `at` ; les suivantes remontent la chaîne des appels.

**Croire qu'une `SyntaxError` n'affecte que sa ligne.** Elle empêche l'exécution de tout
le fichier.

## À retenir

- `'use strict'` transforme des fautes silencieuses en erreurs ; les modules et les
  classes sont strict automatiquement.
- Une `SyntaxError` bloque tout le fichier ; une erreur d'exécution l'arrête à sa ligne.
- `ReferenceError` : identifiant inconnu. `TypeError` : mauvais type.
  `RangeError` : valeur hors limites.
- Dans une trace, la première ligne `at` indique où l'erreur est née.

## Exercices

1. Explique pourquoi ce code affiche une valeur en mode normal, mais lève une erreur en
   mode strict. Précise laquelle et corrige-le.

   ```js
   function prixTTC(prixHT) {
     tottal = prixHT * 1.2;
     return tottal;
   }
   ```

   :::indice
   Regarde l'orthographe de la variable, puis cherche où elle est déclarée.
   :::

   :::solution
   `tottal` n'est déclarée nulle part. En mode normal, l'affectation crée une variable
   globale et la fonction renvoie le bon résultat. En mode strict, elle lève
   `ReferenceError: tottal is not defined`.

   ```js
   'use strict';

   function prixTTC(prixHT) {
     const total = prixHT * 1.2;
     return total;
   }
   ```
   :::

2. Prévois le type d'erreur produit par chacune de ces lignes : `null.nom`,
   `inconnue + 1`, `new Array(-1)`, `const x = ;`.

   :::indice
   Une seule de ces lignes empêche le fichier de démarrer ; les trois autres échouent
   pendant l'exécution.
   :::

   :::solution
   - `null.nom` : `TypeError`, on ne peut pas lire une propriété de `null`.
   - `inconnue + 1` : `ReferenceError`, l'identifiant n'existe pas.
   - `new Array(-1)` : `RangeError`, une longueur de tableau ne peut pas être négative.
   - `const x = ;` : `SyntaxError`, levée à l'analyse, avant l'exécution de tout le
     fichier.
   :::

3. Lis cette trace et indique la ligne à corriger, la fonction concernée et la valeur en
   cause.

   ```text
   TypeError: Cannot read properties of undefined (reading 'email')
       at afficherContact (app.js:14:22)
       at main (app.js:30:3)
   ```

   :::indice
   La première ligne `at` indique où l'erreur a été levée ; la suivante, d'où venait
   l'appel.
   :::

   :::solution
   L'erreur est levée ligne 14, colonne 22 de `app.js`, dans `afficherContact`. On y lit
   la propriété `email` d'une valeur `undefined` — sans doute le contact passé en
   argument, qui n'existe pas. L'appel vient de `main`, ligne 30 : c'est là qu'il faut
   vérifier ce qui est transmis, et `afficherContact` doit gérer l'absence de contact.
   :::

## Questions d'entretien

- Que change `'use strict'` ? Cite trois effets.

  :::indice
  Pense aux variables non déclarées, à `this` et aux paramètres.
  :::

  :::reponse
  Le mode strict lève une `ReferenceError` quand on affecte une variable jamais déclarée,
  au lieu de créer une globale. `this` vaut `undefined` dans une fonction appelée seule,
  au lieu de l'objet global. Les paramètres en double et l'instruction `with` deviennent
  des erreurs de syntaxe, et écrire sur une propriété en lecture seule lève une
  `TypeError` au lieu d'être ignoré.
  :::

- Quelle est la différence entre une `SyntaxError` et une `TypeError` ?

  :::indice
  À quel moment chacune est-elle détectée ?
  :::

  :::reponse
  Une `SyntaxError` est détectée pendant l'analyse du code, avant toute exécution : le
  fichier entier ne s'exécute pas. Une `TypeError` survient pendant l'exécution, quand une
  opération est impossible pour le type de la valeur — appeler quelque chose qui n'est pas
  une fonction, lire une propriété de `null`. Tout ce qui précède la ligne fautive a déjà
  été exécuté.
  :::

- Pourquoi n'écrit-on presque plus `'use strict'` dans un projet moderne ?

  :::indice
  Quels fichiers sont déjà en mode strict sans rien écrire ?
  :::

  :::reponse
  Les modules ES et le corps des classes sont automatiquement en mode strict. Un projet
  moderne qui utilise `import` et `export` en bénéficie donc partout, et les outils de
  compilation comme TypeScript ajoutent la directive quand ils produisent un script
  classique. La directive reste utile dans un vieux script chargé sans module.
  :::
