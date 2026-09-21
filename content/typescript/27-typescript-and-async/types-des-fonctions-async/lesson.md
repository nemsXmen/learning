---
id: typescript-27-types-des-fonctions-async
title: Types des fonctions async
slug: types-des-fonctions-async
technology: typescript
level: intermediate
module: 27-typescript-and-async
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-27-promise-t]
skills: [async]
tags: [typescript, async]
---

## Objectifs

- Annoter le retour des fonctions async
- Voir l’inférence automatique
- Typer les paramètres normalement

## Introduction

Une fonction `async` a toujours un type de retour `Promise<...>`.

## Concept

```ts
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/users/${id}`);
  // ...
  return user;
}

// Inférence
async function getId() {
  return "abc"; // Promise<string>
}
```

## Exemple

```ts
type Loader = () => Promise<string>;
const load: Loader = async () => "data";
```

## Comment ça fonctionne

Même si tu `return` un `T`, TypeScript enveloppe en `Promise<T>`. Retourner explicitement une Promise est aussi possible.

## Erreurs fréquentes

- Annoter `: User` au lieu de `: Promise<User>`
- Oublier async alors qu’on await

## À retenir

- async ⇒ Promise retour
- Annoter Promise<T>
- Paramètres = types synchrones

## Exercices

1. Écris async function double(n: number): Promise<number>.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   async function double(n: number): Promise<number> {
     return n * 2;
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi une async function ne peut-elle pas avoir un type de retour non-Promise ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que par définition elle retourne toujours une Promise. TypeScript enveloppe le type de la valeur retournée dans Promise<T>.
   :::
