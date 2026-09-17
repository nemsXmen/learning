---
id: typescript-02-never
title: never
slug: never
technology: typescript
level: beginner
module: 02-types-primitifs
order: 10
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-02-unknown]
skills: [primitive-types, any-unknown-never]
tags: [typescript, never, primitifs]
---

## Objectifs

- Comprendre le type `never`
- Savoir dans quels cas une expression a le type `never`
- L’utiliser pour l’exhaustivité (discriminated unions)
- Distinguer `never` de `void`

## Introduction

`never` représente des valeurs qui **n’arrivent jamais**. C’est le type bottom : aucun valeur n’est de type `never`.

## Concept

Cas typiques où TypeScript infère `never` :

1. Fonction qui ne retourne jamais (throw ou boucle infinie)

```ts
function fail(message: string): never {
  throw new Error(message);
}
```

2. Branches impossibles après un narrowing exhaustif

```ts
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}
```

## Exemple – exhaustiveness check

```ts
type Shape = "circle" | "square";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 10 * 10;
    case "square":
      return 10 * 10;
    default:
      return assertNever(shape); // si on oublie un cas, erreur de compilation
  }
}
```

Si tu ajoutes `"triangle"` à `Shape` sans gérer le cas, TypeScript errora sur `assertNever`.

## Comment ça fonctionne

`never` est assignable à tous les types (c’est le sous-type de tout), mais rien n’est assignable à `never` (sauf `never` lui-même).

## Erreurs fréquentes

- Confondre `never` et `void`
- Utiliser `never` là où `void` suffit
- Oublier le `default` + `assertNever` dans les switch sur unions

## À retenir

- `never` = ce qui n’arrive jamais
- Utile pour les fonctions qui throw ou bouclent à l’infini
- Très puissant pour vérifier l’exhaustivité des unions
- Différent de `void` (qui signifie « pas de valeur de retour utile »)

## Exercices

1. Écris une fonction `throwError(msg: string): never`.

   :::solution
   ```ts
   function throwError(msg: string): never {
     throw new Error(msg);
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre `never` et `void` ?

   :::reponse
   `void` signifie qu’une fonction ne retourne pas de valeur utile (elle peut implicitement retourner undefined). `never` signifie que la fonction ne retourne *jamais* : elle throw ou ne se termine pas. `never` est aussi utilisé pour l’exhaustivité des unions.
   :::
