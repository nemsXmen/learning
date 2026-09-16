---
id: javascript-memoization
title: "Mémoïsation et cas pratiques des closures"
slug: memoization
technology: javascript
level: advanced
module: closures
order: 3
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-factory-functions
skills:
  - memoization
tags:
  - javascript
  - closures
---

## Objectifs

- Écrire une fonction `memoize` qui garde les résultats déjà calculés.
- Choisir une clé de cache correcte, et savoir quand le cache est dangereux.
- Reconnaître les autres usages courants des closures : `once`, compteurs, limitation
  d'appels.

## Introduction

Un calcul coûteux appelé deux fois avec les mêmes arguments n'a aucune raison d'être refait.
La **mémoïsation** consiste à garder les résultats dans un cache que seule la fonction
connaît — donc dans une closure. C'est l'usage le plus visible d'une famille de motifs où
une fonction retient quelque chose entre deux appels.

## Concept

| Motif | Ce que la closure retient | Usage |
| --- | --- | --- |
| `memoize(f)` | une `Map` des résultats par argument | éviter de recalculer |
| `once(f)` | un booléen et le résultat | garantir un seul appel utile |
| compteur | un nombre | identifiants, statistiques |
| limitation d'appels | un horodatage ou un minuteur | *debounce*, *throttle* |

La mémoïsation suppose une fonction **pure** : si le résultat dépend de l'heure, du réseau
ou d'un état modifiable, le cache renverra une réponse périmée.

## Exemple

```js
function memoize(fonction) {
  const cache = new Map();

  return (...arguments_) => {
    const cle = JSON.stringify(arguments_);
    if (cache.has(cle)) {
      return cache.get(cle);
    }
    const resultat = fonction(...arguments_);
    cache.set(cle, resultat);
    return resultat;
  };
}

let appels = 0;
const lent = (n) => {
  appels += 1;
  return n * 2;
};

const rapide = memoize(lent);
console.log(rapide(21), rapide(21), appels); // 42 42 1 : un seul calcul

function once(fonction) {
  let fait = false;
  let resultat;
  return (...arguments_) => {
    if (!fait) {
      fait = true;
      resultat = fonction(...arguments_);
    }
    return resultat;
  };
}

const initialiser = once(() => {
  console.log('initialisation');
  return { pret: true };
});
initialiser(); // affiche
initialiser(); // n'affiche plus

const identifiant = (() => {
  let n = 0;
  return () => (n += 1);
})();
console.log(identifiant(), identifiant()); // 1 2
```

## Comment ça fonctionne

`memoize` renvoie une fonction qui garde le `cache` dans sa closure : il n'est accessible
par personne d'autre, et il survit d'un appel à l'autre. La fonction d'origine n'est appelée
que lorsque la clé est absente.

Le point délicat est la **clé**. `JSON.stringify(arguments_)` est simple et suffit pour des
arguments primitifs, mais il a des limites : l'ordre des propriétés d'un objet change la
chaîne produite, `undefined` et les fonctions disparaissent, et une référence circulaire lève
une erreur. Pour une fonction à un seul argument primitif, la valeur elle-même fait une
meilleure clé ; pour un argument objet, une `WeakMap` indexée par cet objet évite à la fois
la sérialisation et la rétention mémoire.

Un cache n'est valable que si la fonction est **pure**. Mémoïser une fonction qui lit
l'heure, interroge le réseau ou dépend d'un état modifiable revient à figer une réponse
périmée. C'est le même raisonnement que pour les fonctions pures : la mémoïsation est une
récompense de la pureté.

Un cache non borné est une fuite mémoire lente : chaque nouvelle combinaison d'arguments
ajoute une entrée définitive. En production, on borne la taille — en supprimant l'entrée la
plus ancienne, par exemple — ou l'on donne une durée de vie aux entrées.

Enfin, la mémoïsation ne rend rien plus rapide toute seule : elle échange du temps contre de
la mémoire. Elle est utile pour un calcul coûteux répété avec les mêmes entrées, inutile pour
une fonction déjà rapide, et contre-productive pour une fonction appelée chaque fois avec des
arguments différents.

## Erreurs fréquentes

**Mémoïser une fonction impure.** Le cache sert des résultats périmés.

**Construire une clé fragile.** `String(arguments_)` confond `[1, 2]` et `'1,2'` ;
`JSON.stringify` dépend de l'ordre des clés.

**Laisser le cache grandir sans limite.** Sur un service de longue durée, c'est une fuite.

**Mémoïser au mauvais endroit.** Un cache créé à l'intérieur de la fonction appelée est
recréé à chaque appel et ne sert à rien.

## À retenir

- `memoize` garde un cache privé dans une closure ; la fonction d'origine reste inchangée.
- La clé doit distinguer exactement les appels : attention à `JSON.stringify`.
- Ne mémoïse que des fonctions pures.
- Un cache non borné finit par fuir : borne la taille ou la durée de vie.
- Même famille de motifs : `once`, compteurs, *debounce* et *throttle*.

## Exercices

1. Écris `memoize(fonction)` pour une fonction à un seul argument primitif, et vérifie
   qu'un second appel identique ne recalcule pas.

   :::indice
   Le cache doit vivre dans la closure, pas dans la fonction appelée.
   :::

   :::indice
   Avec un seul argument primitif, l'argument lui-même peut servir de clé.
   :::

   :::solution
   ```js
   function memoize(fonction) {
     const cache = new Map();
     return (argument) => {
       if (!cache.has(argument)) {
         cache.set(argument, fonction(argument));
       }
       return cache.get(argument);
     };
   }

   let appels = 0;
   const carre = memoize((n) => {
     appels += 1;
     return n * n;
   });

   console.log(carre(4), carre(4), appels); // 16 16 1
   ```

   `has` plutôt qu'un test sur `get` : sinon, un résultat valant `undefined` ou `0` serait
   recalculé à chaque fois.
   :::

2. Écris `once(fonction)` : le premier appel exécute, les suivants renvoient le même
   résultat sans réexécuter.

   :::indice
   La closure doit retenir deux choses : le fait que l'appel a eu lieu, et son résultat.
   :::

   :::solution
   ```js
   function once(fonction) {
     let fait = false;
     let resultat;
     return (...arguments_) => {
       if (!fait) {
         fait = true;
         resultat = fonction(...arguments_);
       }
       return resultat;
     };
   }

   const init = once(() => {
     console.log('initialisation');
     return { pret: true };
   });

   console.log(init(), init()); // 'initialisation' affiché une seule fois
   ```

   Le drapeau `fait` est nécessaire : tester `resultat === undefined` échouerait pour une
   fonction qui renvoie précisément `undefined`.
   :::

3. Explique pourquoi mémoïser cette fonction est une mauvaise idée, puis corrige la
   conception.

   ```js
   const tauxDuJour = memoize((devise) => lireTauxDepuisApi(devise));
   ```

   :::indice
   Le résultat dépend-il uniquement de l'argument ?
   :::

   :::solution
   Le taux change avec le temps : la fonction n'est pas pure, et le cache servira
   indéfiniment la première valeur obtenue. Il faut une durée de vie explicite.

   ```js
   function memoizeAvecDuree(fonction, dureeMs) {
     const cache = new Map();
     return (cle, maintenant = Date.now()) => {
       const entree = cache.get(cle);
       if (entree && maintenant - entree.a < dureeMs) {
         return entree.valeur;
       }
       const valeur = fonction(cle);
       cache.set(cle, { valeur, a: maintenant });
       return valeur;
     };
   }
   ```

   L'instant passe en paramètre, ce qui garde la fonction testable.
   :::

## Questions d'entretien

- Qu'est-ce que la mémoïsation, et que suppose-t-elle ?

  :::indice
  Qu'échange-t-on contre quoi, et à quelle condition ?
  :::

  :::reponse
  C'est le fait de garder les résultats déjà calculés dans un cache privé, pour renvoyer
  immédiatement la réponse d'un appel identique. Elle échange de la mémoire contre du temps,
  et n'a de sens que si la fonction est pure : une fonction qui dépend de l'heure, du réseau
  ou d'un état modifiable renverrait une valeur périmée. Elle ne se justifie que pour un
  calcul réellement coûteux, répété avec les mêmes arguments.
  :::

- Comment choisir la clé de cache ?

  :::indice
  Que se passe-t-il si deux appels différents produisent la même clé ?
  :::

  :::reponse
  La clé doit distinguer exactement deux appels qui doivent donner des résultats différents.
  Pour un argument primitif unique, l'argument lui-même suffit, avec une `Map` qui accepte
  tout type. `JSON.stringify` des arguments est pratique mais fragile : il dépend de l'ordre
  des propriétés, perd `undefined` et les fonctions, et échoue sur une référence circulaire.
  Pour un argument objet, une `WeakMap` indexée par cet objet évite la sérialisation et
  laisse le ramasse-miettes faire son travail.
  :::

- Quel est le risque d'un cache en mémoire dans un service de longue durée ?

  :::indice
  Que devient le cache après des millions d'appels différents ?
  :::

  :::reponse
  Un cache non borné grandit indéfiniment : chaque combinaison d'arguments ajoute une entrée
  qui ne sera jamais libérée, ce qui constitue une fuite mémoire lente et difficile à
  diagnostiquer. On borne donc la taille — en évinçant l'entrée la plus ancienne ou la moins
  utilisée —, on donne une durée de vie aux entrées, ou l'on utilise une `WeakMap` quand les
  clés sont des objets dont la durée de vie est déjà gérée ailleurs.
  :::
