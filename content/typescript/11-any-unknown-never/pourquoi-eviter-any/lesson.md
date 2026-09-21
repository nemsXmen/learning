---
id: typescript-11-pourquoi-eviter-any
title: Pourquoi éviter any
slug: pourquoi-eviter-any
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-11-comprendre-any]
skills: [any-unknown-never]
tags: [typescript, any]
---

## Objectifs

- Comprendre les coûts de `any`
- Voir les alternatives
- Adopter une posture « zero any » dans le code métier

## Introduction

Chaque `any` réduit la valeur de TypeScript : moins de sécurité, moins d’autocomplétion, bugs plus tardifs.

## Concept

Problèmes concrets :
- Erreurs déplacées vers le runtime
- Propagation (un any « contamine » souvent d’autres variables)
- Refactors plus risqués
- Documentation implicite perdue

```ts
// Fragile
function parse(data: any) {
  return data.items.map((i: any) => i.name);
}

// Plus sûr
function parse(data: { items: { name: string }[] }) {
  return data.items.map(i => i.name);
}
```

## Exemple

Préférer `unknown` + narrowing, des types précis, ou des schémas de validation (Zod, etc.).

## Comment ça fonctionne

L’équipe perd progressivement la confiance dans le type-checker si les `any` se multiplient.

## Erreurs fréquentes

- « Juste pour cette fois » qui devient permanent
- Typer les retours d’API en `any`

## À retenir

- `any` = dette technique de typage
- Alternatives : `unknown`, types précis, validation runtime
- Objectif : zéro `any` dans le code métier

## Exercices

1. Remplace un paramètre `any` par un type plus précis dans une petite fonction.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   // avant : function greet(user: any)
   function greet(user: { name: string }) {
     return `Hello ${user.name}`;
   }
   ```
   :::

## Questions d'entretien


1. Pourquoi évite-t-on `any` dans un projet TypeScript sérieux ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Parce qu’il désactive les garanties du compilateur, propage l’insécurité, réduit l’autocomplétion et repousse les erreurs au runtime. Des alternatives comme `unknown` ou des types précis existent.
   :::

