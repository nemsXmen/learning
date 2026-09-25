---
id: javascript-ci-cd-et-controles-automatiques
title: "CI/CD et contrôles de qualité automatiques"
slug: ci-cd-et-controles-automatiques
technology: javascript
level: intermediate
module: outillage-professionnel
order: 3
estimatedMinutes: 45
difficulty: 3
xp: 100
prerequisites:
  - javascript-build-vite-bundlers-et-source-maps
  - javascript-pull-requests-revue-et-workflows
skills:
  - js-ci-cd
tags:
  - javascript
  - outillage
  - ci
---

## Objectifs

- Expliquer l'intégration continue et le déploiement continu, et ce qu'ils changent pour une équipe.
- Écrire un workflow GitHub Actions qui installe, vérifie, teste et construit un projet JavaScript.
- Choisir les contrôles automatiques : où les exécuter, dans quel ordre, avec quel coût.
- Ajouter des vérifications rapides avant chaque commit, sans ralentir le travail.
- Déployer automatiquement, en sécurité : secrets, droits minimaux, environnements, retour arrière.

## Introduction

« Ça marche sur ma machine » est la phrase la plus coûteuse du développement. Chaque poste a sa version de Node, ses
fichiers non commités, ses variables d'environnement. L'**intégration continue**, ou CI, règle ce problème : à chaque
poussée, un serveur neutre récupère le code, installe exactement les dépendances verrouillées, et lance toutes les
vérifications. Si l'une échoue, tout le monde le sait, avant la fusion.

Le **déploiement continu**, ou CD, prolonge la chaîne : un code qui a passé toutes les vérifications est mis en
production automatiquement, ou sur simple approbation. Le déploiement devient un non-événement, plusieurs fois par jour,
au lieu d'une opération risquée et redoutée.

## Concept

| Niveau | Quand | Contrôles | Durée visée |
| --- | --- | --- | --- |
| éditeur | pendant la frappe | lint, types, formatage à l'enregistrement | instantané |
| crochet de commit | avant chaque commit | formatage et lint des fichiers modifiés | quelques secondes |
| intégration continue | à chaque poussée et pull request | installation propre, lint, types, tests, build, audit | quelques minutes |
| déploiement | après fusion dans `main` | build de production, migrations, déploiement, vérifications après mise en ligne | selon le projet |

| Élément d'un workflow GitHub Actions | Rôle |
| --- | --- |
| `on:` | les événements déclencheurs : `push`, `pull_request`, planification |
| `jobs:` | des tâches, parallèles par défaut, chacune sur une machine neuve |
| `steps:` | les étapes d'une tâche : actions réutilisables (`uses`) ou commandes (`run`) |
| `permissions:` | les droits du jeton de l'exécution, à réduire au minimum |
| `secrets.*` | les secrets du dépôt, injectés sans apparaître dans les journaux |
| `needs:`, `environment:` | l'ordre entre tâches, et les environnements protégés par une approbation |

## Exemple

Le workflow d'intégration continue du projet de ce cours, dans `.github/workflows/ci.yml` :

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm content:validate
      - run: pnpm test
      - run: pnpm build
```

Chaque poussée, sur n'importe quelle branche, et chaque pull request déclenchent la tâche `verify`. Une machine neuve
récupère le code, installe pnpm et Node 22, restaure le cache des paquets, installe exactement le fichier de
verrouillage, puis enchaîne les vérifications. La première qui échoue arrête tout, et la pull request affiche une croix
rouge. C'est le même enchaînement que le script `pnpm verify` qu'on lance en local.

Une version enrichie, avec les droits réduits, plusieurs versions de Node et un déploiement après fusion :

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [22, 24]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm test -- --coverage
      - run: pnpm build

  deploy:
    needs: verify
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm deploy:production
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

## Comment ça fonctionne

**Une machine neuve, un état reproductible.** Chaque exécution part d'une machine vierge. Il n'y a ni `node_modules`
oublié, ni fichier local, ni variable d'environnement personnelle : si les vérifications passent, c'est grâce à ce qui
est dans le dépôt. `--frozen-lockfile`, l'équivalent de `npm ci`, installe exactement le verrou, et échoue si le
`package.json` a changé sans lui. Le cache des paquets accélère l'installation sans changer son résultat.

**L'ordre des vérifications.** On place d'abord les vérifications rapides et fréquemment en échec, formatage, lint,
types, puis les tests, puis le build : un échec est signalé le plus tôt possible. Une tâche qui prend plus de quelques
minutes finit par être contournée ; on parallélise des tâches indépendantes, on met en cache, et on ne teste dans les
monorepos que les paquets modifiés et leurs dépendants.

**Une matrice de versions.** `strategy.matrix` lance la même tâche plusieurs fois, par exemple avec Node 22 et 24 :
utile pour une bibliothèque qui promet de fonctionner sur plusieurs versions, ou avant une montée de version. Une
application qui ne tourne qu'en Node 24 en production n'a besoin que de cette version, fixée comme dans son `.nvmrc`.

**Des contrôles au service des relecteurs.** Tout ce qu'un outil sait vérifier ne doit plus apparaître en revue de code :
formatage, lint, types, tests, build, couverture minimale si l'équipe y tient, audit des dépendances, détection de
secrets. Avec les vérifications obligatoires de la branche protégée, une pull request rouge ne peut pas être fusionnée.
Un test qui échoue au hasard, dit *flaky*, doit être corrigé ou isolé immédiatement : sinon l'équipe apprend à ignorer
le rouge, et l'intégration continue perd toute valeur.

**Avant le commit : rapide et local.** Des crochets Git, installés par des outils comme `simple-git-hooks` ou Husky,
lancent des vérifications avant chaque commit. Avec `lint-staged`, ils ne formatent et ne vérifient que les fichiers
modifiés : quelques secondes. On n'y met pas toute la suite de tests, trop lente : le crochet se contourne vite avec
`--no-verify`, et c'est l'intégration continue qui fait foi.

**Le déploiement continu.** La tâche `deploy` ne s'exécute qu'après le succès de `verify` (`needs`), et seulement sur
`main`. L'environnement `production` peut exiger une approbation manuelle et restreindre ses secrets à cette tâche. Un
bon déploiement est réversible : on garde les versions précédentes pour revenir en arrière en une commande, on applique
les migrations de base compatibles avec l'ancienne et la nouvelle version, et on vérifie l'application juste après la
mise en ligne. Beaucoup d'équipes déploient aussi chaque pull request dans un environnement de prévisualisation, avec
sa propre URL, pour la relire en conditions réelles.

**Sécuriser la chaîne.** Le pipeline a accès au code et aux secrets de déploiement : c'est une cible. On donne au jeton
les droits minimaux avec `permissions`, on n'expose les secrets qu'aux tâches qui en ont besoin, et jamais aux pull
requests venues de dépôts externes. On fixe la version des actions tierces, idéalement par leur identifiant de commit
plutôt que par une étiquette déplaçable, et on se méfie des commandes qui insèrent directement un titre de pull request
ou un nom de branche dans un script shell : c'est une injection de commande.

## Erreurs fréquentes

**Installer avec `npm install` ou `pnpm install` sans verrou figé.** L'intégration continue teste d'autres versions que
celles du dépôt.

**Un pipeline de vingt minutes.** L'équipe l'attend, puis le contourne ; parallélise, mets en cache, filtre.

**Ignorer un test instable.** Le rouge devient normal ; corrige-le ou isole-le tout de suite.

**Mettre toute la suite de tests dans un crochet de commit.** Il sera contourné ; garde-le à quelques secondes.

**Déployer sans vérifications préalables ni retour arrière.** Chaque déploiement devient un pari.

**Donner au jeton du workflow tous les droits.** Réduis `permissions` au minimum.

**Afficher un secret dans une commande.** Passe-le par une variable d'environnement de l'étape, jamais en argument.

## À retenir

- L'intégration continue vérifie chaque changement sur une machine neuve, à partir du dépôt seul.
- Ordre : installation figée, formatage, lint, types, tests, build ; les plus rapides d'abord.
- Les vérifications obligatoires protègent `main` ; les tests instables se corrigent immédiatement.
- Crochets de commit rapides, limités aux fichiers modifiés ; l'intégration continue fait foi.
- Déploiement continu : après les vérifications, sur `main`, dans un environnement protégé, réversible.
- Droits minimaux, secrets ciblés, actions tierces épinglées : le pipeline est une cible.

## Exercices

1. Ce workflow fonctionne, mais contient quatre problèmes. Trouve-les et corrige-les.

   ```yaml
   name: CI
   on: [push]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22 }
         - run: npm install
         - run: npm run build
         - run: npm test
         - run: npm run lint
         - run: echo "Déploiement avec ${{ secrets.DEPLOY_TOKEN }}" && ./deploy.sh ${{ secrets.DEPLOY_TOKEN }}
   ```

   :::indice
   Installation, ordre des étapes, pull requests, et ce qui est déployé depuis n'importe quelle branche.
   :::

   :::solution
   - `npm install` peut modifier le verrou : `npm ci`.
   - L'ordre met le build, le plus lent, avant le lint, le plus rapide : lint d'abord.
   - `on: [push]` ne déclenche rien pour les pull requests venant de dépôts externes, et le déploiement part de
     **n'importe quelle** branche poussée, sans condition.
   - Le secret est passé en argument de commande : il peut apparaître dans les journaux ou la liste des processus.

   ```yaml
   name: CI
   on:
     push:
       branches: [main]
     pull_request:
   permissions:
     contents: read
   jobs:
     verify:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 22, cache: npm }
         - run: npm ci
         - run: npm run lint
         - run: npm test
         - run: npm run build
     deploy:
       needs: verify
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       environment: production
       steps:
         - uses: actions/checkout@v4
         - run: ./deploy.sh
           env:
             DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
   ```

   Le script lit le jeton dans son environnement. La tâche de déploiement n'existe que sur `main`, après les
   vérifications, dans un environnement protégé.
   :::

2. Configure des crochets de commit pour un projet npm : avant chaque commit, Prettier et ESLint doivent s'exécuter
   uniquement sur les fichiers indexés, en corrigeant ce qui peut l'être. Donne les dépendances, la configuration et
   l'explication de ce qui se passe au commit.

   :::indice
   `simple-git-hooks` installe le crochet, `lint-staged` restreint aux fichiers indexés.
   :::

   :::solution
   ```json
   {
     "scripts": {
       "prepare": "simple-git-hooks"
     },
     "devDependencies": {
       "lint-staged": "^17.5.0",
       "simple-git-hooks": "^2.14.0"
     },
     "simple-git-hooks": {
       "pre-commit": "npx lint-staged"
     },
     "lint-staged": {
       "*.{js,mjs}": ["prettier --write", "eslint --fix"],
       "*.{json,md,yml}": ["prettier --write"]
     }
   }
   ```

   Au `npm install`, le script `prepare` installe le crochet dans `.git/hooks`. À chaque `git commit`, `lint-staged` ne
   passe aux outils que les fichiers indexés, les formate et les corrige, puis les réindexe. Si ESLint trouve une erreur
   qu'il ne sait pas corriger, le commit est refusé avec le message. L'ensemble prend quelques secondes ; la suite de
   tests complète reste dans l'intégration continue, qui fait foi même si quelqu'un contourne le crochet.
   :::

3. Une équipe veut passer d'un déploiement manuel mensuel, stressant, à un déploiement continu. Propose les étapes de la
   transition, dans l'ordre.

   :::indice
   On ne déploie automatiquement que ce qu'on sait vérifier, et on ne déploie souvent que ce qu'on sait annuler.
   :::

   :::solution
   1. Rendre l'intégration continue fiable et rapide : installation figée, lint, types, tests, build, sur chaque pull
      request, avec des vérifications obligatoires sur `main`, et aucun test instable.
   2. Automatiser le déploiement actuel tel quel, en un script, déclenché à la main depuis le pipeline : il devient
      reproductible et documenté.
   3. Rendre le retour arrière trivial : versions précédentes conservées, migrations compatibles dans les deux sens,
      procédure testée.
   4. Ajouter la surveillance après mise en ligne : erreurs, temps de réponse, vérifications de santé, alertes.
   5. Déployer automatiquement dans un environnement de préproduction à chaque fusion, puis en production sur
      approbation, de plus en plus souvent.
   6. Découper le travail en petites pull requests, avec des *feature flags* pour ce qui n'est pas prêt, et enfin
      supprimer l'approbation manuelle quand la confiance est là.

   Déployer souvent réduit le risque de chaque déploiement : peu de changements à la fois, faciles à diagnostiquer et à
   annuler.
   :::

## Questions d'entretien

- Qu'est-ce que l'intégration continue, et que mets-tu dans un pipeline ?

  :::indice
  Machine neuve, dépôt seul, vérifications ordonnées.
  :::

  :::reponse
  C'est la vérification automatique de chaque changement poussé, sur une machine neuve, à partir du seul contenu du dépôt.
  Mon pipeline installe exactement le fichier de verrouillage, puis enchaîne les vérifications des plus rapides aux plus
  lentes : formatage, lint, types, tests, build, et selon les projets l'audit des dépendances et la détection de secrets.
  Il tourne sur chaque pull request, ses vérifications sont obligatoires pour fusionner dans `main`, et il reste rapide,
  quelques minutes, grâce au cache, à la parallélisation et au filtrage des paquets concernés.
  :::

- Intégration continue, livraison continue, déploiement continu : quelle différence ?

  :::indice
  Jusqu'où va l'automatisation ?
  :::

  :::reponse
  L'intégration continue vérifie automatiquement chaque changement et l'intègre fréquemment dans la branche principale. La
  livraison continue garantit que cette branche est toujours déployable, avec un déploiement automatisé déclenché par une
  décision humaine. Le déploiement continu supprime cette décision : tout changement qui passe les vérifications part en
  production. Chaque étape suppose la précédente, et le déploiement continu suppose en plus une surveillance et un retour
  arrière fiables.
  :::

- Comment sécurises-tu un pipeline de CI/CD ?

  :::indice
  Droits, secrets, dépendances du pipeline, entrées non fiables.
  :::

  :::reponse
  En réduisant les droits du jeton de l'exécution avec `permissions`, en n'exposant les secrets qu'aux tâches qui en ont
  besoin, via des environnements protégés, et jamais aux pull requests de dépôts externes. En épinglant les actions tierces
  par leur identifiant de commit. En ne passant jamais un secret en argument de commande. En traitant comme non fiables les
  titres de pull request et noms de branche insérés dans des scripts. Et en protégeant la branche principale et les
  environnements de production par des approbations.
  :::
