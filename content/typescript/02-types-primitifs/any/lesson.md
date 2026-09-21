---
id: typescript-02-any
title: any
slug: any
technology: typescript
level: beginner
module: 02-types-primitifs
order: 8
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-02-symbol]
skills: [primitive-types, any-unknown-never]
tags: [typescript, any, primitifs]
---

## Objectifs

- Comprendre ce qu’est le type `any`
- Savoir pourquoi il désactive le type-checking
- Connaître les cas où on peut (rarement) l’utiliser
- Préférer des alternatives plus sûres

## Introduction

`any` est le type qui dit à TypeScript : « ne vérifie plus rien sur cette valeur ».

## Concept

```ts
let value: any = 42;
value = "hello";
value = { x: 1 };
value.foo.bar.baz; // aucune erreur !
```

Dès qu’une valeur est `any`, TypeScript arrête de la contrôler. Tu perds tous les bénéfices du typage.

### Quand apparaît `any` ?

- Annotation explicite `: any`
- Inférence quand le mode strict n’est pas activé et qu’il n’y a pas assez de contexte
- Certaines valeurs venant de JavaScript non typé

## Exemple

```ts
function log(value: any) {
  console.log(value);
}

// Pratique à court terme, dangereux à long terme
```

## Comment ça fonctionne

`any` est compatible avec tout et tout est compatible avec `any`. C’est une échappatoire totale du système de types.

## Erreurs fréquentes

- Utiliser `any` par paresse au lieu de typer correctement
- Laisser des `any` se propager dans tout le codebase
- Croire que `any` est inoffensif

## À retenir

- `any` désactive le type-checking
- À éviter le plus possible
- Préférer `unknown` quand on ne connaît pas encore le type
- En mode `strict` + `noImplicitAny`, TypeScript te force à être explicite

## Exercices

1. Pourquoi ce code ne produit-il aucune erreur alors qu’il est dangereux ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

```ts
let data: any = "hello";
console.log(data.toFixed(2));
```

   :::solution
   Parce que `any` désactive toutes les vérifications. `toFixed` n’existe pas sur string, mais TypeScript ne dit rien.
   :::

## Questions d'entretien


1. Pourquoi considère-t-on généralement `any` comme une mauvaise pratique ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Parce qu’il désactive complètement le type-checking pour la valeur concernée. Les erreurs qui auraient été attrapées à la compilation ne le sont plus et risquent d’apparaître à runtime. On préfère `unknown` ou des types précis.
   :::

