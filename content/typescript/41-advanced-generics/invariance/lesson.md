---
id: typescript-41-invariance
title: Invariance
slug: invariance
technology: typescript
level: advanced
module: 41-advanced-generics
order: 9
estimatedMinutes: 10
difficulty: 3
xp: 45
prerequisites: [typescript-41-contravariance]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Comprendre l’invariance
- Mutable boxes
- Pourquoi ni co ni contra

## Introduction

**Invariance** : aucune substitution de type arg n’est sûre dans les deux sens.

## Concept

```ts
type Box<T> = { value: T }; // lecture + écriture

// Box<Dog> n’est ni Box<Animal> ni l’inverse de façon sûre
```

## Exemple

Si Box\<Dog\> était Box\<Animal\>, on pourrait écrire un Cat.  
Si Box\<Animal\> était Box\<Dog\>, on pourrait lire un Animal non-Dog.

## Comment ça fonctionne

Dès qu’il y a **in et out**, le paramètre est invariant pour rester sûr.

## Erreurs fréquentes

- Forcer des casts entre Box\<T\> différents

## À retenir

- In + out = invariant
- Mutable
- Casts dangereux

## Exercices

1. Readonly\<Box\<T\>\> change-t-il la variance potentielle ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   En limitant l’écriture, on se rapproche d’une position covariante (lecture seule).
   :::

## Questions d'entretien

1. Pourquoi les conteneurs mutables sont-ils invariants ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce qu’ils exposent T en lecture et en écriture : la covariance autoriserait des écritures illégales, la contravariance des lectures illégales.
   :::
