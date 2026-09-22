---
id: ai-git-reproductibilite
title: "Git, versions et reproductibilité des expériences AI"
slug: git-reproductibilite
technology: ai-engineering
level: beginner
module: fondations
order: 3
estimatedMinutes: 40
difficulty: 2
xp: 90
prerequisites: []
skills: [ai-git]
tags: [git, reproducibility, experiments]
---

## Objectifs

- rendre une expérience AI traçable ;
- distinguer code, configuration, données et artefacts ;
- utiliser commits, branches et tags ;
- documenter les versions de datasets et modèles.

## Pourquoi Git ne suffit pas

Git versionne très bien le code et les petits fichiers, mais pas automatiquement les gros datasets, checkpoints ou secrets.

Pour reproduire un résultat, il faut retrouver code, données, modèle, configuration, dépendances et environnement.

## Manifeste d'expérience

Un run peut enregistrer :

```json
{
  "git_commit": "abc123",
  "dataset": "support-v3",
  "model": "model-x@2026-09-01",
  "temperature": 0,
  "eval_set": "gold-v2"
}
```

## Commits utiles

```bash
git status
git diff
git add src/eval.py tests/test_eval.py
git commit -m "feat: add retrieval evaluation"
git log --oneline --decorate -10
```

Un commit atomique représente un changement compréhensible et réversible.

## Expériences

Une branche isole une modification :

```bash
git switch -c feat/reranker
```

Une branche Git n'est pas une version de modèle. Le code et les artefacts ML ont leurs propres identifiants.

## Reproductibilité

Même code ne signifie pas toujours résultat identique. Les causes possibles incluent seed, version de bibliothèque, matériel, ordre des données, précision numérique et modèle externe.

Il faut enregistrer les facteurs importants et mesurer la variabilité.

## Secrets

Ne jamais committer une clé API ou un mot de passe. Si un secret a fuité, le retirer du dernier fichier ne suffit pas : il faut le révoquer et traiter l'historique selon la procédure du projet.

## Exercices

- Définis un manifeste minimal pour une évaluation RAG.

:::indice
Décompose le problème en étapes simples et vérifie chaque résultat intermédiaire.
:::

:::solution

```json
{
  "git_commit": "abc123",
  "dataset_version": "docs-v4",
  "embedding_model": "embed-v2",
  "generator_model": "llm-v7",
  "retrieval_top_k": 8,
  "reranker": "reranker-v1",
  "eval_set": "gold-v3",
  "environment": "python-3.12"
}
```

:::

## À retenir

Un résultat AI n'est exploitable professionnellement que si son origine peut être reconstruite. Git est une pièce du système de traçabilité, pas le système complet.


## Introduction

Un système AI évolue avec le code, les données, les prompts et les configurations ; Git fournit une base de traçabilité.

## Concept

Un commit doit représenter un changement compréhensible et reproductible, tandis que les gros artefacts suivent une stratégie adaptée.

## Exemple

Exemple : associer une version de code à une configuration de modèle permet de retrouver exactement une expérience.

## Comment ça fonctionne

Le flux reproductible est changement → commit → CI → artefact → déploiement. Les secrets restent hors du dépôt.

## Questions d'entretien

- Pourquoi versionner les configurations AI ?

  :::indice
  Relie le concept à un problème concret de production AI.
  :::

  :::reponse
  Réponse : pour relier une sortie observée à une configuration précise et pouvoir reproduire ou rollbacker.
  :::
