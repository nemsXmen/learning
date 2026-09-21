---
id: ai-15-capstone-launch
title: "Launch: reliability, cost & documentation"
slug: launch
technology: ai-engineering
level: advanced
module: 15-capstone
order: 4
estimatedMinutes: 90
difficulty: 5
xp: 250
prerequisites: []
skills:
  - ai-capstone
tags: [ai, capstone, production]
---

## Mission

Mettre en production un AI SaaS complet et démontrer qu'il est exploitable, observable, sécurisé et maintenable.

## Livrables

- architecture et ADR ;
- API avec contrats validés ;
- authentification et contrôle des permissions ;
- pipeline d'ingestion et recherche ;
- fonctionnalité RAG ;
- agent avec outils limités si nécessaire ;
- suite d'évaluation versionnée ;
- observabilité ;
- limites de coût et de débit ;
- procédure de rollback ;
- documentation développeur et runbook.

## Critères techniques

Le système doit distinguer les erreurs utilisateur, les erreurs d'infrastructure et les erreurs de qualité AI. Les secrets ne doivent jamais être exposés au client. Les appels externes doivent avoir des timeouts et des retries bornés.

## Évaluation finale

Prépare un dataset de référence et compare une version baseline à la version finale. Mesure au minimum qualité, latence, taux d'erreur et coût. Présente les compromis et les limites connues.

## Exercice final

Déploie le projet, provoque volontairement au moins trois scénarios d'échec, puis montre comment le système les détecte et se dégrade.

:::solution
Un capstone terminé n'est pas seulement une démo : il possède des contrats, des tests, une évaluation reproductible, des contrôles de sécurité, des métriques opérationnelles et une documentation permettant à un autre ingénieur de l'exploiter.
:::
