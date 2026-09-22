---
id: typescript-14-generic-services
title: Generic services
slug: generic-services
technology: typescript
level: intermediate
module: 14-generics-advanced
order: 6
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-14-generic-repositories]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Appliquer les generics aux services métier
- Composer repositories et services typés
- Voir un exemple de service générique

## Introduction

Les services peuvent aussi être paramétrés pour mutualiser de la logique.

## Concept

```ts
class CrudService<T extends { id: string }> {
  constructor(private repo: Repository<T>) {}

  get(id: string) {
    return this.repo.findById(id);
  }

  async create(data: Omit<T, "id">) {
    return this.repo.create(data);
  }
}
```

## Exemple

```ts
const userService = new CrudService<User>(userRepo);
```

## Comment ça fonctionne

Le service hérite du paramètre de type du repository et expose une API métier typée.

## Erreurs fréquentes

- Dupliquer la logique CRUD pour chaque entité
- Perdre le type en remontant vers `any`

## À retenir

- Services génériques = logique partagée typée
- Composition naturelle avec Repository<T>
- Réduction de la duplication

## Exercices

1. Esquisse un service générique avec une méthode `list(): Promise<T[]>`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class ListService<T> {
     constructor(private repo: { findAll(): Promise<T[]> }) {}
     list() {
       return this.repo.findAll();
     }
   }
   ```
   :::

## Questions d'entretien

1. Quel bénéfice apportent les services génériques ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Ils factorisent la logique commune (CRUD, logging, cache…) tout en restant correctement typés pour chaque entité, évitant la duplication et les `any`.
   :::
