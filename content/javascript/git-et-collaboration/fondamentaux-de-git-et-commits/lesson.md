---
id: javascript-fondamentaux-de-git-et-commits
title: "Les fondamentaux de Git, et des commits qui racontent une histoire"
slug: fondamentaux-de-git-et-commits
technology: javascript
level: intermediate
module: git-et-collaboration
order: 1
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-npm-et-package-json
skills:
  - js-git-basics
tags:
  - javascript
  - git
  - collaboration
---

## Objectifs

- Comprendre le modèle de Git : répertoire de travail, index, dépôt, commits et références.
- Enregistrer des changements avec `status`, `diff`, `add` et `commit`, et savoir ce que contient chaque zone.
- Écrire des commits atomiques et des messages utiles, au format Conventional Commits.
- Exclure les bons fichiers avec `.gitignore`, et corriger un commit qui n'est pas encore partagé.
- Retrouver l'histoire d'une ligne avec `log`, `show` et `blame`.

## Introduction

Git est l'outil que tout développeur utilise chaque jour, et souvent sans le comprendre vraiment : on mémorise quelques
commandes, jusqu'au jour où l'une d'elles produit un résultat inattendu. Pourtant, son modèle est simple. Une fois
compris, les commandes cessent d'être des formules magiques.

Git est aussi un outil de **communication**. L'historique d'un projet est lu bien plus souvent qu'il n'est écrit : pour
comprendre pourquoi une ligne existe, pour trouver quand un bug est apparu, pour rédiger les notes de version. Un
historique fait de commits intitulés « fix » ou « wip » ne dit rien ; un historique soigné est une documentation.

## Concept

| Zone | Contient | Commandes |
| --- | --- | --- |
| répertoire de travail | les fichiers tels qu'ils sont sur le disque | éditer, `git restore <fichier>` pour annuler |
| index, ou zone de préparation | le prochain commit, en cours de composition | `git add`, `git add -p`, `git restore --staged` |
| dépôt | l'historique des commits, dans `.git` | `git commit`, `git log`, `git show` |

| Objet | Ce que c'est |
| --- | --- |
| commit | un instantané complet du projet, avec un auteur, une date, un message et un ou plusieurs parents |
| identifiant | une empreinte du contenu, comme `8f46847…` : modifier quoi que ce soit donne un autre commit |
| branche | une étiquette mobile qui pointe vers un commit |
| `HEAD` | la référence vers la branche, ou le commit, sur lequel on travaille |

| Type Conventional Commits | Pour |
| --- | --- |
| `feat` | une nouvelle fonctionnalité, donne une version mineure |
| `fix` | une correction de bug, donne un correctif |
| `refactor`, `perf` | une restructuration sans changement de comportement, une optimisation |
| `test`, `docs`, `build`, `ci`, `chore` | tests, documentation, build, intégration continue, entretien |
| `!` ou `BREAKING CHANGE:` | un changement cassant, donne une version majeure |

## Exemple

Un nouveau projet, dont on enregistre les deux premières étapes :

```text
$ git init -b main
$ printf 'node_modules/\n.env\n' > .gitignore
$ git status --short
?? .gitignore
?? prix.js                         ← .env n'apparaît pas : il est ignoré

$ git add .gitignore prix.js
$ git status --short
A  .gitignore
A  prix.js                         ← dans l'index, prêts à être commités

$ git commit -m "feat(prix): calculer un prix TTC"

# … on modifie prix.js …
$ git diff --stat
 prix.js | 2 +-
$ git add prix.js
$ git diff --staged
-export const prixTTC = (ht) => ht * 1.2;
+export const prixTTC = (ht, taux = 0.2) => Math.round(ht * (1 + taux) * 100) / 100;
$ git commit -m "fix(prix): arrondir au centime et accepter un taux"

$ git log --oneline
8f46847 fix(prix): arrondir au centime et accepter un taux
a71d410 feat(prix): calculer un prix TTC

$ git cat-file -p HEAD
tree 64849a5f20c63ef43390da54ef3c526e2dbb0dc2
parent a71d4103057879dc05a54a8ed6d39d13088f8aca
author Ana <ana@exemple.fr> 1790329768 +0300
```

La dernière commande montre ce qu'est vraiment un commit : un arbre, l'instantané des fichiers, un parent, le commit
précédent, un auteur, une date, et le message. C'est tout. L'historique est une chaîne de commits reliés à leurs
parents.

## Comment ça fonctionne

**Des instantanés, pas des différences.** Chaque commit enregistre l'état **complet** du projet. Git économise l'espace
en ne stockant qu'une fois les fichiers identiques, mais conceptuellement, revenir à un commit, c'est retrouver le
projet exactement tel qu'il était. Les différences que montrent `git diff` et `git show` sont calculées à la demande,
en comparant deux instantanés.

**L'index, pour composer ses commits.** On ne commite pas « tout ce qui a changé » : on choisit. `git add fichier` place
un fichier dans l'index ; `git add -p` propose chaque bloc de modification un par un, pour n'en garder qu'une partie.
On peut ainsi avoir corrigé un bug et renommé une variable dans le même fichier, et en faire deux commits distincts.
`git diff` montre ce qui n'est pas encore dans l'index, `git diff --staged` ce qui partira dans le prochain commit :
on relit toujours ce second diff avant de commiter.

**Des identifiants d'empreinte.** L'identifiant d'un commit est calculé à partir de son contenu, y compris l'identifiant
de son parent. Modifier un ancien commit change donc son identifiant, et celui de tous ses descendants : c'est une
nouvelle histoire. D'où une règle essentielle : on peut réécrire ses commits **tant qu'ils ne sont pas partagés**, par
exemple avec `git commit --amend` pour corriger le dernier ; une fois poussés et utilisés par d'autres, on ajoute un
nouveau commit.

**Des commits atomiques.** Un bon commit fait **une** chose, complète, et laisse le projet dans un état qui fonctionne :
les tests passent. Il est ainsi facile à relire, à annuler avec `git revert`, et à identifier comme coupable d'une
régression, comme on le verra avec `git bisect`. « Corrige le calcul de TVA et reformate tout le dossier » mélange
deux intentions : deux commits.

**Des messages utiles.** Le sujet, court, à l'impératif ou au présent, dit **quoi** ; le corps, après une ligne vide, dit
**pourquoi**, ce que le diff ne montre pas. Le format Conventional Commits ajoute un type et une portée :
`fix(prix): arrondir au centime`. Il rend l'historique lisible d'un coup d'œil, et des outils en déduisent le prochain
numéro de version et le journal des modifications. Le projet de ce cours l'utilise, comme beaucoup de projets
JavaScript.

**Ce qu'on ne commite pas.** `.gitignore` liste ce que Git doit ignorer : `node_modules`, reconstruit depuis le fichier de
verrouillage ; les dossiers de build ; les fichiers de l'éditeur ; et surtout `.env` et tout fichier de secrets. Un
fichier déjà suivi n'est pas concerné par `.gitignore` : il faut d'abord le retirer de l'index avec
`git rm --cached`. Et un secret commité doit être révoqué, comme on l'a vu dans la partie sur la sécurité.

**Remonter l'histoire.** `git log --oneline` survole l'historique ; `git log -p fichier` montre chaque modification d'un
fichier ; `git show <commit>` détaille un commit ; `git blame fichier` indique, ligne par ligne, le dernier commit qui
l'a modifiée. Associés à de bons messages, ils répondent à la question la plus fréquente face à un code étrange :
« pourquoi est-ce écrit ainsi ? ».

## Erreurs fréquentes

**`git add .` sans relire.** Des fichiers inattendus partent : un `.env`, un fichier de débogage ; relis
`git status` et `git diff --staged`.

**Des commits fourre-tout.** Plusieurs intentions dans un commit le rendent impossible à relire ou à annuler proprement.

**Des messages vides de sens.** « fix », « update », « wip » : dis quoi et pourquoi.

**Modifier un commit déjà partagé.** `--amend` ou un rebase sur des commits poussés réécrit l'histoire des autres.

**Commiter `node_modules` ou le dossier de build.** Ils se reconstruisent ; ignore-les.

**Croire que `.gitignore` retire un fichier déjà suivi.** Utilise `git rm --cached`, et révoque tout secret déjà
commité.

## À retenir

- Trois zones : répertoire de travail, index, dépôt ; `git add` compose, `git commit` enregistre.
- Un commit est un instantané complet, avec parents, auteur et message ; son identifiant dépend de son contenu.
- On réécrit seulement ce qui n'est pas partagé ; sinon, un nouveau commit.
- Des commits atomiques, qui laissent le projet fonctionnel ; `git add -p` pour les composer.
- Messages : quoi dans le sujet, pourquoi dans le corps ; Conventional Commits pour les types.
- `.gitignore` pour les dépendances, builds et secrets ; `log`, `show`, `blame` pour comprendre l'histoire.

## Exercices

1. Pour chaque situation, écris la commande à utiliser.
   - a) Voir ce qui partira dans le prochain commit.
   - b) Retirer de l'index un fichier ajouté par erreur, sans perdre ses modifications.
   - c) Annuler les modifications non commitées d'un fichier.
   - d) Ajouter à l'index seulement une partie des modifications d'un fichier.
   - e) Corriger le message du dernier commit, pas encore poussé.
   - f) Arrêter de suivre un fichier `config.local.json` déjà commité, tout en le gardant sur le disque.

   :::indice
   Pense aux trois zones : de quelle zone vers quelle zone chaque action déplace-t-elle les changements ?
   :::

   :::solution
   - a) `git diff --staged` : les différences entre le dernier commit et l'index.
   - b) `git restore --staged fichier` : le fichier sort de l'index, les modifications restent dans le répertoire de
     travail.
   - c) `git restore fichier` : le fichier reprend son contenu de l'index ; les modifications sont perdues.
   - d) `git add -p fichier` : Git propose chaque bloc, on répond `y` ou `n`.
   - e) `git commit --amend -m "nouveau message"`.
   - f) `git rm --cached config.local.json`, puis l'ajouter à `.gitignore` et commiter les deux.
   :::

2. Voici le diff d'une journée de travail. Propose un découpage en commits atomiques, avec leurs messages au format
   Conventional Commits.
   - Correction d'un bug : les remises négatives étaient acceptées dans `panier.js`.
   - Ajout d'un test de régression pour ce bug dans `panier.test.js`.
   - Renommage de `calc` en `calculerTotal` dans `panier.js` et ses trois appelants.
   - Nouvelle fonctionnalité : code promotionnel « livraison offerte », dans `promotions.js`, avec ses tests.
   - Mise à jour de la version de Vitest dans `package.json` et le fichier de verrouillage.

   :::indice
   Chaque commit doit avoir une seule intention et laisser les tests verts. Le test de régression va avec sa correction.
   :::

   :::solution
   ```text
   refactor(panier): renommer calc en calculerTotal
   fix(panier): refuser les remises négatives
   feat(promotions): code promotionnel « livraison offerte »
   build(deps): mettre à jour vitest
   ```

   Le renommage passe d'abord, seul : un pur refactoring, facile à relire, qui ne change aucun test. La correction
   arrive avec son test de régression dans le même commit : le test prouve la correction, et le projet reste vert. La
   fonctionnalité et ses tests forment un troisième commit. La mise à jour de dépendance est isolée : si elle casse
   quelque chose, on l'annule sans toucher au reste. Le corps du commit `fix` explique la cause, par exemple
   « la validation ne vérifiait que le maximum ».
   :::

3. Dans un dépôt jetable, reproduis la situation suivante et résous-la : tu as modifié `a.js` et `b.js`, mais tu veux
   commiter seulement `a.js`, puis tu t'aperçois que le message du commit contient une faute. Donne la suite de commandes
   et le résultat de `git log --oneline` et de `git status --short` à la fin.

   :::indice
   `git add a.js`, commit, puis `--amend`. `b.js` doit rester modifié et non indexé.
   :::

   :::solution
   ```text
   $ git init -b main demo && cd demo
   $ echo 1 > a.js && echo 1 > b.js && git add . && git commit -m "chore: initialiser"
   $ echo 2 > a.js && echo 2 > b.js
   $ git add a.js
   $ git commit -m "feat: modifer a"
   $ git commit --amend -m "feat: modifier a"
   $ git log --oneline
   3c9d1e2 feat: modifier a
   5b0f7a4 chore: initialiser
   $ git status --short
    M b.js
   ```

   Le commit corrigé a un nouvel identifiant, car son message fait partie de son contenu : c'est pourquoi on n'utilise
   `--amend` que sur un commit non partagé. `b.js` reste modifié dans le répertoire de travail, prêt pour un prochain
   commit. Les identifiants affichés seront différents chez toi.
   :::

## Questions d'entretien

- Explique la différence entre le répertoire de travail, l'index et le dépôt.

  :::indice
  Trois zones, et les commandes qui déplacent les changements entre elles.
  :::

  :::reponse
  Le répertoire de travail contient les fichiers tels qu'ils sont sur le disque, avec les modifications en cours.
  L'index, ou zone de préparation, contient le prochain commit tel qu'on le compose avec `git add`, éventuellement
  partie par partie avec `git add -p`. Le dépôt contient l'historique des commits, créés à partir de l'index par
  `git commit`. `git diff` compare le répertoire de travail à l'index, `git diff --staged` l'index au dernier commit.
  Cette séparation permet de faire des commits atomiques même quand on a modifié plusieurs choses à la fois.
  :::

- Qu'est-ce qu'un bon commit ?

  :::indice
  Une intention, un état fonctionnel, un message utile.
  :::

  :::reponse
  Un commit atomique : il réalise une seule intention, complète, et laisse le projet dans un état où les tests passent.
  Son message a un sujet court qui dit ce qui change, souvent au format Conventional Commits, et un corps qui explique
  pourquoi quand ce n'est pas évident. Un tel commit se relit facilement, s'annule proprement avec `git revert`, et
  permet à `git bisect` de désigner précisément l'origine d'une régression.
  :::

- Pourquoi ne faut-il pas réécrire des commits déjà poussés ?

  :::indice
  De quoi dépend l'identifiant d'un commit ?
  :::

  :::reponse
  Parce que l'identifiant d'un commit dépend de son contenu, de son message et de son parent : modifier un commit crée un
  nouveau commit, et change aussi tous ses descendants. Si d'autres ont déjà récupéré les anciens commits et travaillé
  dessus, leurs historiques divergent, et il faut des manipulations délicates pour les réconcilier, avec un risque de
  perdre du travail. On réécrit librement ses commits locaux ; une fois partagés, on corrige avec un nouveau commit, par
  exemple un `git revert`.
  :::
