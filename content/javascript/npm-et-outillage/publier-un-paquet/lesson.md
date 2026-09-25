---
id: javascript-publier-un-paquet
title: "Publier un paquet, public ou privé"
slug: publier-un-paquet
technology: javascript
level: advanced
module: npm-et-outillage
order: 2
estimatedMinutes: 40
difficulty: 4
xp: 100
prerequisites:
  - javascript-npm-pnpm-et-gestion-des-paquets
  - javascript-reexport
skills:
  - js-package-publishing
tags:
  - javascript
  - nodejs
  - npm
---

## Objectifs

- Préparer un paquet : nom, points d'entrée avec `exports`, fichiers publiés avec `files`.
- Vérifier le contenu exact d'une publication avec `npm pack --dry-run`, avant de publier.
- Numéroter les versions avec `npm version` et publier avec `npm publish`, en sécurité.
- Publier un paquet privé sur un registre d'organisation, et configurer `.npmrc` sans exposer de jeton.

## Introduction

Tôt ou tard, un morceau de code mérite d'être partagé : une bibliothèque de composants utilisée par trois
applications, un client pour l'API de l'entreprise, un utilitaire que d'autres développeurs pourraient utiliser. Le
publier comme paquet lui donne une version, une documentation, et une installation en une commande.

Publier engage : ce qui part sur le registre public y reste, et d'autres projets vont en dépendre. Une clé d'API
oubliée dans un fichier publié est compromise ; un changement cassant publié en correctif casse les projets des
autres. Ce chapitre montre comment publier juste, et sans fuite.

## Concept

| Champ | Rôle pour un paquet publié |
| --- | --- |
| `name` | unique sur le registre ; `@organisation/nom` pour un paquet *scopé* |
| `version` | semver ; une version publiée ne peut plus être republiée |
| `exports` | les points d'entrée publics ; tout le reste est inaccessible aux utilisateurs |
| `files` | la liste blanche de ce qui est publié |
| `type`, `engines` | le système de modules, les versions de Node supportées |
| `license`, `description`, `repository` | ce qu'affiche la page du registre |
| `publishConfig` | options de publication : `access`, `registry` |
| `private: true` | interdit toute publication |

| Commande | Effet |
| --- | --- |
| `npm pack --dry-run` | liste les fichiers qui seraient publiés, sans rien publier |
| `npm pack` | crée l'archive `.tgz`, installable localement pour tester |
| `npm version patch`, `minor`, `major` | incrémente la version, crée un commit et une étiquette Git |
| `npm publish` | publie ; lance d'abord `prepublishOnly` |
| `npm deprecate nom@version "message"` | signale une version à éviter, sans la supprimer |

## Exemple

Une petite bibliothèque, `@atelier/slug`, transforme un titre en identifiant d'URL :

```js
// src/index.js
export function slug(titre) {
  return titre
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

```json
{
  "name": "@atelier/slug",
  "version": "1.0.0",
  "description": "Transforme un titre en identifiant d'URL.",
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./package.json": "./package.json"
  },
  "files": ["src"],
  "engines": { "node": ">=20" },
  "sideEffects": false,
  "publishConfig": { "access": "public" },
  "scripts": {
    "test": "node --test",
    "prepublishOnly": "npm test"
  }
}
```

Avant de publier, on regarde exactement ce qui partira :

```text
$ npm pack --dry-run
npm notice 7B README.md
npm notice 430B package.json
npm notice 185B src/index.js
npm notice 26B src/interne.js
npm notice total files: 4
```

Le dossier contient aussi `test/`, `.env` et `.git` : rien de cela n'est publié, grâce à `files`. `README.md`,
`package.json` et le fichier de licence sont toujours inclus. On publie ensuite une nouvelle version :

```text
$ npm version minor -m "chore: version %s"
v1.1.0
$ npm publish
```

Chez l'utilisateur, seul le point d'entrée déclaré est accessible :

```js
import { slug } from '@atelier/slug';
console.log(slug('Crème Brûlée')); // creme-brulee

await import('@atelier/slug/src/interne.js'); // ERR_PACKAGE_PATH_NOT_EXPORTED
```

## Comment ça fonctionne

**`exports` définit l'API publique.** Sans `exports`, un utilisateur peut importer n'importe quel fichier du paquet,
par exemple `@atelier/slug/src/interne.js`, et le moindre renommage interne devient un changement cassant pour lui.
Avec `exports`, Node refuse tout chemin non déclaré, avec `ERR_PACKAGE_PATH_NOT_EXPORTED`. On peut déclarer
plusieurs entrées, `"./formats": "./src/formats.js"`, et des variantes selon le contexte : `import` et `require` pour
un paquet qui fournit ESM et CommonJS, `types` pour TypeScript, `browser` pour les outils de build. L'ancien champ
`main` ne déclare qu'une entrée et n'interdit rien.

**`files` est une liste blanche.** Sans elle, npm publie tout le dossier, moins ce qu'excluent `.npmignore` ou, à
défaut, `.gitignore`, avec des surprises : un `.env` non ignoré, des fichiers de test volumineux, des brouillons. Une
liste blanche n'inclut que ce qu'on a prévu. `npm pack --dry-run` affiche le résultat : on le lit à chaque
changement de structure, et l'on peut installer l'archive de `npm pack` dans un autre projet pour tester le paquet
tel que les utilisateurs le recevront.

**Numéroter.** `npm version minor` passe de `1.0.0` à `1.1.0` dans le `package.json`, crée un commit et une
étiquette Git `v1.1.0`, à condition que le dépôt soit propre. On choisit le niveau d'après le *semantic versioning*,
du point de vue de l'utilisateur : changement cassant, majeure ; nouvelle fonctionnalité compatible, mineure ;
correction, correctif. Un journal des modifications, le `CHANGELOG.md`, explique chaque version ; des outils comme
Changesets le construisent à partir de notes écrites dans chaque pull request.

**Publier.** `npm publish` lance `prepublishOnly`, ici les tests, puis envoie l'archive au registre. Un paquet scopé
est privé par défaut sur npm, ce qui demande un compte payant : `publishConfig.access: "public"`, ou
`npm publish --access public`, le rend public. Une version publiée est **définitive** : on ne peut pas republier le
même numéro, et le retrait complet n'est possible que dans les 72 heures, sous conditions, parce que d'autres
projets en dépendent peut-être déjà. Pour une version défectueuse, on publie un correctif et on marque l'ancienne
avec `npm deprecate`.

**Publier en sécurité.** Le compte qui publie est une cible : un attaquant qui le contrôle publie du code malveillant
installé par tous les utilisateurs. On active l'authentification à deux facteurs sur le registre. En intégration
continue, on publie depuis un flux de travail dédié, déclenché par une étiquette, avec l'option `--provenance`, qui
signe le lien entre le paquet et le commit et l'exécution qui l'ont produit. npm prend aussi en charge la
publication de confiance par OIDC depuis GitHub Actions, qui évite de stocker un jeton de longue durée.

**Paquets privés.** Pour du code interne, plusieurs options. Un paquet scopé privé sur npm, dans une organisation
payante. GitHub Packages ou GitLab Package Registry, liés aux dépôts et à leurs droits. Un registre auto-hébergé,
comme Verdaccio. Dans tous les cas, un fichier `.npmrc` associe le scope au registre, et lit le jeton dans une
variable d'environnement :

```text
# .npmrc, commité dans le projet
@atelier:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Le fichier ne contient que le nom de la variable ; la valeur vient de l'environnement du poste ou de l'intégration
continue. Un jeton écrit en clair dans un `.npmrc` commité, ou publié dans un paquet, est compromis : on le révoque.
Et une application qu'on ne veut jamais publier porte `"private": true`.

## Erreurs fréquentes

**Publier sans regarder `npm pack --dry-run`.** Des fichiers de configuration, des secrets ou des gigaoctets de
données partent sur le registre.

**Omettre `exports`.** Chaque fichier interne devient une API publique qu'on ne peut plus renommer.

**Publier un changement cassant en mineure.** Les plages `^` des utilisateurs l'installent automatiquement ; c'est
une majeure.

**Écrire un jeton dans `.npmrc`.** Utilise `${NPM_TOKEN}` et une variable d'environnement.

**Oublier `"access": "public"` pour un paquet scopé public.** La publication échoue, ou le paquet reste privé.

**Supprimer une version au lieu de la déprécier.** Les projets qui en dépendent cassent ; publie un correctif et
déprécie.

**Publier depuis un poste sans authentification à deux facteurs.** Un compte volé suffit à compromettre tous les
utilisateurs.

## À retenir

- `exports` définit l'API publique et bloque le reste ; `files` liste ce qui est publié.
- `npm pack --dry-run` avant chaque publication ; `npm pack` pour tester l'archive installée.
- `npm version` incrémente, commite et étiquette ; le niveau suit semver, vu par l'utilisateur.
- Une version publiée est définitive : on corrige et on déprécie.
- Double authentification, publication depuis l'intégration continue, provenance.
- Paquets privés : scope associé à un registre dans `.npmrc`, jeton dans une variable d'environnement.

## Exercices

1. Ce paquet a été publié par erreur avec ce `package.json`, et l'équipe découvre sur le registre les fichiers `.env`,
   `tests/fixtures/clients.csv` et `src/`, alors que seul `dist/` devait partir. Explique ce qui s'est passé, corrige
   le `package.json`, et liste ce qu'il faut faire maintenant.

   ```json
   {
     "name": "@atelier/client-api",
     "version": "2.3.0",
     "main": "dist/index.js"
   }
   ```

   :::indice
   Sans `files`, qu'est-ce que npm publie ? Et que faire d'un secret qui a été publié ?
   :::

   :::solution
   Sans champ `files`, npm publie tout le dossier, moins ce qu'excluent `.npmignore` ou `.gitignore`. Le projet
   n'avait sans doute pas de `.npmignore`, et `.env` n'était pas ignoré, ou un `.npmignore` incomplet a remplacé les
   règles du `.gitignore`. `main` n'exclut rien : il indique seulement le point d'entrée.

   ```json
   {
     "name": "@atelier/client-api",
     "version": "2.3.1",
     "type": "module",
     "exports": {
       ".": "./dist/index.js",
       "./package.json": "./package.json"
     },
     "files": ["dist"],
     "publishConfig": { "access": "restricted" },
     "scripts": {
       "prepublishOnly": "npm run build && npm test"
     }
   }
   ```

   À faire maintenant :

   1. considérer chaque secret du `.env` comme compromis et le **révoquer** chez son fournisseur, puis en créer un
      nouveau : supprimer la version ne suffit pas, elle a pu être téléchargée ou mise en cache ;
   2. traiter les données de `clients.csv` comme une fuite de données personnelles, avec les responsables concernés ;
   3. retirer la version si c'est encore possible, sinon la déprécier ; publier `2.3.1` corrigée ;
   4. ajouter `npm pack --dry-run` à la revue de publication, ou un contrôle automatique dans l'intégration continue.
   :::

2. Une bibliothèque expose `@atelier/dates` et un sous-module de formats. Écris le champ `exports` qui permet
   `import { formater } from '@atelier/dates'` et `import { ISO } from '@atelier/dates/formats'`, et interdit tout
   autre chemin. Vérifie-le avec un paquet local.

   :::indice
   Une entrée `"."` et une entrée `"./formats"`. On peut tester sans publier : un paquet peut s'importer lui-même par
   son nom grâce à `exports`.
   :::

   :::solution
   ```json
   {
     "name": "@atelier/dates",
     "version": "1.0.0",
     "type": "module",
     "exports": {
       ".": "./src/index.js",
       "./formats": "./src/formats.js",
       "./package.json": "./package.json"
     }
   }
   ```

   ```js
   // src/formats.js : export const ISO = 'yyyy-MM-dd';
   // src/index.js : export const formater = (date) => date.toISOString().slice(0, 10);

   // verifier.mjs, à la racine du paquet : un paquet peut s'importer par son propre nom.
   import { formater } from '@atelier/dates';
   import { ISO } from '@atelier/dates/formats';

   console.log(formater(new Date('2026-09-25T12:00:00Z')), ISO); // 2026-09-25 yyyy-MM-dd

   try {
     await import('@atelier/dates/src/index.js');
   } catch (erreur) {
     console.log(erreur.code); // ERR_PACKAGE_PATH_NOT_EXPORTED
   }
   ```

   Le chemin `./formats` est un nom public, découplé de l'emplacement du fichier : on peut déplacer `src/formats.js`
   sans casser les utilisateurs, en changeant seulement la cible dans `exports`.
   :::

3. L'entreprise publie ses paquets `@atelier/*` sur GitHub Packages. Écris le `.npmrc` du projet qui les consomme, et
   explique comment un développeur et l'intégration continue fournissent le jeton sans jamais le commiter.

   :::indice
   Une ligne pour associer le scope au registre, une pour l'authentification, avec une variable.
   :::

   :::solution
   ```text
   @atelier:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
   ```

   Ce fichier est commité : il ne contient que le nom de la variable. Seuls les paquets `@atelier/*` sont demandés à
   GitHub Packages ; les autres viennent toujours du registre public. Le développeur crée un jeton personnel avec le
   droit de lecture des paquets, et le définit dans son environnement, par exemple dans son profil de shell ou un
   gestionnaire de secrets, jamais dans un fichier du projet. En intégration continue, le jeton est un secret du
   dépôt, injecté comme variable d'environnement de l'étape d'installation ; sur GitHub Actions, le `GITHUB_TOKEN` de
   l'exécution suffit souvent pour lire les paquets de l'organisation. Si la variable manque, l'installation échoue
   avec une erreur d'authentification, ce qui est préférable à un jeton en clair.
   :::

## Questions d'entretien

- À quoi sert le champ `exports` du `package.json` ?

  :::indice
  Qu'est-ce qu'un utilisateur a le droit d'importer ?
  :::

  :::reponse
  Il déclare les points d'entrée publics du paquet et interdit l'accès à tout autre fichier : un import non déclaré
  échoue avec `ERR_PACKAGE_PATH_NOT_EXPORTED`. L'API publique est ainsi explicite, et l'on peut réorganiser
  l'intérieur du paquet sans changement cassant. Il permet aussi des entrées multiples et des variantes
  conditionnelles : `import` et `require` pour fournir ESM et CommonJS, `types` pour TypeScript, `browser` ou `node`
  selon l'environnement. Il remplace avantageusement `main`, qui ne déclare qu'une entrée et n'interdit rien.
  :::

- Comment éviter de publier des fichiers sensibles dans un paquet npm ?

  :::indice
  Liste blanche, vérification, automatisation.
  :::

  :::reponse
  J'utilise le champ `files` comme liste blanche, avec seulement le dossier de build et ce qui est nécessaire, plutôt
  qu'une liste noire `.npmignore` qu'on oublie de maintenir. Avant chaque publication, `npm pack --dry-run` montre la
  liste exacte des fichiers ; je l'intègre à la revue ou à l'intégration continue, et je publie depuis un flux
  automatisé plutôt que depuis un poste de travail. Les secrets ne vivent jamais dans le dossier du paquet. Si un
  secret a fuité malgré tout, je le révoque immédiatement : retirer la version ne suffit pas.
  :::

- Comment choisir le numéro de la prochaine version d'une bibliothèque ?

  :::indice
  Du point de vue de qui ?
  :::

  :::reponse
  Selon le *semantic versioning*, du point de vue de l'utilisateur : si une mise à jour peut casser du code qui
  fonctionnait, même via un comportement non documenté mais largement utilisé, c'est une majeure ; une fonctionnalité
  ajoutée de façon compatible est une mineure ; une correction sans changement d'API est un correctif. Les
  utilisateurs installent automatiquement mineures et correctifs grâce aux plages `^` : une erreur de classement
  casse leurs projets sans qu'ils l'aient décidé. Un journal des modifications documente chaque version, et des
  outils comme Changesets aident à classer chaque changement au moment de la pull request.
  :::
