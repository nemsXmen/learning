---
id: typescript-04-typage-des-objets
title: Typage des objets
slug: typage-des-objets
technology: typescript
level: beginner
module: 04-objects
order: 1
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: [typescript-03-tableaux-types]
skills: [objects]
tags: [typescript, objects]
---

## Objectifs

- Typer un objet avec une annotation inline ou un type/interface
- Comprendre la structure de base d’un type objet
- Voir l’inférence sur les objets littéraux

## Introduction

Les objets sont au cœur de JavaScript. TypeScript permet de décrire précisément leur forme.

## Concept

### Annotation inline

```ts
const user: { name: string; age: number } = {
  name: "Alice",
  age: 30
};
```

### Avec un type alias ou une interface (recommandé dès que réutilisé)

```ts
type User = {
  name: string;
  age: number;
};

const user: User = { name: "Alice", age: 30 };
```

## Exemple

```ts
function printUser(user: { name: string; age: number }) {
  console.log(`${user.name} (${user.age} ans)`);
}
```

## Comment ça fonctionne

TypeScript vérifie que l’objet fourni possède au minimum les propriétés déclarées avec les bons types (structural typing).

## Erreurs fréquentes

- Oublier une propriété obligatoire
- Mettre un type incompatible sur une propriété
- Réutiliser la même forme inline au lieu de créer un type nommé

## À retenir

- `{ prop: Type }` décrit la forme d’un objet
- Préfère un `type` ou `interface` dès que la forme est réutilisée
- L’inférence fonctionne très bien sur les objets littéraux

## Exercices

1. Type un objet `product` avec `id: number` et `title: string`.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   const product: { id: number; title: string } = {
     id: 1,
     title: "Livre TypeScript"
   };
   ```
   :::

## Questions d'entretien


1. Comment type-t-on un objet en TypeScript ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Soit avec une annotation inline `{ prop: Type }`, soit plus proprement avec un `type` ou une `interface` nommée. TypeScript vérifie ensuite que les valeurs respectent cette forme (typage structurel).
   :::

