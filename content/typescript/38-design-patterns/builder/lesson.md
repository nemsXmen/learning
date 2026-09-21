---
id: typescript-38-builder
title: Builder
slug: builder
technology: typescript
level: intermediate
module: 38-design-patterns
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-factory]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Construire des objets complexes étape par étape
- Typer un builder fluent
- Variantes required/optional

## Introduction

Le **Builder** assemble un objet par étapes fluides.

## Concept

```ts
class QueryBuilder {
  private filters: string[] = [];
  private limitValue?: number;

  where(clause: string) {
    this.filters.push(clause);
    return this;
  }

  limit(n: number) {
    this.limitValue = n;
    return this;
  }

  build(): { filters: string[]; limit?: number } {
    return { filters: this.filters, limit: this.limitValue };
  }
}

const q = new QueryBuilder().where("active = true").limit(10).build();
```

## Exemple

Builders typés avec generics pour imposer des étapes (type-state).

## Comment ça fonctionne

Chaque méthode retourne `this` pour le chaînage. `build()` produit l’objet final typé.

## Erreurs fréquentes

- Builder mutable partagé sans reset
- build() partiel non validé

## À retenir

- API fluent
- build() final
- Validation à la fin

## Exercices

1. Ajoute une méthode orderBy(field: string) qui retourne this.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   orderBy(field: string) {
     // ...
     return this;
   }
   ```
   :::

## Questions d'entretien

1. Builder vs constructeur avec beaucoup de params ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le builder clarifie les options optionnelles, permet un chaînage lisible et peut valider à `build()`. Un constructeur géant devient vite illisible et fragile.
   :::
