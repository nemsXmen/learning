---
id: ai-06-prompting
title: "Prompt engineering"
slug: prompting
technology: ai-engineering
level: intermediate
module: llm-engineering
order: 1
estimatedMinutes: 60
difficulty: 3
xp: 130
prerequisites: [ai-05-llm-architecture]
skills: [ai-llm-apps]
tags: [llm, ai-engineering]
---


## Objectifs

Prompt engineering comme ingénierie logicielle

## Prompt comme contrat
Définis explicitement objectif, contexte, contraintes, format et critères de réussite.

```text
instructions + contexte fiable + entrée utilisateur + format attendu
```

Les données utilisateur et documents récupérés sont des données non fiables : ils ne doivent pas modifier implicitement les règles du système.

## Few-shot
Quelques exemples représentatifs peuvent préciser un format ou une politique. Teste aussi les cas ambigus et adversariaux.

## Versioning
Un prompt de production doit avoir une version, un changelog et un jeu d'évaluation. Une modification importante doit être mesurée avant déploiement.

## Injection
Une page web ou un document peut contenir des instructions malveillantes. Sépare clairement données et instructions et n'autorise jamais le modèle à contourner les contrôles applicatifs.

## Exercices

- Tu modifies un prompt utilisé par une feature critique. Comment éviter une régression silencieuse ?

:::indice
Pense au prompt comme à une version de code.
:::

:::solution
Créer une nouvelle version, exécuter un jeu de tests représentatif, comparer les métriques avec la version précédente puis déployer progressivement si les résultats sont acceptables.
:::

## Erreurs fréquentes

Une page web ou un document peut contenir des instructions malveillantes. Les données récupérées doivent donc rester des données non fiables. Le modèle ne doit jamais pouvoir transformer un texte externe en autorisation applicative. Versionne le prompt, son changelog et son dataset d'évaluation.

## À retenir

Le prompt fait partie du logiciel : versionne-le et mesure son comportement.

## Introduction

Un prompt de production n'est pas une formule magique. C'est une partie du comportement logiciel et il doit donc être conçu, testé et versionné.

## Concept

Un bon prompt sépare objectif, règles, contexte fiable, données utilisateur et format attendu. Cette séparation réduit l'ambiguïté et permet de raisonner sur les frontières de confiance.

## Exemple

Pour extraire name, email et amount d'un message client, ne demande pas seulement « extrais les informations ». Définis les champs, les types, le comportement lorsque l'information manque et l'interdiction d'inventer une valeur.

## Comment ça fonctionne

Le flow devient : contrat → contexte → entrée → génération → validation → évaluation. Quelques exemples peuvent préciser un format, mais ils doivent être représentatifs et testés avec des cas ambigus.

## Questions d'entretien

Pourquoi versionner les prompts ?

:::indice
Relie ta réponse à la frontière entre modèle et application.
:::

:::reponse
Pour reproduire les sorties, comparer les changements et identifier quelle version a produit une régression.
:::
