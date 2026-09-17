---
id: javascript-transformations-inutiles
title: "Éviter les transformations inutiles"
slug: transformations-inutiles
technology: javascript
level: advanced
module: transformation-de-donnees
order: 3
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-pipelines-donnees
  - javascript-generateurs
skills:
  - data-transformation-efficiency
tags:
  - javascript
  - donnees
  - performance
---

## Objectifs

- Repérer les passes, copies et recherches qui ne servent à rien dans une chaîne de transformations.
- Remplacer une recherche répétée dans un tableau par un `Set` ou une `Map`.
- Éviter le spread dans l'accumulateur d'un `reduce`.
- S'arrêter tôt avec `find`, `some` ou les méthodes d'itérateurs paresseuses.

## Introduction

Les méthodes de tableau se lisent si bien qu'on les enchaîne sans compter : un `map` pour préparer, un `filter`, un
`sort`, un `slice` pour n'en garder que dix. Sur cinquante éléments, aucune importance. Sur cent mille, ou dans une
fonction appelée à chaque frappe au clavier, ces passes et ces copies deviennent le goulot d'étranglement de
l'application. Le but n'est pas d'abandonner le style déclaratif, mais de reconnaître quelques motifs coûteux et leurs
remplacements, tout aussi lisibles.

## Concept

| Motif coûteux | Pourquoi | Remplacement |
| --- | --- | --- |
| `a.filter((x) => b.includes(x))` | parcourt `b` pour chaque élément de `a` | `const s = new Set(b)` puis `s.has(x)` |
| `reduce` avec `{ ...acc, [k]: v }` | recopie tout l'accumulateur à chaque tour | modifier l'accumulateur local, ou `Object.fromEntries` |
| `filter(...)[0]`, `filter(...).length > 0` | parcourt tout et crée un tableau | `find`, `some` |
| `map` puis `filter` puis `slice(0, 10)` | traite tout pour garder dix éléments | itérateurs paresseux avec `take` |
| calcul coûteux dans un comparateur de `sort` | recalculé à chaque comparaison | précalculer la clé une fois |
| `JSON.parse(JSON.stringify(x))` pour lire | copie profonde sans modification | ne pas copier ce qu'on ne modifie pas |

## Exemple

On compte les appels plutôt que de chronométrer : le résultat est le même à chaque exécution.

```js
const produits = Array.from({ length: 10_000 }, (_, i) => ({ id: i, prix: i % 97, nom: `produit-${i}` }));

// 1. Arrêt anticipé : garder les 3 premiers produits chers.
let appelsTableau = 0;
const chersTableau = produits
  .map((produit) => (appelsTableau++, { ...produit, ttc: produit.prix * 1.2 }))
  .filter((produit) => produit.ttc > 100)
  .slice(0, 3);

let appelsIterateur = 0;
const chersIterateur = produits
  .values()
  .map((produit) => (appelsIterateur++, { ...produit, ttc: produit.prix * 1.2 }))
  .filter((produit) => produit.ttc > 100)
  .take(3)
  .toArray();

console.log(chersTableau.map((p) => p.id).join(), chersIterateur.map((p) => p.id).join()); // 84,85,86 84,85,86
console.log(appelsTableau, appelsIterateur); // 10000 87

// 2. Recherche répétée : includes dans filter contre Set.
const favoris = Array.from({ length: 2_000 }, (_, i) => i * 5);
let comparaisons = 0;
const lentement = produits.filter((produit) =>
  favoris.some((id) => (comparaisons++, id === produit.id)),
);
const index = new Set(favoris);
const rapidement = produits.filter((produit) => index.has(produit.id));
console.log(lentement.length, rapidement.length, comparaisons); // 2000 2000 18001000

// 3. Spread dans reduce : chaque tour recopie tout l'objet.
let proprietesCopiees = 0;
const lentIndex = produits.slice(0, 1_000).reduce((acc, produit) => {
  proprietesCopiees += Object.keys(acc).length;
  return { ...acc, [produit.id]: produit.nom };
}, {});
const rapideIndex = Object.fromEntries(produits.slice(0, 1_000).map((produit) => [produit.id, produit.nom]));
console.log(Object.keys(lentIndex).length === Object.keys(rapideIndex).length, proprietesCopiees); // true 499500
```

## Comment ça fonctionne

Les méthodes de tableau sont **gourmandes** : chaque `map` ou `filter` parcourt tout le tableau et en crée un nouveau
avant que l'étape suivante ne commence. Dans le premier cas, `map` transforme les 10 000 produits, `filter` en garde
une partie dans un deuxième tableau, et `slice` n'en retient que trois. Les **méthodes d'itérateurs** sont
**paresseuses** : `produits.values()` renvoie un itérateur, et `map`, `filter`, `take` construisent une chaîne qui
traite les éléments un par un, à la demande. `take(3)` arrête tout dès le troisième élément retenu : 87 appels au
lieu de 10 000, et aucun tableau intermédiaire. Ces méthodes sont disponibles depuis Node.js 22 et dans les
navigateurs récents ; sur un environnement plus ancien, un générateur ou une boucle `for...of` avec `break` donne le
même arrêt anticipé.

La **recherche répétée** est le motif le plus coûteux, car le coût se multiplie : pour chaque produit, `some` parcourt
les favoris jusqu'à trouver, ou jusqu'au bout. 10 000 produits et 2 000 favoris font 18 millions de comparaisons. Un
`Set` construit une fois répond à `has` en temps constant en moyenne : 10 000 vérifications. Le même raisonnement vaut
pour `includes`, `indexOf` et `find` dans une boucle.

Le **spread dans un `reduce`** a l'air immuable et élégant, mais chaque tour crée un nouvel objet en recopiant toutes
les propriétés déjà accumulées : 0 + 1 + 2 + … + 999, soit près d'un demi-million de copies pour 1 000 éléments. Le
coût croît avec le carré de la taille. L'accumulateur d'un `reduce` est créé par la fonction elle-même : le modifier
directement ne rend pas le code impur. `Object.fromEntries` ou une `Map` expriment d'ailleurs le résultat plus
clairement.

Dans un **comparateur** de `sort`, la fonction est appelée de l'ordre de n × log₂(n) fois : plus de 100 000 appels pour
10 000 éléments, chacun calculant deux clés. Si la clé est coûteuse — normalisation d'une chaîne, date à analyser —,
on la calcule une fois par élément, on trie les paires, puis on récupère les éléments.

Avant d'optimiser, on **mesure**. Ces motifs ne comptent que sur des données volumineuses ou du code appelé très
souvent ; sur une liste de vingt éléments affichée une fois, la version la plus lisible est la bonne. Le chapitre sur la
performance reviendra sur la complexité et le profilage.

## Erreurs fréquentes

**Utiliser `includes` ou `find` dans une boucle sur deux grandes listes.** Construis un `Set` ou une `Map`.

**Recopier l'accumulateur à chaque tour de `reduce`.** Modifie l'accumulateur local ou utilise `Object.fromEntries`.

**Écrire `filter(...)[0]` au lieu de `find`.** Tu parcours tout et crées un tableau pour un seul élément.

**Transformer toute une liste pour n'en afficher que dix.** Filtre avant de transformer, ou utilise `take`.

**Optimiser sans mesurer.** Sur de petites données, la lisibilité prime.

## À retenir

- Les méthodes de tableau parcourent et copient tout ; les méthodes d'itérateurs s'arrêtent tôt.
- `find`, `some`, `every` s'arrêtent dès que la réponse est connue.
- Recherche répétée : un `Set` ou une `Map` construits une fois.
- Pas de spread dans l'accumulateur d'un `reduce` sur de gros volumes.
- Précalcule les clés coûteuses avant un tri, et mesure avant d'optimiser.

## Exercices

1. Réécris cette fonction pour qu'elle ne fasse plus de recherche répétée, sans changer son résultat.

   ```js
   const nonLus = (messages, idsLus) => messages.filter((message) => !idsLus.includes(message.id));
   ```

   :::indice
   Construis la structure de recherche une fois, en dehors du `filter`.
   :::

   :::solution
   ```js
   const nonLus = (messages, idsLus) => {
     const lus = new Set(idsLus);
     return messages.filter((message) => !lus.has(message.id));
   };

   const messages = [{ id: 1 }, { id: 2 }, { id: 3 }];
   console.log(nonLus(messages, [2, 3]).map((message) => message.id)); // [ 1 ]
   ```

   Le `Set` coûte une passe sur `idsLus`, puis chaque vérification est directe : le travail passe du produit des deux
   tailles à leur somme.
   :::

2. Cette fonction trie des contacts par nom normalisé, en ignorant accents et casse. Réécris-la pour ne normaliser
   chaque nom qu'une fois, et vérifie en comptant les appels à `normaliser`.

   ```js
   let appels = 0;
   const normaliser = (texte) => (appels++, texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase());
   const trier = (contacts) =>
     contacts.toSorted((a, b) => normaliser(a.nom).localeCompare(normaliser(b.nom)));
   ```

   :::indice
   Crée des paires `[cle, contact]`, trie les paires sur la clé, puis ne garde que les contacts.
   :::

   :::solution
   ```js
   let appels = 0;
   const normaliser = (texte) => (appels++, texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase());

   const trier = (contacts) =>
     contacts
       .map((contact) => [normaliser(contact.nom), contact])
       .sort(([a], [b]) => a.localeCompare(b))
       .map(([, contact]) => contact);

   const contacts = ['Émile', 'alice', 'Zoé', 'éric', 'Bruno', 'andré', 'Chloé', 'david'].map((nom) => ({ nom }));
   console.log(trier(contacts).map((contact) => contact.nom).join(', '));
   // 'alice, andré, Bruno, Chloé, david, Émile, éric, Zoé'
   console.log(appels); // 8 : une normalisation par contact
   ```

   Le `sort` en place est sans risque ici : il trie le tableau de paires créé par le premier `map`, pas l'original.
   :::

3. Écris `premiersValides(lignes, n, valider)` qui renvoie les `n` premières lignes valides en appelant `valider` le
   moins possible, d'abord avec une boucle, puis avec les méthodes d'itérateurs.

   :::indice
   Dans la boucle, `break` dès que le résultat contient `n` éléments. Avec les itérateurs : `values()`, `filter`,
   `take`, `toArray`.
   :::

   :::solution
   ```js
   function premiersValidesBoucle(lignes, n, valider) {
     const resultat = [];
     for (const ligne of lignes) {
       if (resultat.length === n) break;
       if (valider(ligne)) resultat.push(ligne);
     }
     return resultat;
   }

   const premiersValidesIterateur = (lignes, n, valider) => lignes.values().filter(valider).take(n).toArray();

   let appels = 0;
   const estPair = (nombre) => (appels++, nombre % 2 === 0);
   const lignes = Array.from({ length: 1_000 }, (_, i) => i + 1);

   console.log(premiersValidesBoucle(lignes, 3, estPair), appels); // [ 2, 4, 6 ] 6
   appels = 0;
   console.log(premiersValidesIterateur(lignes, 3, estPair), appels); // [ 2, 4, 6 ] 6
   ```
   :::

## Questions d'entretien

- Pourquoi `liste.reduce((acc, x) => ({ ...acc, [x.id]: x }), {})` peut-il devenir très lent ?

  :::indice
  Compte les propriétés recopiées à chaque tour.
  :::

  :::reponse
  Chaque tour crée un nouvel objet en recopiant toutes les propriétés déjà accumulées : 0, puis 1, puis 2… jusqu'à
  n − 1. Le total croît avec le carré de la taille — un demi-million de copies pour 1 000 éléments, cinquante
  millions pour 10 000 —, et chaque copie crée un objet que le ramasse-miettes devra libérer. L'accumulateur est créé
  par le `reduce` : le modifier directement reste pur vu de l'extérieur. `Object.fromEntries(liste.map(...))` ou une
  `Map` sont plus lisibles et linéaires.
  :::

- Quelle différence entre `tableau.map(f).filter(g).slice(0, 5)` et `tableau.values().map(f).filter(g).take(5)` ?

  :::indice
  Qui traite les éléments, et quand ?
  :::

  :::reponse
  La version tableau est gourmande : `map` applique `f` à tous les éléments et crée un tableau complet, `filter` en crée
  un deuxième, puis `slice` en garde cinq. La version itérateur est paresseuse : chaque élément traverse `f` puis `g`
  un par un, et `take(5)` arrête tout dès le cinquième retenu, sans tableau intermédiaire. Le résultat est un itérateur,
  qu'on convertit avec `toArray`. La différence compte quand le tableau est grand et qu'on en garde peu.
  :::

- Comment décides-tu qu'une transformation de données mérite d'être optimisée ?

  :::indice
  Pense à la taille des données, à la fréquence d'appel et à la mesure.
  :::

  :::reponse
  Je regarde d'abord les ordres de grandeur : volume des données et fréquence d'exécution — une fois au chargement ou à
  chaque frappe. Je repère les motifs qui multiplient le coût : recherche dans une boucle, spread dans un `reduce`,
  calcul coûteux dans un comparateur. Puis je mesure avec le profileur ou `performance.now()` sur des données
  réalistes. Si le gain est négligeable, je garde la version la plus lisible ; sinon je choisis le remplacement le plus
  simple, souvent un `Set`, une `Map` ou un arrêt anticipé.
  :::
