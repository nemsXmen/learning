---
id: typescript-05-parametres-par-defaut
title: Paramètres par défaut
slug: parametres-par-defaut
technology: typescript
level: beginner
module: 05-functions
order: 4
estimatedMinutes: 12
difficulty: 1
xp: 40
prerequisites: [typescript-05-parametres-optionnels]
skills: [functions]
tags: [typescript, functions, default]
---

## Objectifs

- Utiliser des paramètres avec valeur par défaut
- Comprendre le lien avec l’optionalité
- Voir l’inférence de type à partir de la valeur par défaut

## Introduction

Une valeur par défaut rend le paramètre optionnel tout en fournissant un fallback.

## Concept

```ts
function greet(name: string, greeting = "Hello") {
  console.log(`${greeting}, ${name}`);
}

greet("Alice");           // Hello, Alice
greet("Alice", "Bonjour"); // Bonjour, Alice
```

TypeScript infère le type de `greeting` à partir de la valeur par défaut (`string`).

On peut aussi annoter explicitement :

```ts
function greet(name: string, greeting: string = "Hello") { ... }
```

## Exemple

```ts
function createElement(tag = "div", className = "") {
  // ...
}
```

## Comment ça fonctionne

Un paramètre avec valeur par défaut est automatiquement optionnel à l’appel. La valeur par défaut n’est utilisée que si l’argument est `undefined` (pas si on passe explicitement une autre valeur).

## Erreurs fréquentes

- Confondre `= value` et `?: Type`
- Mettre une valeur par défaut incompatible avec le type annoté

## À retenir

- `param = value` → optionnel + fallback
- Le type peut être inféré depuis la valeur par défaut
- Très courant pour les options de configuration

## Exercices

1. Écris une fonction `power` avec un exposant par défaut à 2.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function power(base: number, exp = 2): number {
     return base ** exp;
   }
   ```
   :::

## Questions d'entretien


1. Quelle est la différence entre un paramètre optionnel (`?`) et un paramètre avec valeur par défaut ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Les deux rendent le paramètre omissible. Avec `?` la valeur est `undefined` si omise. Avec une valeur par défaut, on obtient cette valeur au lieu de `undefined`.
   :::

