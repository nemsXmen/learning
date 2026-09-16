---
id: javascript-creer-promesse
title: "Créer une promesse : new Promise, resolve et reject"
slug: creer-une-promesse
technology: javascript
level: intermediate
module: promises
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-promesses-etats
skills:
  - promise-creation
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Construire une promesse avec `new Promise` et régler son état avec `resolve` ou `reject`.
- Convertir une API à callbacks en fonction qui renvoie une promesse.
- Reconnaître quand `new Promise` est inutile, et l'éviter.

## Introduction

La plupart du temps, on consomme des promesses fournies par l'environnement : `fetch`, les API
de fichiers de Node.js, les bibliothèques. Mais il reste beaucoup d'API à callbacks — minuteurs,
anciens modules, événements — qu'on veut intégrer à un code moderne. Le constructeur `Promise`
sert exactement à cela : **envelopper** une opération asynchrone qui ne renvoie pas encore de
promesse.

## Concept

```js
const promesse = new Promise((resolve, reject) => {
  // lancer l'opération, puis appeler resolve(valeur) ou reject(erreur)
});
```

| Élément | Rôle |
| --- | --- |
| Exécuteur | la fonction passée au constructeur, **exécutée immédiatement et de façon synchrone** |
| `resolve(valeur)` | tient la promesse avec cette valeur |
| `reject(erreur)` | rompt la promesse avec cette raison, idéalement un objet `Error` |
| Erreur levée dans l'exécuteur | rompt la promesse automatiquement |
| `Promise.resolve(v)` / `Promise.reject(e)` | crée directement une promesse déjà réglée |

Seul le **premier** appel à `resolve` ou `reject` compte ; les suivants sont ignorés.

## Exemple

```js
function attendre(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function lireConfiguration(nom, rappel) {
  // API à callbacks « erreur d'abord », comme les anciennes API de Node.js.
  setTimeout(() => {
    if (nom === 'absente') rappel(new Error(`Fichier ${nom} introuvable`));
    else rappel(null, { nom, langue: 'fr' });
  }, 10);
}

function lireConfigurationPromise(nom) {
  return new Promise((resolve, reject) => {
    lireConfiguration(nom, (erreur, contenu) => {
      if (erreur) reject(erreur);
      else resolve(contenu);
    });
  });
}

console.log('avant');
const p = new Promise((resolve) => {
  console.log('exécuteur'); // synchrone : s'affiche entre « avant » et « après »
  resolve('premier');
  resolve('second'); // ignoré
});
console.log('après');
p.then((valeur) => console.log(valeur)); // 'premier'

attendre(20)
  .then(() => lireConfigurationPromise('app'))
  .then((config) => console.log(config.langue)); // 'fr'

lireConfigurationPromise('absente').catch((erreur) => console.log(erreur.message));
// 'Fichier absente introuvable'
```

## Comment ça fonctionne

Le constructeur appelle l'exécuteur **tout de suite**, avant même de renvoyer la promesse. C'est
pourquoi `exécuteur` s'affiche entre `avant` et `après`. L'exécuteur lance l'opération — ici un
minuteur ou une fonction à callbacks — et lui confie `resolve` et `reject`. La promesse reste en
attente jusqu'à ce que l'un des deux soit appelé, éventuellement bien plus tard.

Une fois la promesse réglée, les appels suivants à `resolve` ou `reject` sont **ignorés en silence**.
C'est ce qui protège contre une API qui appellerait son callback deux fois. Si l'exécuteur **lève
une erreur**, le constructeur la rattrape et rompt la promesse : l'appelant la reçoit dans son
`catch` au lieu d'une exception non interceptée. Attention : ce filet ne couvre que le code
synchrone de l'exécuteur ; une erreur levée plus tard dans un callback de minuteur n'est pas
rattrapée et doit être transmise avec `reject`.

On rompt une promesse avec un **objet `Error`**, pas une chaîne : il porte une pile d'appels, et
le code qui gère l'erreur peut compter sur `erreur.message`.

`resolve` accepte aussi une **autre promesse** : la nouvelle adopte alors son issue. C'est pourquoi
envelopper une promesse existante dans `new Promise` ne sert à rien. Si une fonction obtient déjà
une promesse — de `fetch`, d'une bibliothèque —, elle la renvoie ou l'enchaîne avec `then`. Le
motif `new Promise((resolve) => autrePromesse.then(resolve))` perd en plus les erreurs, puisque
personne n'appelle `reject`.

Pour les API « erreur d'abord » de Node.js, la fonction `util.promisify` fait la conversion
automatiquement, et la plupart des modules ont désormais une version à promesses, comme
`node:fs/promises`. L'écrire à la main reste utile pour comprendre, et pour les API qui ne suivent
pas cette convention.

## Erreurs fréquentes

**Envelopper une promesse existante dans `new Promise`.** Renvoie-la directement.

**Oublier d'appeler `reject` dans un chemin d'erreur.** La promesse reste en attente pour toujours.

**Lever une erreur dans un callback asynchrone de l'exécuteur.** Elle n'est pas convertie en rejet :
appelle `reject`.

**Rompre avec une chaîne de caractères.** Utilise un objet `Error`.

**Supposer que l'exécuteur s'exécute plus tard.** Il est synchrone.

## À retenir

- `new Promise((resolve, reject) => …)` exécute l'exécuteur immédiatement.
- Seul le premier `resolve` ou `reject` compte.
- Une erreur synchrone dans l'exécuteur rompt la promesse ; une erreur asynchrone doit passer par
  `reject`.
- On rompt avec un objet `Error`.
- On n'enveloppe jamais une promesse existante : on la renvoie ou on l'enchaîne.

## Exercices

1. Écris `attendre(ms)`, qui renvoie une promesse tenue après `ms` millisecondes, puis utilise-la pour
   afficher `prêt` après 100 ms.

   :::indice
   `setTimeout` accepte directement `resolve` comme callback.
   :::

   :::solution
   ```js
   function attendre(ms) {
     return new Promise((resolve) => setTimeout(resolve, ms));
   }

   attendre(100).then(() => console.log('prêt'));
   ```
   :::

2. Écris `promisifier(fonction)`, qui transforme une fonction à callback « erreur d'abord » en
   fonction qui renvoie une promesse, puis applique-la à `lireConfiguration` de l'exemple.

   :::indice
   La fonction renvoyée reçoit les arguments, crée une promesse, et appelle la fonction d'origine
   en ajoutant un dernier argument : le callback qui règle la promesse.
   :::

   :::solution
   ```js
   function promisifier(fonction) {
     return (...args) =>
       new Promise((resolve, reject) => {
         fonction(...args, (erreur, resultat) => {
           if (erreur) reject(erreur);
           else resolve(resultat);
         });
       });
   }

   const lireConfigurationP = promisifier(lireConfiguration);
   lireConfigurationP('app').then((config) => console.log(config.nom)); // 'app'
   ```

   C'est ce que fait `util.promisify` dans Node.js.
   :::

3. Cette fonction perd les erreurs et contient un enveloppement inutile. Explique les deux défauts,
   puis corrige.

   ```js
   function chargerProfil(id) {
     return new Promise((resolve) => {
       chargerUtilisateur(id).then((utilisateur) => resolve(utilisateur.profil));
     });
   }
   ```

   :::indice
   Que devient la promesse externe si `chargerUtilisateur` est rompue ? Et que renvoie déjà
   `chargerUtilisateur(id).then(…)` ?
   :::

   :::solution
   Si `chargerUtilisateur` échoue, personne n'appelle `reject` : la promesse renvoyée reste **en
   attente pour toujours**, et l'erreur disparaît. Et `then` renvoie déjà une promesse : le
   constructeur n'apporte rien.

   ```js
   const chargerUtilisateur = (id) =>
     id > 0 ? Promise.resolve({ profil: 'admin' }) : Promise.reject(new Error('Identifiant invalide'));

   function chargerProfil(id) {
     return chargerUtilisateur(id).then((utilisateur) => utilisateur.profil);
   }

   chargerProfil(1).then(console.log); // 'admin'
   chargerProfil(0).catch((erreur) => console.log(erreur.message)); // 'Identifiant invalide'
   ```
   :::

## Questions d'entretien

- Quand l'exécuteur d'une promesse est-il exécuté ?

  :::indice
  Avant ou après que `new Promise` renvoie l'objet ?
  :::

  :::reponse
  Immédiatement et de façon synchrone, pendant l'appel au constructeur. L'opération qu'il lance
  peut être asynchrone, mais le corps de l'exécuteur, lui, s'exécute avant l'instruction qui suit
  `new Promise`. Une erreur levée dans ce corps synchrone rompt la promesse ; une erreur levée plus
  tard, dans un callback, doit être transmise avec `reject`.
  :::

- Que se passe-t-il si l'on appelle `resolve` puis `reject` ?

  :::indice
  Combien de fois une promesse peut-elle changer d'état ?
  :::

  :::reponse
  Seul le premier appel compte : la promesse est tenue, et le `reject` suivant est ignoré sans
  erreur. Ce comportement protège contre une API qui appellerait son callback plusieurs fois, mais
  il masque aussi les bugs de logique : un chemin d'erreur atteint après un `resolve` ne se voit
  pas. On structure donc l'exécuteur pour qu'un seul chemin règle la promesse.
  :::

- Pourquoi `new Promise` autour d'une promesse existante est-il un anti-pattern ?

  :::indice
  Pense aux erreurs, et à ce que renvoient déjà `then` et la fonction appelée.
  :::

  :::reponse
  Parce qu'il n'apporte rien — la fonction renvoie déjà une promesse, que `then` sait transformer
  — et qu'il perd facilement les erreurs : si l'on oublie de brancher `reject`, un échec laisse la
  promesse externe en attente indéfiniment. On renvoie directement la promesse obtenue, ou son
  `then`. `new Promise` se réserve à l'enveloppement d'une API qui ne renvoie pas de promesse,
  comme un minuteur ou une fonction à callbacks.
  :::
