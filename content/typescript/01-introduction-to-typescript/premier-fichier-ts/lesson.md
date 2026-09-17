---
id: typescript-01-premier-fichier-ts
title: Premier fichier `.ts`
slug: premier-fichier-ts
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 6
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-01-le-compilateur-tsc]
skills: [typescript-basics]
tags: [typescript, premier-pas]
---

## Objectifs

- Créer et compiler ton premier fichier TypeScript
- Voir la différence entre le source et le JavaScript généré
- Comprendre le cycle basique « écrire → compiler → exécuter »

## Introduction

Rien ne vaut la pratique. On va créer un tout premier fichier `.ts`, le compiler et l’exécuter.

## Concept

Un fichier TypeScript a l’extension `.ts` (ou `.tsx` s’il contient du JSX).

Le cycle minimal est :

1. Écrire du code dans `fichier.ts`
2. Lancer `npx tsc fichier.ts` (ou `npx tsc` si un `tsconfig.json` existe)
3. Exécuter le `.js` généré avec Node.js : `node fichier.js`

## Exemple

Crée `greeter.ts` :

```ts
function greeter(person: string): string {
  return "Hello, " + person;
}

const user = "Alice";
console.log(greeter(user));
```

Compile :

```bash
npx tsc greeter.ts
```

Tu obtiens `greeter.js` :

```js
function greeter(person) {
  return "Hello, " + person;
}
const user = "Alice";
console.log(greeter(user));
```

Exécute :

```bash
node greeter.js
# Hello, Alice
```

Si tu changes l’appel en `greeter(42)`, `tsc` refuse de compiler.

## Comment ça fonctionne

- L’annotation `: string` n’existe que dans le source TypeScript
- Après compilation elle a disparu
- Node.js exécute uniquement le JavaScript

Tu peux aussi utiliser `ts-node` (ou `tsx`) pour exécuter directement le `.ts` sans étape de compilation manuelle, mais il est important de comprendre le processus classique.

## Erreurs fréquentes

- Oublier de compiler et essayer de faire `node greeter.ts`  
  Node.js ne comprend pas nativement les annotations TypeScript (sauf avec des loaders).

- Mettre l’extension `.js` par habitude  
  Le compilateur s’attend à `.ts`.

- Modifier le `.js` généré à la main  
  Il sera écrasé à la prochaine compilation. Toujours modifier le `.ts`.

## À retenir

- Extension `.ts` → source TypeScript
- `tsc` produit le `.js`
- On exécute le `.js` (ou on utilise un outil qui compile à la volée)
- Les annotations disparaissent après compilation

## Exercices

1. Crée un fichier `hello.ts` qui déclare une variable typée `message: string` et l’affiche. Compile-le et exécute-le.

   :::indice
   Utilise `const message: string = "Bonjour TypeScript";` puis `console.log`.
   :::

   :::solution
   ```ts
   // hello.ts
   const message: string = "Bonjour TypeScript";
   console.log(message);
   ```
   ```bash
   npx tsc hello.ts
   node hello.js
   ```
   :::

2. Que se passe-t-il si tu écris `const message: string = 42;` ?

   :::indice
   Lance la compilation.
   :::

   :::solution
   `tsc` affiche une erreur : Type 'number' is not assignable to type 'string'.
   Aucun fichier `.js` n’est généré (par défaut).
   :::

## Questions d'entretien

1. Pourquoi ne peut-on pas directement faire `node monfichier.ts` dans un environnement Node classique ?

   :::indice
   Pense à ce que Node comprend nativement.
   :::

   :::reponse
   Node.js exécute du JavaScript. Les annotations de types TypeScript ne font pas partie du standard JavaScript. Il faut soit compiler en `.js` d’abord, soit utiliser un loader/registre (ts-node, tsx, etc.) qui transpile à la volée.
   :::
