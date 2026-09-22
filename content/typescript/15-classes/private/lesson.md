---
id: typescript-15-private
title: private
slug: private
technology: typescript
level: intermediate
module: 15-classes
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-15-public]
skills: [classes]
tags: [typescript, classes, visibility]
---

## Objectifs

- Utiliser `private` pour l’encapsulation
- Comprendre la différence avec les private fields `#`
- Voir les limites (compilation vs runtime)

## Introduction

`private` restreint l’accès au membre à l’intérieur de la classe.

## Concept

```ts
class BankAccount {
  private balance: number = 0;

  deposit(amount: number) {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}

const a = new BankAccount();
a.deposit(100);
// a.balance; // ❌ Error: private
```

## Exemple – private ECMAScript

```ts
class Secret {
  #value = 42; // vraiment privé à runtime
  reveal() {
    return this.#value;
  }
}
```



## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

Le `private` TypeScript est effacé à la compilation (contrôle de types uniquement). Les champs `#` sont privés au niveau du runtime JavaScript.

## Erreurs fréquentes

- Croire que `private` protège à runtime contre un accès malveillant
- Accéder à un membre private depuis une sous-classe (utiliser `protected`)

## À retenir

- `private` = visible uniquement dans la classe (type-checker)
- `#field` = privé runtime natif
- Base de l’encapsulation

## Exercices

1. Rends la propriété `password` private dans une classe User.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class User {
     constructor(private password: string) {}
   }
   ```
   :::

## Questions d'entretien

1. `private` TypeScript protège-t-il à runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non. C’est une contrainte du compilateur. Pour une vraie privatisation runtime, utiliser les private fields `#`.
   :::
