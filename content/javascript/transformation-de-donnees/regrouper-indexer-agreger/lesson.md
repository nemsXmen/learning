---
id: javascript-regrouper-indexer
title: "Regrouper, indexer et agréger des données"
slug: regrouper-indexer-agreger
technology: javascript
level: intermediate
module: transformation-de-donnees
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-tableaux-transformer
  - javascript-map
skills:
  - data-grouping
tags:
  - javascript
  - donnees
---

## Objectifs

- Regrouper des éléments par clé avec `Object.groupBy` et `Map.groupBy`.
- Indexer une liste par identifiant pour des recherches directes.
- Agréger par groupe : compter, sommer, calculer une moyenne, un minimum et un maximum.
- Choisir entre objet et `Map` pour le résultat.

## Introduction

Les données arrivent presque toujours sous forme de listes : commandes, événements, lignes d'un export. Les questions
qu'on leur pose sont rarement « quel est le troisième élément ? », mais plutôt « combien par client ? », « quel total
par mois ? », « quelle est la commande numéro 1042 ? ». Trois opérations y répondent : **regrouper** par clé,
**indexer** par identifiant, **agréger** chaque groupe en quelques chiffres. Bien les maîtriser évite les boucles
imbriquées et les `find` répétés qui rendent le code lent et confus.

## Concept

| Opération | Outil | Résultat |
| --- | --- | --- |
| Regrouper, clé textuelle | `Object.groupBy(liste, cle)` | `{ cle: [éléments] }`, objet sans prototype |
| Regrouper, clé quelconque | `Map.groupBy(liste, cle)` | `Map` de clé vers tableau |
| Indexer | `new Map(liste.map((e) => [e.id, e]))` | accès direct par identifiant |
| Compter | `reduce` ou `Map` de compteurs | `{ cle: nombre }` |
| Agréger un groupe | `reduce` sur chaque groupe | somme, moyenne, min, max |
| Transformer un objet | `Object.entries`, `map`, `Object.fromEntries` | un nouvel objet de mêmes clés |

## Exemple

```js
const commandes = [
  { id: 101, client: 'ada', mois: '2026-08', total: 120 },
  { id: 102, client: 'alan', mois: '2026-08', total: 80 },
  { id: 103, client: 'ada', mois: '2026-09', total: 40 },
  { id: 104, client: 'grace', mois: '2026-09', total: 200 },
  { id: 105, client: 'ada', mois: '2026-09', total: 60 },
];

// Regrouper
const parClient = Object.groupBy(commandes, (commande) => commande.client);
console.log(Object.keys(parClient)); // [ 'ada', 'alan', 'grace' ]
console.log(parClient.ada.map((commande) => commande.id)); // [ 101, 103, 105 ]

// Indexer
const parId = new Map(commandes.map((commande) => [commande.id, commande]));
console.log(parId.get(104).client); // 'grace'

// Agréger chaque groupe
function statistiques(liste) {
  const totaux = liste.map((commande) => commande.total);
  const somme = totaux.reduce((a, b) => a + b, 0);
  return { nombre: liste.length, somme, moyenne: somme / liste.length, max: Math.max(...totaux) };
}

const parMois = Object.fromEntries(
  Object.entries(Object.groupBy(commandes, (commande) => commande.mois)).map(([mois, liste]) => [
    mois,
    statistiques(liste),
  ]),
);
console.log(parMois);
// {
//   '2026-08': { nombre: 2, somme: 200, moyenne: 100, max: 120 },
//   '2026-09': { nombre: 3, somme: 300, moyenne: 100, max: 200 }
// }

// Compter en une passe
const nombreParClient = commandes.reduce((compteurs, { client }) => {
  compteurs.set(client, (compteurs.get(client) ?? 0) + 1);
  return compteurs;
}, new Map());
console.log(nombreParClient); // Map(3) { 'ada' => 3, 'alan' => 1, 'grace' => 1 }

// Map.groupBy : la clé peut être un booléen ou un objet
const parTranche = Map.groupBy(commandes, (commande) => commande.total >= 100);
console.log(parTranche.get(true).length, parTranche.get(false).length); // 2 3
```

## Comment ça fonctionne

`Object.groupBy(liste, cle)` appelle la fonction de clé sur chaque élément et range l'élément dans le tableau
correspondant, en conservant l'ordre d'origine dans chaque groupe et l'ordre de première apparition des clés. La clé
est convertie en chaîne, comme toute propriété d'objet : `1` et `'1'` tombent dans le même groupe. L'objet renvoyé n'a
**pas de prototype** : `parClient.hasOwnProperty` n'existe pas, et une clé comme `'constructor'` ne rencontre aucune
propriété héritée. `Map.groupBy` fait le même travail mais conserve les clés telles quelles, ce qui permet de grouper
par booléen, par nombre ou par objet. Les deux fonctions datent d'ES2024 ; sur un environnement plus ancien, un
`reduce` produit le même résultat.

**Indexer** consiste à construire une fois une `Map` de l'identifiant vers l'élément. Chaque recherche devient
ensuite directe, alors qu'un `find` parcourt la liste à chaque appel. Dès qu'on cherche plusieurs éléments d'une même
liste — par exemple pour relier des commandes à leurs clients —, l'index transforme un travail proportionnel au
produit des deux tailles en un travail proportionnel à leur somme. Si plusieurs éléments partagent un identifiant, le
dernier écrase les précédents : c'est un regroupement qu'il faut alors, pas un index.

**Agréger** revient à réduire chaque groupe à quelques valeurs. Le motif `Object.entries` → `map` →
`Object.fromEntries` transforme les valeurs d'un objet en gardant ses clés. Pour un simple comptage, un `reduce` qui
alimente une `Map` fait tout en une passe, sans créer les tableaux intermédiaires d'un regroupement.

Deux pièges numériques guettent les agrégations. Une moyenne sur un groupe vide divise par zéro et donne `NaN`, et
`Math.max()` sans argument vaut `-Infinity`. Et `Math.max(...totaux)` transmet chaque élément comme un argument : sur
un tableau de plusieurs centaines de milliers d'éléments, la limite de la pile est dépassée et une `RangeError` est
levée. Pour de gros volumes, on calcule le maximum avec `reduce` ou une boucle.

Objet ou `Map` ? Un objet se sérialise directement en JSON et se lit avec la notation pointée, ce qui convient à un
résultat destiné à une API ou un affichage. Une `Map` accepte toutes les clés, garde l'ordre d'insertion, donne sa
taille avec `size` et se prête mieux aux ajouts et suppressions fréquents.

## Erreurs fréquentes

**Chercher avec `find` dans une boucle.** Construis un index `Map` une fois.

**Indexer par une clé qui n'est pas unique.** Les éléments en double s'écrasent : regroupe.

**Grouper par objet avec `Object.groupBy`.** Toutes les clés deviennent `'[object Object]'` : utilise `Map.groupBy`.

**Oublier les groupes vides dans une moyenne.** Gère le cas avant de diviser.

**Utiliser `Math.max(...liste)` sur de très grands tableaux.** Passe par `reduce`.

## À retenir

- `Object.groupBy` pour des clés textuelles, `Map.groupBy` pour des clés quelconques.
- Un index `Map` remplace les `find` répétés par des accès directs.
- `Object.entries` → `map` → `Object.fromEntries` transforme les valeurs d'un objet.
- Compter : un `reduce` sur une `Map`, en une passe.
- Attention à `NaN`, à `-Infinity` et à l'étalement de très grands tableaux.

## Exercices

1. Relie chaque commande à son client et calcule le total dépensé par **nom** de client, sans `find` dans une boucle.

   ```js
   const clients = [
     { id: 'c1', nom: 'Ada' },
     { id: 'c2', nom: 'Alan' },
   ];
   const commandes = [
     { clientId: 'c1', total: 30 },
     { clientId: 'c2', total: 15 },
     { clientId: 'c1', total: 20 },
   ];
   ```

   :::indice
   Construis d'abord un index des clients par `id`, puis accumule les totaux dans un objet.
   :::

   :::solution
   ```js
   const clients = [
     { id: 'c1', nom: 'Ada' },
     { id: 'c2', nom: 'Alan' },
   ];
   const commandes = [
     { clientId: 'c1', total: 30 },
     { clientId: 'c2', total: 15 },
     { clientId: 'c1', total: 20 },
   ];

   const clientsParId = new Map(clients.map((client) => [client.id, client]));
   const totalParNom = {};
   for (const { clientId, total } of commandes) {
     const nom = clientsParId.get(clientId)?.nom ?? 'inconnu';
     totalParNom[nom] = (totalParNom[nom] ?? 0) + total;
   }

   console.log(totalParNom); // { Ada: 50, Alan: 15 }
   ```
   :::

2. À partir de lignes de vente, renvoie les `n` produits les plus vendus en quantité, sous la forme
   `[{ produit, quantite }]`, du plus vendu au moins vendu.

   :::indice
   Somme les quantités par produit dans une `Map`, convertis-la en tableau d'objets, trie avec `toSorted`, puis coupe
   avec `slice`.
   :::

   :::solution
   ```js
   function meilleuresVentes(lignes, n) {
     const quantites = new Map();
     for (const { produit, quantite } of lignes) {
       quantites.set(produit, (quantites.get(produit) ?? 0) + quantite);
     }
     return [...quantites]
       .map(([produit, quantite]) => ({ produit, quantite }))
       .toSorted((a, b) => b.quantite - a.quantite)
       .slice(0, n);
   }

   const lignes = [
     { produit: 'stylo', quantite: 3 },
     { produit: 'cahier', quantite: 5 },
     { produit: 'stylo', quantite: 4 },
     { produit: 'gomme', quantite: 1 },
   ];
   console.log(meilleuresVentes(lignes, 2));
   // [ { produit: 'stylo', quantite: 7 }, { produit: 'cahier', quantite: 5 } ]
   ```
   :::

3. Écris `tableauCroise(ventes)` qui renvoie, pour chaque mois, le total par catégorie, avec `0` pour les catégories
   sans vente ce mois-là.

   :::indice
   Récupère d'abord la liste de toutes les catégories avec un `Set`, puis construis chaque ligne en partant de zéros.
   :::

   :::solution
   ```js
   function tableauCroise(ventes) {
     const categories = [...new Set(ventes.map((vente) => vente.categorie))];
     const zeros = Object.fromEntries(categories.map((categorie) => [categorie, 0]));
     const tableau = {};
     for (const { mois, categorie, montant } of ventes) {
       tableau[mois] ??= { ...zeros };
       tableau[mois][categorie] += montant;
     }
     return tableau;
   }

   console.log(
     tableauCroise([
       { mois: '2026-08', categorie: 'livres', montant: 30 },
       { mois: '2026-08', categorie: 'jeux', montant: 20 },
       { mois: '2026-09', categorie: 'livres', montant: 10 },
       { mois: '2026-08', categorie: 'livres', montant: 5 },
     ]),
   );
   // { '2026-08': { livres: 35, jeux: 20 }, '2026-09': { livres: 10, jeux: 0 } }
   ```
   :::

## Questions d'entretien

- Tu dois associer 10 000 commandes à 10 000 clients. Comment t'y prends-tu, et pourquoi ?

  :::indice
  Compte le nombre de comparaisons avec un `find` par commande.
  :::

  :::reponse
  Un `find` par commande parcourt en moyenne la moitié des clients : environ 50 millions de comparaisons. Je construis
  d'abord une `Map` des clients par identifiant, en une passe, puis chaque commande récupère son client par un accès
  direct : environ 20 000 opérations au total. Je gère aussi le cas d'un client absent de l'index plutôt que de laisser
  une erreur sur `undefined`.
  :::

- Quelle différence entre `Object.groupBy` et `Map.groupBy` ?

  :::indice
  Regarde ce que devient la clé renvoyée par la fonction.
  :::

  :::reponse
  `Object.groupBy` renvoie un objet sans prototype dont les clés sont converties en chaînes : adapté aux catégories
  textuelles et au JSON. `Map.groupBy` renvoie une `Map` qui garde la clé telle quelle : booléen, nombre ou objet, sans
  collision entre `1` et `'1'`. Les deux conservent l'ordre des éléments dans chaque groupe et datent d'ES2024.
  :::

- Quels pièges surveilles-tu quand tu calcules des statistiques par groupe ?

  :::indice
  Pense aux groupes vides, aux très grands tableaux et aux nombres décimaux.
  :::

  :::reponse
  Un groupe vide donne une moyenne `NaN` et un maximum `-Infinity` : je le traite explicitement. `Math.max(...liste)`
  lève une `RangeError` au-delà de quelques centaines de milliers d'éléments : j'utilise `reduce`. Les montants
  décimaux accumulent des erreurs d'arrondi : je calcule en centimes entiers et j'arrondis à l'affichage. Enfin, je
  vérifie que la clé de regroupement est normalisée — casse, espaces — pour ne pas créer deux groupes pour la même
  valeur.
  :::
