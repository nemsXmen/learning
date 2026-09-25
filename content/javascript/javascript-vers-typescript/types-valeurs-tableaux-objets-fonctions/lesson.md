---
id: javascript-types-valeurs-tableaux-objets-fonctions
title: "Typer les valeurs, les tableaux, les objets et les fonctions"
slug: types-valeurs-tableaux-objets-fonctions
technology: javascript
level: intermediate
module: javascript-vers-typescript
order: 1
estimatedMinutes: 45
difficulty: 3
xp: 100
prerequisites:
  - javascript-limites-de-javascript-et-typage-statique
skills:
  - js-ts-basic-types
tags:
  - javascript
  - typescript
---

## Objectifs

- Associer chaque valeur JavaScript à son type TypeScript : primitifs, littéraux, `null` et `undefined`.
- Typer des tableaux, des tuples et des tableaux en lecture seule.
- Décrire la forme d'un objet : propriétés facultatives, en lecture seule, dictionnaires avec `Record`.
- Typer des fonctions : paramètres, valeurs par défaut, paramètres du reste, retour, types de fonctions.
- Choisir entre `unknown`, `any` et `never`.

## Introduction

Ce chapitre traduit ce que vous savez déjà de JavaScript dans la langue de TypeScript. Chaque valeur que vous
manipulez depuis le début du cours a un type : une chaîne, un tableau de commandes, un objet client avec une adresse
facultative, une fonction qui prend un montant et renvoie un montant. TypeScript donne simplement un nom à ces formes,
et vérifie qu'on les respecte.

Le parcours TypeScript de la plateforme consacre un module à chacune de ces notions. Ici, l'objectif est de pouvoir
typer un module JavaScript courant, et de reconnaître les pièges propres à JavaScript que les types rendent visibles.

## Concept

| Valeur JavaScript | Type TypeScript | Remarque |
| --- | --- | --- |
| `'Ana'`, `42`, `true`, `10n` | `string`, `number`, `boolean`, `bigint` | en minuscules : `String` désigne l'objet enveloppe |
| `'payee'` en constante | `'payee'` | un type littéral : une seule valeur possible |
| `null`, `undefined` | `null`, `undefined` | à inclure explicitement : `string \| undefined` |
| `[1, 2, 3]` | `number[]` ou `Array<number>` | un tableau homogène |
| `['Ana', 34]` | `[string, number]` | un tuple : longueur et types fixés par position |
| `{ id: 'c1', total: 42 }` | `{ id: string; total: number }` | la forme de l'objet |
| `new Map()` | `Map<string, Commande>` | les génériques des collections |
| une fonction | `(montant: number) => number` | le type d'une fonction |

| Modificateur | Effet |
| --- | --- |
| `nom?: string` | propriété facultative : absente, ou chaîne |
| `readonly id: string` | propriété non réaffectable |
| `readonly Commande[]` | tableau sans `push`, `splice` ni affectation d'élément |
| `Record<string, number>` | dictionnaire : des clés `string`, des valeurs `number` |
| `unknown` | n'importe quoi, mais à vérifier avant usage |
| `any` | n'importe quoi, sans aucune vérification |
| `never` | aucune valeur possible : un cas qui ne doit jamais arriver |

## Exemple

Un module de gestion de commandes, typé :

```ts
type Statut = 'brouillon' | 'payee' | 'expediee';

interface Ligne {
  readonly sku: string;
  prix: number;
  quantite: number;
}

interface Commande {
  readonly id: string;
  statut: Statut;
  lignes: Ligne[];
  codePromo?: string;
  creeeLe: Date;
}

function total(lignes: readonly Ligne[]): number {
  return lignes.reduce((somme, ligne) => somme + ligne.prix * ligne.quantite, 0);
}

function appliquerCode(commande: Commande, taux: number = 0.1): number {
  const montant = total(commande.lignes);
  return commande.codePromo ? montant * (1 - taux) : montant;
}

function compterParStatut(commandes: Commande[]): Record<Statut, number> {
  const compte: Record<Statut, number> = { brouillon: 0, payee: 0, expediee: 0 };
  for (const commande of commandes) compte[commande.statut] += 1;
  return compte;
}

const trier = (commandes: Commande[], cle: (c: Commande) => number): Commande[] =>
  commandes.toSorted((a, b) => cle(a) - cle(b));

const commandes: Commande[] = [
  { id: 'c1', statut: 'payee', lignes: [{ sku: 'lampe', prix: 49.9, quantite: 2 }], creeeLe: new Date('2026-09-20') },
  { id: 'c2', statut: 'brouillon', lignes: [], codePromo: 'BIENVENUE', creeeLe: new Date('2026-09-21') },
];

console.log(appliquerCode(commandes[0]!)); // 99.8
console.log(compterParStatut(commandes)); // { brouillon: 1, payee: 1, expediee: 0 }
console.log(trier(commandes, (c) => -c.creeeLe.getTime()).map((c) => c.id)); // [ 'c2', 'c1' ]
```

Et ce que TypeScript refuse désormais :

```ts
commandes[0]!.statut = 'livree';
// error TS2322: Type '"livree"' is not assignable to type 'Statut'.

commandes[0]!.id = 'c9';
// error TS2540: Cannot assign to 'id' because it is a read-only property.

const lignes: readonly Ligne[] = commandes[0]!.lignes;
lignes.push({ sku: 'vase', prix: 25, quantite: 1 });
// error TS2339: Property 'push' does not exist on type 'readonly Ligne[]'.

console.log(commandes[1]!.codePromo.toUpperCase());
// error TS2532: Object is possibly 'undefined'.
```

## Comment ça fonctionne

**Les primitifs et les littéraux.** Les types primitifs s'écrivent en minuscules : `string`, `number`, `boolean`,
`bigint`, `symbol`. Un **type littéral** n'accepte qu'une valeur : `'payee'`. L'union de littéraux, `'brouillon' |
'payee' | 'expediee'`, remplace avantageusement les chaînes libres : une faute de frappe ou un statut inexistant est
signalé. C'est la version typée des machines à états vues dans la partie sur les patterns.

**`null` et `undefined`, enfin visibles.** En mode strict, `string` n'inclut ni `null` ni `undefined`. Une propriété
facultative, `codePromo?: string`, a le type `string | undefined` : on ne peut pas appeler une méthode dessus sans
vérifier. Le chaînage optionnel `?.` et l'opérateur `??`, vus dans la partie sur le JavaScript moderne, deviennent les
outils naturels de ce contrôle. Le `!` après une expression, comme `commandes[0]!`, affirme au compilateur que la valeur
existe : à utiliser seulement quand on le sait, comme ici pour un tableau qu'on vient de remplir.

**Tableaux et tuples.** `Ligne[]` est un tableau de longueur quelconque. `[string, number]` est un tuple : exactement
deux éléments, une chaîne puis un nombre, comme ce que renvoie `Object.entries` pour un dictionnaire de nombres.
`readonly Ligne[]` interdit les méthodes qui modifient le tableau : une fonction qui reçoit un tel paramètre promet de ne
pas toucher aux données de l'appelant, un contrat précieux vu la partie sur l'immutabilité.

**Les objets : une forme.** Une interface ou un type objet décrit les propriétés attendues. Un objet littéral avec une
propriété **en trop** est signalé, pour attraper les fautes de frappe dans un nom de propriété facultative. `readonly`
empêche la réaffectation d'une propriété, sans rendre l'objet profondément immuable. Pour un dictionnaire, `Record<K, V>`
décrit des clés et des valeurs ; avec une union de littéraux comme clés, `Record<Statut, number>`, TypeScript exige
qu'aucune clé ne manque.

**Les fonctions.** On annote les paramètres ; le type de retour se déduit souvent, mais l'écrire explicitement sur une
fonction exportée en fait un contrat. Un paramètre avec une valeur par défaut est facultatif ; un paramètre du reste
s'écrit `...valeurs: number[]`. Une fonction passée en argument se type comme `(c: Commande) => number`. Une fonction
qui ne renvoie rien renvoie `void`.

**`unknown`, `any`, `never`.** `any` éteint la vérification : tout est permis sur la valeur, et l'erreur réapparaît à
l'exécution. `unknown` accepte n'importe quelle valeur, mais interdit de l'utiliser avant d'avoir vérifié sa forme :
c'est le bon type pour une donnée extérieure, comme `JSON.parse` ou un `catch`. `never` désigne l'absence de valeur
possible : le type d'une fonction qui lève toujours une erreur, ou d'un cas qui ne doit jamais arriver, ce que le
chapitre suivant exploite.

## Erreurs fréquentes

**Écrire `String`, `Number` ou `Object`.** Ce sont les objets enveloppes ; utilise `string`, `number`, `object`.

**Typer un statut en `string`.** Une union de littéraux attrape les fautes et les valeurs inexistantes.

**Abuser de `!`.** Chaque `!` est une affirmation non vérifiée ; préfère `?.`, `??` ou une vérification.

**Utiliser `any` pour une donnée extérieure.** Utilise `unknown`, et vérifie.

**Oublier `readonly` sur un paramètre qu'on ne doit pas modifier.** Le contrat d'immutabilité n'est pas vérifié.

**Annoter ce que TypeScript infère déjà.** `const total: number = 0` n'apporte rien ; annote les frontières.

## À retenir

- Primitifs en minuscules, types littéraux et unions de littéraux pour les valeurs fermées.
- En mode strict, `null` et `undefined` sont explicites ; `?.`, `??`, et `!` avec parcimonie.
- `T[]`, tuples `[A, B]`, `readonly T[]` pour ne pas modifier les données reçues.
- Objets : propriétés facultatives `?`, `readonly`, dictionnaires `Record<K, V>`.
- Fonctions : paramètres annotés, retour explicite pour l'API publique, types de fonctions pour les rappels.
- `unknown` pour l'inconnu, `never` pour l'impossible, `any` en dernier recours.

## Exercices

1. Type ce module JavaScript, en choisissant des types précis : le rôle ne peut valoir que `client`, `support` ou
   `admin` ; le téléphone est facultatif ; l'identifiant ne doit pas être modifié.

   ```js
   function creerUtilisateur(id, email, role, telephone) {
     return { id, email, role, telephone, creeLe: new Date() };
   }

   function estAdministrateur(utilisateur) {
     return utilisateur.role === 'admin';
   }

   function contacts(utilisateurs) {
     return utilisateurs.filter((u) => u.telephone).map((u) => [u.email, u.telephone]);
   }
   ```

   :::indice
   Une union de littéraux pour le rôle, une propriété facultative, `readonly`, et un tuple pour les paires renvoyées.
   :::

   :::solution
   ```ts
   type Role = 'client' | 'support' | 'admin';

   interface Utilisateur {
     readonly id: string;
     email: string;
     role: Role;
     telephone?: string;
     creeLe: Date;
   }

   function creerUtilisateur(id: string, email: string, role: Role, telephone?: string): Utilisateur {
     return { id, email, role, telephone, creeLe: new Date() };
   }

   const estAdministrateur = (utilisateur: Utilisateur): boolean => utilisateur.role === 'admin';

   function contacts(utilisateurs: readonly Utilisateur[]): [string, string][] {
     return utilisateurs.flatMap((u) => (u.telephone ? [[u.email, u.telephone] as [string, string]] : []));
   }

   const equipe = [
     creerUtilisateur('u1', 'ana@exemple.fr', 'admin', '0600000001'),
     creerUtilisateur('u2', 'bao@exemple.fr', 'client'),
   ];
   console.log(estAdministrateur(equipe[0]!), contacts(equipe)); // true [ [ 'ana@exemple.fr', '0600000001' ] ]
   ```

   Avec `filter` puis `map`, TypeScript ne sait pas que le `filter` a éliminé les téléphones absents, et le tuple
   contiendrait `string | undefined`. `flatMap` avec une condition garde le rétrécissement dans une seule expression. Le
   chapitre suivant montre une autre solution : un prédicat de type.
   :::

2. Pour chaque cas, choisis entre `any`, `unknown` et `never`, et justifie.
   - a) La valeur renvoyée par `JSON.parse` d'un fichier de configuration.
   - b) Le paramètre d'un `catch (erreur)`.
   - c) Le type de retour de `function echouer(message: string) { throw new Error(message); }`.
   - d) La réponse d'une bibliothèque ancienne sans types, pendant une migration, pour une seule ligne.

   :::indice
   Qu'est-ce qu'on sait de la valeur, et doit-on la vérifier avant usage ?
   :::

   :::solution
   - a) `unknown` : la forme du fichier n'est pas garantie ; on la valide avant usage, par exemple avec un schéma.
   - b) `unknown`, ce que TypeScript utilise en mode strict : n'importe quoi peut être levé, pas seulement une `Error`. On
     vérifie avec `erreur instanceof Error` avant de lire `message`.
   - c) `never` : la fonction ne se termine jamais normalement. TypeScript sait alors que le code qui suit un appel est
     inaccessible.
   - d) `any`, localisé et commenté, en attendant de décrire la bibliothèque dans un fichier de déclaration : c'est le
     seul cas où il se justifie, et il doit rester temporaire.

   ```ts
   function echouer(message: string): never {
     throw new Error(message);
   }

   try {
     echouer('configuration absente');
   } catch (erreur: unknown) {
     console.log(erreur instanceof Error ? erreur.message : String(erreur)); // configuration absente
   }
   ```
   :::

3. Cette fonction accepte n'importe quel objet et en affiche les montants. Remplace `any` par des types précis, et montre
   l'erreur que TypeScript signale alors sur l'appel fautif.

   ```ts
   function afficherMontants(montants: any) {
     for (const nom of Object.keys(montants)) {
       console.log(`${nom} : ${montants[nom].toFixed(2)} €`);
     }
   }

   afficherMontants({ loyer: 850, courses: '312.40' });
   ```

   :::indice
   Un dictionnaire de nombres : `Record<string, number>`.
   :::

   :::solution
   ```ts
   function afficherMontants(montants: Record<string, number>): void {
     for (const [nom, valeur] of Object.entries(montants)) {
       console.log(`${nom} : ${valeur.toFixed(2)} €`);
     }
   }

   afficherMontants({ loyer: 850, courses: 312.4 });
   // loyer : 850.00 €
   // courses : 312.40 €
   ```

   Avec l'appel d'origine, `courses: '312.40'`, TypeScript signale : `Type 'string' is not assignable to type 'number'`.
   Avec `any`, TypeScript ne disait rien, et le programme plantait à l'exécution : `montants[nom].toFixed is not a
   function`, car une chaîne n'a pas de
   méthode `toFixed`.
   :::

## Questions d'entretien

- Quelle différence entre `any` et `unknown` ?

  :::indice
  Que peut-on faire avec la valeur sans vérification ?
  :::

  :::reponse
  Les deux acceptent n'importe quelle valeur. Avec `any`, TypeScript désactive toute vérification : on peut appeler
  n'importe quelle méthode, passer la valeur n'importe où, et l'erreur n'apparaît qu'à l'exécution ; `any` se propage
  aussi aux valeurs dérivées. Avec `unknown`, on ne peut rien faire de la valeur tant qu'on n'a pas vérifié sa forme, par
  `typeof`, `instanceof` ou une validation. C'est le type à utiliser pour les données extérieures et les erreurs
  attrapées ; `any` reste un dernier recours temporaire.
  :::

- Comment TypeScript traite-t-il `null` et `undefined` ?

  :::indice
  Mode strict, propriétés facultatives, opérateurs.
  :::

  :::reponse
  En mode strict, avec `strictNullChecks`, `null` et `undefined` ne font partie d'aucun autre type : une valeur qui peut
  être absente a un type explicite comme `string | undefined`, et TypeScript interdit de l'utiliser comme une chaîne sans
  vérification. Les propriétés facultatives `?` et les accès par index avec `noUncheckedIndexedAccess` produisent ces
  types. On les traite avec une condition, le chaînage optionnel `?.` ou `??`. C'est l'un des plus grands apports de
  TypeScript, car les `Cannot read properties of undefined` sont parmi les erreurs les plus fréquentes en JavaScript.
  :::

- Quand utiliser un tuple plutôt qu'un objet ?

  :::indice
  Position contre nom.
  :::

  :::reponse
  Un tuple convient à des paires ou petits ensembles dont le sens est évident par position et le plus souvent
  déstructurés aussitôt : les entrées de `Object.entries`, un couple `[valeur, setValeur]` comme dans les hooks React, des
  coordonnées. Dès que les éléments sont nombreux ou que leur sens n'est pas évident, un objet aux propriétés nommées est
  plus lisible et plus robuste aux évolutions.
  :::
