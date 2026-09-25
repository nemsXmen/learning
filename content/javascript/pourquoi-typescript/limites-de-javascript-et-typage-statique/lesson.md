---
id: javascript-limites-de-javascript-et-typage-statique
title: "Les limites de JavaScript, le typage statique et l'inférence"
slug: limites-de-javascript-et-typage-statique
technology: javascript
level: intermediate
module: pourquoi-typescript
order: 1
estimatedMinutes: 35
difficulty: 3
xp: 90
prerequisites:
  - javascript-eslint-prettier-et-verification-des-types
skills:
  - js-ts-why
tags:
  - javascript
  - typescript
---

## Objectifs

- Reconnaître les erreurs que JavaScript ne signale qu'à l'exécution, voire jamais.
- Expliquer ce qu'apporte un typage statique, et ce qu'il n'apporte pas.
- Comprendre l'inférence : TypeScript déduit la plupart des types sans annotation.
- Situer TypeScript par rapport à JavaScript : un sur-ensemble dont les types disparaissent à l'exécution.

## Introduction

JavaScript est **dynamiquement typé** : une variable peut contenir n'importe quoi, et une erreur de type ne se révèle
qu'au moment où la ligne fautive s'exécute, parfois chez un utilisateur, parfois jamais, en produisant silencieusement un
mauvais résultat. Dans un petit script, on s'en accommode. Dans une application de cent mille lignes, modifiée par dix
personnes, chaque renommage de propriété devient un pari.

**TypeScript** ajoute à JavaScript un système de types vérifié **avant** l'exécution. Il est devenu le standard de fait
des projets JavaScript professionnels. Cette partie fait le pont : elle montre à un développeur JavaScript ce que
TypeScript change, et le parcours TypeScript de la plateforme approfondit ensuite chaque notion.

## Concept

| Erreur | En JavaScript | Avec TypeScript |
| --- | --- | --- |
| faute de frappe dans une propriété | `undefined`, puis un affichage « undefined € » | erreur à l'écriture : la propriété n'existe pas |
| valeur possiblement absente | `TypeError: Cannot read properties of undefined` en production | erreur : la valeur est « possiblement undefined » |
| mauvais type d'argument | conversion implicite, résultat faux | erreur : type incompatible |
| renommage d'une propriété | chaque usage oublié casse à l'exécution | chaque usage oublié est signalé |

| | Typage dynamique (JavaScript) | Typage statique (TypeScript) |
| --- | --- | --- |
| quand les types sont vérifiés | à l'exécution, ligne par ligne | avant l'exécution, sur tout le code |
| erreurs trouvées | celles des chemins exécutés | celles de tous les chemins |
| documentation | commentaires, qui vieillissent | types, vérifiés à chaque compilation |
| aide de l'éditeur | limitée | autocomplétion, navigation, renommage sûr |
| données extérieures | à valider | toujours à valider : les types disparaissent à l'exécution |

## Exemple

Ce fichier TypeScript contient cinq erreurs que JavaScript aurait laissé passer :

```ts
interface Commande {
  id: string;
  total: number;
  client?: { email: string };
}

function resume(commande: Commande): string {
  return `${commande.id} : ${commande.totl} €`;
}

function emailDuClient(commande: Commande): string {
  return commande.client.email;
}

function appliquerRemise(total: number, pourcentage: number): number {
  return total * (1 - pourcentage / 100);
}
appliquerRemise('120', 10);

const commandes: Commande[] = [];
const premiere = commandes[0];
console.log(premiere.total);

let quantite = 3;
quantite = 'trois';
```

```text
$ npx tsc --noEmit
limites.ts(8,39): error TS2551: Property 'totl' does not exist on type 'Commande'. Did you mean 'total'?
limites.ts(12,10): error TS18048: 'commande.client' is possibly 'undefined'.
limites.ts(18,17): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
limites.ts(22,13): error TS18048: 'premiere' is possibly 'undefined'.
limites.ts(25,1): error TS2322: Type 'string' is not assignable to type 'number'.
```

Chacune de ces lignes, en JavaScript, aurait produit un bug : un résumé « undefined € », un plantage pour une commande
sans client, une remise calculée sur une chaîne, un plantage sur une liste vide, une quantité devenue texte. TypeScript
les signale toutes, dans l'éditeur, avant même d'exécuter le code.

## Comment ça fonctionne

**Ce que JavaScript ne peut pas savoir.** Dans `commande.totl`, JavaScript ne peut pas deviner qu'il s'agit d'une faute :
accéder à une propriété inexistante est légal, et renvoie `undefined`. Il ne découvre qu'une valeur est absente qu'au
moment d'y accéder. Et il convertit les types à la volée : `'120' * 0.9` donne `108`, mais `'120' + 5` donne `'1205'`.
Les tests couvrent une partie de ces cas, jamais tous.

**Le typage statique vérifie tous les chemins.** TypeScript analyse le code sans l'exécuter, comme ESLint, mais avec une
connaissance précise de la forme de chaque valeur. Il vérifie ainsi les branches qu'aucun test n'exécute : le client
absent, le tableau vide. Les options strictes, `strict` et `noUncheckedIndexedAccess`, rendent les absences explicites :
une valeur qui peut être `undefined` doit être vérifiée avant usage.

**L'inférence : peu d'annotations.** On n'écrit pas un type partout. `let quantite = 3` suffit à TypeScript pour savoir
que `quantite` est un `number` ; le type de retour d'une fonction se déduit souvent de son corps ; le type des éléments
d'un `map` se déduit du tableau. On annote surtout les **frontières** : les paramètres des fonctions, les structures de
données partagées, les valeurs publiques d'un module. Le reste suit.

**Un typage structurel.** TypeScript compare les **formes**, pas les noms : un objet qui a un `id` de type `string` et un
`total` de type `number` est une `Commande`, qu'il ait été créé avec ce nom ou non. C'est fidèle à la façon dont on
écrit du JavaScript, avec des objets littéraux, et cela rend l'adoption naturelle.

**Un sur-ensemble de JavaScript, effacé à l'exécution.** Tout code JavaScript est, syntaxiquement, du TypeScript ; on
ajoute des annotations. Pour exécuter, les annotations sont **retirées** : par le compilateur `tsc`, par un outil de
build comme Vite, ou directement par Node, qui sait depuis la version 22 exécuter un fichier `.ts` en effaçant ses
types. Conséquence essentielle : **les types n'existent plus à l'exécution**. Un JSON reçu d'une API peut ne pas
respecter l'interface déclarée ; TypeScript ne le vérifiera pas. La validation des données extérieures, vue dans la
partie sur la sécurité, reste indispensable.

**Ce que TypeScript n'est pas.** Il ne rend pas le code plus rapide, ne remplace pas les tests, qui vérifient le
comportement et non les types, et ne protège pas contre les erreurs de logique : `total * 0.9` au lieu de
`total * 1.9` passe la vérification. Il coûte un peu d'apprentissage et un peu d'écriture ; en échange, il supprime une
classe entière de bugs et rend les grands refactorings sûrs.

## Erreurs fréquentes

**Croire que les types protègent les données reçues.** Une réponse d'API n'est pas vérifiée à l'exécution ; valide-la.

**Annoter chaque variable.** L'inférence suffit presque partout ; annote les frontières.

**Désactiver le mode strict pour aller plus vite.** On perd l'essentiel : la vérification des absences.

**Penser que TypeScript remplace les tests.** Il vérifie les types, pas le comportement.

**Utiliser `any` pour faire taire une erreur.** L'erreur est souvent un vrai bug ; `any` désactive la vérification.

## À retenir

- JavaScript ne révèle les erreurs de type qu'à l'exécution, sur les chemins exécutés.
- TypeScript vérifie tous les chemins avant l'exécution : propriétés, absences, arguments, affectations.
- L'inférence déduit la plupart des types ; on annote les frontières.
- Typage structurel : les formes comptent, pas les noms.
- Les types sont effacés à l'exécution : les données extérieures doivent toujours être validées.

## Exercices

1. Pour chaque ligne, dis si TypeScript en mode strict signale une erreur, et laquelle.

   ```ts
   const prix = 49.9;
   const libelle = prix.toFixed(2) + ' €';
   const utilisateurs = new Map<string, { nom: string }>();
   const nom = utilisateurs.get('u1').nom;
   const total = [10, 20].reduce((somme, x) => somme + x);
   const moitie: number = '50' / 2;
   ```

   :::indice
   Que renvoie `Map.get` quand la clé n'existe pas ? Et que donne la division d'une chaîne en TypeScript ?
   :::

   :::solution
   - `prix` et `libelle` : aucune erreur ; `prix` est inféré `number`, `libelle` `string`.
   - `utilisateurs.get('u1').nom` : erreur, l'objet est « possiblement undefined », car `get` renvoie `undefined` pour
     une clé absente. On écrit `utilisateurs.get('u1')?.nom`, ou on vérifie avant.
   - `reduce` sans valeur initiale sur `number[]` : aucune erreur, le résultat est un `number`.
   - `'50' / 2` : erreur, l'opérande gauche d'une opération arithmétique doit être un nombre. JavaScript aurait converti
     et donné `25`.

   ```ts
   const utilisateurs = new Map<string, { nom: string }>();
   const nom = utilisateurs.get('u1')?.nom ?? 'inconnu';
   console.log(nom); // inconnu
   ```
   :::

2. Un collègue affirme : « Avec TypeScript, plus besoin de valider les réponses de l'API, puisque j'ai déclaré
   l'interface `Produit` ». Montre avec un exemple pourquoi c'est faux, et ce qu'il faut faire.

   :::indice
   Que reste-t-il de `interface Produit` quand le code s'exécute ?
   :::

   :::solution
   ```ts
   interface Produit {
     id: string;
     prix: number;
   }

   // Ce que l'API renvoie vraiment, par exemple après un changement de son côté :
   const reponse = '{ "id": "p1", "prix": "49,90" }';
   const produit = JSON.parse(reponse) as Produit; // TypeScript fait confiance

   console.log(produit.prix * 2); // NaN : prix est une chaîne à l'exécution
   ```

   `JSON.parse` renvoie une valeur de type `any`, et le `as Produit` est une simple affirmation : aucune vérification n'a
   lieu, et l'interface est effacée à l'exécution. Le programme compile, puis calcule `NaN`. Il faut valider la réponse à
   la frontière, par exemple avec un schéma zod dont on déduit le type, comme on le verra dans le dernier chapitre de
   cette partie : la validation et le type restent ainsi toujours d'accord.
   :::

3. Réécris cette fonction JavaScript en TypeScript avec le minimum d'annotations nécessaires, puis indique ce que
   TypeScript infère pour le reste.

   ```js
   function statistiques(notes) {
     const total = notes.reduce((somme, note) => somme + note, 0);
     const moyenne = notes.length === 0 ? 0 : total / notes.length;
     return { total, moyenne, meilleure: Math.max(...notes) };
   }
   ```

   :::indice
   Une seule annotation suffit : celle du paramètre.
   :::

   :::solution
   ```ts
   function statistiques(notes: number[]) {
     const total = notes.reduce((somme, note) => somme + note, 0);
     const moyenne = notes.length === 0 ? 0 : total / notes.length;
     return { total, moyenne, meilleure: Math.max(...notes) };
   }

   const resultat = statistiques([12, 15, 9]);
   console.log(resultat); // { total: 36, moyenne: 12, meilleure: 15 }
   ```

   TypeScript infère `total: number`, `moyenne: number`, et le type de retour
   `{ total: number; moyenne: number; meilleure: number }`. Un appel `statistiques(['12'])` serait signalé. On peut
   ajouter le type de retour explicitement pour une fonction exportée : c'est un contrat, et une erreur dans le corps
   serait alors signalée à l'intérieur de la fonction plutôt que chez ses appelants.
   :::

## Questions d'entretien

- Pourquoi utiliser TypeScript plutôt que JavaScript ?

  :::indice
  Erreurs trouvées avant l'exécution, outillage, refactorings.
  :::

  :::reponse
  TypeScript vérifie les types avant l'exécution, sur tous les chemins du code, ce qui élimine une grande classe de bugs :
  propriétés mal orthographiées, valeurs possiblement absentes, arguments du mauvais type. Les types servent de
  documentation toujours à jour, et l'éditeur en tire l'autocomplétion, la navigation et le renommage sûr, ce qui rend les
  refactorings d'une grande base de code beaucoup moins risqués. En contrepartie, il faut apprendre le système de types
  et maintenir quelques annotations. Il ne remplace ni les tests ni la validation des données extérieures.
  :::

- Qu'est-ce que l'inférence de types ?

  :::indice
  Qui écrit le type ?
  :::

  :::reponse
  C'est la capacité de TypeScript à déduire le type d'une valeur sans annotation, à partir de son initialisation, d'une
  expression ou du corps d'une fonction : `let n = 3` est un `number`, le retour de `tableau.map((x) => x.id)` est un
  tableau d'identifiants. Grâce à elle, on annote surtout les frontières, paramètres et API publiques, et le code reste
  proche du JavaScript. Une annotation explicite sert aussi de contrat, pour détecter une erreur à l'endroit où elle est
  commise.
  :::

- Les types TypeScript existent-ils à l'exécution ?

  :::indice
  Que fait le compilateur des annotations ?
  :::

  :::reponse
  Non. Les annotations sont effacées lors de la compilation, ou par l'outil qui exécute le code, comme Vite ou Node : il
  ne reste que du JavaScript. On ne peut donc pas tester une interface à l'exécution, et une donnée extérieure, réponse
  d'API, corps de requête, fichier, n'est pas vérifiée par ses types déclarés. On la valide à la frontière avec du code,
  souvent un schéma dont on déduit le type, pour que la vérification à l'exécution et le type statique restent alignés.
  :::
