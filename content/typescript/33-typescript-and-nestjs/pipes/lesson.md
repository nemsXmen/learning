---
id: typescript-33-pipes
title: Pipes
slug: pipes
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-decorators]
skills: [nestjs]
tags: [typescript, nestjs]
---

## Objectifs

- Comprendre les pipes Nest
- ValidationPipe
- Transformation d’input

## Introduction

Les **pipes** transforment et/ou valident les données avant le handler.

## Concept

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  })
);
```

```ts
@Get(":id")
findOne(@Param("id", ParseIntPipe) id: number) {
  return this.service.findOne(id);
}
```

## Exemple

`ParseUUIDPipe`, pipes custom `implements PipeTransform`.

## Comment ça fonctionne

Le pipe reçoit la valeur, peut la transformer (string → number) ou lever une exception si invalide.

## Erreurs fréquentes

- Pas de ValidationPipe global → DTO non validés
- transform: false alors qu’on attend des types natifs

## À retenir

- ValidationPipe + class-validator
- Parse* pipes
- whitelist

## Exercices

1. Applique ParseIntPipe sur un param id.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   @Param("id", ParseIntPipe) id: number
   ```
   :::

## Questions d'entretien

1. Que fait ValidationPipe avec un DTO class-validator ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il valide l’objet entrant selon les décorateurs du DTO, peut stripper les propriétés non déclarées (whitelist), et optionnellement transformer les payloads en instances de classe.
   :::
