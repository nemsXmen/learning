---
id: typescript-13-generics-avec-objets
title: Generics avec les objets
slug: generics-avec-objets
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-13-generics-avec-arrays]
skills: [generics]
tags: [typescript, generics, objects]
---

## Objectifs

- Paramétrer des formes d’objets
- Propager des types de propriétés
- Voir des patterns simples (box, response…)

## Introduction

Les objets génériques permettent de décrire des conteneurs et des enveloppes typés.

## Concept

```ts
function box<T>(value: T): { value: T } {
  return { value };
}

const b = box(42); // { value: number }
```

```ts
type ApiResponse<T> = {
  data: T;
  status: number;
};
```

## Exemple

```ts
function pickId<T extends { id: string }>(obj: T): string {
  return obj.id;
}
```

## Comment ça fonctionne

Le paramètre de type se place dans la structure de l’objet et est fixé à l’usage.

## Erreurs fréquentes

- Oublier de propager `T` dans toutes les positions nécessaires
- Utiliser `object` ou `any` à la place

## À retenir

- Objets génériques = conteneurs typés
- Très courant pour les réponses API, options, wrappers
- Combinable avec des contraintes (`extends`)

## Exercices

1. Crée un type `Container<T>` avec une propriété `item: T`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Container<T> = { item: T };
   ```
   :::

## Questions d'entretien

1. Donne un exemple d’objet générique utile.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `ApiResponse<T> = { data: T; status: number }` ou `Box<T> = { value: T }`. Le generic permet de réutiliser la même enveloppe pour différents types de contenu.
   :::
