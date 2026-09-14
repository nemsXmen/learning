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

   :::indice
   Le type des éléments doit venir de l'argument : c'est un paramètre de type.
   :::

   :::indice
   Un tableau peut être vide : le type de retour doit l'avouer.
   :::

   :::solution
   ```ts
   function dernier<T>(liste: readonly T[]): T | undefined {
     return liste[liste.length - 1];
   }

   const n = dernier([1, 2]); // number | undefined
   ```
   :::

2. Écris `regrouperPar<T, K extends keyof T>` renvoyant un `Map` correctement typé.

   :::indice
   La clé du `Map` a le type de la propriété choisie : `T[K]`.
   :::

   :::indice
   Chaque valeur du `Map` est un tableau d'éléments de type `T`.
   :::

   :::solution
   ```ts
   function regrouperPar<T, K extends keyof T>(liste: readonly T[], cle: K): Map<T[K], T[]> {
     const groupes = new Map<T[K], T[]>();
     for (const element of liste) {
       const valeur = element[cle];
       const groupe = groupes.get(valeur);
       if (groupe) groupe.push(element);
       else groupes.set(valeur, [element]);
     }
     return groupes;
   }

   const parNiveau = regrouperPar(
     [
       { nom: 'Ada', niveau: 'expert' },
       { nom: 'Linus', niveau: 'avancé' },
     ],
     'niveau',
   );
   // Map<string, { nom: string; niveau: string }[]>
   ```
   :::

3. Trouve le générique fantôme dans une signature donnée et remplace-le.

   :::indice
   Un paramètre de type qui n'apparaît qu'une seule fois ne relie rien : il ne
   contraint aucune autre position.
   :::

   :::solution
   ```ts
   // Avant : T n'apparaît qu'une fois, il ne relie aucune entrée à aucune sortie
   function afficherAvant<T>(valeur: T): void {
     console.log(valeur);
   }

   // Après : même comportement, sans paramètre inutile
   function afficher(valeur: unknown): void {
     console.log(valeur);
   }
   ```
   :::

## Questions d'entretien

- À quoi sert un générique que `any` ne saurait pas exprimer ?

  :::indice
  Compare le type de `identite(42)` écrit avec `any`, puis avec un générique.
  :::

  :::reponse
  Un générique relie des types : `function identite<T>(x: T): T` garantit que la
  sortie a le type de l'entrée, donc `identite(42)` est un `number`. Avec `any`, le lien
  est perdu : la sortie est `any`, et TypeScript cesse de vérifier tout ce qui en
  découle.
  :::

- Que change `T extends { id: string }` pour le corps de la fonction ?

  :::indice
  Qu'as-tu le droit d'écrire avec une valeur de type `T` sans aucune contrainte ?
  :::

  :::reponse
  Sans contrainte, `T` peut être n'importe quoi : le corps ne peut lire aucune
  propriété. Avec `T extends { id: string }`, il peut lire `valeur.id` comme une
  `string`, et l'appelant ne peut passer que des valeurs qui ont un `id` de ce type. Si
  la fonction renvoie `T`, l'appelant récupère son type complet, pas seulement
  `{ id: string }`.
  :::

- Comment reconnaître un paramètre de type inutile dans une signature ?

  :::indice
  Compte combien de fois chaque paramètre de type apparaît dans la signature.
  :::

  :::reponse
  Un paramètre de type utile relie au moins deux positions : deux paramètres, ou un
  paramètre et le retour. S'il n'apparaît qu'une fois, il ne contraint rien et se
  remplace par sa contrainte ou par `unknown`. Exemple :
  `function longueur<T extends { length: number }>(x: T): number` s'écrit simplement
  `function longueur(x: { length: number }): number`.
  :::
