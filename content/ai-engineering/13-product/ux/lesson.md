---
id: ai-13-ux
title: "UX des produits génératifs"
slug: ux
technology: ai-engineering
level: advanced
module: 13-product
order: 3
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-13-architecture]
skills: [ai-product]
tags: [product, ux, analytics, ai]
---

## Objectifs
- concevoir une UX adaptée à l'incertitude ;
- afficher provenance et états ;
- gérer streaming et erreurs ;
- donner un contrôle à l'utilisateur.

## UX
L'utilisateur doit comprendre si le système réfléchit, récupère des données, appelle un outil ou attend une action externe.

```text
request -> progress -> evidence -> result -> user control
```

Pour une réponse sensible, afficher sources, niveau de confiance utile ou possibilité de corriger.

## Erreurs
Une réponse indisponible doit être explicite. Prévois retry, édition, annulation et reprise quand pertinent.

## Exercice
Une réponse générée contient une erreur factuelle. Quelle UX aide l'utilisateur ?

:::indice
Relie chaque décision technique à une métrique ou un risque utilisateur concret.
:::

:::solution
Afficher les sources disponibles, permettre correction/régénération et rendre la limite du système visible plutôt que présenter la réponse comme certaine.

:::

## Erreurs fréquentes

- choisir une technologie avant de définir le problème ;
- mesurer une moyenne sans regarder les cas critiques ;
- confondre une sortie plausible avec une sortie validée ;
- oublier coût, sécurité et opérations dans la conception.

## À retenir
Une bonne UX IA transforme l'incertitude en information et contrôle utilisateur.


## Introduction

L'UX générative doit rendre visible l'incertitude et donner du contrôle.

## Concept

Streaming, états d'attente, citations, édition et approbation répondent à des risques différents.

## Exemple

Une action financière peut nécessiter confirmation humaine même si le modèle propose l'action.

## Comment ça fonctionne

request → progress → evidence → result → user control

## Questions d'entretien

- Pourquoi afficher les sources lorsque c'est possible ?

  :::indice
  Relie la métrique à une décision produit concrète.
  :::

  :::reponse
  Pour aider l'utilisateur à vérifier la réponse et calibrer sa confiance.
  :::
