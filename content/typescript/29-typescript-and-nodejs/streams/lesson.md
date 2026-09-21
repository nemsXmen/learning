---
id: typescript-29-streams
title: Streams
slug: streams
technology: typescript
level: intermediate
module: 29-typescript-and-nodejs
order: 7
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-29-http]
skills: [nodejs]
tags: [typescript, nodejs, streams]
---

## Objectifs

- Connaître Readable / Writable / Duplex
- Voir le typage de base des streams
- Cas d’usage (fichiers, HTTP)

## Introduction

Les **streams** Node permettent de traiter des données par morceaux.

## Concept

```ts
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";

await pipeline(
  createReadStream("in.txt"),
  createWriteStream("out.txt")
);
```

## Exemple

```ts
import { Readable } from "stream";
const r = Readable.from(["a", "b", "c"]);
```

## Comment ça fonctionne

Les types (`Readable`, `Writable`, `Transform`) décrivent les méthodes `pipe`, events `data`/`end`/`error`. Les variants objet / buffer existent.

## Erreurs fréquentes

- Oublier la gestion d’erreur sur les streams
- Charger tout en mémoire alors qu’un stream suffirait

## À retenir

- Readable / Writable
- pipeline promisifié
- Efficace pour gros volumes

## Exercices

1. Cite deux types de streams Node.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Readable et Writable (aussi Duplex, Transform).
   :::

## Questions d'entretien

1. Quand utiliser un stream plutôt que readFile ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour de gros fichiers ou des flux continus : traiter par chunks sans tout charger en mémoire, avec backpressure.
   :::
