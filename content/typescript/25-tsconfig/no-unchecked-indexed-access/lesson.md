---
id: typescript-25-no-unchecked-indexed-access
title: noUncheckedIndexedAccess
slug: no-unchecked-indexed-access
technology: typescript
level: intermediate
module: 25-tsconfig
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-25-strict-null-checks]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Comprendre `noUncheckedIndexedAccess`
- Typer les accès indexés comme potentiellement undefined
- Sécuriser tableaux et objets indexés

## Introduction

Avec cette option, `arr[i]` et `obj[key]` incluent `undefined` dans le type.

## Concept

```ts
const arr = [1, 2, 3];
const x = arr[10];
// number | undefined  (si noUncheckedIndexedAccess)
```

```ts
const map: Record<string, number> = {};
const v = map["missing"]; // number | undefined
```

## Exemple

Force à gérer l’absence avant usage.

## Comment ça fonctionne

Les index signatures et accès numériques ne garantissent plus la présence d’une valeur.

## Erreurs fréquentes

- Assertir systématiquement sans check
- Désactiver l’option face à trop d’erreurs plutôt que de corriger

## À retenir

- Accès indexé → T | undefined
- Checks avant usage
- Option stricte recommandée pour code critique

## Exercices

1. Accède à arr[0] sous noUncheckedIndexedAccess en gérant undefined.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const first = arr[0];
   if (first !== undefined) console.log(first);
   ```
   :::

## Questions d'entretien

1. Que change `noUncheckedIndexedAccess` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les accès par index (`arr[i]`, `obj[key]`) sont typés comme pouvant être `undefined`, forçant une vérification avant utilisation.
   :::
