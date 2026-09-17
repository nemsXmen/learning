---
id: javascript-iterateurs-asynchrones
title: "Itérateurs asynchrones et for await...of"
slug: iterateurs-asynchrones
technology: javascript
level: advanced
module: iterateurs-generateurs
order: 3
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-generateurs
  - javascript-fetch
skills:
  - async-iterators
tags:
  - javascript
  - avance
---

## Objectifs

- Parcourir une suite de valeurs qui arrivent dans le temps avec `for await...of`.
- Écrire un générateur asynchrone avec `async function*` pour paginer une API ou lire un flux.
- Savoir quand un parcours séquentiel est voulu, et quand il ralentit inutilement.

## Introduction

Certaines données n'arrivent pas d'un bloc : les pages successives d'une API, les lignes d'un gros fichier lu
morceau par morceau, les messages d'une connexion ouverte. Les itérateurs ordinaires supposent que la valeur
suivante est disponible immédiatement. Les **itérateurs asynchrones** étendent le protocole au temps : chaque valeur
est une promesse, et `for await...of` attend chacune avant de passer à la suivante.

## Concept

| Élément | Version synchrone | Version asynchrone |
| --- | --- | --- |
| Méthode du protocole | `[Symbol.iterator]()` | `[Symbol.asyncIterator]()` |
| Résultat de `next()` | `{ value, done }` | une promesse de `{ value, done }` |
| Boucle | `for (const x of …)` | `for await (const x of …)` dans une fonction `async` ou un module |
| Générateur | `function*` | `async function*`, qui peut utiliser `await` et `yield` |

`for await...of` accepte aussi les itérables synchrones de promesses, comme un tableau de promesses : il attend chaque
élément dans l'ordre.

Côté Node.js, les flux lisibles — un fichier ouvert avec `fs.createReadStream`, le corps d'une réponse — sont des
itérables asynchrones : `for await (const morceau of flux)` lit un fichier sans le charger entièrement en mémoire.

## Exemple

```js
// Une API simulée qui renvoie des pages de résultats.
const toutesLesCommandes = Array.from({ length: 7 }, (_, i) => ({ id: i + 1 }));
async function chargerPage(numero, taille = 3) {
  await new Promise((resolve) => setTimeout(resolve, 10));
  const debut = (numero - 1) * taille;
  return { elements: toutesLesCommandes.slice(debut, debut + taille), pageSuivante: debut + taille < 7 ? numero + 1 : null };
}

async function* commandes() {
  let page = 1;
  while (page !== null) {
    const { elements, pageSuivante } = await chargerPage(page);
    console.log(`page ${page} chargée`);
    yield* elements;
    page = pageSuivante;
  }
}

const identifiants = [];
for await (const commande of commandes()) {
  identifiants.push(commande.id);
}
console.log(identifiants); // [1, 2, 3, 4, 5, 6, 7] après 'page 1', 'page 2', 'page 3'

for await (const commande of commandes()) {
  if (commande.id === 2) {
    console.log('trouvée sans charger les pages suivantes');
    break; // une seule page chargée
  }
}
```

## Comment ça fonctionne

`for await...of` appelle `[Symbol.asyncIterator]()`, puis attend la promesse renvoyée par chaque `next()` avant
d'exécuter le corps de la boucle. S'il ne trouve pas de méthode asynchrone, il se rabat sur `[Symbol.iterator]()` et
attend chaque valeur produite : c'est ce qui permet de parcourir un tableau de promesses. La boucle n'est utilisable
que dans une fonction `async` ou au niveau supérieur d'un module.

Un **générateur asynchrone** combine les deux mécanismes : `await` suspend en attendant une promesse, `yield` suspend
en livrant une valeur. Dans l'exemple, le générateur charge une page, livre ses éléments un à un avec `yield*`, et ne
charge la page suivante que lorsque le consommateur en redemande. La pagination devient invisible pour le code qui
parcourt : il voit une simple suite de commandes.

Cette paresse est l'intérêt principal. Si le consommateur trouve ce qu'il cherche à la deuxième commande et interrompt
la boucle, les pages suivantes ne sont **jamais demandées** : le `break` appelle `return()` sur le générateur, qui
s'arrête et exécute son éventuel `finally`. Le même principe permet de lire un fichier de plusieurs gigaoctets morceau
par morceau, avec une mémoire constante.

La contrepartie est que `for await...of` est **séquentiel** : chaque valeur est attendue avant de demander la
suivante. C'est exactement ce qu'il faut pour une pagination, où chaque page dépend de la précédente, ou pour un flux,
qui arrive dans l'ordre. En revanche, parcourir avec `for await` un tableau de promesses **déjà lancées** n'accélère
rien et masque les erreurs : si la troisième promesse est rompue pendant qu'on attend la première, elle devient un rejet
non géré. Pour des opérations indépendantes, `Promise.all` reste la bonne écriture.

Les **erreurs** se propagent naturellement : une exception levée ou une promesse rompue dans le générateur est levée
à l'endroit du `for await`, et un `try` / `catch` autour de la boucle la rattrape.

## Erreurs fréquentes

**Utiliser `for await` hors d'une fonction `async` ou d'un module.** C'est une erreur de syntaxe.

**Parcourir avec `for await` des requêtes indépendantes déjà lancées.** Utilise `Promise.all`.

**Charger toutes les pages avant de les parcourir.** Le générateur asynchrone ne charge que ce qui est consommé.

**Oublier que `break` interrompt le générateur.** Les ressources doivent être libérées dans un `finally`.

**Confondre `Symbol.iterator` et `Symbol.asyncIterator`.** `for...of` ne parcourt pas un itérable asynchrone.

## À retenir

- Protocole asynchrone : `[Symbol.asyncIterator]()` et un `next()` qui renvoie une promesse.
- `for await...of` attend chaque valeur ; il accepte aussi les itérables de promesses.
- `async function*` combine `await` et `yield`, idéal pour paginer ou lire un flux.
- Le parcours est paresseux : un `break` évite de charger la suite.
- Le parcours est séquentiel : pour des opérations indépendantes, `Promise.all`.

## Exercices

1. Écris un générateur asynchrone `lignesParLots(lignes, taille, delai)` qui livre les lignes par lots de `taille`, en
   attendant `delai` millisecondes avant chaque lot, puis compte les lots reçus avec `for await`.

   :::indice
   Découpe avec `slice` dans une boucle, `await` un minuteur, puis `yield` le lot.
   :::

   :::solution
   ```js
   const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

   async function* lignesParLots(lignes, taille, delai) {
     for (let i = 0; i < lignes.length; i += taille) {
       await attendre(delai);
       yield lignes.slice(i, i + taille);
     }
   }

   let lots = 0;
   for await (const lot of lignesParLots(['a', 'b', 'c', 'd', 'e'], 2, 5)) {
     lots += 1;
     console.log(lot); // ['a', 'b'], puis ['c', 'd'], puis ['e']
   }
   console.log(lots); // 3
   ```
   :::

2. Une API renvoie ses résultats par pages avec un curseur : `{ elements, curseurSuivant }`, où `curseurSuivant` vaut `null`
   à la dernière page. Écris un générateur générique `parcourirPages(charger)` qui livre tous les éléments, `charger` étant
   une fonction asynchrone qui reçoit le curseur.

   :::indice
   Commence avec un curseur `undefined`, et boucle tant que le curseur suivant n'est pas `null`.
   :::

   :::solution
   ```js
   async function* parcourirPages(charger) {
     let curseur;
     do {
       const { elements, curseurSuivant } = await charger(curseur);
       yield* elements;
       curseur = curseurSuivant;
     } while (curseur !== null);
   }

   const pages = { debut: { elements: ['a', 'b'], curseurSuivant: 'p2' }, p2: { elements: ['c'], curseurSuivant: null } };
   const charger = async (curseur) => pages[curseur ?? 'debut'];

   const tous = [];
   for await (const element of parcourirPages(charger)) tous.push(element);
   console.log(tous); // ['a', 'b', 'c']
   ```

   Le générateur ne connaît rien de l'API : la même fonction parcourt n'importe quelle source paginée par curseur.
   :::

3. Ce code attend trois requêtes déjà lancées avec `for await`. Explique pourquoi il peut provoquer un rejet non géré et
   n'est pas plus rapide qu'une autre écriture, puis corrige-le.

   ```js
   const requetes = [charger('a'), charger('b'), charger('c')];
   for await (const resultat of requetes) afficher(resultat);
   ```

   :::indice
   Les trois requêtes sont lancées dès la création du tableau. Qui gère une rupture de la troisième pendant qu'on attend la
   première ?
   :::

   :::solution
   Les trois requêtes démarrent immédiatement ; `for await` les attend ensuite une à une. Si la troisième est rompue
   pendant l'attente de la première, aucun gestionnaire n'est encore attaché à sa promesse : c'est un rejet non géré. Et
   le parcours n'apporte aucun gain, puisque les requêtes tournaient déjà en parallèle.

   ```js
   const charger = (nom, echoue = false) =>
     new Promise((resolve, reject) => setTimeout(() => (echoue ? reject(new Error(nom)) : resolve(nom)), 10));

   try {
     const resultats = await Promise.all([charger('a'), charger('b'), charger('c', true)]);
     resultats.forEach((resultat) => console.log(resultat));
   } catch (erreur) {
     console.log('échec :', erreur.message); // 'échec : c'
   }
   ```

   `Promise.all` attache ses gestionnaires à toutes les promesses dès le départ. `for await` convient aux valeurs produites
   à la demande, comme des pages ou un flux.
   :::

## Questions d'entretien

- Quelle différence entre `for...of` et `for await...of` ?

  :::indice
  Quel protocole chacun utilise-t-il, et qu'attend-il ?
  :::

  :::reponse
  `for...of` utilise `Symbol.iterator` et traite chaque valeur immédiatement. `for await...of` utilise
  `Symbol.asyncIterator`, attend la promesse renvoyée par chaque `next()` avant d'exécuter le corps, et accepte aussi les
  itérables synchrones de promesses. Il n'est utilisable que dans une fonction `async` ou au niveau supérieur d'un module,
  et il est séquentiel.
  :::

- Dans quels cas un générateur asynchrone est-il utile ?

  :::indice
  Pense à des données qui arrivent progressivement.
  :::

  :::reponse
  Quand des valeurs arrivent au fil du temps et doivent être consommées à la demande : pagination d'une API, lecture d'un
  fichier ou d'un corps de réponse par morceaux, messages d'une connexion. Le générateur cache le mécanisme — pages,
  curseurs, lectures — derrière une simple suite, ne charge que ce qui est consommé, et s'arrête proprement si le parcours
  est interrompu.
  :::

- Pourquoi ne pas utiliser `for await...of` pour attendre des requêtes indépendantes ?

  :::indice
  Pense au parallélisme et à la gestion des rejets.
  :::

  :::reponse
  Parce que `for await` attend les valeurs une à une. Si les requêtes sont déjà lancées, il n'accélère rien et laisse les
  promesses suivantes sans gestionnaire pendant l'attente : une rupture précoce devient un rejet non géré. Si elles sont
  lancées au fil du parcours, elles deviennent séquentielles sans raison. Pour des opérations indépendantes, `Promise.all`
  ou `Promise.allSettled` sont les bonnes écritures.
  :::
