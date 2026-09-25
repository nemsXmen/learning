---
id: javascript-npm-pnpm-et-gestion-des-paquets
title: "npm, pnpm et la gestion des paquets au quotidien"
slug: npm-pnpm-et-gestion-des-paquets
technology: javascript
level: intermediate
module: npm-et-outillage
order: 1
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-dependances-et-versions
skills:
  - js-package-managers
tags:
  - javascript
  - nodejs
  - npm
  - pnpm
---

## Objectifs

- Comparer npm et pnpm : organisation de `node_modules`, espace disque, rigueur, fichier de verrouillage.
- Utiliser les commandes courantes des deux outils : installer, ajouter, retirer, mettre à jour, exécuter.
- Fixer le gestionnaire et sa version pour toute l'équipe avec le champ `packageManager`.
- Entretenir ses dépendances : versions obsolètes, vulnérabilités, versions forcées, scripts d'installation.

## Introduction

npm est livré avec Node, mais ce n'est pas le seul gestionnaire de paquets. pnpm, Yarn et Bun lisent le même
`package.json` et téléchargent depuis le même registre, avec des choix différents sur la façon d'installer. pnpm
s'est imposé dans beaucoup d'équipes, et c'est celui qu'utilise le projet de ce cours.

Au-delà de l'outil, gérer des dépendances est un travail continu : les versions vieillissent, des failles sont
découvertes, des paquets abandonnés. Ce chapitre donne les gestes de ce quotidien.

## Concept

| | npm | pnpm |
| --- | --- | --- |
| `node_modules` | arbre aplati : les dépendances indirectes sont à la racine | seules les dépendances déclarées sont à la racine, en liens vers `node_modules/.pnpm` |
| dépendances fantômes | importables | introuvables : `ERR_MODULE_NOT_FOUND` |
| disque | une copie par projet | un magasin global, partagé par liens physiques entre projets |
| verrouillage | `package-lock.json` | `pnpm-lock.yaml` |
| scripts d'installation des dépendances | exécutés | bloqués par défaut depuis pnpm 10, à autoriser explicitement |
| monorepos | `workspaces` dans `package.json` | `pnpm-workspace.yaml`, filtres puissants |

| Action | npm | pnpm |
| --- | --- | --- |
| installer le projet | `npm install` | `pnpm install` |
| installation d'intégration continue | `npm ci` | `pnpm install --frozen-lockfile` |
| ajouter une dépendance | `npm install zod` | `pnpm add zod` |
| ajouter un outil de développement | `npm install -D vitest` | `pnpm add -D vitest` |
| retirer | `npm uninstall zod` | `pnpm remove zod` |
| versions obsolètes | `npm outdated` | `pnpm outdated` |
| mettre à jour dans les plages | `npm update` | `pnpm update` |
| lancer un script | `npm run build` | `pnpm build` ou `pnpm run build` |
| exécuter un binaire local | `npx vitest` | `pnpm exec vitest` |
| exécuter un paquet sans l'installer | `npx create-vite` | `pnpm dlx create-vite` |
| vulnérabilités connues | `npm audit` | `pnpm audit` |

## Exemple

Le paquet `is-odd` dépend de `is-number`. On l'installe dans deux projets, puis on essaie d'importer `is-number`,
qu'aucun des deux n'a déclaré :

```js
// test.mjs
import isNumber from 'is-number';
console.log('is-number importé :', isNumber(5));
```

```text
$ npm install is-odd@3.0.1
$ ls node_modules
is-number  is-odd
$ node test.mjs
is-number importé : true

$ pnpm add is-odd@3.0.1
$ ls node_modules
is-odd -> .pnpm/is-odd@3.0.1/node_modules/is-odd
$ node test.mjs
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'is-number' imported from …/test.mjs
```

Avec npm, le code utilise une dépendance fantôme sans le savoir : le jour où `is-odd` cessera de dépendre de
`is-number`, le projet cassera, sans qu'aucune ligne de son code ait changé. pnpm révèle l'erreur tout de suite : il
faut ajouter `is-number` au `package.json`.

## Comment ça fonctionne

**Le `node_modules` de pnpm.** pnpm place chaque paquet dans `node_modules/.pnpm/<nom>@<version>/node_modules/<nom>`,
à côté de ses propres dépendances, et ne crée à la racine du projet que des liens symboliques vers les dépendances
**déclarées**. La résolution de Node, qui remonte les dossiers, trouve donc exactement ce que chaque paquet a
déclaré, et rien d'autre. Les fichiers eux-mêmes viennent d'un **magasin** global, adressé par le contenu : un
fichier identique dans cent projets n'existe qu'une fois sur le disque, relié par des liens physiques. Les
installations sont rapides et économes.

**Cette rigueur a un prix.** Certains anciens paquets importent des dépendances qu'ils n'ont pas déclarées, et
cassent avec pnpm. On le corrige en ajoutant la dépendance manquante dans `packageExtensions`, ou en dernier recours
avec l'option `node-linker=hoisted`, qui reproduit l'arbre aplati de npm.

**Fixer le gestionnaire pour toute l'équipe.** Mélanger les outils produit deux fichiers de verrouillage
contradictoires. Le champ `packageManager` du `package.json` déclare l'outil et sa version exacte :
`"packageManager": "pnpm@10.15.0"`. pnpm le lit et, si une autre version est installée, télécharge et utilise la
version demandée ; Corepack, livré avec Node jusqu'à la version 24 et installable séparément depuis, fait de même
pour les différents gestionnaires. On ne commite qu'un
seul fichier de verrouillage.

**Plages écrites par défaut.** `npm install zod` écrit une plage `^` dans le `package.json`. Avec une version
explicite, `pnpm add is-odd@3.0.1` écrit la version exacte, `3.0.1`, alors que npm écrit encore `^3.0.1`. Les deux
comportements se configurent : certaines équipes préfèrent des versions exactes partout, et laissent un outil comme
Renovate proposer chaque mise à jour.

**Entretenir.** `outdated` liste, pour chaque dépendance, la version installée, la plus haute dans la plage (*wanted*)
et la dernière publiée (*latest*). `update` monte dans les plages ; une nouvelle majeure se fait paquet par paquet, en
lisant les notes de version, avec les tests comme filet. `audit` compare l'arbre installé à une base de vulnérabilités
connues : on corrige d'abord ce qui est réellement atteignable par l'application, en production. Quand une faille est
dans une dépendance indirecte dont le parent tarde à se mettre à jour, `overrides` (npm) ou `pnpm.overrides` force
une version corrigée pour tout l'arbre.

**Les scripts d'installation.** Un paquet peut déclarer un script `postinstall`, exécuté automatiquement à
l'installation, avec les droits de l'utilisateur. C'est utile pour télécharger un binaire, comme esbuild, et c'est
le vecteur classique des attaques contre la chaîne d'approvisionnement : un paquet compromis exécute son code sur
chaque poste qui l'installe. pnpm 10 ne les exécute plus par défaut ; il affiche « Ignored build scripts » et l'on
autorise explicitement les paquets de confiance, avec `pnpm approve-builds`, qui les inscrit dans
`onlyBuiltDependencies`. Avec npm, `--ignore-scripts` offre une protection comparable, au prix d'autoriser ensuite
manuellement ceux qui en ont besoin.

**Exécuter des commandes.** `npx` et `pnpm exec` lancent un binaire du projet ; `pnpm dlx`, et `npx` pour un paquet
absent, téléchargent un paquet pour une exécution ponctuelle, comme un générateur de projet. On vérifie le nom : une
faute de frappe peut télécharger un paquet malveillant au nom voisin, le *typosquatting*.

## Erreurs fréquentes

**Mélanger npm et pnpm dans un projet.** Deux verrous divergent ; déclare `packageManager` et supprime l'autre verrou.

**Corriger une erreur pnpm en passant à l'arbre aplati.** L'erreur signale presque toujours une dépendance non
déclarée : déclare-la.

**Lancer `update` sur tout le projet juste avant une mise en production.** Mets à jour régulièrement, par petits
lots, avec les tests.

**Ignorer `audit`, ou au contraire tout corriger avec `--force`.** `npm audit fix --force` peut installer des
majeures cassantes ; analyse ce qui est atteignable, puis corrige de façon ciblée.

**Autoriser tous les scripts d'installation par confort.** Chaque paquet autorisé exécute du code sur ta machine ;
n'approuve que ceux qui en ont besoin.

**Taper `npx` sans vérifier le nom du paquet.** Une faute de frappe peut exécuter un paquet malveillant.

## À retenir

- pnpm n'expose à la racine que les dépendances déclarées : les dépendances fantômes deviennent des erreurs.
- Un magasin global partagé par liens physiques rend pnpm rapide et économe en disque.
- `packageManager` fixe l'outil et sa version ; un seul fichier de verrouillage.
- `outdated`, `update`, `audit`, `overrides` : l'entretien est continu et ciblé.
- Les scripts `postinstall` exécutent du code à l'installation ; pnpm 10 les bloque par défaut.
- Intégration continue : `npm ci` ou `pnpm install --frozen-lockfile`.

## Exercices

1. Un projet migre de npm vers pnpm. Après `pnpm install`, le build échoue : `Cannot find package 'lodash' imported
   from src/utils/format.js`. Pourtant, avec npm, tout fonctionnait. Explique, puis décris la correction et les
   étapes complètes d'une migration propre.

   :::indice
   Qui a amené `lodash` dans le `node_modules` de npm ? Pense aussi au fichier de verrouillage et au champ
   `packageManager`.
   :::

   :::solution
   `lodash` n'est pas déclaré dans le `package.json` du projet : c'est une dépendance d'une autre dépendance, que npm
   avait placée à la racine de `node_modules`. Le code l'importait par accident. pnpm ne l'expose pas, d'où l'erreur.
   La correction est de la déclarer : `pnpm add lodash`, avec la version que le projet utilisait réellement.

   Migration propre :

   1. `pnpm import`, qui crée `pnpm-lock.yaml` à partir de `package-lock.json` et conserve les versions résolues ;
   2. supprimer `package-lock.json` et `node_modules`, puis `pnpm install` ;
   3. déclarer chaque dépendance fantôme révélée par les erreurs, en relançant build et tests ;
   4. ajouter `"packageManager": "pnpm@<version>"` au `package.json` ;
   5. remplacer `npm ci` par `pnpm install --frozen-lockfile` dans l'intégration continue, et `npm run` par `pnpm` dans
      les scripts et la documentation ;
   6. approuver, avec `pnpm approve-builds`, les seuls paquets dont les scripts d'installation sont nécessaires.
   :::

2. `npm audit` signale une vulnérabilité critique dans `minimist@1.2.5`, utilisé par `mkdirp@0.5.5`, lui-même utilisé
   par un outil de build en `devDependencies`. Le mainteneur de l'outil n'a pas publié de correctif. Que fais-tu ?
   Donne la configuration qui force une version corrigée, avec npm et avec pnpm.

   :::indice
   Qui exécute ce code, et avec quelles données ? Puis `overrides`.
   :::

   :::solution
   D'abord, évaluer le risque réel : c'est un outil de développement, qui ne part pas en production et ne traite pas
   de données venues d'utilisateurs. La faille est moins urgente qu'une faille dans une dépendance d'exécution, mais on
   la corrige, car l'outil tourne sur les postes et en intégration continue. On force une version corrigée de
   `minimist` dans tout l'arbre, puis on vérifie que le build et les tests passent :

   ```json
   {
     "overrides": {
       "minimist": "^1.2.8"
     }
   }
   ```

   ```json
   {
     "pnpm": {
       "overrides": {
         "minimist": "^1.2.8"
       }
     }
   }
   ```

   On note la raison dans la pull request, on signale le problème au mainteneur de l'outil, et on retire la version
   forcée quand il publie une version corrigée : une version forcée oubliée peut elle-même bloquer une mise à jour
   future.
   :::

3. Pendant `pnpm install`, un message indique : « Ignored build scripts: esbuild, sharp, ma-lib-utilitaire ». Pour
   chacun, dis s'il faut l'approuver, et comment le décider.

   :::indice
   À quoi sert le script d'installation de chacun ? Un utilitaire de manipulation de chaînes a-t-il besoin de
   compiler ou de télécharger quelque chose ?
   :::

   :::solution
   - `esbuild` : oui. Son script installe le binaire natif adapté au système ; sans lui, l'outil ne fonctionne pas.
     C'est un paquet très utilisé, au mainteneur connu.
   - `sharp` : oui, si le projet traite des images : il installe les bibliothèques natives de traitement d'image.
   - `ma-lib-utilitaire` : non, sans raison claire. Une bibliothèque de fonctions JavaScript n'a rien à compiler ni à
     télécharger. Un script d'installation inattendu est un signal d'alerte : on lit le script dans son
     `package.json`, on vérifie l'historique de publication, et on cherche une alternative si le doute persiste.

   Pour décider, on lit le champ `scripts` du paquet, dans `node_modules/.pnpm/<paquet>/node_modules/<paquet>/package.json`
   ou sur le registre : `preinstall`, `install`, `postinstall`. `pnpm approve-builds` enregistre ensuite les paquets
   approuvés dans `onlyBuiltDependencies`, que l'on relit en revue de code comme le reste.
   :::

## Questions d'entretien

- Pourquoi utiliser pnpm plutôt que npm ?

  :::indice
  Disque, vitesse, rigueur, monorepos, sécurité.
  :::

  :::reponse
  pnpm stocke chaque version de fichier une seule fois dans un magasin global, partagé entre projets par liens
  physiques : les installations sont plus rapides et prennent beaucoup moins de disque. Son `node_modules` n'expose
  que les dépendances déclarées, ce qui élimine les dépendances fantômes et rend les projets plus fiables. Il gère
  très bien les monorepos, avec des filtres pour cibler les paquets. Et depuis la version 10, il bloque par défaut les
  scripts d'installation des dépendances. En contrepartie, quelques anciens paquets mal déclarés demandent une
  configuration.
  :::

- Qu'est-ce qu'une dépendance fantôme ?

  :::indice
  Qui l'a installée, et qui l'importe ?
  :::

  :::reponse
  C'est un paquet que le code importe sans l'avoir déclaré dans son `package.json`, et qui fonctionne seulement parce
  qu'une autre dépendance l'a amené à la racine de `node_modules`, grâce à l'aplatissement de npm. Le projet dépend
  alors d'un détail d'implémentation d'un autre paquet : si celui-ci change de dépendances, ou si la version amenée
  change, le code casse sans avoir été modifié. pnpm les rend impossibles ; avec npm, un lint comme
  `import/no-extraneous-dependencies` les détecte.
  :::

- Comment gères-tu les vulnérabilités signalées par `npm audit` ?

  :::indice
  Toutes les alertes n'ont pas la même urgence.
  :::

  :::reponse
  Je trie par exposition réelle : une faille dans une dépendance d'exécution atteignable avec des données
  d'utilisateurs est urgente ; une faille dans un outil de développement qui ne traite pas de données externes l'est
  moins. Je corrige en mettant à jour la dépendance directe concernée ; si le correctif n'existe que pour une
  dépendance indirecte, je force la version avec `overrides`, en le documentant et en prévoyant de le retirer. J'évite
  `audit fix --force`, qui peut installer des majeures cassantes. Et je laisse un outil comme Renovate ou Dependabot
  proposer les mises à jour en continu, pour ne pas accumuler de retard.
  :::
