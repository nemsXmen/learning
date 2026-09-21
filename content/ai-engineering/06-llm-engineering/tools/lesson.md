---
id: ai-06-tools
title: "Tool calling et exécution contrôlée"
slug: tools
technology: ai-engineering
level: intermediate
module: llm-engineering
order: 3
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-06-structured-output]
skills: [ai-llm-apps]
tags: [llm, ai-engineering]
---


## Objectifs
- comprendre le tool calling ;
- définir des outils avec des contrats minimaux ;
- contrôler autorisation et effets de bord ;
- limiter les boucles agentiques.

## Modèle mental
```text
LLM -> tool request -> validation -> authorization -> execution -> result -> LLM
```

Le LLM propose une action ; le serveur reste responsable de la validation et de l'autorisation.

## Contrats
Un outil expose nom, description, schéma d'entrée et résultat. Préfère des outils ciblés comme get_invoice(invoiceId) à une primitive générique permettant des commandes arbitraires.

## Effets de bord
Pour paiement, suppression ou modification de compte, exige une autorisation indépendante du modèle. Ajoute idempotence, limites et audit logs.

## Boucle
Limite nombre d'appels et temps total. Détecte répétitions, erreurs et absence de progrès.

## Tool output
Le résultat d'un service externe est une donnée non fiable. Il ne doit pas devenir automatiquement une instruction système.

## Exercice
Un agent consulte une facture puis envoie un email. Pourquoi séparer les outils ?

### Solution
La lecture et l'effet de bord ont des risques différents. La séparation permet autorisation, confirmation, idempotence et audit.

## À retenir
Le tool calling relie un composant probabiliste à des opérations déterministes. Les contrôles restent dans le code.


## Introduction

Le tool calling relie raisonnement probabiliste et opérations déterministes.

## Concept

Un tool possède contrat, validation, autorisation, limites et journalisation.

## Exemple

Un tool de remboursement doit vérifier indépendamment identité, permissions, montant et idempotence.

## Comment ça fonctionne

modèle → tool request → validation → authorization → execution → result

## Questions d'entretien

- Qui doit autoriser un effet de bord ?

  :::indice
  Considère toujours la frontière entre génération et logique déterministe.
  :::

  :::reponse
  Le système déterministe côté serveur, pas le modèle seul.
  :::
