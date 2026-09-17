---
id: typescript-12-membres-d-enum
title: Membres d’enum
slug: membres-d-enum
technology: typescript
level: intermediate
module: 12-enums
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-12-const-enum]
skills: [enums]
tags: [typescript, enums]
---

## Objectifs

- Accéder aux membres d’un enum
- Typer des variables avec l’enum
- Voir les membres calculés

## Introduction

Les membres d’enum s’utilisent comme des constantes nommées.

## Concept

```ts
enum Status {
  Idle,
  Loading,
  Success,
  Error
}

function setStatus(s: Status) {
  // ...
}

setStatus(Status.Loading);
```

Membres calculés (numeric enums) :

```ts
enum FileAccess {
  None,
  Read = 1 << 1,
  Write = 1 << 2,
  ReadWrite = Read | Write
}
```

## Exemple

```ts
const current: Status = Status.Idle;
```

## Comment ça fonctionne

Chaque membre est une propriété de l’objet enum (sauf const enum). Le type `Status` n’accepte que les valeurs de l’enum.

## Erreurs fréquentes

- Assigner un number arbitraire à un numeric enum (parfois autorisé selon la config)
- Utiliser des expressions non constantes dans certains contextes

## À retenir

- `Enum.Member` pour accéder aux valeurs
- Le type enum restreint les valeurs acceptées
- Membres calculés possibles (numeric)

## Exercices

1. Utilise un enum `Mode` avec On / Off dans une signature de fonction.

   :::solution
   ```ts
   enum Mode { On, Off }
   function setMode(m: Mode) {}
   setMode(Mode.On);
   ```
   :::

## Questions d'entretien

1. Peut-on avoir des membres calculés dans un enum ?

   :::reponse
   Oui, principalement dans les numeric enums, avec des expressions constantes (décalages de bits, références à d’autres membres, etc.).
   :::
