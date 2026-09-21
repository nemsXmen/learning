---
id: typescript-01-installation-de-typescript
title: Installation de TypeScript
slug: installation-de-typescript
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 4
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-01-quest-ce-que-typescript]
skills: [typescript-basics]
tags: [typescript, installation, setup]
---

## Objectifs

- Installer TypeScript correctement
- Choisir entre installation globale et locale
- Vérifier que l’installation fonctionne
- Connaître les bonnes pratiques de versionning

## Introduction

Installer TypeScript est simple, mais il y a une distinction importante entre installation **globale** et **locale** qui a des conséquences sur la reproductibilité des projets.

## Concept

TypeScript s’installe via npm (ou yarn / pnpm / bun).

### Installation globale

```bash
npm install -g typescript
```

Avantages :
- La commande `tsc` est disponible partout
- Utile pour des essais rapides

Inconvénients :
- La version n’est pas liée au projet
- Deux développeurs peuvent avoir des versions différentes
- Les CI et les collègues risquent d’avoir des comportements différents

### Installation locale (recommandée)

```bash
npm install --save-dev typescript
```

Ou avec pnpm :

```bash
pnpm add -D typescript
```

Avantages :
- La version est fixée dans `package.json` / `package-lock.json`
- Tout le monde (et la CI) utilise exactement la même version
- On lance `tsc` via `npx tsc` ou un script npm

C’est la méthode **fortement recommandée** pour tout projet réel.

### Vérifier l’installation

```bash
npx tsc --version
# ou
./node_modules/.bin/tsc --version
```

Tu devrais voir quelque chose comme `Version 5.x.x`.

## Exemple

Création d’un projet minimal :

```bash
mkdir mon-projet-ts
cd mon-projet-ts
npm init -y
npm install --save-dev typescript
npx tsc --init          # génère un tsconfig.json
```

Tu obtiens un `package.json` avec TypeScript en `devDependency` et un fichier `tsconfig.json`.

## Comment ça fonctionne

Quand tu installes `typescript` localement :

1. Le package est placé dans `node_modules/typescript`
2. Le binaire `tsc` se trouve dans `node_modules/.bin/tsc`
3. `npx tsc` cherche d’abord dans `./node_modules/.bin`
4. Les scripts npm (`"build": "tsc"`) utilisent automatiquement le binaire local

La version exacte est verrouillée par le lockfile (`package-lock.json`, `pnpm-lock.yaml`, etc.).

## Erreurs fréquentes

- **Installer uniquement en global**  
  Puis se retrouver avec des erreurs « ça marche chez moi » à cause de versions différentes.

- **Oublier `--save-dev`**  
  TypeScript n’est presque jamais une dépendance de production. Il doit être en `devDependencies`.

- **Utiliser une version trop ancienne**  
  Les versions 4.x et 5.x ont apporté beaucoup d’améliorations. Vise une version récente (5.x).

- **Ne pas committer le lockfile**  
  Sans lockfile, `npm install` peut installer une version mineure différente.

## À retenir

- Préfère **toujours** l’installation locale (`--save-dev`)
- Utilise `npx tsc` ou des scripts npm pour lancer le compilateur
- Vérifie la version avec `npx tsc --version`
- TypeScript appartient aux `devDependencies`
- Le lockfile garantit la reproductibilité

## Exercices

1. Installe TypeScript localement dans un nouveau dossier et affiche sa version.

   :::indice
   `npm init -y` puis `npm install -D typescript` puis `npx tsc --version`.
   :::

   :::solution
   ```bash
   mkdir test-ts && cd test-ts
   npm init -y
   npm install --save-dev typescript
   npx tsc --version
   ```
   :::

2. Pourquoi met-on TypeScript dans `devDependencies` et non dans `dependencies` ?

   :::indice
   Pense à ce qui est nécessaire *pour exécuter* l’application en production.
   :::

   :::solution
   Parce que TypeScript n’est utilisé qu’au moment du développement et de la compilation (build). En production on exécute uniquement le JavaScript généré. Mettre TypeScript en `dependencies` augmenterait inutilement la taille de `node_modules` en production.
   :::

## Questions d'entretien

1. Quelle est la différence entre installer TypeScript globalement et localement ? Quelle approche recommandes-tu ?

   :::indice
   Parle de reproductibilité et de collaboration.
   :::

   :::reponse
   L’installation globale rend `tsc` disponible partout mais la version n’est pas liée au projet. L’installation locale (`devDependency`) fixe la version dans le `package.json` et le lockfile, garantissant que tous les développeurs et la CI utilisent exactement la même version. On recommande systématiquement l’installation locale pour les projets.
   :::

2. Comment lances-tu le compilateur TypeScript dans un projet où il est installé localement ?

   :::indice
   Plusieurs façons équivalentes.
   :::

   :::reponse
   - `npx tsc`
   - `./node_modules/.bin/tsc`
   - Via un script dans `package.json` : `"build": "tsc"` puis `npm run build`
   :::

