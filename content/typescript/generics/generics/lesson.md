---
id: typescript-generics
title: Génériques
slug: generics
technology: typescript
level: intermediate
module: generics
order: 1
estimatedMinutes: 35
difficulty: 3
xp: 120
prerequisites:
  - typescript-type-inference
skills:
  - generics
  - type-constraints
tags:
  - typescript
  - generics
---

## Objectifs

- Écrire une fonction générique qui préserve le type de son entrée.
- Contraindre un paramètre de type avec `extends`.
- Reconnaître un générique inutile et le supprimer.

## Introduction

Un générique n'est pas un type : c'est un **paramètre de type**, comme un paramètre de
fonction mais résolu à la compilation. Il existe pour une seule raison : exprimer une
relation entre une entrée et une sortie que `any` détruirait et qu'une union ne
saurait pas dire.

## Concept

Compare trois signatures pour la même fonction :

```ts
function premier1(liste: any[]): any {}            // le type est perdu
function premier2(liste: unknown[]): unknown {}    // sûr, mais inutilisable
function premier3<T>(liste: T[]): T | undefined {} // la relation est conservée
```

Seule la troisième dit quelque chose de vrai : *le type renvoyé est celui des éléments
reçus*. Le paramètre `T` n'est pas une valeur, c'est un trou que l'appelant remplit —
le plus souvent sans avoir à l'écrire, grâce à l'inférence.

## Exemple

```ts
function premier<T>(liste: readonly T[]): T | undefined {
  return liste[0];
}

const n = premier([1, 2, 3]);       // number | undefined
const s = premier(['a', 'b']);      // string | undefined

// `extends` contraint ce que T peut être
function parId<T extends { id: string }>(elements: T[], id: string): T | undefined {
  return elements.find((element) => element.id === id);
}

parId([{ id: 'a', nom: 'Ada' }], 'a'); // { id: string; nom: string } | undefined
```

`parId` accède à `.id` : sans la contrainte, le compilateur refuserait, puisque `T`
pourrait être n'importe quoi.

## Comment ça fonctionne

À l'appel, TypeScript infère `T` depuis les arguments, puis vérifie la contrainte
`extends`. Le générique disparaît ensuite complètement : rien n'existe à l'exécution,
aucun code n'est généré. Un générique est un raisonnement du compilateur, pas une
structure.

La contrainte a un second effet, souvent ignoré : elle définit ce que le corps de la
fonction a le droit de faire avec `T`. Sans contrainte, `T` n'offre rien ; avec
`T extends { id: string }`, `.id` devient lisible.

```ts
function cle<T, K extends keyof T>(objet: T, cle: K): T[K] {
  return objet[cle];
}

const utilisateur = { nom: 'Ada', age: 36 };
cle(utilisateur, 'nom'); // string
cle(utilisateur, 'age'); // number
// cle(utilisateur, 'x'); // erreur : 'x' n'est pas une clé
```

Ici deux paramètres de type coopèrent : `K` est contraint par `T`, et le retour `T[K]`
est calculé à partir des deux.

## Erreurs fréquentes

**Le générique fantôme.** Si un paramètre de type n'apparaît qu'une fois, il ne relie
rien et devrait être un type ordinaire :

```ts
function afficher<T>(valeur: T): void {}      // T ne sert à rien
function afficher(valeur: unknown): void {}   // équivalent, plus clair
```

**Contraindre trop tard.** Écrire `T` puis caster dans le corps annule la sécurité que
le générique était censé apporter. La contrainte se met dans la signature.

**Confondre `extends` en générique et en type conditionnel.** Ici `extends` veut dire
« doit être au moins » ; dans `A extends B ? X : Y`, il pose une question.

## À retenir

- Un générique exprime une **relation** entre types, sinon il est inutile.
- L'inférence dispense presque toujours d'écrire `T` à l'appel.
- `extends` restreint `T` et débloque ce que le corps peut en faire.
- Un paramètre de type utilisé une seule fois est un signal de suppression.

## Exercices

1. Type `dernier(liste)` de sorte que `dernier([1, 2])` soit `number | undefined`.
2. Écris `regrouperPar<T, K extends keyof T>` renvoyant un `Map` correctement typé.
3. Trouve le générique fantôme dans une signature donnée et remplace-le.

## Questions d'entretien

- À quoi sert un générique que `any` ne saurait pas exprimer ?
- Que change `T extends { id: string }` pour le corps de la fonction ?
- Comment reconnaître un paramètre de type inutile dans une signature ?
