---
id: typescript-27-gestion-typee-des-erreurs
title: Gestion typée des erreurs
slug: gestion-typee-des-erreurs
technology: typescript
level: intermediate
module: 27-typescript-and-async
order: 10
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-27-async-generators]
skills: [async]
tags: [typescript, async, errors]
---

## Objectifs

- Gérer les erreurs async de façon typée
- Utiliser unknown dans catch
- Patterns Result / neverthrow

## Introduction

Les rejets de Promise et les throw async restent des zones faibles du typage natif.

## Concept

```ts
try {
  await doWork();
} catch (e: unknown) {
  if (e instanceof Error) {
    console.error(e.message);
  } else {
    console.error("Unknown error", e);
  }
}
```

Pattern Result :

```ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function load(): Promise<Result<User>> {
  try {
    return { ok: true, value: await fetchUser() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
}
```

## Exemple

Libs : neverthrow, ts-results, Zod safeParse.

## Comment ça fonctionne

`useUnknownInCatchVariables` (strict) type `e` en unknown. Les Result évitent les throw pour le contrôle de flux.

## Erreurs fréquentes

- catch (e) et e.message sans check
- Avaler les erreurs sans typage

## À retenir

- catch → unknown
- instanceof / type guards
- Result pour flux explicite
- Erreurs métier typées

## Exercices

1. Narrow e: unknown en Error dans un catch.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   catch (e: unknown) {
     if (e instanceof Error) console.log(e.message);
   }
   ```
   :::

## Questions d'entretien

1. Comment gères-tu le typage des erreurs dans du code async TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En typant le catch en unknown, en narrowing (instanceof Error, custom guards), et parfois en adoptant un type Result pour rendre succès/échec explicites sans dépendre uniquement des throw.
   :::
