---
id: typescript-13-valeurs-par-defaut
title: Valeurs par défaut
slug: valeurs-par-defaut
technology: typescript
level: intermediate
module: 13-generics-fundamentals
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-13-plusieurs-parametres-generiques]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Donner des valeurs par défaut aux paramètres de type
- Savoir quand c’est utile
- Respecter les règles d’ordre

## Introduction

Comme les paramètres de fonction, les paramètres de type peuvent avoir une valeur par défaut.

## Concept

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

type SimpleResult = Result<string>;
// équivalent à Result<string, Error>

type CustomResult = Result<string, string>;
```

```ts
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}
```

## Exemple

```ts
interface Response<T = unknown> {
  data: T;
  status: number;
}
```

## Comment ça fonctionne

Si le paramètre n’est pas fourni (ni inféré), la valeur par défaut est utilisée. Les paramètres avec défaut doivent être après ceux sans défaut.

## Erreurs fréquentes

- Placer un paramètre sans défaut après un paramètre avec défaut
- Abuser des défauts trop larges (`any`, `unknown` partout)

## À retenir

- `T = DefaultType`
- Utile pour les APIs ergonomiques
- Ordre : sans défaut puis avec défaut

## Exercices

1. Crée un type `Box<T = unknown>` avec `value: T`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Box<T = unknown> = { value: T };
   ```
   :::

## Questions d'entretien

1. Peut-on donner une valeur par défaut à un paramètre de type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Oui, avec la syntaxe `T = DefaultType`. Le défaut est utilisé si le type n’est ni fourni explicitement ni inféré. Les paramètres avec défaut doivent être placés après ceux sans défaut.
   :::
