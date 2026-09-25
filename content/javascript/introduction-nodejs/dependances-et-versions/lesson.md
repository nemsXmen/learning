---
id: javascript-dependances-et-versions
title: "Dépendances, versions sémantiques et fichier de verrouillage"
slug: dependances-et-versions
technology: javascript
level: intermediate
module: introduction-nodejs
order: 3
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-npm-et-package-json
skills:
  - js-dependencies-semver
tags:
  - javascript
  - nodejs
  - npm
---

## Objectifs

- Classer une dépendance : `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`.
- Lire une version sémantique et une plage de versions : `^`, `~`, version exacte.
- Comprendre comment Node trouve un paquet dans `node_modules`, et pourquoi un paquet peut y figurer en plusieurs
  versions.
- Savoir à quoi sert `package-lock.json`, pourquoi on le commite, et quand utiliser `npm ci`.

## Introduction

Un projet moderne repose sur des dizaines de paquets, qui dépendent eux-mêmes de centaines d'autres. Deux questions
se posent alors. Quelle version de chaque paquet utiliser, pour profiter des corrections sans subir de changement
cassant ? Et comment s'assurer que le poste d'un collègue, l'intégration continue et le serveur de production
installent **exactement** les mêmes versions ?

La première question a une convention, le *semantic versioning*. La seconde a un fichier, `package-lock.json`. Entre
les deux, un dossier souvent mal compris : `node_modules`.

## Concept

| Section | Contenu | Installée… |
| --- | --- | --- |
| `dependencies` | ce dont le code a besoin pour s'exécuter : framework, client HTTP, validation | partout, y compris en production |
| `devDependencies` | les outils de développement : tests, lint, build, types | en développement et en intégration continue ; pas avec `npm install --omit=dev` |
| `peerDependencies` | une dépendance que le paquet utilise mais que **l'application** doit fournir, comme `react` pour un composant React | par l'application |
| `optionalDependencies` | une dépendance dont l'échec d'installation ne doit pas bloquer | si possible |

**Version sémantique** : `MAJEURE.MINEURE.CORRECTIF`, par exemple `2.7.1`.

| On incrémente… | quand… | exemple |
| --- | --- | --- |
| le correctif | on corrige un bug sans changer l'API | `2.7.1` → `2.7.2` |
| la mineure | on ajoute une fonctionnalité compatible | `2.7.2` → `2.8.0` |
| la majeure | on casse la compatibilité | `2.8.0` → `3.0.0` |

| Plage | Accepte | N'accepte pas |
| --- | --- | --- |
| `^1.4.2` | `1.4.2` à `1.x.x` : mineures et correctifs | `2.0.0` |
| `~1.4.2` | `1.4.2` à `1.4.x` : correctifs seulement | `1.5.0` |
| `1.4.2` | exactement `1.4.2` | tout le reste |
| `^0.4.2` | `0.4.2` à `0.4.x` : avant 1.0, une mineure peut casser | `0.5.0` |
| `>=1.2.0 <2.0.0` | l'intervalle indiqué | `2.0.0` |

## Exemple

On ajoute deux dépendances à un projet :

```text
$ npm install zod
$ npm install --save-dev vitest
```

npm télécharge les paquets et leurs dépendances dans `node_modules`, et met à jour deux fichiers. Le
`package.json` reçoit des **plages** :

```json
{
  "dependencies": {
    "zod": "^4.1.5"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

Et `package-lock.json` reçoit l'arbre complet, avec la version **exacte** installée de chaque paquet, y compris les
dépendances indirectes, son adresse et son empreinte :

```json
{
  "name": "suivi-depenses",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/zod": {
      "version": "4.1.5",
      "resolved": "https://registry.npmjs.org/zod/-/zod-4.1.5.tgz",
      "integrity": "sha512-…"
    }
  }
}
```

Six mois plus tard, zod publie `4.3.0`. `^4.1.5` l'accepte. Pourtant, un collègue qui clone le projet et lance
`npm ci` installe toujours `4.1.5`, la version écrite dans le fichier de verrouillage. Le projet ne passera à `4.3.0`
que quand quelqu'un le décidera, avec `npm update zod`, et le fichier de verrouillage mis à jour sera relu comme tout
autre changement.

## Comment ça fonctionne

**Une promesse, pas une garantie.** Le *semantic versioning* est une convention : l'auteur promet de n'introduire de
changement cassant qu'avec une version majeure. La plupart des paquets la respectent, mais une mineure peut casser
un usage que l'auteur ne connaissait pas, et une dépendance indirecte peut changer de comportement. C'est pourquoi la
plage du `package.json` dit ce qu'on **accepte**, et le fichier de verrouillage ce qu'on **utilise**.

**`^` et `~`.** `npm install` écrit par défaut une plage `^` : on accepte les nouvelles fonctionnalités et les
correctifs, jamais une nouvelle majeure. Avant `1.0.0`, la convention change : l'API est considérée comme instable,
et `^0.4.2` n'accepte que les correctifs de `0.4`. Les préversions, comme `2.1.0-beta.1`, ne sont jamais choisies
par une plage ordinaire : il faut les demander explicitement. Et on ne compare jamais des versions comme des
chaînes : `'1.10.0' < '1.9.0'` est vrai, alors que 1.10 est plus récent ; le module `semver` sait les comparer.

**Comment Node trouve un paquet.** Pour `import 'zod'`, Node cherche un dossier `node_modules/zod` à côté du fichier,
puis dans le dossier parent, puis dans le parent du parent, jusqu'à la racine du disque. Il lit ensuite le champ
`exports`, ou `main`, du `package.json` de ce paquet pour savoir quel fichier charger.

**L'arbre de `node_modules`.** npm aplatit l'arbre des dépendances autant qu'il le peut : une dépendance indirecte
est installée à la racine de `node_modules`, où tous les paquets la trouvent. C'est le *hoisting*. Mais si deux
paquets exigent des majeures incompatibles, par exemple `debug@^2` et `debug@^4`, une seule peut être à la racine ;
l'autre est installée dans le `node_modules` du paquet qui en a besoin, qui la trouve en premier grâce à la
recherche du plus proche. Plusieurs versions d'un même paquet peuvent donc coexister. `npm ls debug` montre qui
utilise quelle version, et `npm dedupe` regroupe ce qui peut l'être.

Un effet de bord de l'aplatissement : le code peut importer un paquet qu'il n'a jamais déclaré, parce qu'une autre
dépendance l'a amené à la racine. Cette **dépendance fantôme** disparaîtra le jour où l'autre paquet cessera de
l'utiliser. On déclare toujours ce qu'on importe ; le chapitre sur pnpm montre un gestionnaire qui l'interdit.

**Le fichier de verrouillage.** `package-lock.json` fige l'arbre entier : versions exactes, adresses et empreintes
`integrity`, qui garantissent que le contenu téléchargé est bien celui qui a été verrouillé. On le **commite** :
c'est lui qui rend les installations reproductibles. `npm install` le respecte, mais peut le modifier si le
`package.json` a changé. `npm ci`, pour *clean install*, supprime `node_modules`, installe exactement l'arbre verrouillé
et échoue si le `package.json` et le verrou ne concordent pas : c'est la commande de l'intégration continue et du
déploiement.

**`node_modules` ne se commite pas.** Il se reconstruit à partir du verrou, il contient des binaires propres au
système, et il pèse souvent des centaines de mégaoctets. Il va dans `.gitignore`.

**Mettre à jour.** `npm outdated` liste les versions disponibles ; `npm update` monte dans les plages autorisées ;
changer de majeure est une décision explicite : `npm install zod@5`, en lisant le guide de migration. Des outils
comme Renovate ou Dependabot ouvrent ces mises à jour sous forme de pull requests, que l'intégration continue
vérifie.

## Erreurs fréquentes

**Mettre un outil de test ou de build dans `dependencies`.** Il sera installé en production pour rien ; il va en
`devDependencies`.

**Ne pas commiter `package-lock.json`.** Chaque installation peut produire un arbre différent, et « ça marche sur ma
machine » revient.

**Commiter `node_modules`.** Il se reconstruit à partir du verrou et contient des binaires propres à chaque système.

**Utiliser `npm install` en intégration continue.** Il peut réécrire le verrou ; `npm ci` installe exactement ce qui
est verrouillé, ou échoue.

**Importer une dépendance fantôme.** Déclare dans `package.json` tout paquet que ton code importe.

**Croire que `^0.4.2` accepte `0.5.0`.** Avant 1.0, `^` ne monte que les correctifs.

**Comparer des versions comme des chaînes.** Utilise `semver`.

## À retenir

- `dependencies` pour l'exécution, `devDependencies` pour les outils, `peerDependencies` fournies par l'application.
- `MAJEURE.MINEURE.CORRECTIF` : la majeure signale un changement cassant.
- `^` accepte mineures et correctifs, `~` les correctifs ; avant 1.0, `^` se comporte comme `~`.
- Node cherche `node_modules/<paquet>` en remontant les dossiers ; plusieurs versions peuvent coexister.
- `package-lock.json` fige l'arbre exact : on le commite ; `npm ci` l'installe à l'identique.
- `node_modules` va dans `.gitignore` ; les montées de majeure sont des décisions explicites.

## Exercices

1. Pour chaque plage, indique la version que choisira une installation sans fichier de verrouillage, parmi les
   versions publiées `1.4.2`, `1.4.7`, `1.5.0`, `1.9.3`, `2.0.0` et `2.1.0-beta.1`.
   - a) `^1.4.2`
   - b) `~1.4.2`
   - c) `1.4.2`
   - d) `>=1.5.0`
   - e) `^2.0.0`

   :::indice
   npm choisit la plus haute version qui satisfait la plage. Les préversions ne sont choisies que si la plage les
   demande.
   :::

   :::solution
   - a) `1.9.3` : la plus haute des `1.x.x`.
   - b) `1.4.7` : la plus haute des `1.4.x`.
   - c) `1.4.2` : exactement.
   - d) `2.0.0` : aucune borne supérieure. C'est pourquoi on évite les plages ouvertes, qui acceptent la prochaine
     majeure et ses changements cassants.
   - e) `2.0.0` : `2.1.0-beta.1` est une préversion, ignorée par une plage ordinaire.

   ```js
   // Vérification avec le module semver : npm install semver
   import semver from 'semver';

   const publiees = ['1.4.2', '1.4.7', '1.5.0', '1.9.3', '2.0.0', '2.1.0-beta.1'];
   for (const plage of ['^1.4.2', '~1.4.2', '1.4.2', '>=1.5.0', '^2.0.0']) {
     console.log(plage, semver.maxSatisfying(publiees, plage));
   }
   // ^1.4.2 1.9.3
   // ~1.4.2 1.4.7
   // 1.4.2 1.4.2
   // >=1.5.0 2.0.0
   // ^2.0.0 2.0.0
   ```
   :::

2. Classe ces paquets dans la bonne section du `package.json` d'une API Node qui valide ses entrées avec zod, envoie
   des e-mails avec nodemailer, est testée avec Vitest, vérifiée avec ESLint et TypeScript, et dont les types Node
   viennent de `@types/node`. Puis classe-les pour une bibliothèque de composants React qui utilise React et est
   testée avec Testing Library.

   :::indice
   Qu'est-ce qui doit être présent quand l'API tourne en production ? Et pour une bibliothèque React, qui fournit
   React ?
   :::

   :::solution
   Pour l'API :

   ```json
   {
     "dependencies": {
       "nodemailer": "^7.0.6",
       "zod": "^4.1.5"
     },
     "devDependencies": {
       "@types/node": "^22.18.0",
       "eslint": "^9.36.0",
       "typescript": "^5.9.2",
       "vitest": "^3.2.4"
     }
   }
   ```

   Pour la bibliothèque React :

   ```json
   {
     "peerDependencies": {
       "react": "^18.0.0 || ^19.0.0"
     },
     "devDependencies": {
       "@testing-library/react": "^16.3.0",
       "react": "^19.1.1",
       "vitest": "^3.2.4"
     }
   }
   ```

   React est une dépendance pair : c'est l'application qui le fournit, et il ne doit exister qu'une seule copie de
   React dans la page. La plage accepte les deux majeures supportées. La bibliothèque installe aussi React en
   `devDependencies`, pour ses propres tests.
   :::

3. Ton collègue affirme : « Inutile de commiter `package-lock.json`, les versions sont déjà dans `package.json`. »
   Réponds-lui avec un scénario concret où l'absence du fichier casse la production, alors que les tests passaient
   sur son poste.

   :::indice
   Que contient `package.json` : une version ou une plage ? Et que se passe-t-il pour les dépendances indirectes ?
   :::

   :::solution
   `package.json` contient des plages, et ne dit rien des dépendances indirectes. Scénario : le collègue installe le
   projet lundi, avec `date-lib@^3.2.0` résolu en `3.2.0`, et une dépendance indirecte `parser@1.8.0`. Mercredi,
   `parser` publie `1.9.0`, une mineure qui change par erreur le format d'une date. Jeudi, le serveur de production
   installe le projet de zéro : même `package.json`, mais un arbre différent, avec `parser@1.9.0`. Les tests
   passaient sur le poste du collègue, qui avait `1.8.0` ; la production casse avec `1.9.0`, et personne n'a changé
   une ligne de code.

   Avec le fichier de verrouillage commité et `npm ci` en intégration continue et en production, tous les
   environnements installent exactement `parser@1.8.0`. Le passage à `1.9.0` arrive dans une pull request qui modifie
   le verrou, et les tests l'attrapent avant la production.
   :::

## Questions d'entretien

- Quelle différence entre `^1.4.2` et `~1.4.2` ?

  :::indice
  Quelle partie de la version chacune laisse-t-elle monter ?
  :::

  :::reponse
  `^1.4.2` accepte toute version compatible d'après le *semantic versioning* : de `1.4.2` jusqu'à `2.0.0` exclu, donc
  les nouvelles mineures et les correctifs. `~1.4.2` n'accepte que les correctifs : de `1.4.2` à `1.5.0` exclu.
  Attention au cas avant 1.0 : `^0.4.2` n'accepte que `0.4.x`, car une mineure peut y casser l'API. Dans tous les cas,
  le fichier de verrouillage fixe la version réellement installée.
  :::

- À quoi sert `package-lock.json`, et quelle différence entre `npm install` et `npm ci` ?

  :::indice
  Plage contre version exacte ; reproductibilité.
  :::

  :::reponse
  Il fige l'arbre complet des dépendances, y compris indirectes : version exacte, adresse et empreinte de chaque
  paquet. Il rend les installations reproductibles sur tous les postes et tous les environnements, et on le commite.
  `npm install` installe en respectant le verrou mais peut le mettre à jour, par exemple si le `package.json` a
  changé. `npm ci` supprime `node_modules`, installe exactement ce qui est verrouillé, et échoue si le verrou et le
  `package.json` ne concordent pas : c'est la commande pour l'intégration continue et le déploiement.
  :::

- Qu'est-ce qu'une `peerDependency`, et quand en déclarer une ?

  :::indice
  Pense à une bibliothèque de composants React.
  :::

  :::reponse
  C'est une dépendance que le paquet utilise mais qu'il ne fournit pas : il attend que l'application qui l'installe
  la fournisse, dans une version compatible avec la plage déclarée. On l'utilise pour les plugins et les
  bibliothèques qui doivent partager une instance unique avec l'application : React pour une bibliothèque de
  composants, ESLint pour un plugin ESLint. Si chaque bibliothèque embarquait sa propre copie de React, la page en
  contiendrait plusieurs, ce qui casse les hooks et alourdit le bundle.
  :::
