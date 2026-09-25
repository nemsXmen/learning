---
id: javascript-recherche-et-tri
title: "Algorithmes de recherche et de tri"
slug: recherche-et-tri
technology: javascript
level: advanced
module: performance-javascript
order: 2
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-cout-et-complexite
  - javascript-tableaux-trier
skills:
  - search-sort-algorithms
tags:
  - javascript
  - performance
  - algorithmes
---

## Objectifs

- Choisir entre recherche linéaire, index `Map` et recherche dichotomique selon les recherches à faire.
- Écrire une recherche dichotomique correcte, y compris la variante « premier élément supérieur ou égal ».
- Comprendre le tri par insertion et le tri fusion, et ce qu'ils disent de `Array.prototype.sort`.
- Trier vite et juste : comparateur cohérent, clés précalculées, pas de tri complet quand quelques éléments suffisent.

## Introduction

Chercher et trier sont les deux opérations qu'on fait le plus souvent sur des données, et celles où une mauvaise
stratégie coûte le plus. On ne réécrit presque jamais un algorithme de tri en JavaScript : `sort` est excellent.
Mais savoir comment fonctionnent ces algorithmes permet de choisir la bonne structure, d'écrire un comparateur qui
ne sabote pas le tri, et de reconnaître les cas où une recherche dichotomique remplace des secondes par des
millisecondes.

## Concept

| Besoin | Stratégie | Coût |
| --- | --- | --- |
| une seule recherche dans des données non triées | parcours : `find`, `includes` | O(n) |
| beaucoup de recherches par clé exacte | index `Map` ou `Set`, construit une fois | O(n) puis O(1) par recherche |
| recherches par intervalle, valeur la plus proche, préfixe | tableau trié et recherche dichotomique | O(n log n) une fois, puis O(log n) |
| les k plus grands éléments, k petit | une passe en gardant les k meilleurs | O(n × k) |

| Tri | Complexité | Stable | Point fort |
| --- | --- | --- | --- |
| par insertion | O(n²), O(n) si presque trié | oui | petits tableaux, données presque triées |
| fusion | O(n log n) toujours | oui | prévisible, mais O(n) de mémoire |
| `Array.prototype.sort` | O(n log n) | oui, garanti depuis ES2019 | TimSort dans V8 : fusion et insertion combinées |

Un tri est **stable** s'il conserve l'ordre d'origine des éléments égaux : trier par ville une liste déjà triée par
nom garde les noms dans l'ordre à l'intérieur de chaque ville.

## Exemple

On dispose d'un million d'horodatages triés, et l'on doit répondre à 200 questions : « à quel index commencent
les événements postérieurs à cet instant ? ». La recherche dichotomique coupe l'intervalle en deux à chaque étape :

```js
// Renvoie le premier index dont la valeur est >= cible, ou trie.length si aucune.
function premierIndexAuMoins(trie, cible) {
  let bas = 0;
  let haut = trie.length;
  while (bas < haut) {
    const milieu = (bas + haut) >>> 1;
    if (trie[milieu] < cible) bas = milieu + 1;
    else haut = milieu;
  }
  return bas;
}

const horodatages = Array.from({ length: 1_000_000 }, (_, i) => i * 3);
const requetes = Array.from({ length: 200 }, (_, i) => (i * 14_999) % 3_000_000);

let debut = performance.now();
const lineaire = requetes.map((q) => horodatages.findIndex((t) => t >= q));
console.log(`findIndex : ${Math.round(performance.now() - debut)} ms`);

debut = performance.now();
const dichotomie = requetes.map((q) => premierIndexAuMoins(horodatages, q));
console.log(`dichotomie : ${Math.round(performance.now() - debut)} ms`);

console.log(lineaire.every((index, i) => index === dichotomie[i])); // true
console.log(premierIndexAuMoins([10, 20, 20, 30], 20)); // 1
console.log(premierIndexAuMoins([10, 20, 20, 30], 25)); // 3
console.log(premierIndexAuMoins([10, 20, 20, 30], 99)); // 4
```

Dans Node 22, sur un poste de développement, `findIndex` a pris 1,3 seconde, la dichotomie 1 milliseconde, pour
exactement les mêmes réponses. Un million d'éléments demandent au plus 20 étapes de dichotomie, car 2²⁰ dépasse un
million.

## Comment ça fonctionne

**La recherche dichotomique.** Elle ne fonctionne que sur des données **triées** selon le critère recherché. À chaque
tour, on compare l'élément du milieu à la cible et on élimine la moitié qui ne peut pas contenir la réponse.
L'intervalle `[bas, haut)` inclut `bas` et exclut `haut` ; la boucle s'arrête quand il est vide, et `bas` désigne
alors le premier index qui convient. Cette variante, appelée *lower bound*, est plus utile que « trouver l'élément
égal » : elle donne aussi l'endroit où insérer une valeur pour garder le tableau trié, et le début d'un intervalle.
Pour compter les valeurs comprises entre `a` inclus et `b` exclu, on fait
`premierIndexAuMoins(t, b) - premierIndexAuMoins(t, a)`. `(bas + haut) >>> 1` divise par deux en entier ; pour des
tableaux de plus d'un milliard d'éléments, on écrirait `bas + ((haut - bas) >> 1)`.

**Trier une fois pour chercher souvent.** Trier coûte O(n log n). Si l'on ne fait qu'une recherche, un parcours en
O(n) est moins cher ; si l'on en fait beaucoup, le tri est vite amorti. Pour des recherches par clé exacte, une `Map`
fait mieux encore. La dichotomie garde l'avantage pour tout ce qu'une `Map` ne sait pas faire : intervalles,
valeur la plus proche, préfixes de chaînes triées.

**Tri par insertion.** On parcourt le tableau et on insère chaque élément à sa place parmi ceux déjà triés, en
décalant les plus grands. Dans le pire cas, O(n²). Mais sur un tableau presque trié, chaque élément bouge peu :
le tri devient presque linéaire, et sur une dizaine d'éléments, il bat les algorithmes plus sophistiqués.

**Tri fusion.** On coupe le tableau en deux, on trie chaque moitié récursivement, puis on **fusionne** les deux
moitiés triées en avançant dans chacune : log n niveaux de découpe, O(n) de fusion par niveau, d'où O(n log n) dans
tous les cas. En prenant l'élément de gauche en cas d'égalité, il est stable. Son défaut : un tableau auxiliaire de
taille n.

**Ce que fait `sort`.** V8 utilise **TimSort**, qui repère les séquences déjà triées dans les données, les allonge
par insertion quand elles sont courtes, puis les fusionne. D'où sa rapidité sur les données réelles, souvent
partiellement triées. `sort` trie en place, `toSorted` renvoie une copie ; les deux sont stables.

**Le comparateur est un contrat.** Il doit renvoyer un nombre négatif, positif ou nul, et être cohérent : si `a` passe
avant `b`, `b` ne doit pas passer avant `a`. Un comparateur qui renvoie un booléen, `(a, b) => a > b`, ne renvoie
jamais de valeur négative : `true` devient 1 et `false` 0, et le résultat est faux sans qu'aucune erreur ne
l'annonce. `[3, 1, 2, 5, 4].sort((a, b) => a > b)` laisse le tableau inchangé.

**Précalculer les clés.** `sort` appelle le comparateur environ n log n fois, soit environ 2 millions de fois pour
100 000 éléments. Si chaque appel recalcule une clé coûteuse, par exemple en analysant une date ou en normalisant
un texte, ce travail est multiplié d'autant. On calcule la clé une fois par élément, on trie les paires, puis on
reprend les éléments :

```js
const commandes = [
  { id: 'c1', date: '2026-03-02T10:00:00Z' },
  { id: 'c2', date: '2026-01-15T08:30:00Z' },
  { id: 'c3', date: '2026-02-20T17:45:00Z' },
];

const triees = commandes
  .map((commande) => ({ commande, cle: Date.parse(commande.date) }))
  .toSorted((a, b) => a.cle - b.cle)
  .map(({ commande }) => commande);

console.log(triees.map((c) => c.id)); // [ 'c2', 'c3', 'c1' ]
```

**Pas de tri complet pour trois éléments.** Pour les trois meilleures ventes parmi un million, trier tout coûte
O(n log n). Une passe unique qui garde les trois meilleures vues jusqu'ici coûte O(n × 3). Quand k grandit, un tas
binaire ramène ce coût à O(n log k).

## Erreurs fréquentes

**Faire une dichotomie sur des données non triées.** Le résultat est faux, sans erreur. Trie d'abord, selon le même
critère que la recherche.

**Se tromper de bornes.** Mélanger intervalles inclusifs et exclusifs mène à des boucles infinies ou à un élément
oublié. Garde une convention, `[bas, haut)`, et teste les cas limites : tableau vide, cible avant le premier et après
le dernier élément, doublons.

**Renvoyer un booléen depuis un comparateur.** Renvoie `a - b` pour des nombres, `a.localeCompare(b)` pour du texte.

**Recalculer une clé coûteuse dans le comparateur.** Précalcule-la, une fois par élément.

**Trier à chaque ajout.** Pour garder une liste triée, insère à l'index donné par la dichotomie, ou trie une fois à
la fin.

**Réécrire `sort` « pour aller plus vite ».** `sort` est stable, optimisé et testé ; on écrit son propre algorithme pour
un besoin précis, pas pour battre le moteur.

## À retenir

- Une recherche : parcours ; beaucoup de recherches exactes : `Map` ; intervalles et plus proche voisin : tri et
  dichotomie.
- La dichotomie est en O(log n) : une vingtaine d'étapes pour un million d'éléments.
- La variante « premier index supérieur ou égal » donne aussi la position d'insertion et les bornes d'un intervalle.
- `sort` est O(n log n) et stable ; le comparateur renvoie un nombre et reste cohérent.
- Précalcule les clés coûteuses ; pour les k meilleurs, évite le tri complet.

## Exercices

1. Écris `compterDansIntervalle(trie, min, max)`, qui compte les valeurs `v` telles que `min <= v <= max` dans un
   tableau de nombres trié, en O(log n).

   :::indice
   Deux appels à `premierIndexAuMoins` suffisent. Le premier nombre strictement supérieur à `max` est le premier au
   moins égal à… quoi, pour des entiers ? Et pour des nombres quelconques ?
   :::

   :::solution
   Pour des nombres quelconques, on écrit une seconde variante qui cherche le premier index strictement supérieur :

   ```js
   function premierIndexAuMoins(trie, cible) {
     let bas = 0;
     let haut = trie.length;
     while (bas < haut) {
       const milieu = (bas + haut) >>> 1;
       if (trie[milieu] < cible) bas = milieu + 1;
       else haut = milieu;
     }
     return bas;
   }

   function premierIndexSuperieur(trie, cible) {
     let bas = 0;
     let haut = trie.length;
     while (bas < haut) {
       const milieu = (bas + haut) >>> 1;
       if (trie[milieu] <= cible) bas = milieu + 1;
       else haut = milieu;
     }
     return bas;
   }

   const compterDansIntervalle = (trie, min, max) =>
     Math.max(0, premierIndexSuperieur(trie, max) - premierIndexAuMoins(trie, min));

   const valeurs = [1, 3, 3, 5, 8, 8, 8, 12];
   console.log(compterDansIntervalle(valeurs, 3, 8)); // 6
   console.log(compterDansIntervalle(valeurs, 4, 4)); // 0
   console.log(compterDansIntervalle(valeurs, 0, 100)); // 8
   console.log(compterDansIntervalle([], 0, 1)); // 0
   console.log(compterDansIntervalle(valeurs, 9, 2)); // 0
   ```

   Les deux fonctions ne diffèrent que par `<` et `<=` : c'est ce qui décide où se place une valeur égale à la cible.
   `Math.max(0, …)` gère un intervalle inversé.
   :::

2. Implémente le tri fusion `triFusion(tableau, comparer)`, qui renvoie un nouveau tableau trié, stable, sans
   modifier l'original. Vérifie la stabilité sur des objets de même clé.

   :::indice
   Cas de base : un tableau de 0 ou 1 élément est trié. Pendant la fusion, en cas d'égalité, prends l'élément de
   gauche en premier.
   :::

   :::solution
   ```js
   function triFusion(tableau, comparer = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
     if (tableau.length <= 1) return [...tableau];
     const milieu = tableau.length >>> 1;
     const gauche = triFusion(tableau.slice(0, milieu), comparer);
     const droite = triFusion(tableau.slice(milieu), comparer);

     const resultat = [];
     let i = 0;
     let j = 0;
     while (i < gauche.length && j < droite.length) {
       // <= 0 : à égalité, l'élément de gauche passe d'abord, d'où la stabilité.
       if (comparer(gauche[i], droite[j]) <= 0) resultat.push(gauche[i++]);
       else resultat.push(droite[j++]);
     }
     while (i < gauche.length) resultat.push(gauche[i++]);
     while (j < droite.length) resultat.push(droite[j++]);
     return resultat;
   }

   const personnes = [
     { nom: 'Ana', ville: 'Lyon' },
     { nom: 'Bao', ville: 'Nice' },
     { nom: 'Chloé', ville: 'Lyon' },
     { nom: 'Dan', ville: 'Nice' },
   ];
   const parVille = triFusion(personnes, (a, b) => a.ville.localeCompare(b.ville));
   console.log(parVille.map((p) => p.nom)); // [ 'Ana', 'Chloé', 'Bao', 'Dan' ]
   console.log(triFusion([5, 2, 9, 1, 5, 6])); // [ 1, 2, 5, 5, 6, 9 ]
   console.log(personnes[0].nom); // Ana : l'original n'a pas bougé
   ```

   Dans chaque ville, l'ordre d'origine est conservé : Ana avant Chloé, Bao avant Dan.
   :::

3. Écris `plusGrands(tableau, k, cle)` qui renvoie les `k` éléments de plus grande clé, du plus grand au plus petit,
   sans trier tout le tableau. Compare le résultat avec la version par tri.

   :::indice
   Garde un petit tableau trié des k meilleurs vus jusqu'ici. Un nouvel élément n'y entre que s'il dépasse le plus
   petit d'entre eux.
   :::

   :::solution
   ```js
   function plusGrands(tableau, k, cle) {
     const meilleurs = []; // trié du plus grand au plus petit, au plus k éléments
     for (const element of tableau) {
       const valeur = cle(element);
       if (meilleurs.length === k && valeur <= cle(meilleurs[k - 1])) continue;
       let position = meilleurs.length;
       while (position > 0 && cle(meilleurs[position - 1]) < valeur) position -= 1;
       meilleurs.splice(position, 0, element);
       if (meilleurs.length > k) meilleurs.pop();
     }
     return meilleurs;
   }

   const ventes = Array.from({ length: 100_000 }, (_, i) => ({ id: i, montant: (i * 7919) % 100_003 }));
   const rapides = plusGrands(ventes, 3, (v) => v.montant);
   const parTri = ventes.toSorted((a, b) => b.montant - a.montant).slice(0, 3);

   console.log(rapides.map((v) => v.montant)); // [ 100002, 100001, 100000 ]
   console.log(rapides.every((v, i) => v.montant === parTri[i].montant)); // true
   ```

   Chaque élément coûte au plus k comparaisons et un `splice` sur k éléments : O(n × k) au total, avec k = 3. Le
   `continue` rend la plupart des éléments presque gratuits, car ils ne battent pas le troisième.
   :::

## Questions d'entretien

- Quand préférer une recherche dichotomique à une `Map` ?

  :::indice
  Qu'est-ce qu'une `Map` ne sait pas faire ?
  :::

  :::reponse
  Une `Map` répond en O(1) à « cette clé existe-t-elle ? », et c'est imbattable pour des recherches exactes. Elle
  ne connaît pas l'ordre des clés : elle ne sait pas trouver toutes les valeurs d'un intervalle, la valeur la plus
  proche, ou les chaînes qui commencent par un préfixe. Pour cela, on trie une fois, en O(n log n), et chaque
  recherche dichotomique coûte O(log n). La dichotomie sert aussi à insérer au bon endroit dans une liste qu'on garde
  triée.
  :::

- Qu'est-ce qu'un tri stable, et pourquoi est-ce utile ?

  :::indice
  Pense à un tableau déjà trié par nom qu'on trie ensuite par ville.
  :::

  :::reponse
  Un tri stable conserve l'ordre relatif des éléments que le comparateur juge égaux. Cela permet de composer des
  tris : trier par nom, puis de façon stable par ville, donne une liste par ville où les noms restent dans l'ordre.
  C'est aussi ce qu'attend un utilisateur qui clique sur plusieurs colonnes d'un tableau. `Array.prototype.sort` est
  stable depuis ES2019 ; le tri fusion l'est, le tri rapide classique ne l'est pas.
  :::

- Pourquoi `tableau.sort((a, b) => a > b)` est-il un bug ?

  :::indice
  Que devient un booléen dans un contexte numérique ?
  :::

  :::reponse
  Le comparateur doit renvoyer un nombre négatif, nul ou positif. Un booléen est converti en 1 ou 0 : il ne dit
  jamais que `a` doit passer avant `b`, et l'algorithme reçoit des informations incohérentes. Le résultat dépend de
  l'algorithme du moteur, n'est pas trié en général, et aucune erreur ne l'indique : `[3, 1, 2, 5, 4]` reste
  inchangé dans V8. Il faut renvoyer `a - b` pour des nombres, et `localeCompare` pour des chaînes.
  :::
