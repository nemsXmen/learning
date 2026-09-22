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

## Exercices

Évite le faux indicateur de confiance. Un pourcentage généré par le modèle n'est pas automatiquement une probabilité calibrée.

:::indice
Une réponse générée contient une erreur factuelle. Quelle UX aide l'utilisateur ?
:::

:::solution
Donne des moyens de vérification et de correction.
:::

## Erreurs fréquentes

Le flow est : request → progress → evidence → result → user control. Les actions à effet de bord doivent avoir une frontière de confirmation adaptée au risque.

## À retenir

Afficher les sources disponibles, permettre correction/régénération et rendre la limite du système visible plutôt que présenter la réponse comme certaine.

## Introduction

Concevoir une UX pour un système probabiliste

## Concept

Une interface générative doit aider l'utilisateur à comprendre ce que le système fait et ce qu'il sait réellement. Une réponse fluide ne doit pas donner une impression de certitude injustifiée.

## Exemple

Les états peuvent distinguer génération, retrieval, appel d'outil, attente externe, succès et erreur. Selon le cas, sources, citations, édition, annulation, confirmation ou régénération sont utiles.

## Comment ça fonctionne

Une réponse factuelle comporte une erreur. Afficher les sources disponibles, permettre la correction et rendre les limites visibles donne à l'utilisateur des moyens de vérifier au lieu de transformer une sortie probabiliste en vérité implicite.

## Questions d'entretien

Une bonne UX AI transforme l'incertitude en information et contrôle utilisateur.

:::indice
Relie ta réponse à une décision produit mesurable.
:::

:::reponse
Pourquoi afficher les sources lorsque c'est possible ?
:::
