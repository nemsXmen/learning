---
id: typescript-01-le-compilateur-tsc
title: Le compilateur `tsc`
slug: le-compilateur-tsc
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 5
estimatedMinutes: 20
difficulty: 1
xp: 50
prerequisites: [typescript-01-installation-de-typescript]
skills: [typescript-basics]
tags: [typescript, tsc, compilateur]
---

## Objectifs

- Comprendre le rôle exact de `tsc`
- Savoir lancer une compilation simple
- Distinguer type-checking et émission de JavaScript
- Connaître les options de base les plus utiles

## Introduction

`tsc` (TypeScript Compiler) est le cœur de TypeScript. C’est lui qui lit tes fichiers `.ts`, vérifie les types et produit le JavaScript.

Même si tu utilises ensuite Vite, esbuild, SWC ou Bun (qui ont leurs propres transpileurs), comprendre `tsc` reste fondamental.

## Concept

`tsc` fait deux choses principales :

1. **Type-checking** — vérifier que le code respecte les types
2. **Émission (emit)** — générer les fichiers `.js` (et éventuellement `.d.ts` et source maps)

Tu peux demander à `tsc` de ne faire *que* le type-checking (très utile en CI) :

```bash
npx tsc --noEmit
```

Ou de compiler réellement :

```bash
npx tsc
```

### Options essentielles

| Option              | Rôle                                      |
|---------------------|-------------------------------------------|
| `--help`            | Affiche l’aide                            |
| `--version`         | Affiche la version                        |
| `--init`            | Génère un `tsconfig.json`                 |
| `--noEmit`          | Type-check seulement, n’écrit aucun fichier |
| `--watch` / `-w`    | Recompile à chaque modification           |
| `--project` / `-p`  | Spécifie un `tsconfig.json`               |
| `--outDir`          | Dossier de sortie des fichiers `.js`      |
| `--target`          | Version d’ECMAScript cible (ES5, ES2020…) |
| `--module`          | Système de modules (CommonJS, ESNext…)    |

## Exemple

Fichier `hello.ts` :

```ts
function greet(name: string): string {
  return `Hello, ${name}!`;
}

console.log(greet("TypeScript"));
```

Compilation :

```bash
npx tsc hello.ts
```

Résultat : un fichier `hello.js` :

```js
function greet(name) {
  return `Hello, ${name}!`;
}
console.log(greet("TypeScript"));
```

Les annotations ont disparu.

Avec watch mode :

```bash
npx tsc hello.ts --watch
```

`tsc` reste ouvert et recompile à chaque sauvegarde.

## Comment ça fonctionne

Quand tu lances `tsc` :

1. Il lit le `tsconfig.json` (s’il existe) ou les options en ligne de commande
2. Il construit un programme (liste des fichiers à compiler)
3. Il parse chaque fichier en AST
4. Il effectue le type-checking
5. S’il n’y a pas d’erreur (ou si `noEmitOnError` est false), il émet le JavaScript
6. Optionnellement il génère les déclaration files (`.d.ts`) et les source maps

Le processus est déterministe : mêmes sources + même config = mêmes sorties.

## Erreurs fréquentes

- **Lancer `tsc` sans `tsconfig.json` sur un gros projet**  
  `tsc` compile alors *tous* les `.ts` du dossier courant et des sous-dossiers, ce qui est rarement ce qu’on veut.

- **Oublier `--noEmit` en CI**  
  On veut souvent seulement vérifier les types, pas générer des fichiers.

- **Confondre `tsc` et le bundler**  
  `tsc` n’est pas un bundler. Il ne fait pas de tree-shaking ni de minification. Pour le navigateur on utilise généralement Vite, webpack, esbuild, etc. en plus (ou à la place pour la transpilation).

- **Ignorer les erreurs avec `// @ts-ignore` partout**  
  Ça détruit la valeur de TypeScript.

## À retenir

- `tsc` = type-checker + transpileur officiel
- `--noEmit` est très utile pour la CI
- `--watch` accélère le feedback en développement
- Un `tsconfig.json` est quasi obligatoire dès qu’on a plus d’un fichier
- Les bundlers modernes peuvent remplacer la partie « émission », mais le type-checking reste souvent confié à `tsc`

## Exercices

1. Crée un fichier `add.ts` avec une fonction typée, compile-le avec `tsc` et observe le JavaScript généré.

   :::indice
   Écris une fonction `add(a: number, b: number): number` puis lance `npx tsc add.ts`.
   :::

   :::solution
   ```ts
   // add.ts
   function add(a: number, b: number): number {
     return a + b;
   }
   console.log(add(2, 3));
   ```
   ```bash
   npx tsc add.ts
   # → génère add.js sans les annotations
   ```
   :::

2. Quelle commande permet de vérifier les types *sans* produire de fichiers JavaScript ?

   :::indice
   Une option très courte.
   :::

   :::solution
   ```bash
   npx tsc --noEmit
   ```
   :::

## Questions d'entretien

1. Quel est le rôle de `tsc` et peut-on s’en passer complètement ?

   :::indice
   Distingue type-checking et émission.
   :::

   :::reponse
   `tsc` est le compilateur officiel : il vérifie les types et peut émettre du JavaScript. On peut remplacer la partie émission par des outils plus rapides (esbuild, SWC, Sucrase…), mais le type-checking de référence reste celui de `tsc` (ou d’outils qui réutilisent son API). En CI on lance souvent `tsc --noEmit`.
   :::

2. À quoi sert l’option `--watch` ?

   :::indice
   Pense au feedback loop du développeur.
   :::

   :::reponse
   Elle met `tsc` en mode surveillance : dès qu’un fichier source change, il recompile automatiquement. C’est très pratique en développement pour avoir un feedback quasi immédiat sans relancer la commande à chaque fois.
   :::
