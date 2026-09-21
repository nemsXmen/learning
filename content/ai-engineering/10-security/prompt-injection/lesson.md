---
id: ai-10-prompt-injection
title: "Prompt injection et attaques indirectes"
slug: prompt-injection
technology: ai-engineering
level: advanced
module: 10-security
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

## Exercice
Une page récupérée demande à l'agent de transmettre son secret API. Que doit-il faire ?

### Solution
Ignorer cette instruction comme donnée non fiable. Les secrets ne doivent pas être exposés au modèle.

## À retenir
L'injection est un problème de frontière de confiance et d'autorité.
