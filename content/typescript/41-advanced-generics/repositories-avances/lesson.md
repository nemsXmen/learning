---
id: typescript-41-repositories-avances
title: Repositories avancés
slug: repositories-avances
technology: typescript
level: advanced
module: 41-advanced-generics
order: 12
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-builders-types]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Repository générique typé
- Clés et entités
- Contraintes d’identifiant

## Introduction

Les **repositories génériques** factorisent CRUD tout en restant typés.

## Concept

```ts
interface Entity {
  id: string;
}

interface Repository<T extends Entity> {
  findById(id: T["id"]): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: T["id"]): Promise<void>;
}

class InMemoryRepo<T extends Entity> implements Repository<T> {
  private map = new Map<T["id"], T>();
  async findById(id: T["id"]) {
    return this.map.get(id) ?? null;
  }
  async save(entity: T) {
    this.map.set(entity.id, entity);
  }
  async delete(id: T["id"]) {
    this.map.delete(id);
  }
}
```

## Exemple

Spécialisations : UserRepository extends Repository\<User\>.

## Comment ça fonctionne

`T extends Entity` garantit `id`. `T["id"]` propage le type d’identifiant.

## Erreurs fréquentes

- id: any
- Repo générique trop abstrait pour le domaine

## À retenir

- T extends Entity
- T["id"]
- Spécialisations métier

## Exercices

1. Pourquoi T extends Entity ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour garantir la présence de id et typer find/delete.
   :::

## Questions d'entretien

1. Comment types-tu un repository générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec `T extends { id: ... }`, des méthodes en `T` / `T["id"]`, et des implémentations (mémoire, SQL) qui respectent cette interface.
   :::
