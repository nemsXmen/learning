---
id: javascript-minuteurs
title: "setTimeout, setInterval et leurs pièges"
slug: minuteurs
technology: javascript
level: intermediate
module: asynchronisme
order: 3
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-event-loop
skills:
  - timers
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Programmer, répéter et annuler une exécution différée.
- Choisir entre `setInterval` et un `setTimeout` récursif.
- Éviter les minuteurs oubliés, les dérives et les appels qui se chevauchent.

## Introduction

Relancer une vérification toutes les dix secondes, afficher un message qui disparaît, attendre
avant de réessayer une requête : les minuteurs sont l'outil asynchrone le plus simple, et l'un
des plus souvent mal utilisés. Un intervalle jamais arrêté continue de tourner après la fermeture
d'un composant ; un délai supposé exact dérive sous la charge. Ce chapitre fait le tour de ces
pièges.

## Concept

| Fonction | Effet | Renvoie |
| --- | --- | --- |
| `setTimeout(f, delai, ...args)` | exécute `f` une fois, après **au moins** `delai` ms | un identifiant |
| `setInterval(f, delai, ...args)` | exécute `f` toutes les `delai` ms environ | un identifiant |
| `clearTimeout(id)` | annule un `setTimeout` pas encore exécuté | `undefined` |
| `clearInterval(id)` | arrête un intervalle | `undefined` |

L'identifiant est un nombre dans un navigateur et un objet `Timeout` dans Node.js : on le
conserve simplement pour pouvoir annuler.

Deux façons de répéter :

- **`setInterval`** programme les exécutions à cadence fixe, sans attendre la fin de la
  précédente ;
- **`setTimeout` récursif** programme l'exécution suivante **à la fin** de la courante : le
  délai sépare deux fins et deux débuts, jamais deux exécutions qui se chevauchent.

## Exemple

```js
const annule = setTimeout(() => console.log('jamais affiché'), 50);
clearTimeout(annule);

let ticks = 0;
const intervalle = setInterval(() => {
  ticks += 1;
  console.log(`tick ${ticks}`);
  if (ticks === 3) {
    clearInterval(intervalle); // sans cette ligne, l'intervalle tourne indéfiniment
    demarrerSequence();
  }
}, 20);

// setTimeout récursif : la suite n'est programmée qu'une fois l'étape terminée.
function demarrerSequence() {
  let tours = 0;
  function tour() {
    tours += 1;
    console.log(`tour ${tours}`);
    if (tours < 3) {
      setTimeout(tour, 20);
    }
  }
  setTimeout(tour, 20);
}

setTimeout((prenom, salutation) => console.log(`${salutation} ${prenom}`), 0, 'Ada', 'Bonjour');
// Affiche d'abord 'Bonjour Ada', puis tick 1, tick 2, tick 3, puis tour 1, tour 2, tour 3.
```

## Comment ça fonctionne

Le délai d'un minuteur est la durée **minimale** avant que le callback soit placé dans la file des
macrotâches. Il s'exécute ensuite quand la pile est vide et que les tâches précédentes sont
passées : un calcul bloquant, ou une longue file d'événements, le retarde d'autant. Les
navigateurs ajoutent leurs propres règles : un minuteur imbriqué sur plusieurs niveaux est
ramené à au moins 4 ms, et les onglets en arrière-plan ralentissent fortement leurs minuteurs,
souvent à une exécution par seconde ou moins, pour économiser la batterie. Un minuteur ne sert
donc pas à mesurer le temps : pour cela, on compare des horodatages avec `Date.now()` ou
`performance.now()`.

`setInterval` programme les exécutions à cadence fixe **sans se soucier de ce que fait le
callback**. Si ce callback lance une opération asynchrone plus longue que l'intervalle — une
requête réseau lente, par exemple —, l'appel suivant démarre avant la fin du précédent : les
requêtes se chevauchent et leurs réponses peuvent arriver dans le désordre. Le `setTimeout`
récursif n'a pas ce défaut : l'étape suivante n'est programmée qu'une fois l'étape courante
terminée, ce qui garantit un écart entre deux exécutions et permet d'adapter le délai, par
exemple pour espacer les tentatives après une erreur.

Un minuteur **retient son callback**, et tout ce que ce callback capture, jusqu'à son exécution
ou son annulation. Un intervalle jamais arrêté vit donc aussi longtemps que la page ou le
processus, avec son environnement : dans une application à composants, chaque montage qui crée
un intervalle doit l'arrêter au démontage. Dans Node.js, un minuteur actif maintient même le
processus en vie ; `timeout.unref()` indique qu'il ne doit pas l'empêcher de se terminer.

Le délai accepté est limité à 2 147 483 647 ms, soit environ 24,8 jours. Au-delà, la valeur
déborde et le callback s'exécute presque immédiatement. Enfin, on ne passe jamais une chaîne de
caractères à `setTimeout` : elle serait évaluée comme du code, avec les mêmes risques qu'`eval`.

## Erreurs fréquentes

**Oublier d'arrêter un intervalle.** Il tourne indéfiniment et retient tout ce qu'il capture.

**Utiliser `setInterval` pour une opération asynchrone.** Les appels se chevauchent : préfère un
`setTimeout` récursif.

**Mesurer une durée en comptant les ticks.** Les délais dérivent : compare des horodatages.

**Perdre l'identifiant du minuteur.** Sans lui, impossible d'annuler.

**Passer une méthode détachée en callback.** Elle perd son `this`, comme vu dans la partie Runtime.

## À retenir

- `setTimeout` : une fois, après au moins le délai ; `setInterval` : à cadence fixe.
- Conserve l'identifiant pour `clearTimeout` ou `clearInterval`.
- Pour répéter une opération asynchrone, préfère un `setTimeout` récursif.
- Un minuteur actif retient son callback : arrête ce que tu démarres.
- Les délais sont des minimums, ralentis en arrière-plan ; mesure le temps avec des horodatages.

## Exercices

1. Écris `afficherTemporairement(message, duree, afficher, masquer)` qui affiche un message puis
   le masque après `duree` ms, et renvoie une fonction permettant de le fermer plus tôt sans que
   le masquage automatique s'exécute ensuite.

   :::indice
   Conserve l'identifiant du minuteur : la fonction renvoyée l'annule et masque immédiatement.
   :::

   :::solution
   ```js
   function afficherTemporairement(message, duree, afficher, masquer) {
     afficher(message);
     const id = setTimeout(masquer, duree);
     return () => {
       clearTimeout(id);
       masquer();
     };
   }

   const journal = [];
   const fermer = afficherTemporairement(
     'Enregistré',
     3000,
     (m) => journal.push(`affiche ${m}`),
     () => journal.push('masque'),
   );
   fermer();
   setTimeout(() => console.log(journal), 3100); // ['affiche Enregistré', 'masque']
   ```

   Sans `clearTimeout`, le masquage s'exécuterait une seconde fois au bout de trois secondes.
   :::

2. Écris `interroger(verifier, delai, maxTentatives)` qui appelle `verifier(rappel)` jusqu'à ce que
   le rappel reçoive `true`, en attendant `delai` ms entre la fin d'une vérification et le début de
   la suivante, sans dépasser `maxTentatives`.

   :::indice
   Programme la tentative suivante **dans** le rappel, pas à intervalle fixe.
   :::

   :::solution
   ```js
   function interroger(verifier, delai, maxTentatives, quandFini) {
     let tentatives = 0;

     function essayer() {
       tentatives += 1;
       verifier((pret) => {
         if (pret) return quandFini(true, tentatives);
         if (tentatives >= maxTentatives) return quandFini(false, tentatives);
         setTimeout(essayer, delai);
       });
     }

     essayer();
   }

   let appels = 0;
   const verifier = (rappel) => setTimeout(() => rappel(++appels === 3), 10);
   interroger(verifier, 20, 5, (reussi, n) => console.log(reussi, n)); // true 3
   ```

   Une vérification lente ne peut jamais en chevaucher une autre, puisque la suivante n'est
   programmée qu'à l'arrivée du résultat.
   :::

3. Ce code lance une requête simulée de 50 ms toutes les 20 ms. Mesure combien de requêtes sont en
   cours en même temps, puis corrige pour qu'il n'y en ait jamais plus d'une.

   ```js
   let enCours = 0;
   let maximum = 0;
   function requete(fin) {
     enCours += 1;
     maximum = Math.max(maximum, enCours);
     setTimeout(() => { enCours -= 1; fin(); }, 50);
   }
   const id = setInterval(() => requete(() => {}), 20);
   ```

   :::indice
   `setInterval` ne sait pas que la requête précédente n'est pas finie. Qui devrait programmer la
   requête suivante ?
   :::

   :::solution
   Avec `setInterval`, une nouvelle requête démarre toutes les 20 ms alors que chacune dure 50 ms :
   plusieurs requêtes se chevauchent — deux ou trois selon la précision des minuteurs. La version récursive ne programme la suivante qu'à la fin
   de la précédente.

   ```js
   let enCours = 0;
   let maximum = 0;
   function requete(fin) {
     enCours += 1;
     maximum = Math.max(maximum, enCours);
     setTimeout(() => { enCours -= 1; fin(); }, 50);
   }

   let restantes = 5;
   function suivante() {
     requete(() => {
       restantes -= 1;
       if (restantes > 0) setTimeout(suivante, 20);
       else console.log('simultanées au maximum :', maximum); // 1
     });
   }
   suivante();
   ```
   :::

## Questions d'entretien

- Quelle différence entre `setInterval` et un `setTimeout` récursif ?

  :::indice
  Pense à un callback qui lance une opération plus longue que l'intervalle.
  :::

  :::reponse
  `setInterval` programme les exécutions à cadence fixe, sans attendre la fin du travail
  précédent : avec une opération asynchrone lente, les appels se chevauchent. Un `setTimeout`
  récursif ne programme l'exécution suivante qu'à la fin de la courante, ce qui garantit un écart
  entre deux exécutions et permet d'ajuster le délai à chaque tour, par exemple pour espacer les
  tentatives après une erreur.
  :::

- Le délai d'un `setTimeout` est-il garanti ?

  :::indice
  Que se passe-t-il si la pile est occupée au moment où le délai expire ?
  :::

  :::reponse
  Non, c'est un minimum. À l'expiration, le callback est placé dans la file des macrotâches et
  attend que la pile soit vide et que les tâches précédentes soient passées. Les navigateurs
  ajoutent un délai minimal pour les minuteurs imbriqués et ralentissent ceux des onglets en
  arrière-plan. Pour mesurer une durée, on compare des horodatages plutôt que de compter des ticks.
  :::

- Pourquoi un intervalle oublié est-il un problème ?

  :::indice
  Que retient un minuteur actif, et combien de temps ?
  :::

  :::reponse
  Un intervalle actif continue de s'exécuter indéfiniment et retient son callback, avec tout ce
  que ce callback capture : c'est à la fois du travail inutile et une fuite mémoire. Dans une
  interface, un composant détruit continue d'agir, parfois sur des éléments qui n'existent plus ;
  dans Node.js, l'intervalle empêche même le processus de se terminer. On conserve l'identifiant
  et on arrête l'intervalle quand il n'a plus de raison d'être.
  :::
