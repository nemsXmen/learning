---
id: javascript-monorepos-et-workspaces
title: "Monorepos et workspaces"
slug: monorepos-et-workspaces
technology: javascript
level: advanced
module: npm-et-outillage
order: 3
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-npm-pnpm-et-gestion-des-paquets
skills:
  - js-monorepo-workspaces
tags:
  - javascript
  - nodejs
  - pnpm
  - monorepo
---

## Objectifs

- Savoir ce qu'est un monorepo, et quand il vaut mieux que plusieurs dépôts.
- Déclarer un workspace pnpm et relier des paquets internes avec le protocole `workspace:`.
- Exécuter des scripts dans tous les paquets, dans le bon ordre, ou seulement dans ceux qui sont concernés.
- Organiser les dépendances entre applications et paquets partagés, sans cycles.

## Introduction

Une application web, une API, et entre les deux du code partagé : les types des données échangées, les règles de
validation, un client HTTP. Avec un dépôt par projet, partager ce code oblige à le publier comme paquet, à monter
sa version, puis à mettre à jour chaque projet : un changement de trois lignes devient trois pull requests
coordonnées.

Un **monorepo** regroupe ces projets dans un seul dépôt. Un changement du code partagé et son utilisation dans l'API et
l'application se font dans le même commit, testés ensemble. C'est l'organisation du projet de ce cours : `apps/web`,
`apps/api`, et des paquets dans `packages/`, dont celui qui valide le contenu que vous êtes en train de lire.

## Concept

| Élément | Rôle |
| --- | --- |
| `pnpm-workspace.yaml` | déclare les dossiers qui contiennent les paquets du workspace |
| paquet du workspace | un dossier avec son propre `package.json`, ses scripts et ses dépendances |
| `"@app/validation": "workspace:*"` | une dépendance vers un paquet **local** du workspace, par un lien |
| un seul `pnpm-lock.yaml`, un seul `pnpm install` | à la racine, pour tout le dépôt |

| Commande | Effet |
| --- | --- |
| `pnpm -r build` | lance `build` dans tous les paquets qui l'ont, dépendances d'abord |
| `pnpm --filter @app/web test` | lance `test` dans un seul paquet |
| `pnpm --filter "@app/api..." build` | le paquet **et ses dépendances** |
| `pnpm --filter "...@app/validation" test` | le paquet **et tout ce qui en dépend** |
| `pnpm --filter "[origin/main]" test` | les paquets modifiés depuis `origin/main` |
| `pnpm add zod --filter @app/api` | ajoute une dépendance à un seul paquet |
| `pnpm add -D -w prettier` | ajoute un outil à la racine du workspace |

## Exemple

Une boutique : un paquet `prix`, un paquet `panier` qui l'utilise, et une application.

```text
boutique/
├── package.json
├── pnpm-workspace.yaml
├── packages/
│   ├── prix/      → @boutique/prix
│   └── panier/    → @boutique/panier, dépend de @boutique/prix
└── apps/
    └── boutique/  → @boutique/app, dépend de @boutique/panier
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
{
  "name": "@boutique/panier",
  "version": "1.0.0",
  "type": "module",
  "exports": "./src/index.js",
  "dependencies": {
    "@boutique/prix": "workspace:*"
  }
}
```

```js
// packages/panier/src/index.js
import { formaterPrix } from '@boutique/prix';

export const totalPanier = (lignes) =>
  formaterPrix(lignes.reduce((somme, ligne) => somme + ligne.prix * ligne.quantite, 0));
```

```js
// packages/prix/src/index.js
export const formaterPrix = (centimes) => `${(centimes / 100).toFixed(2).replace('.', ',')} €`;
```

```js
// apps/boutique/index.js
import { totalPanier } from '@boutique/panier';

console.log(totalPanier([{ prix: 1250, quantite: 2 }, { prix: 399, quantite: 1 }])); // 28,99 €
```

```text
$ pnpm install
$ pnpm -r build
packages/prix build: build prix
packages/panier build: build panier
apps/boutique build: build app
$ pnpm --filter @boutique/app start
28,99 €
```

Un `pnpm install` à la racine installe tout le workspace. `pnpm -r build` construit `prix`, puis `panier`, puis
l'application : l'ordre suit les dépendances.

## Comment ça fonctionne

**Des liens, pas des copies.** Pour `workspace:*`, pnpm ne télécharge rien : il crée dans
`apps/boutique/node_modules/@boutique/panier` un lien symbolique vers `packages/panier`. Une modification du paquet
est visible immédiatement par ses utilisateurs, sans publication ni réinstallation. Le protocole `workspace:` garantit
aussi qu'on utilise bien le paquet local : si le paquet n'existe pas dans le workspace, l'installation échoue au lieu
d'aller chercher un paquet du même nom sur le registre.

**À la publication.** Si un paquet du workspace est publié, pnpm remplace `workspace:*` par la version exacte du paquet
référencé, `1.0.0`, et `workspace:^` par `^1.0.0` : l'archive publiée contient des plages normales, installables hors
du monorepo.

**L'ordre topologique.** pnpm construit le graphe des dépendances entre paquets du workspace. `pnpm -r` exécute le
script de chaque paquet après ceux dont il dépend, et en parallèle quand c'est possible. Ce graphe interdit les
cycles : si `prix` importait `panier`, lequel construire en premier ? Un cycle est un signal de mauvais découpage ; on
extrait la partie commune dans un troisième paquet.

**Filtrer.** Dans un grand monorepo, tout reconstruire et tout tester à chaque changement coûte cher. Les filtres
ciblent le travail : `--filter @app/web` pour un paquet, `"@app/api..."` pour un paquet et ses dépendances, ce qu'il
faut construire pour le lancer, `"...@app/validation"` pour un paquet et tout ce qui en dépend, ce qu'il faut tester
après l'avoir modifié. En intégration continue, `--filter "...[origin/main]"` teste les paquets modifiés depuis la
branche principale et leurs dépendants. Des outils comme Turborepo ou Nx vont plus loin : ils mettent en cache le
résultat de chaque tâche et ne réexécutent que ce dont les entrées ont changé.

**Où vont les dépendances.** Chaque paquet déclare ce qu'il importe, dans son propre `package.json` : l'API déclare
son framework, l'application web le sien. Les outils utilisés partout, comme Prettier ou TypeScript, et la
configuration commune, vont à la racine, ou dans un paquet de configuration partagé : dans le projet de ce cours,
`packages/config` fournit la configuration TypeScript commune, que la plupart des paquets étendent. La racine est
`private: true`, et ses scripts délèguent : `"test": "pnpm -r test"`. Un seul fichier de verrouillage garantit qu'une bibliothèque a la même
version dans toutes les applications.

**Paquets internes : source ou build.** Un paquet interne peut être consommé depuis ses sources, `exports` pointant
vers `src/index.ts` que l'outil de l'application compile, ce qui est simple et rapide en développement. Ou il peut être
construit, `exports` pointant vers `dist/`, ce qui impose de le construire avant ses utilisateurs, mais produit
exactement ce qu'on publierait. Le projet de ce cours construit ses paquets : c'est pourquoi le script de validation
du contenu construit d'abord `@app/validation` puis `@app/content`.

**Frontières.** Le monorepo rend tout importable, et c'est un danger : une application qui importe un fichier
interne d'une autre, `../../apps/api/src/db.ts`, crée un couplage invisible. Les règles : on ne passe que par le
nom du paquet et son `exports` ; les applications dépendent des paquets, jamais l'inverse ; les paquets partagés ne
dépendent pas des applications. Des règles de lint peuvent les faire respecter.

**Monorepo ou plusieurs dépôts ?** Un monorepo convient quand des projets évoluent ensemble et partagent du code :
changements atomiques, un seul outillage, refactorings transverses. Plusieurs dépôts conviennent à des projets
indépendants, maintenus par des équipes séparées, avec des cycles de publication différents. Un monorepo demande de
l'outillage à mesure qu'il grandit : filtres, cache, règles de frontières, propriétaires de code.

## Erreurs fréquentes

**Référencer un paquet interne par un chemin relatif.** `import … from '../../packages/prix/src/index.js'` contourne
`exports` et le graphe de dépendances ; déclare `workspace:*` et importe par le nom.

**Oublier de déclarer une dépendance interne.** L'import peut fonctionner par hasard, mais `pnpm -r` ne connaît pas
l'ordre, et le build casse de façon intermittente.

**Installer dans un sous-dossier avec `npm install`.** Un second verrou apparaît et l'arbre diverge ; tout passe par
pnpm, à la racine.

**Mettre les dépendances de chaque application à la racine.** Chaque paquet déclare ce qu'il importe ; la racine
garde les outils communs.

**Créer un cycle entre paquets.** Extrais la partie commune dans un nouveau paquet.

**Tout reconstruire à chaque changement.** Filtre sur les paquets modifiés et leurs dépendants, puis mets en cache.

## À retenir

- Un monorepo regroupe des projets liés pour des changements atomiques et un outillage commun.
- `pnpm-workspace.yaml` déclare les paquets ; `workspace:*` relie un paquet local par un lien.
- `workspace:*` devient une version réelle à la publication.
- `pnpm -r` suit l'ordre des dépendances ; `--filter` cible un paquet, ses dépendances (`nom...`) ou ses dépendants
  (`...nom`).
- Chaque paquet déclare ses dépendances ; la racine, privée, garde les outils et délègue ses scripts.
- Pas de chemins relatifs entre paquets, pas de cycles, des frontières claires.

## Exercices

1. Dans le projet de ce cours, tu modifies `packages/validation`. Écris les commandes pnpm pour : lancer les tests de
   ce seul paquet ; lancer les tests de tous les paquets qui en dépendent, lui compris ; construire l'application
   `@app/api` avec tout ce dont elle a besoin. Explique chaque filtre.

   :::indice
   Le nom du paquet est `@app/validation`. Les trois points se placent après le nom pour les dépendances, avant pour
   les dépendants.
   :::

   :::solution
   ```text
   pnpm --filter @app/validation test
   pnpm --filter "...@app/validation" test
   pnpm --filter "@app/api..." build
   ```

   - Le premier filtre ne sélectionne que `@app/validation`.
   - `...@app/validation` sélectionne le paquet et tout ce qui en dépend, directement ou non : l'API, l'application
     web, le paquet de contenu. Ce sont les paquets qu'une modification peut casser.
   - `@app/api...` sélectionne l'API et tout ce dont elle dépend ; pnpm construit d'abord les dépendances, puis l'API.

   Les guillemets évitent qu'un shell interprète les points ou les crochets d'autres filtres.
   :::

2. Une équipe a trois paquets : `@app/ui` importe `@app/utils`, et `@app/utils` importe une fonction de mise en forme
   depuis `@app/ui`. Le build échoue de façon intermittente. Explique le problème et propose un nouveau découpage.

   :::indice
   Dans quel ordre pnpm doit-il construire ces paquets ? Quelle est la partie commune ?
   :::

   :::solution
   C'est une dépendance circulaire entre paquets : aucun ordre de construction ne satisfait les deux relations. Selon
   l'état des dossiers `dist` au moment du build, l'un des deux trouve une version périmée ou absente de l'autre, d'où
   les échecs intermittents. La fonction de mise en forme est la partie commune : elle ne relève ni de l'interface ni
   des utilitaires génériques. On l'extrait dans un paquet dédié, par exemple `@app/format`, dont dépendent les deux
   autres :

   ```text
   @app/format   ← aucune dépendance interne
   @app/utils    → @app/format
   @app/ui       → @app/utils, @app/format
   ```

   Le graphe redevient acyclique, et `pnpm -r build` construit `format`, puis `utils`, puis `ui`. Une règle de lint
   comme `import/no-cycle`, ou une vérification du graphe en intégration continue, empêche le cycle de revenir.
   :::

3. Écris le `package.json` racine d'un monorepo qui contient `apps/web`, `apps/api` et `packages/*`, avec : l'outil et sa
   version fixés ; Prettier et TypeScript partagés ; un script `verify` qui lance le lint, les tests et le build de
   tous les paquets, dans le bon ordre, en s'arrêtant à la première erreur ; un script `dev` qui lance l'API et
   l'application web en parallèle.

   :::indice
   `private: true`, `packageManager`, `pnpm -r`, et `--parallel` pour des tâches qui ne se terminent pas.
   :::

   :::solution
   ```json
   {
     "name": "atelier-monorepo",
     "private": true,
     "packageManager": "pnpm@10.15.0",
     "engines": {
       "node": ">=22"
     },
     "scripts": {
       "lint": "pnpm -r lint",
       "test": "pnpm -r test",
       "build": "pnpm -r build",
       "verify": "pnpm lint && pnpm test && pnpm build",
       "dev": "pnpm --parallel --filter @app/web --filter @app/api dev",
       "format": "prettier --write ."
     },
     "devDependencies": {
       "prettier": "^3.6.2",
       "typescript": "^5.9.2"
     }
   }
   ```

   La racine est privée : on ne la publie jamais. `pnpm -r` suit l'ordre topologique et s'arrête à la première
   erreur. Les serveurs de développement ne se terminent pas : `--parallel` les lance ensemble sans attendre l'ordre des
   dépendances, et affiche leurs sorties préfixées par le nom du paquet. Le fichier `pnpm-workspace.yaml` liste
   `apps/*` et `packages/*`.
   :::

## Questions d'entretien

- Quels sont les avantages et les inconvénients d'un monorepo ?

  :::indice
  Changements atomiques, outillage, taille, frontières.
  :::

  :::reponse
  Avantages : un changement du code partagé et de ses utilisateurs se fait dans un seul commit, testé ensemble ; un
  seul outillage, une seule configuration, un seul fichier de verrouillage, donc les mêmes versions partout ; le
  partage de code sans publication ; les refactorings transverses sont faciles. Inconvénients : le dépôt grossit, et
  sans filtres ni cache, l'intégration continue ralentit ; tout est importable, ce qui demande des règles de
  frontières ; les droits d'accès sont plus difficiles à séparer. Il convient à des projets qui évoluent ensemble ;
  des projets indépendants, gérés par des équipes séparées, sont souvent mieux dans des dépôts distincts.
  :::

- Que fait le protocole `workspace:*` ?

  :::indice
  Pendant le développement, puis à la publication.
  :::

  :::reponse
  Il déclare une dépendance vers un paquet du même workspace. pnpm crée un lien symbolique vers le dossier local : les
  modifications sont visibles immédiatement, sans publication. Il garantit que le paquet vient du workspace, et
  l'installation échoue s'il n'existe pas, au lieu de télécharger un homonyme du registre. À la publication, pnpm
  remplace `workspace:*` par la version exacte du paquet, et `workspace:^` par une plage `^`, pour que le paquet
  publié soit installable ailleurs.
  :::

- Comment garder une intégration continue rapide dans un grand monorepo ?

  :::indice
  Ne faire que le travail nécessaire, et ne jamais le faire deux fois.
  :::

  :::reponse
  En ne traitant que les paquets concernés : avec pnpm, `--filter "...[origin/main]"` sélectionne les paquets modifiés
  et tout ce qui en dépend. En mettant en cache les résultats des tâches, avec Turborepo ou Nx, localement et à
  distance : une tâche dont les entrées n'ont pas changé est restaurée au lieu d'être réexécutée. En parallélisant ce
  qui est indépendant, grâce au graphe de dépendances. Et en gardant des frontières claires, qui limitent le nombre
  de dépendants de chaque paquet.
  :::
