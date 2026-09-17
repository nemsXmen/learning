---
id: javascript-methode-debogage
title: "Une méthode de débogage : reproduire, isoler, corriger, prouver"
slug: methode-de-debogage
technology: javascript
level: advanced
module: debugging
order: 4
estimatedMinutes: 30
difficulty: 3
xp: 90
prerequisites:
  - javascript-debug-reseau
skills:
  - debugging-method
tags:
  - javascript
  - debogage
---

## Objectifs

- Suivre une démarche en étapes plutôt que de modifier le code au hasard.
- Réduire un bug à son cas le plus simple, et tester une hypothèse à la fois.
- Corriger la cause plutôt que le symptôme, et le prouver par un test de régression.

## Introduction

Les outils des chapitres précédents ne servent à rien sans méthode. Face à un bug, la tentation est de
modifier une ligne, relancer, en modifier une autre : on finit parfois par faire disparaître le
symptôme sans savoir pourquoi, et le bug revient sous une autre forme. Les développeurs expérimentés
suivent une démarche proche de la méthode expérimentale. Elle paraît plus lente ; elle est presque
toujours plus rapide.

## Concept

| Étape | Question | Geste |
| --- | --- | --- |
| 1. Reproduire | Puis-je provoquer le bug à volonté ? | écrire les étapes exactes, les données, l'environnement |
| 2. Réduire | Quel est le plus petit cas qui échoue ? | retirer tout ce qui n'est pas nécessaire |
| 3. Isoler | Où le comportement diverge-t-il de l'attendu ? | comparer entrée et sortie de chaque étape, couper en deux |
| 4. Formuler | Quelle est la cause probable ? | une hypothèse précise, testable |
| 5. Vérifier | L'hypothèse est-elle vraie ? | une seule modification, puis observer |
| 6. Corriger | Qu'est-ce qui produit le bug, et non ce qui le montre ? | modifier la cause |
| 7. Prouver | Le bug peut-il revenir ? | un test de régression qui échouait avant la correction |

La recherche par **dichotomie** accélère l'isolement : couper le chemin suspect en deux, vérifier la
moitié où tout est encore correct, recommencer. Dans l'historique Git, `git bisect` fait de même entre
un commit sain et un commit cassé.

## Exemple

```js
import assert from 'node:assert/strict';

// Signalement : « après avoir affiché les meilleures ventes, le catalogue change d'ordre ».
function meilleuresVentes(produits, n = 3) {
  return produits.sort((a, b) => b.ventes - a.ventes).slice(0, n);
}

// 1-2. Reproduire avec le plus petit cas possible.
const catalogue = [{ nom: 'A', ventes: 1 }, { nom: 'B', ventes: 5 }];
meilleuresVentes(catalogue, 1);
console.log(catalogue.map((p) => p.nom)); // ['B', 'A'] : reproduit

// 3-5. Isoler, formuler et vérifier : « sort modifie le tableau reçu ».
const essai = [3, 1, 2];
console.log(essai.sort() === essai, essai); // true [1, 2, 3] : hypothèse confirmée

// 6. Corriger la cause.
function meilleuresVentesCorrigee(produits, n = 3) {
  return produits.toSorted((a, b) => b.ventes - a.ventes).slice(0, n);
}

// 7. Prouver par un test de régression.
const entree = [{ nom: 'A', ventes: 1 }, { nom: 'B', ventes: 5 }];
assert.deepEqual(meilleuresVentesCorrigee(entree, 1), [{ nom: 'B', ventes: 5 }]);
assert.deepEqual(entree.map((p) => p.nom), ['A', 'B']); // l'entrée n'est plus modifiée
console.log('test de régression : OK');
```

## Comment ça fonctionne

**Reproduire** vient en premier, parce qu'un bug qu'on ne peut pas déclencher ne peut pas être corrigé
avec certitude : on ne saura jamais si la modification a eu un effet. On note les étapes exactes, les
données, le navigateur, la version déployée. Si le bug est intermittent, on cherche ce qui varie : le
temps, l'ordre des requêtes, l'état laissé par une action précédente.

**Réduire** rend le problème lisible. Le signalement parle d'un catalogue et d'une page d'accueil ; le cas
minimal tient en deux produits et un appel de fonction. Chaque élément retiré sans que le bug disparaisse
est un suspect de moins. À la fin, le cas réduit devient souvent le test de régression.

**Isoler** consiste à trouver le premier endroit où la réalité s'écarte de l'attendu. On compare entrée et
sortie de chaque étape, avec des points d'arrêt ou des assertions, et l'on coupe le chemin en deux plutôt
que de tout parcourir. Pour une régression apparue entre deux versions, `git bisect` automatise la
dichotomie dans l'historique : il propose des commits intermédiaires, on indique s'ils sont sains ou
cassés, et il désigne le commit fautif en quelques étapes.

**Formuler puis vérifier** une hypothèse à la fois est la discipline centrale. « Le tri modifie le tableau
reçu » se vérifie en une ligne. Modifier trois choses à la fois, en revanche, empêche de savoir laquelle a
agi, et peut en casser une quatrième. Si l'hypothèse est fausse, on l'écarte et on en formule une autre à
partir de ce qu'on a observé.

**Corriger la cause** évite de déplacer le bug. Recopier le catalogue avant chaque affichage masquerait le
symptôme ; utiliser `toSorted` supprime la cause, pour tous les appelants. Enfin, **prouver** : le test
écrit sur le cas réduit échoue avant la correction, passe après, et empêchera le bug de revenir lors d'une
modification future.

Expliquer le problème à voix haute, à un collègue ou à un canard en plastique, force à formuler chaque
hypothèse : c'est souvent à ce moment qu'on voit celle qu'on n'avait pas vérifiée.

## Erreurs fréquentes

**Corriger avant d'avoir reproduit.** On ne peut pas savoir si la correction fonctionne.

**Modifier plusieurs choses à la fois.** On ne sait plus laquelle a agi.

**Supposer au lieu de vérifier.** « Cette fonction marche forcément » est une hypothèse comme une autre.

**Traiter le symptôme.** Le bug revient ailleurs.

**Oublier le test de régression.** Rien n'empêche le bug de réapparaître.

## À retenir

- Reproduire, réduire, isoler, formuler, vérifier, corriger, prouver.
- Un cas minimal rend la cause visible et devient le test de régression.
- Couper en deux pour isoler ; `git bisect` pour une régression dans l'historique.
- Une hypothèse et une modification à la fois.
- Corriger la cause, puis prouver par un test qui échouait avant.

## Exercices

1. On signale : « la facture affiche parfois 0,30000000000000004 € de TVA ». Écris le cas minimal qui
   reproduit le problème, formule l'hypothèse, puis corrige en calculant en centimes.

   ```js
   function tva(prix) {
     return prix * 0.2;
   }
   ```

   :::indice
   Cherche un prix qui produit ce résultat : `0.2` et beaucoup de décimaux n'ont pas de représentation
   binaire exacte.
   :::

   :::solution
   ```js
   console.log(1.5 * 0.2); // 0.30000000000000004 : reproduit avec une seule valeur

   // Hypothèse : les nombres à virgule flottante ne représentent pas exactement 0,2 et 1,5 * 0,2.
   console.log(0.1 + 0.2 === 0.3); // false : même famille de problème

   function tvaEnCentimes(prixEnCentimes) {
     return Math.round(prixEnCentimes * 0.2);
   }

   console.log(tvaEnCentimes(150) / 100); // 0.3
   ```

   Les montants sont stockés et calculés en centimes entiers, et convertis en euros seulement pour
   l'affichage.
   :::

2. Une fonctionnalité marchait il y a 64 commits et ne marche plus aujourd'hui. Combien de vérifications
   `git bisect` demande-t-il au plus, et quelles commandes lances-tu ?

   :::indice
   Chaque vérification divise par deux l'intervalle de commits suspects.
   :::

   :::solution
   Au plus **6** vérifications, puisque 2 puissance 6 vaut 64. La séquence :

   ```bash
   git bisect start
   git bisect bad                 # le commit courant est cassé
   git bisect good a1b2c3d        # un commit où tout fonctionnait
   # Git place le dépôt sur un commit intermédiaire : on teste, puis on indique le résultat.
   git bisect good                # ou : git bisect bad
   # … jusqu'à ce que Git affiche le premier commit fautif
   git bisect reset               # revenir à la branche de départ
   ```

   Si un script de test peut trancher seul, `git bisect run npm test` enchaîne toutes les vérifications
   automatiquement.
   :::

3. Un bug a été corrigé : `moyenne([])` renvoyait `NaN`, elle doit renvoyer `null`. Écris le test de
   régression avec `node:assert`, puis vérifie qu'il aurait échoué sur l'ancienne version.

   :::indice
   Le test porte sur le cas réduit qui révélait le bug, et sur un cas normal pour ne rien casser d'autre.
   :::

   :::solution
   ```js
   import assert from 'node:assert/strict';

   function ancienneMoyenne(notes) {
     return notes.reduce((t, n) => t + n, 0) / notes.length;
   }

   function moyenne(notes) {
     if (notes.length === 0) return null;
     return notes.reduce((t, n) => t + n, 0) / notes.length;
   }

   function testerMoyenne(fonction) {
     assert.equal(fonction([]), null); // le cas du bug
     assert.equal(fonction([12, 15]), 13.5); // le cas normal
   }

   testerMoyenne(moyenne);
   console.log('version corrigée : OK');
   assert.throws(() => testerMoyenne(ancienneMoyenne));
   console.log('ancienne version : le test échoue bien');
   ```

   Un test de régression qui n'aurait pas échoué avant la correction ne prouve rien.
   :::

## Questions d'entretien

- Comment abordes-tu un bug que tu ne comprends pas ?

  :::indice
  Une démarche en étapes, pas une liste d'outils.
  :::

  :::reponse
  Je commence par le reproduire de façon fiable, puis je le réduis au cas le plus simple. J'isole
  l'endroit où le comportement s'écarte de l'attendu, en comparant les entrées et sorties des étapes ou en
  coupant le chemin en deux. Je formule une hypothèse précise, je la vérifie avec une seule modification,
  et je corrige la cause plutôt que le symptôme. J'ajoute enfin un test de régression qui échouait avant la
  correction.
  :::

- Qu'est-ce que `git bisect`, et quand l'utiliser ?

  :::indice
  Une recherche par dichotomie dans l'historique.
  :::

  :::reponse
  C'est une commande qui cherche par dichotomie le commit qui a introduit une régression, entre un commit
  sain et un commit cassé. À chaque étape, on indique si le commit proposé est bon ou mauvais, et Git divise
  l'intervalle par deux : 1 000 commits se départagent en une dizaine d'étapes. On l'utilise quand on sait
  qu'une fonctionnalité marchait avant, sans savoir quelle modification l'a cassée ; `git bisect run`
  l'automatise avec un script de test.
  :::

- Pourquoi une seule modification à la fois ?

  :::indice
  Que conclure si le bug disparaît après trois changements ?
  :::

  :::reponse
  Parce qu'avec plusieurs modifications on ne sait plus laquelle a produit l'effet observé : le bug peut
  disparaître pour une raison fausse, ou une modification inutile peut rester dans le code et en casser
  une autre partie. Une modification par hypothèse transforme chaque essai en information fiable, même
  quand l'hypothèse est fausse.
  :::
