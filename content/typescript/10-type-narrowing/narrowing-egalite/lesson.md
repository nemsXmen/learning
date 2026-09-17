---
id: typescript-10-narrowing-egalite
title: Narrowing par égalité
slug: narrowing-egalite
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-10-narrowing-in]
skills: [type-narrowing]
tags: [typescript, narrowing]
---

## Objectifs

- Utiliser les tests d’égalité pour narrow
- Narrow plusieurs variables en même temps
- Voir les cas `=== null` / `=== undefined`

## Introduction

Les comparaisons strictes (`===`, `!==`) permettent aussi le narrowing.

## Concept

```ts
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // x et y sont tous les deux string ici
    x.toUpperCase();
    y.toLowerCase();
  }
}
```

```ts
function print(value: string | null) {
  if (value !== null) {
    console.log(value.toUpperCase());
  }
}
```

## Exemple

```ts
function handle(status: "ok" | "error" | "pending") {
  if (status === "ok") {
    // status est "ok"
  }
}
```

## Comment ça fonctionne

TypeScript analyse les égalités et restreint les types des deux côtés quand c’est pertinent (égalité de littéraux, null/undefined, etc.).

## Erreurs fréquentes

- Utiliser `==` au lieu de `===` (moins précis)
- Oublier le cas `undefined` vs `null`

## À retenir

- `===` / `!==` participent au narrowing
- Très utile avec null, undefined et les littéraux
- Peut narrow plusieurs variables à la fois

## Exercices

1. Narrow une valeur `string | null | undefined` pour n’afficher que les strings non vides.

   :::solution
   ```ts
   function show(value: string | null | undefined) {
     if (value !== null && value !== undefined && value !== "") {
       console.log(value);
     }
   }
   ```
   :::

## Questions d'entretien

1. Comment le narrowing par égalité aide-t-il avec `null` et `undefined` ?

   :::reponse
   Les tests `value !== null` et `value != null` (ou des gardes équivalentes) permettent à TypeScript d’exclure null/undefined et d’autoriser les opérations sur le type restant.
   :::
