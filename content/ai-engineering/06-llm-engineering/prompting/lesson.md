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
- construire des prompts testables ;
- séparer instructions, données et contexte ;
- réduire ambiguïté et injection ;
- versionner les prompts.

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

## Exercice
Extraire name, email et amount depuis un message client. Quelles contraintes ajouter ?

### Solution
Définir un schéma, les types, les champs manquants, l'interdiction d'inventer et des exemples couvrant les cas ambigus.

## À retenir
Le prompt est une partie versionnée du logiciel, pas une formule magique.


## Introduction

Un prompt de production est un contrat entre le produit et le modèle.

## Concept

Instructions, contexte, entrée utilisateur et format de sortie doivent être séparés.

## Exemple

Un prompt versionné peut être testé sur un dataset avant déploiement.

## Comment ça fonctionne

contrat → contexte → génération → validation → feedback

## Questions d'entretien

- Pourquoi versionner les prompts ?

  :::indice
  Considère toujours la frontière entre génération et logique déterministe.
  :::

  :::reponse
  Pour reproduire les sorties et détecter les régressions.
  :::
