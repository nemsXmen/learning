---
id: javascript-generiques-et-types-utilitaires
title: "Génériques et types utilitaires"
slug: generiques-et-types-utilitaires
technology: javascript
level: advanced
module: javascript-vers-typescript
order: 3
estimatedMinutes: 50
difficulty: 4
xp: 110
prerequisites:
  - javascript-interfaces-alias-unions-et-retrecissement
skills:
  - js-ts-generics-utility
tags:
  - javascript
  - typescript
---

## Objectifs

- Écrire des fonctions et des types génériques, qui gardent le lien entre les types d'entrée et de sortie.
- Contraindre un paramètre de type avec `extends`, et utiliser `keyof` pour des clés sûres.
- Dériver des types à partir d'autres avec `Partial`, `Pick`, `Omit`, `Readonly`, `Record`, `ReturnType`, `Awaited`.
- Déduire des types de valeurs avec `typeof` et `as const`, pour n'avoir qu'une source de vérité.

## Introduction

Beaucoup de fonctions JavaScript sont écrites pour fonctionner avec n'importe quel type : `premier(tableau)`,
`grouperPar(elements, cle)`, `memoize(fonction)`, un dépôt en mémoire qui stocke des commandes ou des clients. Les typer
avec `any` ferait perdre toute l'information : le premier élément d'un tableau de commandes deviendrait « n'importe
quoi ». Les **génériques** permettent de dire « le même type qu'en entrée ».

Les **types utilitaires**, eux, évitent de réécrire dix variantes d'un même type : la commande, la commande sans son
identifiant pour la création, la commande partielle pour une mise à jour, la commande en lecture seule pour l'affichage.
On les dérive tous d'une seule définition.

## Concept

| Générique | Exemple | Sens |
| --- | --- | --- |
| fonction | `function premier<T>(t: readonly T[]): T \| undefined` | le résultat a le type des éléments |
| contrainte | `<T extends { id: string }>` | `T` doit au moins avoir un `id` |
| `keyof` | `<T, K extends keyof T>` | `K` est l'une des clés de `T` |
| type générique | `type Resultat<T> = { ok: true; valeur: T } \| { ok: false; erreur: string }` | un type paramétré |
| valeur par défaut | `<T = unknown>` | le type utilisé si rien n'est précisé |

| Type utilitaire | Produit |
| --- | --- |
| `Partial<T>` | toutes les propriétés facultatives |
| `Required<T>` | toutes les propriétés obligatoires |
| `Readonly<T>` | toutes les propriétés en lecture seule |
| `Pick<T, 'a' \| 'b'>` | seulement certaines propriétés |
| `Omit<T, 'id'>` | toutes sauf certaines |
| `Record<K, V>` | un objet de clés `K` et de valeurs `V` |
| `ReturnType<typeof f>`, `Parameters<typeof f>` | le retour, les paramètres d'une fonction |
| `Awaited<T>` | le type résolu d'une promesse |
| `NonNullable<T>` | `T` sans `null` ni `undefined` |

## Exemple

Un dépôt en mémoire générique, réutilisable pour n'importe quelle entité qui a un identifiant :

```ts
interface Produit {
  id: string;
  nom: string;
  prix: number;
  stock: number;
}

class DepotEnMemoire<T extends { id: string }> {
  #elements = new Map<string, T>();

  ajouter(element: T): T {
    this.#elements.set(element.id, element);
    return element;
  }

  parId(id: string): T | undefined {
    return this.#elements.get(id);
  }

  mettreAJour(id: string, modifications: Partial<Omit<T, 'id'>>): T {
    const actuel = this.#elements.get(id);
    if (!actuel) throw new Error(`Introuvable : ${id}`);
    const suivant = { ...actuel, ...modifications };
    this.#elements.set(id, suivant);
    return suivant;
  }

  trierPar<K extends keyof T>(cle: K): T[] {
    return [...this.#elements.values()].toSorted((a, b) => (a[cle] < b[cle] ? -1 : a[cle] > b[cle] ? 1 : 0));
  }
}

const produits = new DepotEnMemoire<Produit>();
produits.ajouter({ id: 'p1', nom: 'Lampe', prix: 49.9, stock: 3 });
produits.ajouter({ id: 'p2', nom: 'Vase', prix: 25, stock: 0 });

const lampe = produits.mettreAJour('p1', { stock: 2 });
console.log(lampe); // { id: 'p1', nom: 'Lampe', prix: 49.9, stock: 2 }
console.log(produits.trierPar('prix').map((p) => p.nom)); // [ 'Vase', 'Lampe' ]
```

Ce que TypeScript refuse, grâce aux génériques et aux types dérivés :

```ts
produits.mettreAJour('p1', { id: 'p9' });
// error TS2353: Object literal may only specify known properties, and 'id' does not exist in type 'Partial<Omit<Produit, "id">>'.

produits.mettreAJour('p1', { prix: 'gratuit' });
// error TS2322: Type 'string' is not assignable to type 'number'.

produits.trierPar('poids');
// error TS2345: Argument of type '"poids"' is not assignable to parameter of type 'keyof Produit'.
```

## Comment ça fonctionne

**Un paramètre de type.** Dans `function premier<T>(tableau: readonly T[]): T | undefined`, `T` est une variable de type.
À chaque appel, TypeScript l'**infère** à partir des arguments : avec un tableau de produits, `T` vaut `Produit`, et le
résultat est un `Produit | undefined`. On précise rarement `T` soi-même ; on le fait quand rien ne permet de le déduire,
comme `new DepotEnMemoire<Produit>()` ou `new Map<string, Commande>()`. Les collections du langage sont déjà
génériques : `Array<T>`, `Map<K, V>`, `Set<T>`, `Promise<T>`.

**Les contraintes.** Sans contrainte, `T` peut être n'importe quoi, et l'on ne peut rien faire de ses valeurs. `T extends
{ id: string }` exige que `T` ait au moins un `id` de type chaîne : le dépôt peut alors utiliser `element.id`. `K extends
keyof T` restreint `K` aux noms de propriétés de `T` : `trierPar('prix')` est accepté, `trierPar('poids')` refusé, et
`a[cle]` a le bon type.

**Les types génériques.** Un alias ou une interface peut aussi avoir des paramètres. `Resultat<T>`, une union discriminée
qui contient soit une valeur de type `T`, soit une erreur, sert pour n'importe quel cas d'utilisation : on l'a utilisé
sans types dans la partie sur les patterns fonctionnels.

**Dériver plutôt que dupliquer.** `Partial<Omit<Produit, 'id'>>` se lit de l'intérieur vers l'extérieur : les propriétés
de `Produit` sans `id`, toutes facultatives. C'est exactement ce qu'accepte une mise à jour. Si l'on ajoute une propriété
`categorie` à `Produit`, elle apparaît automatiquement dans ce type : une seule source de vérité. `Pick` choisit les
champs d'un résumé public, `Readonly` protège un objet renvoyé à l'affichage, `Record` décrit un dictionnaire. Tous ces
utilitaires sont eux-mêmes écrits avec des génériques et des types *mappés*, que le parcours TypeScript de la plateforme
détaille.

**Des types à partir des valeurs.** `typeof` appliqué à une valeur, dans une position de type, donne son type :
`ReturnType<typeof creerCommande>` est le type de ce que renvoie la fonction, sans l'écrire une seconde fois.
`as const` fige une valeur littérale : `const STATUTS = ['brouillon', 'payee'] as const` a le type
`readonly ['brouillon', 'payee']`, et `(typeof STATUTS)[number]` donne l'union `'brouillon' | 'payee'`. La liste existe à
l'exécution, pour une validation ou un menu, et le type en découle.

**Ne pas en faire trop.** Les génériques servent quand une fonction ou un type fonctionne vraiment pour plusieurs types,
avec un lien entre eux. Un paramètre de type utilisé une seule fois, `function afficher<T>(x: T): void`, n'apporte rien
par rapport à `unknown`. Des types très sophistiqués deviennent vite illisibles : la clarté pour le lecteur reste le
critère, comme pour le reste du code.

## Erreurs fréquentes

**Typer une fonction générique avec `any`.** On perd le lien entre entrée et sortie ; utilise un paramètre de type.

**Oublier la contrainte.** Sans `extends`, on ne peut rien faire des valeurs de type `T`.

**Utiliser `string` pour un nom de propriété.** `keyof T` n'accepte que les propriétés existantes.

**Dupliquer un type pour chaque variante.** Dérive-le avec `Partial`, `Pick`, `Omit`.

**Écrire deux fois la même liste de valeurs.** Une constante `as const` et `(typeof X)[number]`.

**Des génériques pour le plaisir.** Un paramètre de type qui ne relie rien complique sans raison.

## À retenir

- Un générique relie les types d'entrée et de sortie ; TypeScript l'infère presque toujours.
- `extends` contraint un paramètre de type ; `keyof T` limite aux clés existantes.
- `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record` dérivent des types d'une seule définition.
- `ReturnType`, `Parameters`, `Awaited`, `typeof` : des types tirés des fonctions et des valeurs.
- `as const` et `(typeof X)[number]` : une liste à l'exécution, une union dans les types.

## Exercices

1. Écris une fonction générique `grouperPar(elements, cle)` qui groupe des objets selon la valeur d'une de leurs
   propriétés, et dont le résultat est correctement typé.

   :::indice
   Deux paramètres de type : `T` pour les éléments, `K extends keyof T` pour la clé. Le résultat associe une valeur de
   `T[K]` à un tableau de `T`.
   :::

   :::solution
   ```ts
   function grouperPar<T, K extends keyof T>(elements: readonly T[], cle: K): Map<T[K], T[]> {
     const groupes = new Map<T[K], T[]>();
     for (const element of elements) {
       const valeur = element[cle];
       const groupe = groupes.get(valeur);
       if (groupe) groupe.push(element);
       else groupes.set(valeur, [element]);
     }
     return groupes;
   }

   const commandes = [
     { id: 'c1', statut: 'payee' as const, total: 40 },
     { id: 'c2', statut: 'brouillon' as const, total: 15 },
     { id: 'c3', statut: 'payee' as const, total: 25 },
   ];

   const parStatut = grouperPar(commandes, 'statut'); // Map<'payee' | 'brouillon', …[]>
   console.log(parStatut.get('payee')?.map((c) => c.id)); // [ 'c1', 'c3' ]
   ```

   `T[K]` est le type de la propriété choisie : ici, l'union des statuts. `grouperPar(commandes, 'client')` serait
   refusé, car `client` n'est pas une clé. Pour des clés de type chaîne, `Map.groupBy`, vu dans la partie sur la
   transformation de données, fait la même chose et est déjà typé ainsi.
   :::

2. À partir de cette seule interface, dérive quatre types sans réécrire de propriété : les données de création (sans `id`
   ni `creeLe`), une mise à jour (tout facultatif sauf ce qui ne se modifie pas), le résumé public (`id` et `nom`), et
   une version en lecture seule.

   ```ts
   interface Client {
     id: string;
     nom: string;
     email: string;
     telephone?: string;
     creeLe: Date;
   }
   ```

   :::indice
   Combine `Omit`, `Partial`, `Pick` et `Readonly`.
   :::

   :::solution
   ```ts
   interface Client {
     id: string;
     nom: string;
     email: string;
     telephone?: string;
     creeLe: Date;
   }

   type NouveauClient = Omit<Client, 'id' | 'creeLe'>;
   type MiseAJourClient = Partial<Omit<Client, 'id' | 'creeLe'>>;
   type ResumeClient = Pick<Client, 'id' | 'nom'>;
   type ClientLecture = Readonly<Client>;

   function creer(donnees: NouveauClient): Client {
     return { ...donnees, id: crypto.randomUUID(), creeLe: new Date() };
   }

   const ana = creer({ nom: 'Ana', email: 'ana@exemple.fr' });
   const miseAJour: MiseAJourClient = { telephone: '0600000000' };
   const resume: ResumeClient = { id: ana.id, nom: ana.nom };
   const lecture: ClientLecture = ana;
   console.log(Object.keys(resume), miseAJour, typeof lecture.creeLe); // [ 'id', 'nom' ] { telephone: '0600000000' } object
   ```

   Ajouter `adresse` à `Client` l'ajoute automatiquement à la création et à la mise à jour, sans toucher aux types
   dérivés. `lecture.nom = 'X'` serait refusé.
   :::

3. Ce module déclare deux fois la liste des catégories : une fois dans le type, une fois dans un tableau pour le menu.
   Réécris-le avec une seule source de vérité, et écris une fonction qui valide qu'une chaîne reçue est une catégorie.

   ```ts
   type Categorie = 'luminaires' | 'textile' | 'ceramique';
   const CATEGORIES = ['luminaires', 'textile', 'ceramique'];
   ```

   :::indice
   `as const`, puis `(typeof CATEGORIES)[number]`, et un prédicat de type.
   :::

   :::solution
   ```ts
   const CATEGORIES = ['luminaires', 'textile', 'ceramique'] as const;
   type Categorie = (typeof CATEGORIES)[number]; // 'luminaires' | 'textile' | 'ceramique'

   function estCategorie(valeur: string): valeur is Categorie {
     return (CATEGORIES as readonly string[]).includes(valeur);
   }

   const recue: string = 'textile';
   if (estCategorie(recue)) {
     const categorie: Categorie = recue; // accepté : rétréci par le prédicat
     console.log(`catégorie valide : ${categorie}`); // catégorie valide : textile
   }
   console.log(estCategorie('jardin')); // false
   ```

   Ajouter une catégorie se fait à un seul endroit, et le type, le menu et la validation suivent. La conversion
   `as readonly string[]` est nécessaire car `includes` sur un tuple de littéraux n'accepte que ces littéraux ; elle est
   sans risque ici, puisqu'on ne fait que lire.
   :::

## Questions d'entretien

- À quoi servent les génériques ?

  :::indice
  Réutiliser sans perdre l'information de type.
  :::

  :::reponse
  À écrire des fonctions, classes et types qui fonctionnent pour plusieurs types tout en gardant le lien entre eux : le
  premier élément d'un tableau de commandes est une commande, pas « n'importe quoi ». Le paramètre de type est le plus
  souvent inféré à l'appel. Avec des contraintes, `T extends { id: string }`, on peut utiliser certaines propriétés, et
  avec `keyof`, limiter un argument aux clés existantes. On les retrouve partout : `Array<T>`, `Promise<T>`, `Map<K, V>`,
  les dépôts, les résultats typés.
  :::

- Cite quelques types utilitaires et un cas d'usage pour chacun.

  :::indice
  Création, mise à jour, résumé, lecture seule.
  :::

  :::reponse
  `Omit<Client, 'id'>` pour les données de création, sans l'identifiant attribué par le serveur. `Partial<…>` pour une
  mise à jour où chaque champ est facultatif. `Pick<Client, 'id' | 'nom'>` pour un résumé public. `Readonly<T>` pour
  empêcher la modification d'un objet renvoyé. `Record<Statut, number>` pour un compteur par statut. `ReturnType` et
  `Awaited` pour réutiliser le type de ce que renvoie une fonction asynchrone. Tous dérivent d'une seule définition, qui
  reste la source de vérité.
  :::

- Comment éviter de déclarer deux fois une liste de valeurs, dans les types et à l'exécution ?

  :::indice
  `as const`.
  :::

  :::reponse
  On déclare la liste une fois, comme valeur, avec `as const` : `const STATUTS = ['brouillon', 'payee'] as const`. Le type
  s'en déduit avec `(typeof STATUTS)[number]`, qui donne l'union des littéraux. La liste reste disponible à l'exécution,
  pour construire un menu ou valider une donnée avec un prédicat de type, et ajouter une valeur ne se fait qu'à un endroit.
  Les bibliothèques de validation comme zod poussent l'idée plus loin : on écrit le schéma, et le type en est déduit.
  :::
