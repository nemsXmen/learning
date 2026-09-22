---
id: typescript-37-tests-derreurs
title: Tests d’erreurs
slug: tests-derreurs
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-37-tests-async]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Tester les throws
- Affiner le type d’erreur
- Messages et codes

## Introduction

Tester les **erreurs** fait partie du contrat d’une fonction.

## Concept

```ts
it("throws on invalid email", () => {
  expect(() => Email.parse("bad")).toThrow(ValidationError);
});

it("async not found", async () => {
  await expect(service.get("x")).rejects.toBeInstanceOf(NotFoundError);
});
```

## Exemple

Vérifier `error.code` si erreurs métier typées.

## Comment ça fonctionne

`toThrow` accepte constructeur, string, regex. Pour async : `rejects`.

## Erreurs fréquentes

- expect(fn()) au lieu de expect(() => fn())
- Ne tester que le message fragile

## À retenir

- expect(() => ...).toThrow
- Instance + code
- rejects pour async

## Exercices

1. Pourquoi expect(() => fn()) et pas expect(fn()) pour un throw sync ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Parce que fn() serait exécuté avant expect et ferait échouer le test hors assertion.
   :::

## Questions d'entretien

1. Comment testes-tu une erreur métier typée ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En assertant la classe (`toBeInstanceOf`) et éventuellement un `code` / propriétés stables, plutôt que seulement le message texte fragile.
   :::
