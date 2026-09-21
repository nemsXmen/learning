---
id: ai-15-capstone-evaluate
title: "Evaluate, secure & observe"
slug: evaluate
technology: ai-engineering
level: advanced
module: 15-capstone
order: 1
estimatedMinutes: 60
difficulty: 5
xp: 180
prerequisites: []
skills:
  - ai-capstone
tags: [ai, capstone, production]
---

## Objectifs
- Concevoir une solution complète autour de Evaluate, secure & observe.
- Relier architecture, données, modèle et produit.
- Prouver la qualité par des tests et des métriques.

## Concept
Le niveau expert consiste à raisonner sur le système complet. **Evaluate, secure & observe** ne doit pas être traité isolément : l'interface, les données, le modèle, le retrieval éventuel, les outils, la sécurité et l'observabilité forment une seule chaîne.

Dans le capstone, chaque composant doit avoir un contrat clair. Les opérations longues passent par une stratégie asynchrone adaptée, les secrets restent côté serveur et les actions à risque sont contrôlées.

## Méthode
- Écrire l'architecture avant le code.
- Définir les contrats et schémas.
- Construire une baseline fonctionnelle.
- Ajouter RAG ou agents uniquement si le besoin le justifie.
- Créer un jeu d'évaluation versionné.
- Instrumenter qualité, latence, coût et erreurs.
- Préparer rollback et documentation.

## Exercice
Implémente une partie du capstone sur **Evaluate, secure & observe**. Fournis architecture, contrats, tests, métriques et procédure de déploiement.

:::indice
Chaque composant doit pouvoir être remplacé ou testé sans dépendre implicitement de tout le reste.
:::

:::solution
Une solution complète sépare domaine, orchestration et infrastructure, valide les entrées/sorties, limite les permissions et mesure le système avec un dataset d'évaluation versionné.
:::

## À retenir
- L'expertise vient de la capacité à relier les couches.
- La production exige tests, sécurité et observabilité.
- Un capstone doit laisser des artefacts réutilisables : code, tests, métriques et documentation.
