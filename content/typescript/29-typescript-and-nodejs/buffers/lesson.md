---
id: typescript-29-buffers
title: Buffers
slug: buffers
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-29-streams]
skills: [nodejs]
tags: [typescript, nodejs, buffer]
---

## Objectifs

- Comprendre le type `Buffer`
- Convertir Buffer ↔ string
- Voir les cas binaires

## Introduction

`Buffer` représente des données binaires en Node.

## Concept

```ts
const buf: Buffer = Buffer.from("hello", "utf8");
const s: string = buf.toString("utf8");
const slice: Buffer = buf.subarray(0, 2);
```

## Exemple

```ts
Buffer.alloc(16);
Buffer.concat([buf1, buf2]);
```

## Comment ça fonctionne

`Buffer` est typé dans `@types/node` (Uint8Array-like). Beaucoup d’APIs I/O acceptent ou retournent des Buffer.

## Erreurs fréquentes

- Traiter un Buffer comme string sans toString
- Encodings incorrects

## À retenir

- Buffer = binaire
- from / toString
- APIs fichier / réseau

## Exercices

1. Crée un Buffer depuis "abc" en utf8 puis reconvertis en string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const b = Buffer.from("abc", "utf8");
   const s = b.toString("utf8");
   ```
   :::

## Questions d'entretien

1. Buffer vs string en Node ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   string = texte (UTF-16 en JS). Buffer = séquence d’octets pour données binaires ou texte encodé. Les I/O brutes manipulent souvent des Buffer.
   :::
