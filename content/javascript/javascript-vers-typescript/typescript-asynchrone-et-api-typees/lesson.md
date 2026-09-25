---
id: javascript-typescript-asynchrone-et-api-typees
title: "TypeScript asynchrone et API typées de bout en bout"
slug: typescript-asynchrone-et-api-typees
technology: javascript
level: advanced
module: javascript-vers-typescript
order: 4
estimatedMinutes: 50
difficulty: 4
xp: 110
prerequisites:
  - javascript-generiques-et-types-utilitaires
  - javascript-validation-secrets-et-dependances
skills:
  - js-ts-async-apis
tags:
  - javascript
  - typescript
  - api
---

## Objectifs

- Typer les fonctions asynchrones : `Promise<T>`, `Awaited`, `Promise.all` et ses tuples.
- Traiter la réponse de `fetch` comme une donnée inconnue, la valider, et en déduire un type sûr.
- Écrire un client HTTP générique qui ne renvoie que des données validées, et des erreurs typées.
- Partager schémas et types entre le serveur et le client pour typer une API de bout en bout.

## Introduction

La frontière la plus fragile d'une application est le réseau. Côté client, on déclare `interface Produit`, on écrit
`const produits: Produit[] = await reponse.json()`, et TypeScript est satisfait. Mais `reponse.json()` renvoie ce que le
serveur a réellement envoyé, et TypeScript n'en sait rien : un champ renommé côté serveur, un nombre envoyé en chaîne, et
l'application plante loin de la cause, ou affiche `NaN`.

Ce chapitre ferme cette brèche. On type correctement le code asynchrone, puis on fait en sorte qu'une donnée venue du
réseau ne reçoive un type **qu'après** avoir été vérifiée. La bonne nouvelle : avec un schéma de validation, on n'écrit
le type qu'une fois, et la vérification à l'exécution en découle.

## Concept

| Situation | Type |
| --- | --- |
| une fonction `async` qui renvoie une commande | `Promise<Commande>` |
| le type d'une valeur attendue | `Awaited<ReturnType<typeof chargerCommande>>` |
| `await Promise.all([chargerClient(), chargerCommandes()])` | un tuple `[Client, Commande[]]` |
| `await reponse.json()` | `any` dans la bibliothèque standard : à traiter comme `unknown` |
| une erreur attrapée | `unknown` : vérifier avec `instanceof` avant usage |

| Frontière réseau | Bonne pratique |
| --- | --- |
| décrire la donnée attendue | un schéma, par exemple zod |
| obtenir le type | `z.infer<typeof Schema>` : le type découle du schéma |
| valider | `Schema.parse(donnees)` ou `safeParse`, à la réception |
| partager | le même schéma côté serveur et côté client, dans un paquet commun |

## Exemple

Un schéma zod décrit la réponse attendue ; le type en est déduit, jamais écrit à la main :

```ts
import { z } from 'zod';

const ProduitSchema = z.object({
  id: z.string(),
  nom: z.string(),
  prix: z.number().nonnegative(),
  enStock: z.boolean(),
});
type Produit = z.infer<typeof ProduitSchema>; // { id: string; nom: string; prix: number; enStock: boolean }

class ErreurApi extends Error {
  readonly statut: number | null;
  constructor(message: string, statut: number | null) {
    super(message);
    this.statut = statut; // champ déclaré explicitement : syntaxe effaçable, exécutable par Node
  }
}

async function requeteJson<T>(url: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const reponse = await fetch(url, init);
  if (!reponse.ok) throw new ErreurApi(`HTTP ${reponse.status}`, reponse.status);
  const brut: unknown = await reponse.json();
  const resultat = schema.safeParse(brut);
  if (!resultat.success) {
    throw new ErreurApi(`Réponse inattendue : ${resultat.error.issues[0]?.path.join('.')}`, reponse.status);
  }
  return resultat.data;
}

const listerProduits = (): Promise<Produit[]> => requeteJson('/api/produits', z.array(ProduitSchema));
```

Pour l'essayer sans serveur, on simule `fetch`, une première fois avec une réponse conforme, puis avec un prix envoyé en
chaîne :

```ts
function simulerFetch(corps: unknown): void {
  globalThis.fetch = async () => new Response(JSON.stringify(corps), { status: 200 });
}

simulerFetch([{ id: 'p1', nom: 'Lampe', prix: 49.9, enStock: true }]);
const produits = await requeteJson('http://test/produits', z.array(ProduitSchema));
console.log(produits[0]?.prix.toFixed(2)); // 49.90

simulerFetch([{ id: 'p1', nom: 'Lampe', prix: '49,90', enStock: true }]);
try {
  await requeteJson('http://test/produits', z.array(ProduitSchema));
} catch (erreur) {
  if (erreur instanceof ErreurApi) console.log(erreur.message); // Réponse inattendue : 0.prix
}
```

La réponse non conforme est arrêtée à la frontière, avec un message qui désigne le champ fautif, au lieu de produire
`NaN` trois écrans plus loin.

## Comment ça fonctionne

**Typer l'asynchrone.** Une fonction `async` renvoie toujours une promesse : son type de retour s'écrit `Promise<T>`, et
`await` sur une `Promise<T>` donne un `T`. `Awaited<T>` fait la même chose au niveau des types, utile avec
`ReturnType` pour réutiliser le type de ce que renvoie une fonction asynchrone. `Promise.all` conserve les types par
position : `await Promise.all([chargerClient(id), chargerCommandes(id)])` est un tuple `[Client, Commande[]]`, qu'on
déstructure. Dans un `catch`, l'erreur est `unknown` : n'importe quoi peut avoir été levé, on vérifie avec `instanceof`.

**Le trou de `reponse.json()`.** Dans les types de la bibliothèque standard, `json()` renvoie `Promise<any>`. Écrire
`const produits: Produit[] = await reponse.json()` ne vérifie rien : c'est une affirmation déguisée. On affecte plutôt
le résultat à une variable `unknown`, qui oblige à le valider avant de l'utiliser. Même chose pour `JSON.parse`, les
messages reçus d'un WebSocket, `localStorage`, ou les variables d'environnement.

**Le schéma comme source de vérité.** Écrire l'interface `Produit` **et** une fonction de validation, c'est avoir deux
descriptions qui finissent par diverger. Avec zod, on écrit le schéma, et `z.infer` en déduit le type : ajouter un champ
au schéma l'ajoute au type, et la validation reste d'accord avec lui. D'autres bibliothèques suivent le même principe,
comme Valibot ou ArkType.

**Un client générique.** `requeteJson<T>(url, schema)` relie le type du résultat au schéma passé en argument : avec
`z.array(ProduitSchema)`, `T` est `Produit[]`. Aucune fonction du reste de l'application ne manipule plus de `any`. Les
erreurs sont regroupées dans une classe `ErreurApi` qui porte le statut, pour que l'interface distingue une panne réseau,
un refus d'autorisation ou une réponse non conforme. On peut aussi renvoyer un résultat typé, une union discriminée
`{ ok: true, donnees } | { ok: false, erreur }`, plutôt que de lever.

**Typer de bout en bout.** Le serveur valide aussi ses entrées avec des schémas : le corps de `POST /produits`, les
paramètres de requête. Si le serveur et le client partagent les mêmes schémas, par exemple dans un paquet commun d'un
monorepo, un changement de format côté serveur casse la compilation du client au lieu de casser la production. Le projet
de ce cours procède ainsi : son paquet `@app/validation` est utilisé par l'API et par l'application web. Des outils vont
plus loin, comme tRPC, qui partage directement les types des procédures, ou des générateurs de types à partir d'un
contrat OpenAPI.

**Les types ne remplacent pas le contrat.** Même avec des types partagés, le client et le serveur sont déployés
séparément : une ancienne version du client peut appeler une nouvelle version du serveur. On garde des changements
compatibles, ajouter plutôt que renommer, et la validation à la frontière reste le filet de sécurité.

## Erreurs fréquentes

**Typer `await reponse.json()` directement.** C'est une affirmation non vérifiée ; passe par `unknown` et un schéma.

**Écrire l'interface et le schéma séparément.** Ils divergent ; déduis le type du schéma.

**Utiliser `erreur.message` sans vérification dans un `catch`.** L'erreur est `unknown` ; teste `instanceof Error`.

**Oublier de vérifier `reponse.ok`.** Une erreur 500 avec un corps JSON serait traitée comme une réponse valide.

**Ajouter des `as` pour faire taire les erreurs de types sur les données reçues.** Chaque `as` est un point où la
donnée n'est plus vérifiée.

**Croire que des types partagés suffisent.** Client et serveur évoluent séparément ; valide toujours à la frontière.

## À retenir

- `async` renvoie `Promise<T>` ; `Awaited`, `Promise.all` en tuple ; `catch` reçoit `unknown`.
- `reponse.json()` et `JSON.parse` renvoient `any` : traite-les comme `unknown`.
- Un schéma est la source de vérité : `z.infer` en déduit le type, `safeParse` vérifie à l'exécution.
- Un client générique `requeteJson<T>(url, schema)` ne renvoie que des données validées, avec des erreurs typées.
- Schémas partagés entre serveur et client pour typer l'API de bout en bout, et validation maintenue aux frontières.

## Exercices

1. Type cette fonction qui charge en parallèle un client et ses commandes, et indique le type de chaque variable.

   ```ts
   async function chargerClient(id: string) {
     return { id, nom: 'Ana' };
   }
   async function chargerCommandes(clientId: string) {
     return [{ id: 'c1', clientId, total: 42 }];
   }
   async function tableauDeBord(id: string) {
     const [client, commandes] = await Promise.all([chargerClient(id), chargerCommandes(id)]);
     return { client, nombre: commandes.length, total: commandes.reduce((s, c) => s + c.total, 0) };
   }
   ```

   :::indice
   Les types sont presque tous inférés. Utilise `Awaited<ReturnType<…>>` pour nommer le résultat.
   :::

   :::solution
   ```ts
   async function chargerClient(id: string) {
     return { id, nom: 'Ana' };
   }
   async function chargerCommandes(clientId: string) {
     return [{ id: 'c1', clientId, total: 42 }];
   }
   async function tableauDeBord(id: string) {
     const [client, commandes] = await Promise.all([chargerClient(id), chargerCommandes(id)]);
     return { client, nombre: commandes.length, total: commandes.reduce((s, c) => s + c.total, 0) };
   }

   type TableauDeBord = Awaited<ReturnType<typeof tableauDeBord>>;
   // { client: { id: string; nom: string }; nombre: number; total: number }

   const tableau: TableauDeBord = await tableauDeBord('u1');
   console.log(tableau); // { client: { id: 'u1', nom: 'Ana' }, nombre: 1, total: 42 }
   ```

   `client` est `{ id: string; nom: string }`, `commandes` est `{ id: string; clientId: string; total: number }[]` :
   `Promise.all` garde le type de chaque position. `ReturnType` donne `Promise<…>`, et `Awaited` en retire la promesse.
   Aucune annotation n'a été nécessaire à l'intérieur des fonctions.
   :::

2. Écris le schéma zod d'une réponse paginée générique, `{ elements: T[], page: number, total: number }`, sous forme d'une
   fonction qui reçoit le schéma des éléments, et utilise-la pour valider une page de produits.

   :::indice
   Une fonction qui prend un `z.ZodType<T>` et renvoie un `z.object`.
   :::

   :::solution
   ```ts
   import { z } from 'zod';

   const ProduitSchema = z.object({ id: z.string(), nom: z.string(), prix: z.number() });

   const page = <T>(element: z.ZodType<T>) =>
     z.object({
       elements: z.array(element),
       page: z.number().int().positive(),
       total: z.number().int().nonnegative(),
     });

   const PageProduits = page(ProduitSchema);
   type PageProduits = z.infer<typeof PageProduits>;

   const brut: unknown = JSON.parse('{ "elements": [{ "id": "p1", "nom": "Lampe", "prix": 49.9 }], "page": 1, "total": 37 }');
   const resultat: PageProduits = PageProduits.parse(brut);
   console.log(resultat.elements[0]?.nom, resultat.total); // Lampe 37

   console.log(PageProduits.safeParse({ elements: [], page: 0, total: 5 }).success); // false : page doit être positive
   ```

   La même fonction sert pour les pages de commandes, de clients, d'avis : le format de pagination est décrit une fois, et
   chaque type de page en découle.
   :::

3. Remplace les exceptions de `requeteJson` par un résultat typé : `Promise<Resultat<T>>`, où `Resultat<T>` est une union
   discriminée qui distingue le succès, une erreur HTTP avec son statut, et une réponse non conforme. Montre comment
   l'appelant traite chaque cas.

   :::indice
   Trois variantes, avec une propriété `type`. L'appelant fait un `switch` exhaustif.
   :::

   :::solution
   ```ts
   import { z } from 'zod';

   type Resultat<T> =
     | { type: 'succes'; donnees: T }
     | { type: 'http'; statut: number }
     | { type: 'non-conforme'; champ: string };

   async function requeteJson<T>(url: string, schema: z.ZodType<T>): Promise<Resultat<T>> {
     const reponse = await fetch(url);
     if (!reponse.ok) return { type: 'http', statut: reponse.status };
     const verifie = schema.safeParse(await reponse.json());
     return verifie.success
       ? { type: 'succes', donnees: verifie.data }
       : { type: 'non-conforme', champ: verifie.error.issues[0]?.path.join('.') ?? '?' };
   }

   const ProduitSchema = z.object({ id: z.string(), prix: z.number() });

   function message(resultat: Resultat<z.infer<typeof ProduitSchema>>): string {
     switch (resultat.type) {
       case 'succes':
         return `Prix : ${resultat.donnees.prix} €`;
       case 'http':
         return resultat.statut === 404 ? 'Produit introuvable' : `Erreur serveur (${resultat.statut})`;
       case 'non-conforme':
         return `Réponse inattendue sur le champ ${resultat.champ}`;
     }
   }

   const reponses = [
     new Response(JSON.stringify({ id: 'p1', prix: 49.9 })),
     new Response('{}', { status: 404 }),
     new Response(JSON.stringify({ id: 'p1', prix: 'gratuit' })),
   ];
   for (const reponse of reponses) {
     globalThis.fetch = async () => reponse;
     console.log(message(await requeteJson('http://test/p1', ProduitSchema)));
   }
   // Prix : 49.9 €
   // Produit introuvable
   // Réponse inattendue sur le champ prix
   ```

   Chaque cas d'échec est visible dans le type : l'appelant ne peut pas oublier d'en traiter un, et TypeScript vérifie
   que le `switch` couvre les trois variantes, sans `default`. Les pannes réseau, où `fetch` lui-même rejette, restent
   des exceptions, qu'on peut aussi transformer en quatrième variante.
   :::

## Questions d'entretien

- Pourquoi ne faut-il pas écrire `const data: Produit[] = await res.json()` ?

  :::indice
  Que renvoie `json()` dans les types, et que vérifie l'annotation ?
  :::

  :::reponse
  Parce que `json()` renvoie `Promise<any>` : l'annotation `Produit[]` n'est qu'une affirmation, aucune vérification n'a
  lieu, et le type est effacé à l'exécution. Si le serveur change le format, l'erreur apparaît plus tard, loin de sa
  cause. J'affecte le résultat à une variable `unknown` et je le valide avec un schéma dont je déduis le type, par
  exemple avec zod : la donnée n'obtient le type `Produit[]` qu'une fois vérifiée, et une réponse non conforme est arrêtée
  à la frontière avec un message précis.
  :::

- Comment typer une API de bout en bout, entre un serveur et un client TypeScript ?

  :::indice
  Une seule source de vérité, partagée.
  :::

  :::reponse
  En partageant des schémas de validation entre les deux, par exemple dans un paquet commun d'un monorepo : le serveur
  les utilise pour valider les entrées et typer ses réponses, le client pour valider ce qu'il reçoit, et les types en
  découlent des deux côtés. Un changement de format côté serveur casse la compilation du client. D'autres approches :
  tRPC, qui partage les types des procédures, ou la génération de types à partir d'un contrat OpenAPI. Dans tous les cas,
  on garde la validation aux frontières et des changements compatibles, car client et serveur sont déployés séparément.
  :::

- Quel type a l'erreur dans un `catch`, et comment l'utiliser ?

  :::indice
  Qu'est-ce qu'on peut lever en JavaScript ?
  :::

  :::reponse
  En mode strict, `unknown`, car JavaScript permet de lever n'importe quelle valeur : une `Error`, une chaîne, un objet.
  On la rétrécit avant usage : `if (erreur instanceof ErreurApi)` pour les erreurs de l'application, `instanceof Error`
  pour lire `message`, et sinon on la relance ou on la convertit avec `String(erreur)`. Des classes d'erreur dédiées, ou
  un résultat typé en union discriminée, rendent les cas d'échec explicites pour l'appelant.
  :::
