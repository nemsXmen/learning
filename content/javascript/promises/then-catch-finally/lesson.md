---
id: javascript-then-catch
title: "then, catch, finally et le chaînage"
slug: then-catch-finally
technology: javascript
level: intermediate
module: promises
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-creer-promesse
skills:
  - promise-chaining
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Prédire la valeur transmise d'un maillon à l'autre d'une chaîne de promesses.
- Enchaîner des opérations asynchrones en renvoyant des promesses depuis `then`.
- Utiliser `catch` pour récupérer d'une erreur et `finally` pour nettoyer.

## Introduction

La force des promesses tient à une propriété : `then` **renvoie une nouvelle promesse**. Chaque
maillon transforme le résultat du précédent, et la chaîne se lit de haut en bas, comme du code
synchrone. Mais cette propriété a des règles précises — ce qu'on renvoie, ce qu'on oublie de
renvoyer, ce qu'on lève — et presque tous les bugs de promesses viennent d'une de ces règles
mal appliquée.

## Concept

`promesse.then(f)` renvoie une **nouvelle** promesse, dont l'issue dépend de ce que fait `f` :

| Dans `f` | La promesse renvoyée par `then` est |
| --- | --- |
| `return valeur` | tenue avec `valeur` |
| rien (pas de `return`) | tenue avec `undefined` |
| `return autrePromesse` | réglée comme `autrePromesse`, une fois celle-ci réglée |
| `throw erreur` | rompue avec `erreur` |

Les autres méthodes suivent la même logique :

| Méthode | Appelée quand | Effet sur la chaîne |
| --- | --- | --- |
| `catch(g)` | la promesse précédente est rompue | la valeur renvoyée par `g` **tient** la suite : c'est une récupération |
| `finally(h)` | dans tous les cas | `h` ne reçoit rien ; la valeur ou l'erreur précédente **traverse** |
| `then(f, g)` | tenue ou rompue | `g` ne voit pas les erreurs levées par `f` |

## Exemple

```js
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

Promise.resolve(2)
  .then((n) => n * 10) // 20 : une valeur renvoyée tient la suite
  .then((n) => attendre(10).then(() => n + 1)) // 21 : une promesse renvoyée est attendue
  .then((n) => {
    console.log('étape', n); // 'étape 21'
  }) // pas de return : la suite reçoit undefined
  .then((valeur) => console.log('reçu :', valeur)) // 'reçu : undefined'
  .finally(() => console.log('chaîne 1 terminée'))
  .then(() => demonstrationCatch());

function demonstrationCatch() {
  Promise.reject(new Error('réseau indisponible'))
    .then(() => console.log('jamais exécuté')) // sauté : la promesse est rompue
    .catch((erreur) => {
      console.log('récupéré :', erreur.message); // 'récupéré : réseau indisponible'
      return 'valeur de secours';
    })
    .then((valeur) => console.log('suite :', valeur)) // 'suite : valeur de secours'
    .finally(() => console.log('nettoyage')); // exécuté, sans recevoir de valeur
}
```

## Comment ça fonctionne

Chaque appel à `then`, `catch` ou `finally` crée une **nouvelle promesse**, en attente, liée à la
précédente. Quand la précédente se règle, le moteur exécute le callback correspondant en
microtâche, puis règle la nouvelle promesse d'après ce que le callback a produit. C'est ce qui
permet d'écrire la chaîne à plat : chaque maillon attend le précédent sans imbrication.

Le cas décisif est celui du callback qui **renvoie une promesse**. La promesse créée par `then`
ne se règle pas avec l'objet promesse lui-même : elle **adopte** son issue, une fois celle-ci
connue. C'est l'aplatissement qui transforme une suite d'opérations asynchrones en une chaîne
lisible. Il ne fonctionne que si le callback **renvoie** effectivement la promesse : une fonction
fléchée avec accolades sans `return` lance l'opération mais n'attend rien, et la suite reçoit
`undefined` avant la fin — l'erreur la plus répandue avec les promesses.

`catch(g)` est un raccourci pour `then(undefined, g)`. Quand une promesse est rompue, les
callbacks de succès sont ignorés jusqu'au premier gestionnaire d'erreur. Si ce gestionnaire
**renvoie** une valeur, la chaîne repart dans l'état tenu : c'est une récupération. S'il
**relève** l'erreur, la chaîne reste rompue.

La forme `then(f, g)` n'est pas équivalente à `then(f).catch(g)` : dans la première, `g` ne voit
que les erreurs de la promesse **précédente**, pas celles levées par `f`. On préfère presque
toujours la seconde.

`finally(h)` sert au nettoyage : masquer un indicateur de chargement, fermer une connexion.
`h` ne reçoit ni valeur ni erreur, et ce qu'il renvoie est ignoré : l'issue précédente traverse
telle quelle. Seule exception : si `h` lève une erreur ou renvoie une promesse rompue, cette
nouvelle erreur remplace l'issue précédente.

## Erreurs fréquentes

**Oublier le `return` dans un `then`.** L'étape suivante n'attend pas et reçoit `undefined`.

**Imbriquer au lieu d'enchaîner.** Renvoie la promesse ; ne rattache pas un `then` à l'intérieur.

**Utiliser `then(f, g)` en pensant que `g` couvre `f`.** Mets un `catch` après.

**Placer une logique de résultat dans `finally`.** Il ne reçoit pas la valeur : il nettoie.

**Récupérer une erreur sans le vouloir.** Un `catch` qui ne relève pas remet la chaîne en succès.

## À retenir

- `then` renvoie une nouvelle promesse, réglée d'après ce que renvoie ou lève le callback.
- Renvoyer une promesse dans `then` l'attend : c'est l'aplatissement de la chaîne.
- Sans `return`, la suite reçoit `undefined` et n'attend rien.
- `catch` qui renvoie une valeur récupère ; `catch` qui relève propage.
- `finally` nettoie sans modifier l'issue, sauf s'il échoue lui-même.

## Exercices

1. Prédis ce qu'affiche ce code, puis corrige-le pour qu'il affiche `4`.

   ```js
   Promise.resolve(1)
     .then((x) => x + 1)
     .then((x) => {
       x * 2;
     })
     .then((x) => console.log(x));
   ```

   :::indice
   Que renvoie une fonction fléchée avec accolades et sans `return` ?
   :::

   :::solution
   Il affiche `undefined` : le deuxième callback calcule `x * 2` mais ne renvoie rien.

   ```js
   Promise.resolve(1)
     .then((x) => x + 1)
     .then((x) => x * 2)
     .then((x) => console.log(x)); // 4
   ```
   :::

2. Montre sur un exemple que `then(f, g)` ne rattrape pas une erreur levée dans `f`, puis écris la
   forme qui la rattrape.

   :::indice
   Fais lever une erreur dans `f`, et compare le gestionnaire passé en second argument avec un
   `catch` placé après.
   :::

   :::solution
   ```js
   const f = () => {
     throw new Error('erreur dans f');
   };
   const g = (erreur) => console.log('g a vu :', erreur.message);

   Promise.resolve()
     .then(f, g) // g n'est pas appelé : il ne couvre que la promesse précédente
     .catch((erreur) => console.log('catch suivant :', erreur.message)); // 'catch suivant : erreur dans f'

   Promise.resolve()
     .then(f)
     .catch(g); // 'g a vu : erreur dans f'
   ```
   :::

3. Écris `chargerAvecIndicateur(charger, etat)` qui passe `etat.chargement` à `true`, lance
   `charger()`, et remet `etat.chargement` à `false` dans tous les cas, succès ou échec, sans
   modifier le résultat renvoyé à l'appelant.

   :::indice
   `finally` s'exécute dans les deux cas et laisse traverser la valeur ou l'erreur.
   :::

   :::solution
   ```js
   function chargerAvecIndicateur(charger, etat) {
     etat.chargement = true;
     return charger().finally(() => {
       etat.chargement = false;
     });
   }

   const etat = { chargement: false };
   chargerAvecIndicateur(() => Promise.resolve('données'), etat)
     .then((valeur) => console.log(valeur, etat.chargement)) // 'données' false
     .then(() => chargerAvecIndicateur(() => Promise.reject(new Error('échec')), etat))
     .catch((erreur) => console.log(erreur.message, etat.chargement)); // 'échec' false
   ```
   :::

## Questions d'entretien

- Que renvoie `then`, et comment la valeur de la promesse suivante est-elle déterminée ?

  :::indice
  Quatre cas selon ce que fait le callback.
  :::

  :::reponse
  `then` renvoie toujours une nouvelle promesse. Si le callback renvoie une valeur, elle est tenue
  avec cette valeur ; s'il ne renvoie rien, avec `undefined` ; s'il renvoie une promesse, elle
  adopte son issue une fois réglée ; s'il lève une erreur, elle est rompue. C'est ce mécanisme qui
  permet d'enchaîner des opérations asynchrones à plat.
  :::

- Quelle différence entre `then(f, g)` et `then(f).catch(g)` ?

  :::indice
  Qui rattrape une erreur levée par `f` ?
  :::

  :::reponse
  Dans `then(f, g)`, `g` ne traite que les rejets de la promesse précédente : une erreur levée dans
  `f` lui échappe et part vers la suite de la chaîne. Dans `then(f).catch(g)`, `g` est attaché à la
  promesse renvoyée par `then`, et rattrape donc aussi les erreurs de `f`. La seconde forme est
  celle qu'on veut presque toujours.
  :::

- À quoi sert `finally`, et que transmet-il ?

  :::indice
  Que reçoit son callback, et que devient ce qu'il renvoie ?
  :::

  :::reponse
  `finally` exécute un nettoyage quel que soit le résultat : masquer un indicateur, libérer une
  ressource. Son callback ne reçoit aucun argument, et sa valeur de retour est ignorée : la valeur
  ou l'erreur précédente traverse jusqu'à la suite. Seul un échec du nettoyage lui-même — une erreur
  levée ou une promesse rompue renvoyée — remplace l'issue précédente.
  :::
