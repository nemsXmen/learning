---
id: ai-10-agent-security
title: "Sécuriser les agents autonomes"
slug: agent-security
technology: ai-engineering
level: advanced
module: security
order: 4
estimatedMinutes: 80
difficulty: 5
xp: 180
prerequisites: [ai-10-data-protection]
skills: [ai-security]
tags: [security, ai, llm]
---

## Objectifs
- appliquer least privilege ;
- contrôler les actions à effet de bord ;
- sécuriser les sandboxes ;
- auditer les décisions.

## Agent non privilégié
Le modèle peut proposer une action mais ne doit pas devenir l'autorité d'accès.

```text
proposal -> policy engine -> authorization -> tool -> side effect
```

## Sandbox
Pour du code non fiable, isole filesystem, réseau, CPU, mémoire et durée. Interdis toute capacité inutile.

## Secrets
Injecte les credentials uniquement dans le composant qui doit les utiliser. Évite de les placer dans le contexte LLM.

## Audit
Trace appels d'outils, décisions de politique, erreurs et request IDs sans enregistrer inutilement des données sensibles.

## Exercices
- Même un agent correctement configuré peut produire une action inattendue. Les contrôles doivent donc limiter l'impact maximal d'une erreur ou d'une compromission.

:::indice
- Un agent peut exécuter du Python arbitraire. Quelles protections minimales ?
:::
:::solution
Pense en termes d'isolation et de limites de ressources.
:::
## Erreurs fréquentes

Le flow est : request → policy → sandbox/tool → validation du résultat → audit. Les secrets doivent rester dans le composant qui appelle réellement le service, pas dans le contexte du modèle.

## À retenir

Sandbox isolée, timeout, quotas CPU/mémoire, filesystem restreint, réseau contrôlé et validation des résultats avant tout effet de bord.

## Introduction

Sécuriser l'autonomie et l'exécution de code

## Concept

Un agent qui peut seulement produire du texte a une surface d'impact limitée. Dès qu'il peut appeler des outils, modifier des données ou exécuter du code, la sécurité doit contrôler chaque capacité.

## Exemple

Le principe de least privilege consiste à donner uniquement les permissions nécessaires, pendant la durée nécessaire. L'agent propose ; le policy engine décide ; le tool exécute.

## Comment ça fonctionne

Pour un agent capable d'exécuter Python arbitraire, il ne suffit pas de vérifier le prompt. Il faut isoler le processus, limiter CPU et mémoire, contrôler le filesystem et le réseau et imposer un timeout.

## Questions d'entretien
- L'autonomie augmente la surface d'attaque ; les privilèges et les ressources doivent rester bornés.

:::indice
Relie ta réponse à une frontière de confiance et à un contrôle déterministe.
:::
:::reponse
Quel est le principe de least privilege pour un agent ?
:::