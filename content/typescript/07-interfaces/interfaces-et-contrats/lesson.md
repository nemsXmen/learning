---
id: typescript-07-interfaces-et-contrats
title: Interfaces et contrats d'objets
slug: interfaces-et-contrats
technology: typescript
level: beginner
module: 07-interfaces
order: 1
estimatedMinutes: 20
difficulty: 2
xp: 50
prerequisites: [typescript-06-introduction-a-type]
skills: [interfaces]
tags: [typescript, interfaces, objets]
---

## Objectifs

- Déclarer une interface pour décrire un objet.
- Utiliser une interface comme contrat de fonction.
- Comprendre les propriétés optionnelles et readonly.

## Introduction

Une interface nomme la forme attendue d'un objet et rend ce contrat réutilisable entre plusieurs fonctions et modules.

## Concept

```ts
interface User {
  id: number;
  name: string;
  email?: string;
  readonly createdAt: Date;
}
```

Une interface décrit la structure attendue. Elle ne crée pas de valeur à runtime et peut être utilisée comme type de paramètre, de retour ou de variable.

## Exemple

```ts
function displayUser(user: User): string {
  return user.email ? `${user.name} <${user.email}>` : user.name;
}

const user: User = {
  id: 1,
  name: 'Ada',
  createdAt: new Date(),
};
```

## Comment ça fonctionne

TypeScript vérifie qu'un objet fourni respecte les propriétés obligatoires de l'interface et leurs types. Une propriété marquée `?` est facultative, tandis que `readonly` interdit sa réaffectation après création.

## Erreurs fréquentes

- Confondre une interface avec une classe instanciable.
- Oublier une propriété obligatoire.
- Utiliser `readonly` en pensant qu'il protège une valeur imbriquée à runtime.

## À retenir

- Une interface décrit un contrat de structure.
- Elle peut être réutilisée sur plusieurs frontières de code.
- Les interfaces sont effacées lors de la compilation.

## Exercices

1. Déclare une interface `Product` avec un `id` numérique, un `name` textuel et un prix numérique.

   :::indice
   Utilise une propriété par ligne et indique le type après `:`.
   :::

   :::solution
   ```ts
   interface Product {
     id: number;
     name: string;
     price: number;
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence principale entre une interface et un objet JavaScript ?

   :::indice
   Pense à la compilation et au rôle de description.
   :::

   :::reponse
   Une interface est un contrat de type vérifié par TypeScript et effacé à la compilation. Un objet JavaScript est une valeur concrète présente à runtime.
   :::
