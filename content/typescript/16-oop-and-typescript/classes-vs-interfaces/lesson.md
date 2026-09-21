---
id: typescript-16-classes-vs-interfaces
title: Classes vs interfaces
slug: classes-vs-interfaces
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-16-dependency-injection]
skills: [oop]
tags: [typescript, oop]
---

## Objectifs

- Savoir quand utiliser une classe ou une interface
- Éviter les classes anémiques inutiles
- Choisir selon comportement vs forme

## Introduction

Classes et interfaces se complètent : l’une porte le comportement runtime, l’autre le contrat de forme.

## Concept

| Besoin                         | Préférer        |
|--------------------------------|-----------------|
| Contrat de forme / API         | Interface       |
| Comportement + état runtime    | Classe          |
| Polymorphisme sans implémentation | Interface    |
| Factoriser du code concret     | Classe (abstraite) |

```ts
// Contrat
interface Clock {
  now(): Date;
}

// Implémentation
class SystemClock implements Clock {
  now() { return new Date(); }
}
```

## Exemple

Pour un DTO (données seules), un type/interface suffit souvent. Pour un service avec logique, une classe (ou des fonctions) est plus naturelle.

## Comment ça fonctionne

Les interfaces n’existent pas à runtime ; les classes si. Le choix impacte tests, DI et tree-shaking.

## Erreurs fréquentes

- Classe sans comportement (anémique) alors qu’un type suffisait
- Interface jamais implémentée autrement qu’une fois

## À retenir

- Interface = contrat
- Classe = comportement + état
- Ne pas créer de classe par habitude

## Exercices

1. Pour un simple `{ id: string; name: string }`, choisis interface/type ou classe et justifie.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Type ou interface : pas de comportement, pure forme de données.
   :::

## Questions d'entretien

1. Quand choisis-tu une interface plutôt qu’une classe en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Quand j’ai besoin d’un contrat de forme sans implémentation runtime : ports d’architecture, typage de DTOs, polymorphisme structurel. Une classe intervient quand il y a un comportement ou un état à encapsuler.
   :::
