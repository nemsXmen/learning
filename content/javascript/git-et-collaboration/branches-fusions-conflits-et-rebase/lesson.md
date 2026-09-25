---
id: javascript-branches-fusions-conflits-et-rebase
title: "Branches, fusions, conflits et rebase"
slug: branches-fusions-conflits-et-rebase
technology: javascript
level: intermediate
module: git-et-collaboration
order: 2
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-fondamentaux-de-git-et-commits
skills:
  - js-git-branches
tags:
  - javascript
  - git
  - collaboration
---

## Objectifs

- Créer des branches et passer de l'une à l'autre, en comprenant qu'une branche n'est qu'une étiquette.
- Fusionner, en avance rapide ou avec un commit de fusion, et résoudre un conflit avec méthode.
- Rebaser une branche sur une autre, et respecter la règle d'or du rebase.
- Choisir entre fusion, rebase et fusion écrasée (*squash*).
- Récupérer un travail qu'on croit perdu avec `git reflog`.

## Introduction

Les branches permettent de travailler sur plusieurs choses en parallèle : une fonctionnalité en cours, une correction
urgente, une expérience. Chacune avance de son côté, puis on les réunit. C'est au moment de les réunir que tout se joue :
deux personnes ont modifié la même ligne, et Git ne peut pas deviner laquelle garder.

Les conflits font peur, mais ils sont normaux et se résolvent avec méthode. Ce chapitre montre comment les branches
fonctionnent vraiment, comment fusionner ou rebaser, et comment ne jamais perdre de travail.

## Concept

| Commande | Effet |
| --- | --- |
| `git switch -c feat/seuil` | crée une branche et s'y place |
| `git switch main` | revient sur `main` |
| `git merge feat/seuil` | intègre la branche dans la branche courante |
| `git rebase main` | rejoue les commits de la branche courante au-dessus de `main` |
| `git merge --abort`, `git rebase --abort` | annule une fusion ou un rebase en cours de conflit |
| `git log --oneline --graph --all` | dessine l'historique et ses branches |
| `git reflog` | liste les positions successives de `HEAD`, y compris des commits « perdus » |

| Intégration | Historique obtenu | Quand |
| --- | --- | --- |
| avance rapide (*fast-forward*) | linéaire : l'étiquette avance simplement | la branche cible n'a pas bougé |
| commit de fusion | une bifurcation puis une jonction, avec un commit à deux parents | on veut garder la trace de la branche |
| rebase puis avance rapide | linéaire, commits rejoués avec de nouveaux identifiants | historique lisible, branche personnelle |
| fusion écrasée (*squash*) | un seul commit qui résume la branche | pull request aux commits intermédiaires désordonnés |

## Exemple

Sur `main`, `SEUIL` vaut 50. Une branche `feat/seuil` le passe à 60, pendant qu'un correctif sur `main` le passe à 45.
La fusion produit un conflit :

```text
$ git merge feat/seuil
Auto-merging regles.js
CONFLICT (content): Merge conflict in regles.js
Automatic merge failed; fix conflicts and then commit the result.

$ cat regles.js
export const LIVRAISON = 4.9;
<<<<<<< HEAD
export const SEUIL = 45;
=======
export const SEUIL = 60;
>>>>>>> feat/seuil

$ git status --short
UU regles.js
```

Git a fusionné tout ce qu'il pouvait, et marqué la zone où les deux versions divergent : entre `<<<<<<<` et `=======`,
la version de la branche courante ; entre `=======` et `>>>>>>>`, celle de la branche fusionnée. On peut aussi choisir de
rebaser la branche plutôt que de fusionner :

```text
$ git switch feat/seuil
$ git rebase main
Could not apply 0b1b302... feat: livraison offerte dès 60 €
# … on édite regles.js pour garder la bonne valeur, sans les marqueurs …
$ git add regles.js
$ git rebase --continue
Successfully rebased and updated refs/heads/feat/seuil.

$ git log --oneline --graph --all
* 33a3f59 feat: livraison offerte dès 60 €
* eee3693 fix: seuil promotionnel de septembre
* b67bc47 feat: règles de livraison

$ git switch main && git merge --ff-only feat/seuil
Fast-forward
```

Le commit de la branche a été rejoué au-dessus du correctif : il a un **nouvel identifiant**, `33a3f59` au lieu de
`0b1b302`, et l'historique est linéaire.

## Comment ça fonctionne

**Une branche est une étiquette.** Une branche n'est qu'un fichier qui contient l'identifiant d'un commit. Créer une
branche ne copie rien ; commiter fait avancer l'étiquette de la branche courante vers le nouveau commit. `HEAD` indique
la branche courante. C'est pourquoi les branches sont si légères : on en crée une pour chaque tâche, et on la supprime
une fois intégrée.

**La fusion.** Si `main` n'a pas bougé depuis la création de la branche, la fusion se contente d'avancer l'étiquette :
c'est l'avance rapide. Sinon, Git cherche l'**ancêtre commun** des deux branches et compare chacune à cet ancêtre. Les
changements qui touchent des zones différentes s'additionnent ; ceux qui modifient la même zone de deux façons
différentes créent un conflit. Le résultat est un **commit de fusion**, à deux parents.

**Résoudre un conflit, avec méthode.** Un conflit n'est pas une erreur, c'est une question : « ces deux changements
étaient voulus ; que doit contenir le résultat ? ». La réponse n'est pas toujours l'une des deux versions. Ici, le
seuil de septembre et le nouveau seuil de la fonctionnalité sont deux décisions métier : il faut peut-être demander à
la personne concernée. Ensuite, on édite le fichier pour obtenir le bon contenu, on retire **tous** les marqueurs, on
lance les tests, puis `git add` et `git commit`, ou `git rebase --continue`. En cas de doute, `--abort` ramène à l'état
d'avant. Les éditeurs affichent les deux versions côte à côte, avec des boutons pour choisir.

**Le rebase.** Rebaser `feat/seuil` sur `main`, c'est prendre ses commits, et les **rejouer** un par un au-dessus du
dernier commit de `main`, comme si la branche avait été créée maintenant. Le résultat est linéaire et facile à lire,
mais chaque commit rejoué est un **nouveau** commit, avec un nouvel identifiant. Les conflits se résolvent commit par
commit.

**La règle d'or du rebase.** Comme il réécrit les commits, on ne rebase **jamais** une branche que d'autres utilisent :
leurs copies contiennent les anciens commits, et les deux histoires divergent. On rebase ses propres branches, avant de
les partager ou avant de les intégrer. Si l'on doit pousser une branche rebasée déjà publiée, on utilise
`git push --force-with-lease`, qui refuse d'écraser un travail poussé entre-temps par quelqu'un d'autre, plutôt que
`--force`.

**Fusion, rebase ou squash ?** Les trois sont légitimes, et chaque équipe choisit une convention. Le rebase donne un
historique linéaire, commit par commit. Le commit de fusion garde la trace exacte des branches. La fusion écrasée
réduit une pull request à un seul commit propre, au prix des étapes intermédiaires. Ce qui compte : que `main` reste
lisible et que chaque commit qui y arrive laisse le projet fonctionnel. Le rebase interactif, `git rebase -i`, permet
en plus de réordonner, fusionner ou reformuler ses commits locaux avant de les partager.

**Rien ne se perd vraiment.** Un commit n'est effacé que s'il n'est plus accessible depuis aucune référence pendant
plusieurs semaines. Après un `reset --hard` malheureux ou une branche supprimée, `git reflog` liste toutes les positions
récentes de `HEAD` : on y retrouve l'identifiant du commit « perdu », et `git branch sauvetage <identifiant>` le
récupère.

## Erreurs fréquentes

**Travailler directement sur `main`.** Crée une branche par tâche, même petite.

**Laisser des marqueurs de conflit dans le code.** Cherche `<<<<<<<` avant de commiter, et lance les tests.

**Choisir « ma version » par réflexe.** Un conflit oppose deux changements voulus ; comprends les deux.

**Rebaser une branche partagée.** Les autres ont les anciens commits ; rebase seulement tes branches.

**`git push --force` sur une branche commune.** Utilise `--force-with-lease`, et seulement sur tes branches.

**Garder une branche des semaines sans l'intégrer.** Plus elle diverge, plus les conflits sont gros ; intègre souvent.

**Paniquer après un `reset --hard`.** Consulte `git reflog`.

## À retenir

- Une branche est une étiquette sur un commit ; `HEAD` désigne la branche courante.
- Fusion : avance rapide si possible, sinon commit de fusion à deux parents, à partir de l'ancêtre commun.
- Conflit : comprendre les deux changements, écrire le bon résultat, retirer les marqueurs, tester, `add`.
- Rebase : rejoue les commits au-dessus d'une autre branche, avec de nouveaux identifiants.
- Règle d'or : ne jamais rebaser ce qui est partagé ; `--force-with-lease` plutôt que `--force`.
- `git reflog` retrouve les commits qu'on croit perdus.

## Exercices

1. Pendant un rebase, Git s'arrête sur un conflit dans `panier.js`. Décris, dans l'ordre, ce que tu fais pour terminer
   proprement, puis ce que tu fais si tu te rends compte que tu n'es pas prêt à trancher.

   :::indice
   Éditer, vérifier, indexer, continuer ; ou tout annuler.
   :::

   :::solution
   1. `git status` pour voir les fichiers en conflit et le commit en cours de rejeu.
   2. Ouvrir `panier.js`, comprendre les deux versions, par exemple avec `git log -p` sur chaque branche, et écrire le
      contenu correct.
   3. Retirer tous les marqueurs `<<<<<<<`, `=======` et `>>>>>>>`, puis lancer les tests concernés.
   4. `git add panier.js`, puis `git rebase --continue` ; recommencer si un commit suivant est aussi en conflit.

   Si l'on n'est pas prêt à trancher, par exemple parce qu'il faut l'avis de l'auteur de l'autre changement,
   `git rebase --abort` ramène la branche exactement à son état d'avant le rebase. Rien n'est perdu.
   :::

2. Tu as fait `git reset --hard HEAD~2` sur ta branche, et tu t'aperçois que les deux commits annulés contenaient une
   journée de travail. Retrouve-les. Donne les commandes et explique ce que montre chacune.

   :::indice
   Le reflog garde les positions précédentes de `HEAD`.
   :::

   :::solution
   ```text
   $ git reflog
   a1b2c3d HEAD@{0}: reset: moving to HEAD~2
   9f8e7d6 HEAD@{1}: commit: feat: export PDF des factures
   5c4b3a2 HEAD@{2}: commit: feat: modèle de facture
   $ git branch sauvetage 9f8e7d6
   $ git log --oneline sauvetage -3
   9f8e7d6 feat: export PDF des factures
   5c4b3a2 feat: modèle de facture
   a1b2c3d …
   $ git reset --hard sauvetage
   ```

   `git reflog` liste les positions de `HEAD` : juste avant le reset, `HEAD` était sur `9f8e7d6`. Une branche
   `sauvetage` y pose une étiquette, pour que le commit ne soit plus menacé par le nettoyage. On vérifie son contenu,
   puis on remet sa branche dessus. Les identifiants seront différents chez toi. Les modifications **non commitées** au
   moment du `reset --hard`, elles, ne sont pas dans le reflog : d'où l'intérêt de commiter souvent.
   :::

3. Ton équipe hésite entre trois conventions pour intégrer les pull requests dans `main` : commit de fusion, rebase puis
   avance rapide, ou fusion écrasée. Donne un avantage et un inconvénient de chacune, et une recommandation pour une
   équipe de cinq personnes qui fait des pull requests courtes.

   :::indice
   Pense à la lisibilité de `main`, à `git bisect`, et à la valeur des commits intermédiaires.
   :::

   :::solution
   - **Commit de fusion** : garde l'histoire exacte, branche comprise ; mais le graphe devient touffu, et des commits
     intermédiaires parfois cassés arrivent dans `main`, ce qui gêne `git bisect`.
   - **Rebase puis avance rapide** : historique linéaire et détaillé ; mais chaque commit doit être propre et vert, ce
     qui demande de la discipline, et le rebase réécrit les commits de la branche.
   - **Fusion écrasée** : un commit par pull request, propre, au message relu, facile à annuler ; mais les étapes
     intermédiaires disparaissent de `main`, ce qui gêne un peu pour les grosses pull requests.

   Pour des pull requests courtes, la fusion écrasée est souvent le meilleur compromis : `main` reste lisible, chaque
   commit correspond à une intention revue et testée, et `git bisect` désigne directement la pull request fautive. Une
   équipe très rigoureuse sur ses commits peut préférer le rebase. L'essentiel est de choisir une convention et de la
   configurer dans l'outil de dépôt.
   :::

## Questions d'entretien

- Quelle différence entre `git merge` et `git rebase` ?

  :::indice
  Nouveau commit à deux parents, ou commits rejoués.
  :::

  :::reponse
  `git merge` réunit deux branches en créant, sauf avance rapide, un commit de fusion à deux parents : l'historique
  garde la trace exacte des branches, et aucun commit existant n'est modifié. `git rebase` rejoue les commits de la
  branche courante au-dessus d'une autre : l'historique devient linéaire, mais les commits rejoués sont de nouveaux
  commits, avec de nouveaux identifiants. D'où la règle : on rebase ses branches personnelles, jamais une branche
  partagée, et on fusionne ce qui est commun.
  :::

- Comment résous-tu un conflit de fusion ?

  :::indice
  Une question à trancher, pas une erreur.
  :::

  :::reponse
  Je regarde les fichiers en conflit avec `git status`, je comprends les deux changements, en lisant les commits de
  chaque côté et en demandant à leur auteur si nécessaire, puis j'écris le contenu correct, qui peut combiner les deux.
  Je retire tous les marqueurs, je lance les tests, puis `git add` et je termine la fusion ou le rebase. Si je ne peux
  pas trancher, `--abort` ramène à l'état d'avant. Pour réduire les conflits, j'intègre souvent et je garde des branches
  courtes.
  :::

- Qu'est-ce que la règle d'or du rebase ?

  :::indice
  Que deviennent les copies des autres ?
  :::

  :::reponse
  Ne jamais rebaser des commits que d'autres ont déjà récupérés. Le rebase crée de nouveaux commits à la place des
  anciens ; les personnes qui travaillaient sur les anciens se retrouvent avec une histoire divergente, difficile à
  réconcilier, avec un risque de perte de travail. Je rebase mes branches personnelles, avant de les partager ou de les
  intégrer, et si je dois pousser une branche à moi déjà publiée, j'utilise `--force-with-lease`.
  :::
