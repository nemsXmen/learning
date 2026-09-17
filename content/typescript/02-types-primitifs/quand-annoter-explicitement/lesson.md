---
id: typescript-02-quand-annoter-explicitement
title: Quand annoter explicitement ?
slug: quand-annoter-explicitement
technology: typescript
level: beginner
module: 02-types-primitifs
order: 15
estimatedMinutes: 15
difficulty: 2
xp: 45
prerequisites: [typescript-02-readonly-et-valeurs-mutables]
skills: [primitive-types]
tags: [typescript, annotations, bonnes-pratiques]
---

## Objectifs

- Avoir des règles claires sur quand annoter
- Éviter la sous-annotation et la sur-annotation
- Appliquer ces règles aux types primitifs

## Introduction

La question « dois-je annoter ? » revient tout le temps. Voici des règles pragmatiques.

## Concept

### Annoter systématiquement

- Paramètres de fonctions publiques
- Valeurs de retour des fonctions publiques (surtout si non évidentes)
- Variables non initialisées
- Tout ce qui vient de l’extérieur (`unknown` puis narrowing)

### Laisser l’inférence

- Variables locales initialisées avec un littéral clair
- Valeurs de retour évidentes
- La plupart des variables intermédiaires

### Annoter pour documenter ou restreindre

- Literal unions (`"admin" | "user"`)
- Configurations
- API stables

## Exemple

```ts
// ✅ Bien
function createId(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

// ✅ Bien – inférence suffisante
const id = createId("user");

// ❌ Sur-annotation inutile
const name: string = "Alice";
```

## Comment ça fonctionne

L’équilibre idéal est : **contrats explicites aux frontières, inférence à l’intérieur**.

## Erreurs fréquentes

- Annoter absolument tout → code bruyant
- N’annoter jamais → API floues et `any` qui se propagent
- Annoter avec `any` « pour gagner du temps »

## À retenir

- Frontières = annotations
- Intérieur = inférence
- Les annotations sont aussi de la documentation
- Le mode `strict` + `noImplicitAny` t’aide à trouver le bon équilibre

## Exercices

1. Pour chaque ligne, dis si tu annoterais ou non :

```ts
const port = 3000;
function startServer(p) { ... }
let result;
```

   :::solution
   - `const port = 3000` → non (inférence)
   - `function startServer(p)` → oui, annoter `p`
   - `let result` → oui, annoter le type
   :::

## Questions d'entretien

1. Quelle règle suis-tu pour décider d’annoter un type ou de laisser l’inférence ?

   :::reponse
   J’annote les frontières (paramètres, retours publics, données externes) et les cas où je veux restreindre le type. À l’intérieur des fonctions, je laisse l’inférence travailler. Cela garde le code lisible tout en conservant des contrats clairs.
   :::
