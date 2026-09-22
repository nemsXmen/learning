---
id: typescript-41-contraintes-complexes
title: Contraintes complexes
slug: advanced-contraintes-complexes
technology: typescript
level: advanced
module: 41-advanced-generics
order: 1
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-16-abstraction]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Combiner plusieurs contraintes
- extends avec unions et intersections
- keyof et contraintes de clés

## Introduction

Les **contraintes complexes** limitent T à des formes utiles.

## Concept

```ts
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // ...
}

function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

type IdOf<T extends { id: string | number }> = T["id"];
```

## Exemple

`T extends Record<string, unknown>` pour objets indexables.

## Comment ça fonctionne

`extends` borne le paramètre. Plusieurs params peuvent se contraindre mutuellement (`K extends keyof T`).

## Erreurs fréquentes

- Contrainte trop large (T extends any)
- Contrainte trop étroite qui bloque l’usage

## À retenir

- extends
- keyof
- Contraintes croisées

## Exercices

1. Borne K pour qu’il soit une clé de T.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `K extends keyof T`
   :::

## Questions d'entretien

1. À quoi sert `K extends keyof T` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À garantir que K est une clé valide de T, ce qui permet d’indexer T[K] en toute sécurité et d’écrire des utilitaires comme pick/omit typés.
   :::
