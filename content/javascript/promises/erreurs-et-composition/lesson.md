---
id: javascript-promesses-erreurs
title: "Propagation des erreurs et composition de promesses"
slug: erreurs-et-composition
technology: javascript
level: advanced
module: promises
order: 4
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-then-catch
skills:
  - promise-errors
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Suivre le trajet d'une erreur dans une chaîne, et placer les `catch` au bon endroit.
- Transformer une erreur en la relevant avec un contexte, sans perdre sa cause.
- Composer plusieurs promesses, en séquence ou en parallèle avec `Promise.all`.

## Introduction

Une chaîne de promesses se comporte comme un bloc `try` : une erreur levée à n'importe quelle
étape saute les étapes suivantes jusqu'au premier `catch`. C'est pratique, et dangereux quand on
l'ignore : un `catch` placé trop tôt avale une erreur que la suite aurait dû voir, et une promesse
rompue sans aucun `catch` peut arrêter un serveur. Ce chapitre décrit la propagation, puis la façon
de combiner plusieurs promesses.

## Concept

| Situation | Comportement |
| --- | --- |
| Une étape lève ou renvoie une promesse rompue | les `then` suivants sont sautés jusqu'au prochain `catch` |
| Un `catch` renvoie une valeur | la chaîne reprend normalement |
| Un `catch` relève une erreur | la chaîne reste rompue, jusqu'au `catch` suivant |
| Aucun `catch` ne traite le rejet | rejet non géré : avertissement en navigateur, arrêt du processus Node.js |

Pour combiner des promesses :

| Besoin | Écriture |
| --- | --- |
| Étapes qui dépendent les unes des autres | une chaîne de `then` |
| Opérations indépendantes, toutes nécessaires | `Promise.all([p1, p2, p3])` |

`Promise.all` renvoie une promesse tenue avec le **tableau des valeurs, dans l'ordre des
promesses fournies**, ou rompue dès la **première** erreur.

## Exemple

```js
function etape(nom, echoue = false) {
  return () => {
    console.log(`→ ${nom}`);
    if (echoue) throw new Error(`${nom} a échoué`);
    return nom;
  };
}

Promise.resolve()
  .then(etape('valider'))
  .then(etape('payer', true))
  .then(etape('expédier')) // sautée : la chaîne est rompue
  .catch((erreur) => {
    console.log('capturée :', erreur.message);
    throw new Error('commande annulée', { cause: erreur }); // relever avec un contexte
  })
  .catch((erreur) => console.log(erreur.message, '| cause :', erreur.cause.message))
  .then(() => composer());

function composer() {
  const prix = (id) => new Promise((resolve) => setTimeout(() => resolve(id * 10), 10 * id));

  Promise.all([prix(3), prix(1), prix(2)]).then((valeurs) => {
    console.log('en parallèle :', valeurs); // [30, 10, 20] : ordre des entrées, pas d'arrivée
  });
}
// → valider
// → payer
// capturée : payer a échoué
// commande annulée | cause : payer a échoué
// en parallèle : [ 30, 10, 20 ]
```

## Comment ça fonctionne

Une promesse rompue se propage exactement comme une exception : chaque `then` qui ne prévoit pas
de gestionnaire d'erreur transmet la rupture à la promesse qu'il crée, sans exécuter son callback.
La rupture descend ainsi la chaîne jusqu'au premier `catch`. C'est pourquoi un seul `catch` en fin
de chaîne suffit à couvrir toutes les étapes — et pourquoi un `catch` placé **au milieu** change le
sens de la suite : s'il ne relève pas l'erreur, les étapes suivantes s'exécutent comme si tout
allait bien, avec la valeur qu'il a renvoyée, souvent `undefined`.

**Relever** une erreur avec un contexte est la bonne pratique quand une couche du programme veut
donner du sens à un échec technique : « commande annulée » dit plus à l'utilisateur que « réseau
indisponible ». L'option `{ cause }` du constructeur `Error`, depuis ES2022, conserve l'erreur
d'origine pour le diagnostic.

Une promesse rompue sans aucun gestionnaire devient un **rejet non géré**. Le navigateur affiche
un avertissement et émet l'événement `unhandledrejection`. Node.js, depuis sa version 15, **arrête
le processus** : un serveur entier peut tomber pour un `catch` oublié. On veille donc à ce que
chaque chaîne se termine par un `catch`, ou soit renvoyée à un appelant qui s'en charge.

`Promise.all` lance l'attente de toutes les promesses **en même temps**. Ses valeurs suivent l'ordre
du tableau d'entrée, quel que soit l'ordre d'arrivée. Il se rompt dès la **première** erreur, sans
attendre les autres — qui continuent pourtant de s'exécuter, puisqu'une promesse ne s'annule pas.
C'est le bon outil quand toutes les opérations sont nécessaires ; le module suivant présente
`allSettled`, `race` et `any` pour les autres cas.

Pour des étapes qui doivent se suivre, dans un ordre imposé ou parce que chacune dépend de la
précédente, on enchaîne les `then`. Pour une liste d'étapes connue seulement à l'exécution, un
`reduce` construit la chaîne. Le module Async / await montre une écriture plus lisible des deux cas.

## Erreurs fréquentes

**Placer un `catch` au milieu sans relever.** La suite s'exécute avec une valeur vide.

**Laisser une chaîne sans `catch`.** Rejet non géré, et arrêt d'un processus Node.js.

**Relever une nouvelle erreur sans `cause`.** L'erreur d'origine est perdue pour le diagnostic.

**Croire que `Promise.all` annule les autres opérations en cas d'échec.** Elles continuent.

**Exécuter en séquence des opérations indépendantes.** Elles pourraient attendre ensemble.

## À retenir

- Une rupture saute les `then` jusqu'au premier `catch`, comme une exception.
- Un `catch` qui renvoie une valeur récupère ; qui relève, propage.
- Toute chaîne doit se terminer par un `catch` ou être renvoyée à un appelant.
- `Promise.all` : valeurs dans l'ordre d'entrée, rupture à la première erreur, sans annulation.
- Séquence pour les étapes dépendantes, `Promise.all` pour les opérations indépendantes.

## Exercices

1. Ce code affiche `Total : undefined` au lieu de s'arrêter sur l'erreur. Explique pourquoi et
   corrige.

   ```js
   chargerPanier()
     .catch((erreur) => console.log('Échec :', erreur.message))
     .then((panier) => calculerTotal(panier))
     .then((total) => console.log('Total :', total));
   ```

   :::indice
   Que renvoie le `catch`, et que devient la chaîne après lui ?
   :::

   :::solution
   Le `catch` affiche l'erreur puis renvoie `undefined` : la chaîne repart en succès, et les étapes
   suivantes s'exécutent avec un panier absent. Le `catch` doit venir à la fin.

   ```js
   const chargerPanier = () => Promise.reject(new Error('panier introuvable'));
   const calculerTotal = (panier) => panier.reduce((s, p) => s + p, 0);

   chargerPanier()
     .then((panier) => calculerTotal(panier))
     .then((total) => console.log('Total :', total))
     .catch((erreur) => console.log('Échec :', erreur.message)); // 'Échec : panier introuvable'
   ```
   :::

2. Charge trois ressources indépendantes en parallèle et affiche la somme de leurs tailles. Si l'une
   échoue, affiche un seul message d'erreur.

   :::indice
   `Promise.all` attend les trois ensemble et renvoie leurs valeurs dans l'ordre fourni.
   :::

   :::solution
   ```js
   const charger = (nom, taille, echoue = false) =>
     new Promise((resolve, reject) =>
       setTimeout(() => (echoue ? reject(new Error(`${nom} indisponible`)) : resolve(taille)), 10),
     );

   Promise.all([charger('images', 120), charger('styles', 30), charger('scripts', 50)])
     .then((tailles) => console.log('total :', tailles.reduce((s, t) => s + t, 0))) // 'total : 200'
     .catch((erreur) => console.log('échec :', erreur.message));

   Promise.all([charger('images', 120), charger('styles', 30, true)])
     .then(() => console.log('jamais'))
     .catch((erreur) => console.log('échec :', erreur.message)); // 'échec : styles indisponible'
   ```
   :::

3. Écris `executerEnSerie(taches)` : `taches` est un tableau de fonctions qui renvoient chacune une
   promesse. Elles doivent s'exécuter l'une après l'autre, et la fonction doit renvoyer une promesse
   du tableau de leurs résultats.

   :::indice
   Pars d'une promesse tenue avec `[]`, et pour chaque tâche, enchaîne son exécution puis ajoute son
   résultat au tableau.
   :::

   :::solution
   ```js
   function executerEnSerie(taches) {
     return taches.reduce(
       (chaine, tache) =>
         chaine.then((resultats) => tache().then((resultat) => [...resultats, resultat])),
       Promise.resolve([]),
     );
   }

   const journal = [];
   const tache = (nom, ms) => () =>
     new Promise((resolve) => setTimeout(() => { journal.push(nom); resolve(nom); }, ms));

   executerEnSerie([tache('a', 30), tache('b', 10), tache('c', 20)]).then((resultats) => {
     console.log(resultats, journal); // ['a', 'b', 'c'] ['a', 'b', 'c']
   });
   ```

   Chaque tâche ne démarre qu'à la fin de la précédente : l'ordre est respecté même si `b` est plus
   rapide que `a`. Les tâches reçoivent des **fonctions**, pas des promesses, sinon elles auraient
   toutes démarré dès la création du tableau.
   :::

## Questions d'entretien

- Comment une erreur se propage-t-elle dans une chaîne de promesses ?

  :::indice
  Compare avec une exception dans un bloc `try`.
  :::

  :::reponse
  Comme une exception : dès qu'une étape lève une erreur ou renvoie une promesse rompue, les `then`
  suivants sont sautés jusqu'au premier `catch`. Si ce `catch` renvoie une valeur, la chaîne repart
  en succès ; s'il relève une erreur, la rupture continue. Un seul `catch` final couvre donc toutes
  les étapes, et un `catch` intermédiaire doit relever l'erreur s'il ne veut pas la masquer.
  :::

- Que se passe-t-il avec une promesse rompue que personne ne gère ?

  :::indice
  Les conséquences diffèrent entre un navigateur et Node.js.
  :::

  :::reponse
  C'est un rejet non géré. Le navigateur affiche un avertissement dans la console et émet
  l'événement `unhandledrejection`. Node.js, depuis sa version 15, arrête le processus par défaut,
  ce qui peut faire tomber un serveur entier. Chaque chaîne doit donc se terminer par un `catch`, ou
  être renvoyée à un appelant qui la gère, et une surveillance globale de `unhandledrejection` sert
  de filet pour journaliser les oublis.
  :::

- Comment se comporte `Promise.all` quand une des promesses échoue ?

  :::indice
  Attend-il les autres ? Les annule-t-il ?
  :::

  :::reponse
  Il se rompt immédiatement avec la première erreur, sans attendre les autres promesses. Celles-ci
  ne sont pas annulées : les opérations continuent, mais leurs résultats sont ignorés. Quand on a
  besoin de toutes les issues, succès et échecs, on utilise `Promise.allSettled`, et pour annuler
  réellement des requêtes, un `AbortController`.
  :::
