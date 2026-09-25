---
id: javascript-npm-et-package-json
title: "npm, package.json et les scripts"
slug: npm-et-package-json
technology: javascript
level: intermediate
module: introduction-nodejs
order: 2
estimatedMinutes: 35
difficulty: 3
xp: 80
prerequisites:
  - javascript-runtime-node
skills:
  - js-npm-package-json
tags:
  - javascript
  - nodejs
  - npm
---

## Objectifs

- Distinguer les trois sens de « npm » : l'outil, le registre et le paquet.
- Lire et écrire un `package.json` : identité, type de modules, points d'entrée, scripts, moteur.
- Écrire des scripts npm qui s'enchaînent, reçoivent des arguments et fonctionnent sur tous les systèmes.
- Exposer une commande en ligne de commande avec le champ `bin`.

## Introduction

Un projet JavaScript n'est pas seulement un dossier de fichiers : il a un nom, une version, des dépendances, des
commandes pour le tester, le construire, le lancer. Tout cela tient dans un fichier, `package.json`, à la racine du
projet. C'est la première chose qu'on lit en arrivant sur un projet inconnu, et la section `scripts` en est le mode
d'emploi : `npm test`, `npm run build`, `npm run dev`.

Ce chapitre présente npm et ce fichier. Le suivant s'occupera des dépendances et de leurs versions.

## Concept

**npm** désigne trois choses : l'outil en ligne de commande livré avec Node ; le **registre**, `registry.npmjs.org`,
qui héberge des millions de paquets ; et, par extension, un **paquet** : un dossier avec un `package.json`.

| Champ du `package.json` | Rôle |
| --- | --- |
| `name`, `version` | identité du paquet ; obligatoires pour le publier |
| `private: true` | interdit toute publication accidentelle ; à mettre dans une application |
| `type` | `"module"` : les fichiers `.js` sont des modules ES ; `"commonjs"` ou absent : CommonJS |
| `exports`, `main` | le point d'entrée quand un autre code importe le paquet |
| `bin` | les commandes exécutables que le paquet installe |
| `scripts` | les commandes du projet, lancées avec `npm run <nom>` |
| `dependencies`, `devDependencies` | les paquets dont le projet a besoin, au chapitre suivant |
| `engines` | les versions de Node supportées |

| Commande | Effet |
| --- | --- |
| `npm init -y` | crée un `package.json` avec des valeurs par défaut |
| `npm run` | liste les scripts |
| `npm run build` | lance le script `build`, précédé de `prebuild` et suivi de `postbuild` s'ils existent |
| `npm test`, `npm start` | raccourcis de `npm run test` et `npm run start` |
| `npm run test -- --watch` | transmet `--watch` à la commande du script |
| `npx vitest`, `npm exec vitest` | exécute une commande d'un paquet, installé localement ou téléchargé |
| `node --run build` | lance un script directement avec Node, plus vite, mais sans `pre` ni `post` |

## Exemple

Le `package.json` d'une petite application Node :

```json
{
  "name": "suivi-depenses",
  "version": "1.2.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "dev": "node --watch --env-file=.env src/serveur.js",
    "start": "node src/serveur.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "check": "npm run lint && npm test"
  },
  "dependencies": {
    "zod": "^4.1.0"
  },
  "devDependencies": {
    "eslint": "^9.36.0",
    "vitest": "^3.2.0"
  }
}
```

```text
$ npm run check

> suivi-depenses@1.2.0 check
> npm run lint && npm test

> suivi-depenses@1.2.0 lint
> eslint .

> suivi-depenses@1.2.0 test
> vitest run
 ✓ src/depenses.test.js (6 tests)
```

Un nouveau venu sait tout de suite comment lancer le projet en développement, le tester et le vérifier, sans lire
de documentation.

## Comment ça fonctionne

**Du JSON strict.** `package.json` est du JSON, pas du JavaScript : guillemets doubles, pas de virgule après le
dernier élément, pas de commentaires. Une seule erreur de syntaxe, et toutes les commandes npm échouent. Pour le
modifier sans risque depuis un terminal, `npm pkg set type=module` et `npm pkg get version` lisent et écrivent le
fichier proprement.

**`type` décide du système de modules.** Avec `"type": "module"`, Node traite les fichiers `.js` du paquet comme des
modules ES. Avec `"commonjs"`, ce sont des modules CommonJS, et un `import` au niveau supérieur d'un `.js` échoue.
Sans ce champ, ou avec une valeur qu'il ne reconnaît pas, Node 22 essaie CommonJS, détecte la syntaxe ES, analyse le
fichier une seconde fois et affiche un avertissement `MODULE_TYPELESS_PACKAGE_JSON`. Les extensions `.mjs` et `.cjs`
forcent le système, quel que soit le champ. `npm init -y` écrit aujourd'hui `"type": "commonjs"` : pour un nouveau
projet, on le passe à `"module"`.

**Comment un script trouve ses commandes.** `npm run` exécute la chaîne dans un shell : `sh` sur macOS et Linux,
`cmd.exe` sur Windows. Avant, il ajoute `node_modules/.bin` au début du `PATH` : c'est là que les paquets installés
déposent leurs commandes. Un script peut donc appeler `vitest` ou `eslint` sans chemin, et c'est la version du projet
qui s'exécute, pas une version installée globalement. `npx` fait la même recherche, et télécharge le paquet s'il
n'est pas installé : on vérifie alors ce qu'on exécute.

**Arguments, `pre` et `post`.** Tout ce qui suit `--` est ajouté à la fin de la commande : `npm run test -- --watch`
exécute `vitest run --watch`. Pour un script `build`, npm exécute `prebuild`, puis `build`, puis `postbuild`, et
s'arrête à la première erreur. Ces crochets sont pratiques, mais cachés : un script explicite comme
`"check": "npm run lint && npm test"` se lit plus facilement. npm fournit aussi des variables d'environnement au
script, comme `npm_package_name`, `npm_package_version` et `npm_lifecycle_event`, le nom du script en cours.

**Codes de sortie.** Un script réussit si sa commande se termine avec le code 0. `&&` n'enchaîne que si la commande
précédente a réussi : `lint && test` ne lance pas les tests si le lint échoue. C'est ce que regarde l'intégration
continue : un code non nul, et la vérification échoue.

**Des scripts qui marchent partout.** Un script est exécuté par `cmd.exe` sur Windows : `rm -rf dist`,
`NODE_ENV=production node app.js` ou les guillemets simples y échouent. Pour rester portable, on écrit les tâches
de fichiers en JavaScript, dans un petit script Node, ou on utilise des outils comme `rimraf` ; pour les variables
d'environnement, `node --env-file` ou `cross-env`.

**Exposer une commande.** Le champ `bin` associe un nom de commande à un fichier. Quand quelqu'un installe le paquet,
npm crée ce lien dans `node_modules/.bin`, ou dans le `PATH` global avec `npm install -g`. Le fichier commence par
une ligne *shebang*, `#!/usr/bin/env node`, qui indique aux systèmes Unix de l'exécuter avec Node ; sur Windows,
npm génère un petit script `.cmd` équivalent.

**`node --run`.** Depuis Node 22, `node --run build` exécute un script du `package.json` sans passer par npm :
démarrage plus rapide, même ajout de `node_modules/.bin` au `PATH`, mais sans `prebuild` ni `postbuild`.

## Erreurs fréquentes

**Écrire un commentaire ou une virgule finale dans `package.json`.** Ce n'est pas du JSON valide : npm refuse le
fichier. Utilise `npm pkg set` pour modifier sans risque.

**Oublier `"type": "module"`.** Avec `"type": "commonjs"`, les `import` d'un fichier `.js` échouent ; sans champ,
Node devine avec un avertissement et une double analyse.

**Installer un outil globalement pour un projet.** Chaque développeur aura sa version ; installe-le en
`devDependencies` et appelle-le depuis un script.

**Oublier `--` pour transmettre un argument.** `npm run test --watch` donne l'option à npm, pas à Vitest.

**Écrire des scripts qui ne marchent que sous Unix.** `rm -rf` ou `VAR=valeur commande` échouent sous Windows.

**Oublier `private: true` dans une application.** Un `npm publish` par erreur la publierait sur le registre public.

## À retenir

- `package.json` décrit le projet : identité, type de modules, points d'entrée, scripts, dépendances, moteur.
- C'est du JSON strict ; `npm pkg set` le modifie sans risque.
- `npm run` ajoute `node_modules/.bin` au `PATH` : les scripts utilisent les outils du projet.
- `--` transmet des arguments ; `pre<nom>` et `post<nom>` encadrent un script ; `&&` enchaîne sur succès.
- Des scripts portables : pas de commandes propres à Unix, des scripts Node pour les fichiers.
- `bin` expose une commande, avec un fichier qui commence par `#!/usr/bin/env node`.

## Exercices

1. Ce `package.json` est refusé par npm, et même corrigé, le projet ne se comporte pas comme prévu. Trouve les quatre
   problèmes.

   ```text
   {
     "name": "Mon Projet",
     "version": "1.0",
     // modules ES partout
     "type": "modules",
     "scripts": {
       "test": "vitest run",
     }
   }
   ```

   :::indice
   Deux erreurs de syntaxe JSON, et deux valeurs que npm ou Node n'acceptent pas : relis les règles du nom, de la
   version et du type.
   :::

   :::solution
   - Le commentaire `// modules ES partout` est interdit en JSON.
   - La virgule après `"vitest run"` est interdite en JSON.
   - `"type": "modules"` n'est pas une valeur reconnue : c'est `"module"`. Node l'ignore sans erreur, comme si le
     champ était absent, et devine le système de chaque fichier en affichant un avertissement.
   - `"name": "Mon Projet"` : un nom de paquet est en minuscules, sans espace ; et `"version": "1.0"` n'est pas une
     version sémantique complète, qui a trois nombres. Les scripts fonctionnent encore, mais `npm publish` refuse
     le paquet : `Invalid name`, puis `Invalid version`.

   ```json
   {
     "name": "mon-projet",
     "version": "1.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "test": "vitest run"
     }
   }
   ```
   :::

2. Écris la section `scripts` d'un projet qui doit pouvoir : formater le code avec Prettier ; vérifier le formatage
   sans modifier ; lancer ESLint ; lancer les tests une fois ou en continu ; et, en une commande `verify`, vérifier le
   formatage, le lint et les tests, en s'arrêtant à la première erreur. Comment lancer seulement les tests d'un
   fichier `panier.test.js` ?

   :::indice
   `prettier --write .` et `prettier --check .` ; `&&` pour enchaîner ; `--` pour transmettre un argument.
   :::

   :::solution
   ```json
   {
     "scripts": {
       "format": "prettier --write .",
       "format:check": "prettier --check .",
       "lint": "eslint .",
       "test": "vitest run",
       "test:watch": "vitest",
       "verify": "npm run format:check && npm run lint && npm test"
     }
   }
   ```

   `npm test -- panier.test.js` exécute `vitest run panier.test.js`. Dans `verify`, on vérifie le formatage sans le
   modifier : en intégration continue, un script ne doit pas réécrire les fichiers.
   :::

3. Transforme ce script en commande `compter-lignes`, installable avec npm : `compter-lignes fichier.txt` affiche le
   nombre de lignes, et sort avec le code 1 si aucun fichier n'est donné ou s'il n'existe pas. Donne le
   `package.json` et le fichier `bin/compter-lignes.js`.

   :::indice
   Le fichier commence par `#!/usr/bin/env node`. `process.argv[2]` est le premier argument ; `console.error` et
   `process.exitCode` pour les erreurs.
   :::

   :::solution
   ```json
   {
     "name": "compter-lignes",
     "version": "1.0.0",
     "type": "module",
     "bin": {
       "compter-lignes": "./bin/compter-lignes.js"
     }
   }
   ```

   ```js
   #!/usr/bin/env node
   import { readFile } from 'node:fs/promises';

   const chemin = process.argv[2];

   if (!chemin) {
     console.error('Usage : compter-lignes <fichier>');
     process.exitCode = 1;
   } else {
     try {
       const contenu = await readFile(chemin, 'utf8');
       const lignes = contenu === '' ? 0 : contenu.split('\n').length - (contenu.endsWith('\n') ? 1 : 0);
       console.log(lignes);
     } catch (erreur) {
       console.error(`Impossible de lire ${chemin} : ${erreur.code ?? erreur.message}`);
       process.exitCode = 1;
     }
   }
   ```

   Installé dans un projet, le paquet crée `node_modules/.bin/compter-lignes`, utilisable dans les scripts ou avec
   `npx compter-lignes`. Un fichier qui se termine par un saut de ligne n'a pas de ligne vide supplémentaire : d'où la
   correction sur `endsWith('\n')`.
   :::

## Questions d'entretien

- Que se passe-t-il quand on lance `npm run build` ?

  :::indice
  Pense au `PATH`, au shell, à `prebuild` et `postbuild`, et au code de sortie.
  :::

  :::reponse
  npm lit le script `build` du `package.json`, ajoute `node_modules/.bin` au début du `PATH`, et exécute `prebuild`
  s'il existe, puis `build`, puis `postbuild`, dans un shell : `sh` sous Unix, `cmd.exe` sous Windows. Il fournit
  des variables d'environnement comme `npm_package_version`. Si une étape se termine avec un code non nul, npm
  s'arrête et renvoie une erreur, ce qu'utilise l'intégration continue. Les arguments après `--` sont ajoutés à la
  commande.
  :::

- Pourquoi installer ESLint en `devDependencies` plutôt que globalement ?

  :::indice
  Que se passe-t-il quand deux développeurs ont deux versions différentes ?
  :::

  :::reponse
  Installé dans le projet, l'outil a une version fixée par le projet et son fichier de verrouillage : tous les
  développeurs et l'intégration continue exécutent exactement la même version, avec les mêmes règles. Un outil
  global dépend de chaque machine, peut manquer, ou produire des résultats différents. Les scripts npm trouvent
  l'outil local grâce à `node_modules/.bin`, et `npx` aussi.
  :::

- À quoi sert le champ `type` du `package.json` ?

  :::indice
  Comment Node décide-t-il qu'un fichier `.js` est un module ES ?
  :::

  :::reponse
  Il indique comment Node doit interpréter les fichiers `.js` du paquet : `"module"` pour des modules ES, avec
  `import` et `export` ; `"commonjs"`, la valeur par défaut, pour `require` et `module.exports`. Les extensions `.mjs`
  et `.cjs` forcent le système quel que soit ce champ. Pour un nouveau projet, on choisit `"module"`.
  :::
