---
id: javascript-cout-et-complexite
title: "Le coût d'une opération et la complexité"
slug: cout-et-complexite
technology: javascript
level: advanced
module: performance-javascript
order: 1
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-choisir-sa-boucle
  - javascript-map
skills:
  - complexity-analysis
tags:
  - javascript
  - performance
  - complexite
---

## Objectifs

- Situer le coût d'une opération : calcul, allocation, accès au DOM, réseau.
- Exprimer la complexité d'un algorithme en notation Big O, en temps et en mémoire.
- Connaître le coût des méthodes de tableaux, d'objets, de `Map` et de `Set`.
- Repérer un algorithme quadratique caché dans un code qui a l'air simple.

## Introduction

Le module sur les boucles a introduit l'idée : deux boucles imbriquées coûtent beaucoup plus cher qu'une seule. On va
maintenant en faire un outil de travail. Face à un code lent, la question n'est presque jamais « comment rendre
cette ligne plus rapide ? », mais « combien de fois cette ligne s'exécute-t-elle, et combien coûte chaque
exécution ? ». La **complexité** répond à la première question, les **ordres de grandeur** à la seconde.

Ces deux outils permettent de prévoir un problème avant de le mesurer : une fonction qui passe en 2 ms sur 1 000
éléments peut prendre plusieurs secondes sur 40 000, et on peut le savoir en lisant le code.

## Concept

**Ordres de grandeur.** Toutes les opérations ne se valent pas. Les chiffres exacts dépendent de la machine ; les
rapports entre eux, beaucoup moins.

| Opération | Ordre de grandeur |
| --- | --- |
| addition, comparaison, lecture d'une variable locale | une fraction de nanoseconde |
| lecture d'une propriété d'objet, d'un élément de tableau | quelques nanosecondes |
| allocation d'un petit objet ou tableau | des dizaines de nanosecondes, plus le ramasse-miettes ensuite |
| lecture d'une taille ou d'une position dans le DOM qui force un calcul de mise en page | de quelques microsecondes à plusieurs millisecondes |
| requête réseau | des dizaines à des centaines de millisecondes |

Une seule requête réseau de trop pèse autant que des millions d'additions : on optimise d'abord ce qui coûte le plus
cher, et ce qui se répète le plus.

**Notation Big O.** Elle décrit comment le nombre d'opérations grandit avec la taille `n` des données, en ignorant
les constantes et les termes secondaires : `3n + 20` s'écrit O(n), `n²/2 + n` s'écrit O(n²).

| Complexité | Nom | Exemple | n = 1 000 → n = 1 000 000 |
| --- | --- | --- | --- |
| O(1) | constante | `tableau[i]`, `map.get(cle)` | identique |
| O(log n) | logarithmique | recherche dichotomique dans un tableau trié | ×2 |
| O(n) | linéaire | parcourir un tableau, `includes` | ×1 000 |
| O(n log n) | quasi linéaire | `sort` | ×2 000 environ |
| O(n²) | quadratique | `includes` dans un `filter`, boucles imbriquées | ×1 000 000 |
| O(2ⁿ) | exponentielle | énumérer tous les sous-ensembles | inutilisable au-delà de quelques dizaines |

**Coût des structures courantes.**

| Opération | Coût |
| --- | --- |
| `tableau[i]`, `tableau.length` | O(1) |
| `push`, `pop` | O(1) amorti |
| `shift`, `unshift`, `splice` au début ou au milieu | O(n) : les éléments suivants sont décalés |
| `includes`, `indexOf`, `find`, `some` | O(n) dans le pire cas |
| `slice`, `concat`, `[...tableau]`, `map`, `filter` | O(n) en temps et en mémoire |
| `sort`, `toSorted` | O(n log n) |
| `objet.cle`, `cle in objet` | O(1) |
| `Object.keys`, `Object.entries`, `{ ...objet }` | O(n), n étant le nombre de propriétés |
| `map.get`, `map.set`, `map.has`, `set.has`, `set.add`, `delete` | O(1) en moyenne |

## Exemple

On veut garder, parmi des clients, ceux dont l'identifiant figure dans une liste d'identifiants actifs. Les deux
versions donnent le même résultat :

```js
function mesurer(libelle, fonction) {
  const debut = performance.now();
  const resultat = fonction();
  console.log(`${libelle} : ${(performance.now() - debut).toFixed(1)} ms`);
  return resultat;
}

const n = 40_000;
const clients = Array.from({ length: n }, (_, i) => ({ id: i, nom: `Client ${i}` }));
const idsActifs = Array.from({ length: n / 2 }, (_, i) => i * 2);

// O(n × m) : includes reparcourt idsActifs pour chaque client.
const lents = mesurer('includes', () => clients.filter((client) => idsActifs.includes(client.id)));

// O(n + m) : le Set est construit une fois, chaque recherche est en O(1).
const rapides = mesurer('Set', () => {
  const actifs = new Set(idsActifs);
  return clients.filter((client) => actifs.has(client.id));
});

console.log(lents.length === rapides.length); // true
```

Sur un poste de développement, on obtient par exemple :

```text
n = 1 000    includes : 1.6 ms     Set : 0.3 ms
n = 10 000   includes : 98 ms      Set : 4.1 ms
n = 40 000   includes : 2 414 ms   Set : 8.2 ms
```

Quand `n` est multiplié par 4, de 10 000 à 40 000, la version `includes` est environ 25 fois plus lente : c'est
la signature d'un algorithme quadratique, un peu aggravée par les caches du processeur. La version `Set` suit
à peu près la taille des données.

## Comment ça fonctionne

**Compter, puis simplifier.** Pour estimer une complexité, on compte combien de fois s'exécute l'opération la plus
répétée. Dans la première version, `filter` appelle son callback `n` fois, et chaque `includes` parcourt jusqu'à
`m` identifiants : jusqu'à `n × m` comparaisons, soit 800 millions pour 40 000 clients et 20 000 identifiants.
Dans la seconde, construire le `Set` coûte `m` opérations, et chaque `has` coûte O(1) : `n + m` au total. On garde
le terme qui domine quand les données grandissent, et on supprime les constantes : O(n²) quand `m` est
proportionnel à `n`, O(n) pour la seconde.

**Pire cas, cas moyen, coût amorti.** Big O décrit le plus souvent le pire cas : `find` peut trouver au premier
élément, mais il faut prévoir qu'il parcoure tout. Une `Map` est en O(1) **en moyenne** : c'est une table de
hachage, et des collisions peuvent coûter davantage, rarement. `push` est en O(1) **amorti** : de temps en temps, le
tableau doit réallouer un espace plus grand et copier ses éléments, mais comme la capacité double à peu près à
chaque fois, le coût réparti sur tous les `push` reste constant.

**Le piège des méthodes « simples ».** Une ligne comme `ids.includes(id)`, `liste.indexOf(x)`, `tableau.shift()`
ou `{ ...acc, [cle]: valeur }` cache une boucle. Placée dans une autre boucle, elle rend l'ensemble quadratique.
`shift` est un bon exemple : il décale tous les éléments restants. Vider une file de 100 000 éléments avec
`while (file.length) file.shift()` a pris 2,3 secondes dans Node 22, contre 2 ms en avançant un index. Pour une file,
on garde un index de tête plutôt que de retirer le premier élément.

**Objets, `Map` et `Set`.** Lire une propriété d'objet est en O(1), et les moteurs l'accélèrent encore grâce aux
**formes** (*hidden classes*) : des objets créés avec les mêmes propriétés, dans le même ordre, partagent une
description interne, et le code qui les lit est optimisé pour elle. `delete objet.cle` casse souvent cette
optimisation : V8 fait alors passer l'objet en mode dictionnaire, plus lent. Pour une collection dont les clés
changent en permanence, une `Map` est faite pour cela ; pour une structure fixe, un objet littéral est idéal.

**La mémoire aussi a une complexité.** `map`, `filter`, `slice` et le spread créent de nouveaux tableaux : O(n) en
mémoire à chaque étape. Une chaîne de cinq transformations sur un million d'éléments alloue cinq tableaux d'un
million d'éléments, que le ramasse-miettes devra récupérer. C'est souvent acceptable ; dans une boucle chaude, ce
ne l'est plus.

**Big O ne dit pas tout.** Pour 20 éléments, un parcours O(n) d'un tableau est plus rapide qu'une `Map` : pas de
hachage, des données contiguës en mémoire. Les constantes comptent sur les petites tailles, la complexité sur les
grandes. D'où la règle : on raisonne en Big O pour prévoir, et on **mesure** avant de complexifier le code.

## Erreurs fréquentes

**Chercher avec `includes` ou `find` dans une boucle.** Construis un `Set` ou une `Map` une fois, avant la boucle.

**Utiliser `shift` pour consommer une grande file.** Avance un index, ou utilise une structure adaptée.

**Oublier le coût caché d'un spread.** `{ ...acc, [cle]: valeur }` dans un `reduce` copie tout l'accumulateur à
chaque tour : O(n²).

**Croire qu'une ligne courte est bon marché.** `JSON.parse(JSON.stringify(objet))`, `Object.keys(objet).length` ou
`tableau.sort()` coûtent au moins O(n).

**Optimiser sans connaître `n`.** Un algorithme quadratique sur une liste qui ne dépassera jamais 10 éléments n'est
pas un problème. Demande-toi quelle taille les données peuvent atteindre en production.

**Confondre complexité et durée.** Big O prédit la croissance, pas le temps en millisecondes : pour cela, on mesure.

## À retenir

- On optimise d'abord ce qui coûte le plus cher (réseau, DOM) et ce qui se répète le plus.
- Big O décrit la croissance du travail avec `n`, en ignorant constantes et termes secondaires.
- `includes`, `indexOf`, `find`, `shift`, `splice` et le spread sont en O(n) : dans une boucle, O(n²).
- `Map` et `Set` offrent des recherches en O(1) en moyenne ; `push` et `pop` sont en O(1) amorti.
- Les transformations de tableaux coûtent aussi de la mémoire.
- On raisonne en Big O pour prévoir, on mesure pour décider.

## Exercices

1. Donne la complexité en temps de chacune de ces fonctions, en fonction de la taille `n` du tableau, et justifie
   en une phrase.

   ```js
   const premier = (tableau) => tableau[0];
   const somme = (tableau) => tableau.reduce((total, x) => total + x, 0);
   const aDesDoublons = (tableau) => tableau.some((x, i) => tableau.indexOf(x) !== i);
   const trieEtPremier = (tableau) => tableau.toSorted((a, b) => a - b)[0];
   ```

   :::indice
   Compte le nombre de fois où l'opération la plus répétée s'exécute. `indexOf` est lui-même un parcours.
   :::

   :::solution
   - `premier` : O(1), un seul accès, quelle que soit la taille.
   - `somme` : O(n), un passage sur chaque élément.
   - `aDesDoublons` : O(n²) dans le pire cas, car `some` peut appeler `n` fois un `indexOf` qui parcourt jusqu'à `n`
     éléments. Un `Set` la ramène à O(n).
   - `trieEtPremier` : O(n log n) pour le tri, plus O(n) pour la copie. Chercher le minimum avec une seule boucle,
     ou `Math.min(...tableau)` sur un tableau de taille raisonnable, suffit : O(n).

   ```js
   const aDesDoublonsRapide = (tableau) => new Set(tableau).size !== tableau.length;

   console.log(aDesDoublonsRapide([1, 2, 3, 2])); // true
   console.log(aDesDoublonsRapide([1, 2, 3])); // false
   ```
   :::

2. Cette fonction regroupe des ventes par vendeur. Elle devient très lente au-delà de quelques dizaines de milliers
   de ventes. Explique pourquoi, puis réécris-la en O(n).

   ```js
   function totalParVendeur(ventes) {
     const vendeurs = [];
     for (const vente of ventes) {
       const existant = vendeurs.find((v) => v.nom === vente.vendeur);
       if (existant) {
         existant.total += vente.montant;
       } else {
         vendeurs.push({ nom: vente.vendeur, total: vente.montant });
       }
     }
     return vendeurs;
   }
   ```

   :::indice
   Combien coûte `find` quand il y a beaucoup de vendeurs différents ? Quelle structure retrouve une entrée par sa
   clé en O(1) ?
   :::

   :::solution
   Pour chaque vente, `find` parcourt la liste des vendeurs déjà vus : O(n × v), soit O(n²) quand presque chaque
   vente a un vendeur différent. Une `Map` indexée par nom retrouve l'entrée en O(1) :

   ```js
   function totalParVendeur(ventes) {
     const totaux = new Map();
     for (const { vendeur, montant } of ventes) {
       totaux.set(vendeur, (totaux.get(vendeur) ?? 0) + montant);
     }
     return [...totaux].map(([nom, total]) => ({ nom, total }));
   }

   console.log(
     totalParVendeur([
       { vendeur: 'Ana', montant: 10 },
       { vendeur: 'Bao', montant: 5 },
       { vendeur: 'Ana', montant: 7 },
     ]),
   );
   // [ { nom: 'Ana', total: 17 }, { nom: 'Bao', total: 5 } ]
   ```

   Une `Map` conserve l'ordre d'insertion : le résultat garde l'ordre de première apparition, comme la version
   d'origine.
   :::

3. Une file d'attente de tâches est traitée avec `while (file.length) traiter(file.shift())`, et elle peut contenir
   100 000 tâches. Écris une classe `File` avec `ajouter(valeur)`, `retirer()` et `taille`, dont toutes les
   opérations sont en O(1) amorti.

   :::indice
   Au lieu de retirer physiquement le premier élément, retiens l'index de la tête. Pense à libérer la mémoire des
   éléments déjà retirés.
   :::

   :::solution
   ```js
   class File {
     #elements = [];
     #tete = 0;

     ajouter(valeur) {
       this.#elements.push(valeur);
     }

     retirer() {
       if (this.taille === 0) return undefined;
       const valeur = this.#elements[this.#tete];
       this.#elements[this.#tete] = undefined; // libère la référence
       this.#tete += 1;
       // Quand la moitié du tableau est vide, on le compacte : coût O(n) rare, O(1) amorti.
       if (this.#tete > 1024 && this.#tete * 2 > this.#elements.length) {
         this.#elements = this.#elements.slice(this.#tete);
         this.#tete = 0;
       }
       return valeur;
     }

     get taille() {
       return this.#elements.length - this.#tete;
     }
   }

   const file = new File();
   for (let i = 0; i < 100_000; i++) file.ajouter(i);
   let somme = 0;
   while (file.taille > 0) somme += file.retirer();
   console.log(somme); // 4999950000
   ```

   Le compactage copie les éléments restants, mais seulement quand la tête a dépassé la moitié du tableau : chaque
   élément est copié un nombre borné de fois, d'où le coût amorti constant.
   :::

## Questions d'entretien

- Qu'est-ce que la notation Big O, et pourquoi ignore-t-elle les constantes ?

  :::indice
  Elle décrit une croissance, pas une durée.
  :::

  :::reponse
  Elle décrit comment le nombre d'opérations, ou la mémoire, grandit quand la taille des données augmente. Elle
  ignore les constantes et les termes secondaires parce que, pour de grandes tailles, c'est la forme de la croissance
  qui domine : un algorithme en O(n) finira toujours par battre un algorithme en O(n²), quelles que soient leurs
  constantes. Pour de petites tailles en revanche, les constantes comptent, et c'est pourquoi on mesure avant
  d'optimiser.
  :::

- Quelle est la complexité de `tableau.filter((x) => autre.includes(x))`, et comment l'améliorer ?

  :::indice
  `includes` est un parcours.
  :::

  :::reponse
  O(n × m) : pour chacun des `n` éléments, `includes` parcourt jusqu'aux `m` éléments de `autre`. On construit une
  fois `const ensemble = new Set(autre)`, en O(m), puis on filtre avec `ensemble.has(x)`, en O(1) : O(n + m) au
  total. Au-delà de quelques milliers d'éléments, la différence se chiffre en secondes.
  :::

- Qu'est-ce qu'un coût amorti ? Donne un exemple en JavaScript.

  :::indice
  Pense à ce qui se passe quand un tableau n'a plus de place pour un `push`.
  :::

  :::reponse
  C'est le coût moyen d'une opération sur une longue suite d'opérations, même si certaines sont ponctuellement
  chères. `push` est en O(1) amorti : quand la capacité du tableau est atteinte, le moteur alloue un espace plus
  grand, proportionnel à la taille actuelle, et copie tout, en O(n). Comme cela arrive de plus en plus rarement, la
  somme des copies reste proportionnelle au nombre de `push`, et chaque `push` coûte en moyenne une constante.
  :::
