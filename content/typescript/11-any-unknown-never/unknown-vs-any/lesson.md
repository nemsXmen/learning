---
id: typescript-11-unknown-vs-any
title: unknown vs any
slug: unknown-vs-any
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-11-narrowing-de-unknown]
skills: [any-unknown-never]
tags: [typescript, unknown, any]
---

## Objectifs

- Comparer clairement `unknown` et `any`
- Savoir lequel choisir
- Adopter `unknown` par défaut pour l’inconnu

## Introduction

Les deux représentent l’incertitude, mais l’un est sûr et l’autre non.

## Concept

|                | any                          | unknown                        |
|----------------|------------------------------|--------------------------------|
| Assignable depuis tout | Oui                     | Oui                            |
| Assignable vers tout   | Oui                     | Non (sauf any/unknown)         |
| Usage libre            | Oui                     | Non (narrowing requis)         |
| Sécurité               | Aucune                  | Préservée                      |
| Autocomplétion         | Trompeuse               | Après narrowing                |

```ts
let a: any = 42;
a.foo(); // OK compile

let u: unknown = 42;
// u.foo(); // ❌
```

## Exemple

```ts
// Préférer
function parse(input: string): unknown {
  return JSON.parse(input);
}

// Éviter
function parseBad(input: string): any {
  return JSON.parse(input);
}
```

## Comment ça fonctionne

`unknown` force la discipline ; `any` l’abandonne.

## Erreurs fréquentes

- Choisir `any` par habitude
- Caster `unknown` trop tôt

## À retenir

- Inconnu + sécurité → `unknown`
- `any` uniquement en dernier recours (migration, interop difficile)
- Par défaut : `unknown`

## Exercices

1. Remplace un retour `any` par `unknown` et ajoute un narrowing.

   :::solution
   ```ts
   function load(): unknown {
     return JSON.parse("{}");
   }
   const data = load();
   if (typeof data === "object" && data !== null) {
     // ...
   }
   ```
   :::

## Questions d'entretien

1. Quand choisir `unknown` plutôt que `any` ?

   :::reponse
   Dès que possible. `unknown` conserve la sécurité en exigeant un narrowing ; `any` désactive le typage. On réserve `any` aux cas extrêmes (migration progressive, typings manquants difficiles).
   :::
