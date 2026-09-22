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
- Un agent peut exécuter du code Python arbitraire. Quelles protections minimales ?

:::indice
Cherche une défense qui reste fiable même si le modèle produit une sortie hostile.
:::

:::solution
Sandbox isolée, timeout, quotas CPU/mémoire, filesystem restreint, réseau contrôlé et validation des résultats.

:::

## Erreurs fréquentes

- négliger les hypothèses et les contrats de données ;
- modifier plusieurs variables à la fois sans pouvoir attribuer l'effet ;
- ignorer les cas limites, les erreurs et la reproductibilité ;
- optimiser avant d'avoir défini une mesure de succès.

## À retenir
L'autonomie augmente la surface d'attaque ; les privilèges doivent rester bornés.


## Introduction

Un agent augmente la surface d'attaque lorsqu'il peut appeler des outils.

## Concept

Least privilege, sandbox, secrets courts et audit réduisent l'impact d'une compromission.

## Exemple

Un outil shell doit être isolé ou remplacé par une API spécialisée lorsque cela suffit.

## Comment ça fonctionne

request → policy → sandbox/tool → audit

## Questions d'entretien

- Quel est le principe de least privilege pour un agent ?

  :::indice
  Pense aux contrôles qui restent fiables même si le modèle se trompe.
  :::

  :::reponse
  Accorder uniquement les permissions nécessaires à la tâche et pour la durée nécessaire.
  :::
