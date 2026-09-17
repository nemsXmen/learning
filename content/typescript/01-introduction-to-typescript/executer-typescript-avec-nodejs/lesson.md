---
id: typescript-01-executer-typescript-avec-nodejs
title: Exécuter TypeScript avec Node.js
slug: executer-typescript-avec-nodejs
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 9
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-01-premier-fichier-ts]
skills: [typescript-basics]
tags: [typescript, nodejs, execution]
---

## Objectifs

- Exécuter du TypeScript avec Node.js
- Connaître les approches classiques (compilation + node, ts-node, tsx)
- Choisir la bonne méthode selon le contexte

## Introduction

Node.js ne comprend pas nativement TypeScript. Il existe plusieurs façons de l’exécuter.

## Concept

### 1. Compiler puis exécuter (méthode classique)

```bash
npx tsc
node dist/index.js
```

Avantage : simple, pas de dépendance supplémentaire en production.  
Inconvénient : étape manuelle (ou script).

### 2. ts-node

```bash
npm install -D ts-node
npx ts-node src/index.ts
```

Compile et exécute à la volée. Très pratique en développement.

### 3. tsx (recommandé aujourd’hui pour le dev)

```bash
npm install -D tsx
npx tsx src/index.ts
```

Plus rapide que ts-node, support ESM natif, très bon DX.

### 4. Loader natif (Node 22+)

Node commence à proposer un support expérimental, mais pour l’instant les outils dédiés restent plus confortables.

## Exemple

Avec tsx :

```bash
npm install -D tsx
npx tsx src/hello.ts
```

Le fichier est exécuté directement, avec type-checking optionnel selon la configuration.

## Comment ça fonctionne

Les outils comme ts-node et tsx enregistrent un *hook* ou un loader qui intercepte les `require`/`import` des fichiers `.ts`, les transpile en mémoire et les exécute. Le type-checking peut être activé ou désactivé pour la vitesse.

## Erreurs fréquentes

- Utiliser ts-node en production  
  Préférer compiler et exécuter le JavaScript.

- Oublier de typer les fichiers exécutés avec tsx/ts-node  
  Le type-checking n’est pas toujours activé par défaut.

## À retenir

- Production → compiler avec `tsc` (ou un bundler) puis `node`
- Développement → `tsx` ou `ts-node` pour le confort
- `tsx` est aujourd’hui l’outil le plus agréable pour exécuter du TypeScript rapidement

## Exercices

1. Installe `tsx` et exécute un fichier `.ts` directement.

   :::indice
   `npm i -D tsx` puis `npx tsx monfichier.ts`.
   :::

   :::solution
   ```bash
   npm install -D tsx
   npx tsx src/index.ts
   ```
   :::

## Questions d'entretien

1. Quelles sont les principales façons d’exécuter du TypeScript avec Node.js ?

   :::reponse
   - Compiler avec `tsc` puis lancer le `.js` avec `node`
   - Utiliser `ts-node` ou `tsx` pour une exécution à la volée en développement
   - Utiliser un bundler (esbuild, etc.) qui produit du JavaScript exécutable
   :::
