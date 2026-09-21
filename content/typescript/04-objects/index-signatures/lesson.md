---
id: typescript-04-index-signatures
title: Index signatures
slug: index-signatures
technology: typescript
level: beginner
module: 04-objects
order: 6
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-04-objets-imbriques]
skills: [objects]
tags: [typescript, objects, index-signature]
---

## Objectifs

- Comprendre les index signatures
- Typer des objets à clés dynamiques
- Connaître les contraintes (clés string/number/symbol)

## Introduction

Parfois on ne connaît pas à l’avance les noms des propriétés. Les index signatures permettent de décrire ce cas.

## Concept

```ts
type StringMap = {
  [key: string]: string;
};

const dict: StringMap = {
  hello: "bonjour",
  world: "monde"
};

dict["foo"] = "bar"; // OK
```

On peut aussi contraindre les clés numériques :

```ts
type NumberDict = {
  [index: number]: string;
};
```

## Exemple

```ts
type Scores = {
  [player: string]: number;
};

const scores: Scores = {
  alice: 10,
  bob: 15
};
```

## Comment ça fonctionne

L’index signature dit : « toute propriété dont la clé est de ce type aura une valeur de tel type ». Les propriétés nommées explicites doivent être compatibles avec l’index signature.

## Erreurs fréquentes

- Oublier que toutes les propriétés (même nommées) doivent respecter l’index signature
- Utiliser une index signature trop large (`[key: string]: any`)
- Confondre avec les mapped types (plus avancés)

## À retenir

- `[key: string]: Type` = dictionnaire de clés string vers Type
- Utile pour les maps dynamiques
- Les propriétés explicites doivent être assignables à l’index signature

## Exercices

1. Crée un type pour un dictionnaire de nombres indexé par string.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   type NumberMap = {
     [key: string]: number;
   };
   ```
   :::

## Questions d'entretien


1. À quoi sert une index signature ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   À typer des objets dont les noms de propriétés ne sont pas connus à l’avance (dictionnaires, maps dynamiques). Elle indique le type des clés et le type des valeurs associées.
   :::

