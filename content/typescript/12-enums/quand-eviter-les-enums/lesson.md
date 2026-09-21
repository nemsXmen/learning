---
id: typescript-12-quand-eviter-les-enums
title: Quand éviter les enums
slug: quand-eviter-les-enums
technology: typescript
level: intermediate
module: 12-enums
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-12-enum-vs-union]
skills: [enums]
tags: [typescript, enums]
---

## Objectifs

- Identifier les situations où les enums sont contre-productifs
- Préférer des alternatives plus simples
- Adopter une convention d’équipe claire

## Introduction

Les enums ne sont pas toujours le meilleur outil. Voici quand les éviter.

## Concept

Éviter les enums quand :
- Une literal union suffit (cas le plus fréquent)
- On veut un maximum de tree-shaking
- On travaille dans un contexte très « JS » / multi-runtime
- On a besoin de types purement type-level sans runtime
- Les numeric enums opaques nuisent à la lisibilité

Préférer les enums quand :
- On a réellement besoin d’un objet runtime partagé
- On s’appuie sur le reverse mapping
- L’équipe a déjà une convention enum solide

## Exemple

```ts
// Souvent préférable
type Theme = "light" | "dark";

// Plutôt que
enum Theme {
  Light = "light",
  Dark = "dark"
}
```

## Comment ça fonctionne

Moins d’enums = moins de concepts, moins de code généré, plus de cohérence avec les literal types.

## Erreurs fréquentes

- Enum par défaut pour tout ensemble fermé
- Numeric enums sans documentation des valeurs

## À retenir

- Literal union en premier réflexe
- Enum seulement si le runtime / reverse mapping le justifie
- Convention d’équipe > dogme

## Exercices

1. Pour un statut "pending" | "done", choisis enum ou union et justifie.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   Literal union : pas besoin d’objet runtime, ensemble simple de strings.
   :::

## Questions d'entretien


1. Dans quels cas évites-tu les enums TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Quand une literal union suffit, quand on privilégie le tree-shaking et un modèle purement type-level, ou quand les numeric enums rendraient les valeurs moins lisibles. Les enums restent utiles pour un objet runtime partagé ou un reverse mapping.
   :::

