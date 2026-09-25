---
id: javascript-interfaces-alias-unions-et-retrecissement
title: "Interfaces, alias de types, unions et rétrécissement"
slug: interfaces-alias-unions-et-retrecissement
technology: javascript
level: intermediate
module: javascript-vers-typescript
order: 2
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-types-valeurs-tableaux-objets-fonctions
skills:
  - js-ts-unions-narrowing
tags:
  - javascript
  - typescript
---

## Objectifs

- Nommer des types avec `interface` et `type`, et savoir choisir.
- Combiner des types avec l'union `|` et l'intersection `&`.
- Modéliser des variantes avec une union discriminée, et rendre les états impossibles impossibles à écrire.
- Rétrécir un type avec `typeof`, `instanceof`, `in`, l'égalité et les prédicats de type.
- Garantir qu'aucun cas n'est oublié grâce à la vérification d'exhaustivité avec `never`.

## Introduction

En JavaScript, une valeur change souvent de forme selon le cas : un paiement par carte a un numéro masqué, un virement a
un IBAN, un paiement en espèces n'a rien de tout cela. Le code s'en sort avec des `if` sur une propriété `type`, et tout
va bien jusqu'au jour où l'on ajoute un quatrième moyen de paiement et qu'on oublie de le traiter à un endroit.

TypeScript décrit ces variantes avec des **unions**, et suit le raisonnement du code : après `if (paiement.type ===
'carte')`, il sait que `paiement` est un paiement par carte. C'est le **rétrécissement**, ou *narrowing*. Combiné à une
vérification d'exhaustivité, il signale chaque endroit où le nouveau cas n'est pas traité.

## Concept

| Construction | Exemple | Usage |
| --- | --- | --- |
| `interface` | `interface Client { nom: string }` | la forme d'un objet ; extensible avec `extends` |
| `type` | `type Id = string`, `type Statut = 'a' \| 'b'` | n'importe quel type : unions, tuples, fonctions, objets |
| union `A \| B` | `string \| number` | une valeur de l'un **ou** de l'autre |
| intersection `A & B` | `Client & { fidelite: number }` | une valeur qui a **les deux** formes |
| union discriminée | `{ type: 'carte'; … } \| { type: 'virement'; … }` | des variantes, distinguées par une propriété littérale commune |

| Rétrécissement | Condition | TypeScript en déduit |
| --- | --- | --- |
| `typeof` | `typeof x === 'string'` | un primitif précis |
| `instanceof` | `erreur instanceof Error` | une instance de classe |
| `in` | `'iban' in paiement` | une variante qui possède cette propriété |
| égalité sur un discriminant | `paiement.type === 'carte'` | la variante correspondante |
| valeur non nulle | `if (client)`, `client != null` | la valeur n'est ni `null` ni `undefined` |
| prédicat de type | `function estCarte(p): p is Carte` | ce que la fonction affirme |

## Exemple

Trois moyens de paiement, modélisés par une union discriminée :

```ts
interface PaiementCarte {
  type: 'carte';
  derniersChiffres: string;
  montant: number;
}

interface PaiementVirement {
  type: 'virement';
  iban: string;
  montant: number;
}

interface PaiementEspeces {
  type: 'especes';
  montant: number;
}

type Paiement = PaiementCarte | PaiementVirement | PaiementEspeces;

function nePasOublier(cas: never): never {
  throw new Error(`Cas non traité : ${JSON.stringify(cas)}`);
}

function libelle(paiement: Paiement): string {
  switch (paiement.type) {
    case 'carte':
      return `Carte •••• ${paiement.derniersChiffres}`; // ici, paiement est un PaiementCarte
    case 'virement':
      return `Virement depuis ${paiement.iban.slice(0, 4)}…`;
    case 'especes':
      return 'Espèces';
    default:
      return nePasOublier(paiement); // ici, paiement est de type never
  }
}

const paiements: Paiement[] = [
  { type: 'carte', derniersChiffres: '4242', montant: 49.9 },
  { type: 'virement', iban: 'FR7630006000011234567890189', montant: 120 },
  { type: 'especes', montant: 12 },
];

console.log(paiements.map(libelle)); // [ 'Carte •••• 4242', 'Virement depuis FR76…', 'Espèces' ]
```

Six mois plus tard, on ajoute les paiements par chèque à l'union, en oubliant `libelle` :

```ts
interface PaiementCheque {
  type: 'cheque';
  numero: string;
  montant: number;
}
type Paiement = PaiementCarte | PaiementVirement | PaiementEspeces | PaiementCheque;
```

```text
error TS2345: Argument of type 'PaiementCheque' is not assignable to parameter of type 'never'.
```

TypeScript désigne exactement le `switch` qui ne traite pas le nouveau cas.

## Comment ça fonctionne

**`interface` ou `type` ?** Les deux décrivent la forme d'un objet, et se valent dans la plupart des cas. `interface`
s'étend avec `extends` et peut être complétée par une seconde déclaration du même nom, ce qu'utilisent les
bibliothèques pour permettre d'enrichir leurs types. `type` sait nommer n'importe quel type : une union, un tuple, un type
de fonction, un type littéral. Une convention courante : `interface` pour les objets, `type` pour le reste. L'essentiel
est de rester cohérent dans un projet.

**Unions et intersections.** Une union `A | B` accepte une valeur de l'un ou de l'autre ; on ne peut alors utiliser que
ce qui est commun aux deux, jusqu'à ce qu'on ait rétréci. Une intersection `A & B` exige les deux formes à la fois : utile
pour ajouter des propriétés à un type existant, par exemple `Commande & { client: Client }`.

**Les unions discriminées.** Chaque variante porte une propriété de même nom, ici `type`, avec une valeur littérale
différente. Tester cette propriété suffit à TypeScript pour savoir de quelle variante il s'agit, et donner accès à ses
propriétés propres : `iban` n'existe que dans la branche `'virement'`. C'est la traduction typée des états et des
variantes vus dans la partie sur les patterns : chaque variante ne porte que ses propres données, et les combinaisons
absurdes, un paiement en espèces avec un IBAN, ne peuvent pas s'écrire.

**Le rétrécissement suit le code.** TypeScript analyse le flux de contrôle : après `if (typeof x === 'string') return;`,
il sait que `x` n'est plus une chaîne dans la suite. Il comprend `typeof`, `instanceof`, `in`, les égalités, les tests
de nullité, les `return`, `throw` et `break`. On écrit du JavaScript ordinaire, et les types se précisent tout seuls.

**Les prédicats de type.** Quand la vérification est dans une fonction, TypeScript ne la voit pas. Un **prédicat de
type**, `function estCarte(p: Paiement): p is PaiementCarte`, lui dit ce que la fonction garantit quand elle renvoie
`true`. `paiements.filter(estCarte)` a alors le type `PaiementCarte[]`. Les versions récentes de TypeScript infèrent
même le prédicat de fonctions simples, comme `(p) => p.type === 'carte'`. Attention : TypeScript fait confiance au
prédicat ; un prédicat faux produit des types faux.

**L'exhaustivité avec `never`.** Dans le `default` d'un `switch` qui traite toutes les variantes, il ne reste aucune
valeur possible : le type de `paiement` est `never`. Passer cette valeur à une fonction qui n'accepte que `never` ne
compile donc que si tous les cas sont traités. Le jour où une variante est ajoutée, le `default` n'est plus vide, et la
compilation échoue à cet endroit précis. À l'exécution, la fonction lève une erreur si une valeur inattendue arrive
malgré tout, par exemple depuis une donnée non validée.

## Erreurs fréquentes

**Des variantes sans discriminant.** Des propriétés facultatives partout, `iban?`, `derniersChiffres?`, permettent des
combinaisons absurdes ; une union discriminée les interdit.

**Un `default` qui renvoie une valeur « au cas où ».** Le compilateur ne signalera jamais un cas oublié ; utilise la
vérification avec `never`.

**Utiliser une propriété avant de rétrécir.** Sur une union, seules les propriétés communes sont accessibles.

**Écrire un prédicat de type faux.** TypeScript lui fait confiance ; teste-le.

**Rétrécir avec `as`.** `paiement as PaiementCarte` affirme sans vérifier ; préfère un test réel.

**Mélanger `interface` et `type` sans règle.** Choisis une convention pour le projet.

## À retenir

- `interface` pour les objets extensibles, `type` pour les unions, tuples et fonctions.
- Union `|` : l'un ou l'autre ; intersection `&` : les deux à la fois.
- Union discriminée : une propriété littérale commune distingue les variantes.
- TypeScript rétrécit les types en suivant `typeof`, `instanceof`, `in`, les égalités et les tests de nullité.
- Prédicats de type `x is T` pour les vérifications dans une fonction, notamment avec `filter`.
- Exhaustivité : un `default` qui passe la valeur à une fonction `never`.

## Exercices

1. Remplace ce type aux propriétés facultatives par une union discriminée, et écris la fonction `afficher` avec une
   vérification d'exhaustivité.

   ```ts
   interface Notification {
     canal: 'email' | 'sms' | 'push';
     adresse?: string;
     numero?: string;
     jetonAppareil?: string;
     message: string;
   }
   ```

   :::indice
   Une variante par canal, chacune avec la seule propriété de destination qui la concerne.
   :::

   :::solution
   ```ts
   type Notification =
     | { canal: 'email'; adresse: string; message: string }
     | { canal: 'sms'; numero: string; message: string }
     | { canal: 'push'; jetonAppareil: string; message: string };

   function nePasOublier(cas: never): never {
     throw new Error(`Canal non traité : ${JSON.stringify(cas)}`);
   }

   function afficher(notification: Notification): string {
     switch (notification.canal) {
       case 'email':
         return `E-mail à ${notification.adresse} : ${notification.message}`;
       case 'sms':
         return `SMS au ${notification.numero} : ${notification.message}`;
       case 'push':
         return `Push vers ${notification.jetonAppareil.slice(0, 6)}… : ${notification.message}`;
       default:
         return nePasOublier(notification);
     }
   }

   console.log(afficher({ canal: 'sms', numero: '0600000000', message: 'Colis livré' }));
   // SMS au 0600000000 : Colis livré
   ```

   Avec l'ancien type, `{ canal: 'sms', adresse: 'a@b.fr', message: '…' }` était accepté, sans numéro. Désormais, chaque
   canal exige sa destination, et aucune autre.
   :::

2. Écris un prédicat de type `estDefini` pour retirer les `null` et `undefined` d'un tableau avec `filter`, et montre la
   différence de type obtenue avec un simple `filter(Boolean)`.

   :::indice
   `function estDefini<T>(valeur: T | null | undefined): valeur is T`.
   :::

   :::solution
   ```ts
   function estDefini<T>(valeur: T | null | undefined): valeur is T {
     return valeur !== null && valeur !== undefined;
   }

   const saisies: (number | null | undefined)[] = [12, null, 0, undefined, 7];

   const nombres = saisies.filter(estDefini); // number[]
   const avecBoolean = saisies.filter(Boolean); // (number | null | undefined)[] : TypeScript ne rétrécit pas
   console.log(nombres, avecBoolean); // [ 12, 0, 7 ] [ 12, 7 ]
   ```

   Le prédicat donne le type `number[]`. `filter(Boolean)` n'est pas reconnu comme un prédicat, et il a un second défaut,
   visible à l'exécution : il retire aussi `0`, qui est une valeur fausse. Le prédicat explicite est donc plus juste,
   pour les types comme pour les valeurs.
   :::

3. Cette fonction reçoit une valeur d'un formulaire, qui peut être une chaîne, un nombre ou une date. Écris-la en
   TypeScript pour qu'elle renvoie toujours une date, en rétrécissant proprement chaque cas.

   ```js
   function versDate(valeur) {
     if (valeur instanceof Date) return valeur;
     if (typeof valeur === 'number') return new Date(valeur);
     const date = new Date(valeur);
     if (Number.isNaN(date.getTime())) throw new Error(`Date invalide : ${valeur}`);
     return date;
   }
   ```

   :::indice
   Le paramètre est une union ; chaque condition retire un cas, et le dernier bloc ne voit plus qu'une chaîne.
   :::

   :::solution
   ```ts
   function versDate(valeur: string | number | Date): Date {
     if (valeur instanceof Date) return valeur;
     if (typeof valeur === 'number') return new Date(valeur);
     // Ici, TypeScript sait que valeur est une string.
     const date = new Date(valeur.trim());
     if (Number.isNaN(date.getTime())) throw new Error(`Date invalide : ${valeur}`);
     return date;
   }

   console.log(versDate('2026-09-25').toISOString()); // 2026-09-25T00:00:00.000Z
   console.log(versDate(0).toISOString()); // 1970-01-01T00:00:00.000Z
   try {
     versDate('pas une date');
   } catch (erreur) {
     console.log((erreur as Error).message); // Date invalide : pas une date
   }
   ```

   Après les deux `return`, il ne reste qu'une possibilité : `valeur.trim()` est accepté sans conversion. Un appel
   `versDate(true)` est signalé par TypeScript, alors que JavaScript l'aurait converti en date de 1970.
   :::

## Questions d'entretien

- Quelle différence entre `interface` et `type` ?

  :::indice
  Ce que chacun peut nommer, et l'extension.
  :::

  :::reponse
  Les deux décrivent la forme d'un objet et sont interchangeables dans la plupart des cas. `interface` ne décrit que des
  objets, s'étend avec `extends`, et peut être complétée par une autre déclaration du même nom, ce que les bibliothèques
  utilisent pour permettre d'augmenter leurs types. `type` nomme n'importe quel type : unions, intersections, tuples,
  types de fonctions, littéraux, types calculés. J'utilise souvent `interface` pour les objets du domaine et `type` pour
  les unions et le reste, en restant cohérent dans le projet.
  :::

- Qu'est-ce qu'une union discriminée, et pourquoi est-elle utile ?

  :::indice
  Une propriété littérale commune.
  :::

  :::reponse
  C'est une union de types objets qui partagent une propriété, le discriminant, dont la valeur littérale est différente
  dans chaque variante, par exemple `type: 'carte' | 'virement'`. Tester cette propriété permet à TypeScript de savoir
  quelle variante on manipule et de donner accès à ses propriétés propres. Chaque variante ne porte que ses données, ce
  qui rend les combinaisons absurdes impossibles, et combinée à une vérification d'exhaustivité avec `never`, elle fait
  signaler tout cas oublié quand une variante est ajoutée.
  :::

- Comment vérifier qu'un `switch` traite tous les cas d'une union ?

  :::indice
  Que reste-t-il dans le `default` quand tout est traité ?
  :::

  :::reponse
  Dans le `default`, je passe la valeur à une fonction qui n'accepte que le type `never`. Si tous les cas sont traités,
  le type restant est `never`, et l'appel compile. Si une variante est ajoutée à l'union sans être traitée, la valeur a
  encore ce type dans le `default`, et la compilation échoue exactement à cet endroit. La fonction lève aussi une erreur à
  l'exécution, au cas où une donnée non validée apporterait une valeur imprévue.
  :::
