---
id: typescript-22-as
title: as
slug: as
technology: typescript
level: intermediate
module: 22-type-assertions
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [type-assertions]
tags: [typescript, assertions]
---

## Objectifs

- Utiliser l’assertion `as`
- Comprendre qu’elle force un type
- Voir les limites de sécurité

## Introduction

Une **assertion de type** (`as`) dit au compilateur de traiter une valeur comme un type donné.

## Concept

```ts
const value: unknown = "hello";
const str = value as string;
str.toUpperCase();
```

```ts
const el = document.getElementById("app") as HTMLDivElement;
```

## Exemple

```ts
type User = { id: number; name: string };
const data = JSON.parse('{"id":1,"name":"Alice"}') as User;
```

## Comment ça fonctionne

`as` n’effectue **aucune** vérification runtime. C’est une directive purement compile-time. TypeScript autorise l’assertion si les types se chevauchent suffisamment (ou via double assertion).

## Erreurs fréquentes

- Croire que `as` valide les données
- Masquer des bugs avec des assertions trop larges

## À retenir

- `value as Type`
- Aucune vérification runtime
- À utiliser avec parcimonie

## Exercices

1. Assert `unknown` vers `string` puis appelle `toUpperCase`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const v: unknown = "hi";
   const s = v as string;
   s.toUpperCase();
   ```
   :::

## Questions d'entretien

1. Une assertion `as` vérifie-t-elle quelque chose à runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non. C’est purement compile-time : le compilateur fait confiance au développeur. Aucune validation n’est générée dans le JavaScript.
   :::
