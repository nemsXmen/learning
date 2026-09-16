---
id: javascript-choisir-structure
title: "Choisir sa structure : tableau, objet, Map ou Set"
slug: choisir-sa-structure
technology: javascript
level: intermediate
module: map-et-set
order: 4
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-map
skills:
  - data-structure-choice
tags:
  - javascript
  - map-et-set
---

## Objectifs

- Comparer tableau, objet, `Map` et `Set` sur l'ordre, les clés, la recherche et la
  sérialisation.
- Choisir la structure adaptée à un besoin donné, et justifier ce choix.
- Convertir d'une structure à l'autre, et indexer un tableau pour des recherches répétées.

## Introduction

Les quatre structures de cette partie se recouvrent : on peut tout faire avec un tableau,
au prix de recherches lentes et de code verbeux. Savoir choisir, c'est reconnaître la
question que le code va poser le plus souvent aux données — « la suivante ? », « celle
d'identifiant 42 ? », « est-elle déjà là ? » — et prendre la structure qui y répond
directement.

## Concept

| | Tableau | Objet | `Map` | `Set` |
| --- | --- | --- | --- | --- |
| Accès par | index | clé chaîne | clé de tout type | — |
| Ordre garanti | oui | clés entières d'abord | insertion | insertion |
| Doublons | oui | clés uniques | clés uniques | valeurs uniques |
| Taille | `length` | `Object.keys().length` | `size` | `size` |
| Recherche d'une valeur | `includes`, lente | accès direct | `has`, rapide | `has`, rapide |
| Sérialisable en JSON | oui | oui | non | non |
| Méthodes de transformation | `map`, `filter`, `reduce` | via `Object.entries` | via `[...carte]` | via `[...ensemble]` |

La question à se poser, dans l'ordre :

1. Les données sont-elles une **suite ordonnée** qu'on parcourt ? → tableau.
2. Décrivent-elles **une seule entité** aux champs connus ? → objet.
3. Faut-il **retrouver** une valeur par une clé, souvent, avec des clés variées ? → `Map`.
4. La seule question est-elle **« déjà présent ? »** ? → `Set`.

## Exemple

```js
const commandes = [
  { id: 42, client: 'ada', total: 120 },
  { id: 43, client: 'grace', total: 80 },
];

const parId = new Map(commandes.map((commande) => [commande.id, commande]));
console.log(parId.get(43).client); // 'grace' : accès direct, sans parcours

const clients = new Set(commandes.map((commande) => commande.client));
console.log(clients.has('ada'), clients.size); // true 2

const totalParClient = commandes.reduce((acc, commande) => {
  acc.set(commande.client, (acc.get(commande.client) ?? 0) + commande.total);
  return acc;
}, new Map());
console.log(Object.fromEntries(totalParClient)); // { ada: 120, grace: 80 }
```

## Comment ça fonctionne

Le critère décisif est presque toujours le **coût de la recherche**. Retrouver un élément
dans un tableau avec `find` ou `includes` demande de le parcourir : le coût grandit avec sa
taille. Un objet, une `Map` et un `Set` retrouvent une entrée par sa clé, en temps quasi
constant, quelle que soit la taille.

D'où un motif courant : quand un tableau est interrogé plusieurs fois par identifiant, on
l'**indexe** une fois dans une `Map`. Une boucle de `n` recherches dans un tableau de `n`
éléments fait `n × n` comparaisons ; avec un index, elle en fait `n`. Sur 1 000 éléments, on
passe d'un million d'opérations à quelques milliers.

Entre objet et `Map`, la règle pratique : un **objet** décrit une entité aux champs connus à
l'avance, écrits dans le code — `{ nom, email, role }`. Une **Map** sert de dictionnaire dont
les clés sont des **données**, inconnues à l'écriture, éventuellement nombreuses, ajoutées et
retirées souvent, et pas forcément des chaînes.

Dernier critère, la **sérialisation** : un tableau et un objet passent tels quels dans
`JSON.stringify` ; une `Map` et un `Set` donnent `{}`. Aux frontières d'une application —
API, stockage local —, on convertit donc systématiquement.

Ces structures se convertissent en une ligne : `[...ensemble]`, `Object.fromEntries(carte)`,
`new Map(Object.entries(objet))`, `new Set(tableau)`. Choisir une structure n'est donc jamais
définitif.

## Erreurs fréquentes

**Chercher dans un tableau à l'intérieur d'une boucle.** Indexe d'abord dans une `Map`.

**Utiliser un objet comme dictionnaire de clés externes.** Les clés héritées et `__proto__`
créent des surprises ; une `Map` est plus sûre.

**Stocker une `Map` ou un `Set` dans du JSON.** Ils deviennent `{}` : convertis-les.

**Choisir une `Map` pour trois champs fixes.** Un objet littéral se destructure et se lit
mieux.

## À retenir

- Tableau : suite ordonnée qu'on parcourt. Objet : une entité, champs connus.
- `Map` : dictionnaire à clés venues des données. `Set` : appartenance et unicité.
- Recherche répétée par identifiant : indexe le tableau dans une `Map`.
- `Map` et `Set` ne survivent pas à `JSON.stringify`.
- Les conversions tiennent en une ligne : le choix n'est pas définitif.

## Exercices

1. Pour chacun de ces besoins, choisis une structure et justifie : les messages d'une
   conversation ; la fiche d'un utilisateur ; les identifiants déjà synchronisés ; le nombre
   de vues par article, pour des milliers d'articles.

   :::indice
   Reprends les quatre questions de la section Concept, dans l'ordre.
   :::

   :::solution
   - **Messages d'une conversation** : un tableau. L'ordre compte, on les parcourt et on
     ajoute à la fin.
   - **Fiche d'un utilisateur** : un objet. Champs connus à l'avance, destructuring,
     sérialisation JSON directe.
   - **Identifiants déjà synchronisés** : un `Set`. La seule question est « déjà vu ? », et
     les doublons n'ont pas de sens.
   - **Vues par article** : une `Map`. Les clés sont des données, nombreuses, avec des lectures
     et écritures fréquentes par identifiant.
   :::

2. À partir d'un tableau de commandes `{ id, client, total }`, construis un index permettant
   de retrouver une commande par son identifiant sans parcourir le tableau.

   :::indice
   `map` peut produire les paires `[cle, valeur]` attendues par le constructeur de `Map`.
   :::

   :::solution
   ```js
   const commandes = [
     { id: 42, client: 'ada', total: 120 },
     { id: 43, client: 'grace', total: 80 },
   ];

   const parId = new Map(commandes.map((commande) => [commande.id, commande]));

   console.log(parId.get(43).client); // 'grace'
   console.log(parId.has(99)); // false
   ```

   L'index se construit en un parcours, puis chaque recherche est immédiate — au lieu d'un
   `find` complet à chaque fois.
   :::

3. À partir des mêmes commandes, calcule le total par client et renvoie le résultat sous une
   forme sérialisable en JSON.

   :::indice
   Accumule dans une `Map`, puis convertis avant de sérialiser.
   :::

   :::solution
   ```js
   const totaux = commandes.reduce((acc, commande) => {
     acc.set(commande.client, (acc.get(commande.client) ?? 0) + commande.total);
     return acc;
   }, new Map());

   console.log(JSON.stringify(Object.fromEntries(totaux)));
   // '{"ada":120,"grace":80}'
   ```
   :::

## Questions d'entretien

- Comment accélérer des recherches répétées dans un tableau ?

  :::indice
  Que coûte un `find` répété `n` fois sur un tableau de `n` éléments ?
  :::

  :::reponse
  En construisant un index une seule fois : `new Map(elements.map((e) => [e.id, e]))`, puis
  `get` pour chaque recherche. Un `find` parcourt le tableau à chaque appel, donc `n`
  recherches sur `n` éléments coûtent `n × n` comparaisons ; avec l'index, la construction
  coûte `n` et chaque recherche est quasi immédiate. Le compromis est la mémoire de l'index et
  sa mise à jour si les données changent : pour quelques recherches seulement, `find` suffit.
  :::

- Quelles structures survivent à `JSON.stringify`, et comment traiter les autres ?

  :::indice
  Essaie sur les quatre structures du chapitre.
  :::

  :::reponse
  Les tableaux et les objets se sérialisent directement. Une `Map` et un `Set` donnent `{}`,
  car JSON ne connaît pas ces types. On convertit avant l'envoi — `Object.fromEntries(carte)`
  ou `[...carte]`, `[...ensemble]` — et on reconstruit à la réception avec `new Map(paires)`
  ou `new Set(tableau)`. C'est un point à décider une fois pour toutes aux frontières de
  l'application, plutôt qu'à chaque appel.
  :::

- Objet ou `Map` : quel critère trancher en premier ?

  :::indice
  Les clés sont-elles écrites dans le code, ou viennent-elles des données ?
  :::

  :::reponse
  L'origine des clés. Si elles sont écrites dans le code et connues à l'avance — `nom`,
  `email`, `role` —, c'est un objet : plus lisible, destructurable, sérialisable. Si elles
  viennent des données — identifiants, adresses, objets —, c'est une `Map` : pas de collision
  avec les propriétés héritées, ordre d'insertion garanti, `size` immédiat, suppression propre
  avec `delete`. Un objet dont on ne connaît pas les clés à l'écriture est presque toujours
  une `Map` déguisée.
  :::
