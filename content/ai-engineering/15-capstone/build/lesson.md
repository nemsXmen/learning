---
id: ai-15-build
title: "Capstone : construire le produit par itérations"
slug: build
technology: ai-engineering
level: expert
module: capstone
order: 2
estimatedMinutes: 120
difficulty: 5
xp: 280
prerequisites: [ai-15-architecture]
skills: [ai-capstone]
tags: [capstone, architecture, rag, agents, production]
---

## Objectifs
- découper une implémentation complexe en tranches verticales ;
- définir des contrats d'API et de données ;
- construire un premier flux de bout en bout ;
- tester chaque couche sans dépendre systématiquement de services coûteux ;
- ajouter progressivement RAG, agents, streaming, quotas et billing.

## Introduction

Un capstone échoue souvent parce que trop de composants sont construits simultanément. La stratégie inverse consiste à construire une tranche verticale minimale : authentification → requête → gateway → réponse validée → persistance.

Une fois ce chemin fiable, chaque nouvelle capacité s'appuie sur des contrats existants.

## Concept

Découpe le produit en phases :

~~~text
foundation
   ↓
AI gateway
   ↓
RAG
   ↓
agents + tools
   ↓
UI + streaming
   ↓
evaluation + observability
   ↓
quotas + billing
~~~

Chaque phase doit être démontrable. Un contrat doit être versionné avant que plusieurs composants ne dépendent de lui.

## Exemple

Premier vertical slice :

~~~text
POST /tasks
   ↓
auth
   ↓
create task
   ↓
AI gateway
   ↓
structured response
   ↓
persist result
   ↓
return task
~~~

Ensuite, ajoute le retrieval :

~~~text
task → retrieve ACL-filtered chunks → model → validated answer
~~~

Puis un outil contrôlé :

~~~text
model proposal → schema validation → policy check → tool execution → observation
~~~

## Comment ça fonctionne

Commence par configuration et secrets, migrations, authentification, tenant, gateway LLM, contrat de sortie structurée, persistance et tests.

Ajoute ensuite RAG, workers, agents et billing. Les réponses des modèles et les résultats de tools doivent être mockables afin de tester les scénarios sans dépendre d'un fournisseur externe.

Les tests doivent couvrir :
- unitaires pour la logique déterministe ;
- intégration pour DB, cache et retrieval ;
- API pour les contrats ;
- évaluations IA pour la qualité ;
- tests de sécurité pour permissions et injection ;
- tests de charge pour les chemins coûteux.

## Erreurs fréquentes

- construire toute l'infrastructure avant un premier flux fonctionnel ;
- créer trop d'abstractions avant d'avoir des cas réels ;
- appeler le LLM réel dans tous les tests ;
- ne pas versionner les contrats ;
- tester seulement le happy path ;
- ajouter un framework agent sans besoin métier ;
- oublier les migrations et la reproductibilité.

## Exercices

Pourquoi construire d'abord un gateway abstrait plutôt que disperser les appels LLM dans les services ?

:::indice
Liste les préoccupations qui doivent rester identiques même si le fournisseur ou le modèle change.
:::

:::solution
Le gateway centralise le contrat fournisseur, timeout, retry borné, fallback éventuel, streaming, mesure des tokens, coût, logs et gestion des erreurs. Les services métier restent ainsi indépendants du SDK d'un fournisseur.
:::

## À retenir

Construis verticalement, versionne les contrats et rends les dépendances externes remplaçables et testables.

## Questions d'entretien

- Pourquoi construire verticalement ?
- Pourquoi mocker les fournisseurs LLM ?
- Quels tests sont indispensables pour un agent ?
- Quand une abstraction devient-elle prématurée ?

:::indice
Relie chaque décision à la vitesse de feedback et au risque introduit.
:::

:::reponse
Le vertical slice valide tôt le flux réel. Les mocks rendent les tests déterministes et contrôlent coût et latence. Un agent doit tester policy, outils, limites, erreurs et résultats inattendus. Une abstraction est prématurée lorsqu'elle ne protège encore aucun contrat ou variation réellement nécessaire.
:::
