---
id: typescript-24-barrel-files
title: Barrel files
slug: barrel-files
technology: typescript
level: intermediate
module: 24-modules
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-24-import-type]
skills: [modules]
tags: [typescript, modules]
---

## Objectifs

- Comprendre les barrel files (`index.ts`)
- Les utiliser pour une API publique
- Connaître leurs limites

## Introduction

Un **barrel** ré-exporte les symboles d’un dossier via un `index.ts`.

## Concept

```ts
// components/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Modal } from "./Modal";

// usage
import { Button, Input } from "./components";
```

## Exemple

Utile pour stabiliser l’API d’un package ou d’un dossier feature.

## Comment ça fonctionne

Les consommateurs importent depuis le dossier ; le barrel route vers les fichiers réels.

## Erreurs fréquentes

- Barrels massifs → cycles, lenteur IDE, tree-shaking dégradé
- Ré-exporter des détails internes

## À retenir

- Barrel = façade
- API publique seulement
- Éviter les mega-barrels

## Exercices

1. Crée un barrel qui ré-exporte `add` et `sub` depuis math.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   export { add, sub } from "./math";
   ```
   :::

## Questions d'entretien

1. Quels sont les avantages et inconvénients des barrel files ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avantages : imports courts, API publique claire. Inconvénients : risque de cycles, moins bon tree-shaking, ralentissement des outils si les barrels sont trop gros ou trop profonds.
   :::
