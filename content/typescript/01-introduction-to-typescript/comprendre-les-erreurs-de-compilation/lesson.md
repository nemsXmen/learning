---
id: typescript-01-comprendre-les-erreurs-de-compilation
title: Comprendre les erreurs de compilation
slug: comprendre-les-erreurs-de-compilation
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 13
estimatedMinutes: 20
difficulty: 2
xp: 50
prerequisites: [typescript-01-annotations-de-types]
skills: [typescript-basics]
tags: [typescript, erreurs, debugging]
---

## Objectifs

- Lire et comprendre les messages d’erreur de `tsc`
- Distinguer les erreurs de types des erreurs de syntaxe
- Savoir où chercher l’origine d’une erreur
- Adopter une bonne attitude face aux erreurs TypeScript

## Introduction

Les erreurs de TypeScript font peur au début. Elles sont en réalité ton meilleur allié : elles te disent *exactement* où le contrat de types est cassé.

## Concept

Une erreur TypeScript ressemble généralement à :

```
src/index.ts:12:5 - error TS2322: Type 'string' is not assignable to type 'number'.

12   age = "trente";
       ~~~
```

Elle contient :

- Le fichier et la position (ligne:colonne)
- Un code d’erreur (`TS2322`)
- Un message en anglais clair
- Souvent un soulignement de la zone concernée

### Catégories courantes

- **Type non assignable** (`TS2322`)
- **Propriété inexistante** (`TS2339`)
- **Argument manquant ou en trop**
- **Variable utilisée avant d’être assignée**
- **any implicite** (en mode strict)

## Exemple

```ts
interface User {
  name: string;
}

const user: User = {
  name: "Alice",
  age: 30        // ❌ Object literal may only specify known properties
};
```

L’erreur te dit que `age` n’existe pas sur `User`.

## Comment ça fonctionne

Le compilateur construit un graphe de types et vérifie chaque affectation, chaque appel de fonction, chaque accès à propriété. Dès qu’une incompatibilité est trouvée, il émet une erreur diagnostique sans pour autant toujours arrêter tout le processus (sauf si `noEmitOnError` est activé).

## Erreurs fréquentes

- Lire seulement la première ligne et paniquer  
  Lis toujours le message complet et la position.

- Ajouter `as any` ou `@ts-ignore` pour « faire taire » l’erreur  
  C’est une dette technique.

- Ne pas regarder la *cause* (souvent quelques lignes au-dessus)

## À retenir

- Les erreurs TypeScript sont des informations, pas des punitions
- Elles pointent presque toujours vers un vrai problème de contrat
- Apprends à lire le code d’erreur et le message
- Résous la cause plutôt que de masquer le symptôme

## Exercices

1. Explique cette erreur :

```
Type 'null' is not assignable to type 'string'.
```

   :::solution
   On a essayé d’affecter `null` à une variable ou un paramètre qui est déclaré comme `string` (et `strictNullChecks` est actif).
   :::

## Questions d'entretien

1. Comment abordes-tu une erreur TypeScript que tu ne comprends pas immédiatement ?

   :::reponse
   Je lis le message complet, je regarde le fichier et la ligne indiqués, je vérifie les types des variables impliquées (via le hover de l’éditeur), et je cherche le code d’erreur TS si nécessaire. Je résous la cause racine plutôt que d’utiliser `any` ou `@ts-ignore`.
   :::
