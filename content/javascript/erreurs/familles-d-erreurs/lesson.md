---
id: javascript-familles-erreurs
title: "Les trois familles d'erreurs"
slug: familles-d-erreurs
technology: javascript
level: intermediate
module: erreurs
order: 1
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-mode-strict-erreurs
skills:
  - error-types
tags:
  - javascript
  - erreurs
---

## Objectifs

- Distinguer une erreur de syntaxe, une erreur d'exécution et une erreur de logique.
- Savoir à quel moment le moteur peut détecter chacune, et ce qu'il ne détectera jamais.
- Choisir la bonne technique de diagnostic selon la famille.

## Introduction

« Ça ne marche pas » recouvre trois situations qui n'ont ni la même cause, ni le même
moment d'apparition, ni la même méthode de correction. Le code refuse de démarrer, il
démarre puis s'interrompt, ou il tourne jusqu'au bout en produisant un résultat faux.

Classer l'erreur avant de la chercher fait gagner beaucoup de temps. Une erreur de
syntaxe se lit dans le message ; une erreur d'exécution se lit dans la pile d'appels ;
une erreur de logique ne se lit nulle part — il faut la reproduire et la réduire. Ce
chapitre pose ce tri, qui sert de plan à toute la partie.

## Concept

| Famille | Quand | Le moteur la détecte ? | Symptôme |
| --- | --- | --- | --- |
| Syntaxe | à l'analyse, avant toute exécution | oui, toujours | rien ne s'exécute dans le fichier |
| Exécution | pendant l'exécution, à la ligne fautive | oui, au moment où elle survient | le programme s'interrompt |
| Logique | jamais signalée | non | le programme finit, le résultat est faux |

Une **erreur de syntaxe** est une violation de la grammaire du langage : parenthèse non
fermée, `const` sans nom, mot-clé mal placé. Le moteur analyse tout le fichier avant de
l'exécuter, donc aucune ligne ne tourne, même celles écrites avant la faute.

Une **erreur d'exécution** est un code grammaticalement correct qui demande l'impossible :
appeler ce qui n'est pas une fonction, lire une propriété de `null`, dépasser une limite.
Le moteur lève alors un objet `Error` et interrompt le programme si personne ne l'attrape.

Une **erreur de logique** est un programme valide qui fait autre chose que ce qu'on
voulait : un `<` à la place d'un `<=`, une soustraction inversée, une condition oubliée.
Le moteur n'a aucun moyen de la voir : il exécute exactement ce qui est écrit.

## Exemple

```js
// 1 — Syntaxe : rien ne s'exécute, pas même ce console.log
console.log('début');
const prix = ; // SyntaxError: Unexpected token ';'
```

```js
// 2 — Exécution : la première ligne s'affiche, la seconde interrompt le programme
const client = { nom: 'Ada' };
console.log(client.nom); // 'Ada'
console.log(client.adresse.ville); // TypeError: Cannot read properties of undefined
console.log('jamais atteint');
```

```js
// 3 — Logique : aucune erreur, un résultat faux
function moyenne(notes) {
  let somme = 0;
  for (let i = 0; i < notes.length - 1; i++) {
    somme += notes[i];
  }
  return somme / notes.length;
}
console.log(moyenne([10, 20, 30])); // 10 — attendu : 20
```

Le troisième cas est le plus coûteux : il ne se plaint pas. C'est le rôle des tests et de
la méthode de débogage de le faire apparaître.

## Comment ça fonctionne

Le moteur travaille en deux temps. D'abord il **analyse** le fichier entier et construit
sa représentation interne ; toute faute de grammaire arrête ce travail et lève une
`SyntaxError` avant la moindre exécution. C'est pourquoi un `console.log` placé en
première ligne ne s'affiche pas quand la faute est à la trentième.

Ensuite il **exécute**. Chaque opération impossible produit une erreur d'exécution, levée
au moment précis où l'opération a lieu. L'erreur remonte alors la pile d'appels jusqu'à
un `try` ; si elle n'en trouve aucun, le programme s'arrête et l'erreur est affichée avec
sa pile.

Deux nuances utiles. Certains fichiers sont analysés indépendamment les uns des autres :
en modules ES, une `SyntaxError` dans un fichier n'empêche pas les autres d'être valides,
mais elle empêche l'import. Et une erreur peut changer de famille selon le moment : un
`eval('const x = ;')` produit une `SyntaxError`… à l'exécution, puisque la chaîne n'est
analysée qu'au moment de l'appel.

Le mode strict déplace la frontière entre logique et exécution. Sans lui, une affectation
à une variable non déclarée crée une globale silencieuse — une erreur de logique. Avec
`'use strict'` (et donc dans tout module), la même ligne lève une `ReferenceError` : le
moteur transforme un bug invisible en erreur visible. C'est la raison principale d'écrire
du code en mode strict.

Pour les erreurs de logique, le langage n'offre rien : il faut d'autres outils. Un
linter attrape quelques cas (comparaison toujours fausse, variable inutilisée), les types
en attrapent d'autres, et les tests attrapent le reste en comparant le résultat obtenu au
résultat attendu.

## Erreurs fréquentes

**Chercher la faute de syntaxe à la ligne indiquée.** Le moteur signale l'endroit où il
comprend qu'il y a un problème, pas l'endroit où il a été créé. Une accolade manquante
ligne 12 est souvent signalée à la fin du fichier. Remonte vers le haut depuis la ligne
indiquée.

**Croire qu'un fichier « en partie exécuté » avait une erreur de syntaxe.** S'il a affiché
quelque chose avant de s'arrêter, c'est une erreur d'exécution : l'analyse avait réussi.

**Traiter une erreur de logique en lisant le code.** Relire dix fois la même fonction ne
révèle presque jamais la faute, parce qu'on relit son intention. Il faut instrumenter :
afficher les valeurs intermédiaires ou écrire un test qui échoue.

**Faire taire une erreur d'exécution au lieu de la corriger.** Entourer d'un `try` vide
une ligne qui plante transforme une erreur d'exécution en erreur de logique : on perd le
signal et on garde le bug.

**Oublier que le mode strict change le diagnostic.** Le même code peut échouer
silencieusement dans un `<script>` classique et lever une erreur dans un module.

## À retenir

- Syntaxe : détectée à l'analyse, rien ne s'exécute, message souvent décalé vers le bas.
- Exécution : détectée à la ligne fautive, interrompt le programme, laisse une pile.
- Logique : jamais détectée par le moteur ; seuls les tests et l'instrumentation la voient.
- Le mode strict convertit certaines erreurs de logique en erreurs d'exécution.
- Classer l'erreur d'abord ; la méthode de recherche découle de la famille.

## Exercices

1. Pour chacun de ces trois extraits, dis à quelle famille appartient le problème et ce
   que le programme affiche avant de s'arrêter.

   ```js
   // A
   console.log('A');
   function f( { return 1; }

   // B
   console.log('B');
   const liste = null;
   console.log(liste.length);

   // C
   console.log('C');
   const tva = (prix) => prix * 0.2;
   console.log(tva(100)); // attendu : le prix TTC
   ```

   :::indice
   Pose-toi une seule question par extrait : le moteur a-t-il pu analyser le fichier, puis
   a-t-il pu exécuter chaque opération demandée ?
   :::

   :::solution
   - **A** — erreur de syntaxe : la parenthèse des paramètres n'est pas fermée. Le fichier
     n'est pas analysable, donc `'A'` ne s'affiche **pas**.
   - **B** — erreur d'exécution : `'B'` s'affiche, puis `liste.length` lève une
     `TypeError: Cannot read properties of null`.
   - **C** — erreur de logique : `'C'` puis `20` s'affichent, sans aucune erreur. La
     fonction calcule la TVA, pas le prix TTC ; il fallait `prix * 1.2`.
   :::

2. Cette fonction doit renvoyer le plus grand nombre d'un tableau. Elle ne lève aucune
   erreur mais se trompe sur certaines entrées. Trouve le cas qui échoue et corrige.

   ```js
   function maximum(nombres) {
     let max = 0;
     for (const n of nombres) {
       if (n > max) max = n;
     }
     return max;
   }
   console.log(maximum([3, 9, 4])); // 9
   ```

   :::indice
   La valeur de départ de `max` suppose quelque chose sur le contenu du tableau.
   :::

   :::indice
   Essaie `maximum([-5, -2, -9])`.
   :::

   :::solution
   ```js
   function maximum(nombres) {
     if (nombres.length === 0) return undefined;
     let max = nombres[0]; // pas 0 : on part d'une valeur réellement présente
     for (const n of nombres) {
       if (n > max) max = n;
     }
     return max;
   }

   console.log(maximum([-5, -2, -9])); // -2 (et non 0)
   console.log(maximum([])); // undefined
   ```

   C'est une erreur de logique typique : `0` n'appartient pas au tableau. Aucun message ne
   la signale, seul un test sur des nombres négatifs la fait apparaître.
   :::

3. Transforme une erreur de logique en erreur d'exécution. Cette fonction accepte
   silencieusement une entrée invalide et renvoie `NaN` ; fais-la échouer tôt et clairement.

   ```js
   function surface(largeur, hauteur) {
     return largeur * hauteur;
   }
   console.log(surface(3, 'grand')); // NaN
   ```

   :::indice
   Un `NaN` qui circule contamine tous les calculs suivants. Mieux vaut refuser l'entrée au
   moment où elle arrive.
   :::

   :::indice
   `typeof valeur !== 'number'` ou `Number.isFinite(valeur)` pour valider, puis `throw`.
   :::

   :::solution
   ```js
   function surface(largeur, hauteur) {
     if (!Number.isFinite(largeur) || !Number.isFinite(hauteur)) {
       throw new TypeError('surface attend deux nombres finis');
     }
     return largeur * hauteur;
   }

   console.log(surface(3, 4)); // 12
   surface(3, 'grand'); // TypeError: surface attend deux nombres finis
   ```

   Le bug existait déjà ; il est maintenant visible à la ligne qui l'a créé, avec une pile
   d'appels qui désigne l'appelant fautif, au lieu d'un `NaN` découvert trois écrans plus
   loin.
   :::

## Questions d'entretien

- Pourquoi un `console.log` en première ligne ne s'affiche-t-il pas quand le fichier
  contient une erreur de syntaxe plus bas ?

  :::indice
  Pense aux deux phases du moteur : que fait-il avant d'exécuter la première instruction ?
  :::

  :::reponse
  Parce que le moteur analyse le fichier entier avant d'en exécuter la moindre ligne.
  L'analyse construit la représentation interne du programme ; si la grammaire est violée
  quelque part, cette construction échoue et le moteur lève une `SyntaxError` sans jamais
  passer à la phase d'exécution. Rien du fichier ne tourne, pas même le code situé avant la
  faute. C'est un bon test de diagnostic : si le programme a affiché quelque chose avant de
  s'arrêter, la faute n'est pas syntaxique mais d'exécution.
  :::

- Quelle est la différence pratique entre une erreur d'exécution et une erreur de logique,
  et laquelle est la plus dangereuse ?

  :::indice
  Compare le signal que chacune envoie, et le moment où on l'apprend.
  :::

  :::reponse
  Une erreur d'exécution est bruyante : le moteur l'annonce, indique la ligne et fournit la
  pile d'appels. On sait qu'il y a un problème et souvent où. Une erreur de logique est
  silencieuse : le programme se termine normalement avec un résultat faux, qui peut être
  stocké, facturé ou affiché à un utilisateur pendant des mois. La seconde est donc plus
  dangereuse, malgré son apparence inoffensive. Toute la valeur du mode strict, des tests,
  du typage et des validations d'entrée est de transformer des erreurs de logique en erreurs
  d'exécution, le plus tôt possible après leur cause.
  :::

- Le mode strict fait-il apparaître de nouvelles erreurs, ou révèle-t-il des erreurs
  existantes ?

  :::indice
  Que devient `x = 5` sans déclaration, dans chacun des deux modes ?
  :::

  :::reponse
  Il révèle des erreurs existantes. Sans mode strict, `x = 5` sur une variable non déclarée
  crée une propriété globale : le programme continue, mais la variable attendue n'a pas été
  écrite là où on croyait — c'est déjà un bug, simplement invisible. En mode strict, la même
  ligne lève une `ReferenceError`. Le code ne devient pas plus fautif, la faute devient
  visible au bon endroit. C'est la même idée qu'une validation d'entrée qui `throw` : on
  déplace la détection au plus près de la cause. Les modules ES sont en mode strict par
  défaut, ce qui donne ce comportement sans rien écrire.
  :::
