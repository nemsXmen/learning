---
id: typescript-38-decorator
title: Decorator
slug: decorator
technology: typescript
level: intermediate
module: 38-design-patterns
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-specification]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Ajouter des responsabilités sans modifier la classe
- Typer le wrapping
- Différencier du décorateur TS syntaxique

## Introduction

Le pattern **Decorator** enveloppe un objet pour enrichir son comportement.

## Concept

```ts
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(message);
  }
}

class TimestampLogger implements Logger {
  constructor(private inner: Logger) {}
  log(message: string) {
    this.inner.log(`${new Date().toISOString()} ${message}`);
  }
}
```

## Exemple

Ne pas confondre avec les **decorators TypeScript** (`@Injectable`) — même nom, concepts différents.

## Comment ça fonctionne

Même interface, délégation + comportement ajouté. Composition multiple possible.

## Erreurs fréquentes

- Decorator pattern vs @decorator syntax
- Ordre de wrapping non maîtrisé

## À retenir

- Même interface
- Composition
- ≠ syntaxe @decorator

## Exercices

1. Wrappe un Logger avec un préfixe "[APP]".

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class PrefixLogger implements Logger {
     constructor(private inner: Logger, private prefix: string) {}
     log(m: string) { this.inner.log(`${this.prefix} ${m}`); }
   }
   ```
   :::

## Questions d'entretien

1. Decorator pattern vs décorateurs TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le pattern structurel enveloppe des objets à runtime pour ajouter du comportement. Les décorateurs TS sont une syntaxe de métadonnées/transformations à la déclaration (souvent compile-time / reflection).
   :::
