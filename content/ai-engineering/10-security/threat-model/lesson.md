---
id: ai-10-threat-model
title: "Threat modeling pour les systèmes IA"
slug: threat-model
technology: ai-engineering
level: advanced
module: 10-security
order: 1
estimatedMinutes: 70
difficulty: 5
xp: 160
prerequisites: [ai-09-regression]
skills: [ai-security]
tags: [security, ai, llm]
---

## Objectifs
- identifier les actifs et frontières de confiance ;
- modéliser les menaces spécifiques à l'IA ;
- relier menaces et contrôles ;
- prioriser les risques.

## Actifs
Cartographie prompts, données, secrets, modèles, outils, bases, sorties et actions métier. Définis qui peut accéder à chacun.

## Threat model
```text
asset -> trust boundary -> threat -> impact -> control -> residual risk
```

Les risques incluent injection, exfiltration, abus d'outils, fuite de données, empoisonnement, déni de service et coûts non maîtrisés.

## Contrôles
Associe chaque menace à des mesures : validation, isolation, ACL, rate limit, sandbox, logging et approbation.

## Exercice
Un document externe peut influencer un agent qui possède un outil d'écriture. Quelle frontière protéger ?

### Solution
Traiter le document comme donnée non fiable et placer une autorisation déterministe avant toute écriture.

## À retenir
La sécurité commence par les frontières de confiance, pas par le prompt seul.
