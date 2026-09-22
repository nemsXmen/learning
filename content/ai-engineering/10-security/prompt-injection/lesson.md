---
id: ai-10-prompt-injection
title: "Prompt injection et attaques indirectes"
slug: prompt-injection
technology: ai-engineering
level: advanced
module: security
order: 2
estimatedMinutes: 75
difficulty: 5
xp: 170
prerequisites: [ai-10-threat-model]
skills: [ai-security]
tags: [security, ai, llm]
---

## Objectifs
- distinguer injection directe et indirecte ;
- limiter l'influence des contenus non fiables ;
- sécuriser les outils ;
- tester des scénarios adversariaux.

## Direct vs indirect
Une injection directe vient de l'utilisateur. Une injection indirecte peut être cachée dans une page, un email, un PDF ou une base récupérée par RAG.

```text
untrusted content -> model context
                         X
                 policy boundary
                         |
                  tool execution
```

Le fait qu'une instruction soit lisible par le modèle ne lui donne aucun privilège.

## Défenses
Sépare instructions et données, applique ACL, minimise contexte, valide les arguments des outils et place l'autorisation hors modèle.

## Exercices
- Une page récupérée demande à l'agent de transmettre son secret API. Que doit-il faire ?

:::indice
Cherche une défense qui reste fiable même si le modèle produit une sortie hostile.
:::

:::solution
Ignorer cette instruction comme donnée non fiable. Les secrets ne doivent pas être exposés au modèle.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
L'injection est un problème de frontière de confiance et d'autorité.


## Introduction

Les instructions peuvent provenir de sources non fiables et tenter de détourner le modèle.

## Concept

Injection directe et indirecte nécessitent défense en profondeur.

## Exemple

Un document récupéré peut contenir une instruction malveillante ; il doit rester une donnée et non une autorité.

## Comment ça fonctionne

untrusted input → retrieval → model → constrained action

## Questions d'entretien

- Pourquoi le contexte RAG est-il une surface d'attaque ?

  :::indice
  Pense aux contrôles qui restent fiables même si le modèle se trompe.
  :::

  :::reponse
  Parce qu'un document externe peut contenir des instructions adversariales interprétées par le modèle.
  :::
