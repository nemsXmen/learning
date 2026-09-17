---
id: javascript-memoire-gc
title: "Pile, tas et ramasse-miettes"
slug: pile-tas-ramasse-miettes
technology: javascript
level: advanced
module: memoire
order: 1
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-closures
  - javascript-weak-collections
skills:
  - memory-model
tags:
  - javascript
  - memoire
---

## Objectifs

- Distinguer ce qui vit sur la pile et ce qui vit sur le tas.
- Comprendre qu'une variable objet contient une référence, et ce que cela implique pour la mémoire.
- Expliquer l'accessibilité et l'algorithme « marquer et balayer » du ramasse-miettes.
- Savoir ce que le ramasse-miettes ne fait pas, et pourquoi on ne le déclenche pas soi-même.

## Introduction

En JavaScript, on n'alloue ni ne libère jamais la mémoire à la main : on crée des objets, et le moteur les récupère
quand ils ne servent plus. Cette automatisation est confortable, mais elle repose sur une règle précise — un objet
reste en mémoire tant qu'il est **accessible**. Comprendre cette règle, c'est comprendre pourquoi une application
consomme de plus en plus de mémoire alors que « rien n'est gardé », sujet du chapitre suivant.

## Concept

| Notion | Ce qu'elle désigne |
| --- | --- |
| Pile d'appels | les cadres des fonctions en cours, avec leurs variables locales |
| Tas | la zone où vivent les objets, tableaux, fonctions et closures |
| Référence | la valeur d'une variable objet : un moyen d'atteindre un objet du tas |
| Racines | les points de départ toujours accessibles : global, pile d'appels, tâches en attente |
| Accessible | atteignable depuis une racine en suivant des références |
| Marquer et balayer | marquer tout ce qui est accessible, puis libérer le reste |

## Exemple

Le moteur ne montre pas son ramasse-miettes, mais on peut simuler son algorithme sur un petit graphe d'objets.

```js
// Un tas miniature : chaque objet liste les objets qu'il référence.
const tas = new Map([
  ['session', ['utilisateur', 'panier']],
  ['utilisateur', ['avatar']],
  ['panier', ['article1', 'article2']],
  ['article1', []],
  ['article2', ['panier']], // référence circulaire
  ['avatar', []],
  ['ancienPanier', ['article3']],
  ['article3', ['ancienPanier']], // cycle isolé
]);

function marquerEtBalayer(tas, racines) {
  const marques = new Set();
  const aVisiter = [...racines];
  while (aVisiter.length > 0) {
    const objet = aVisiter.pop();
    if (marques.has(objet)) continue;
    marques.add(objet);
    aVisiter.push(...tas.get(objet));
  }
  const liberes = [...tas.keys()].filter((objet) => !marques.has(objet));
  for (const objet of liberes) tas.delete(objet);
  return liberes;
}

console.log(marquerEtBalayer(tas, ['session'])); // [ 'ancienPanier', 'article3' ]

tas.set('session', ['utilisateur']); // on vide le panier de la session
console.log(marquerEtBalayer(tas, ['session'])); // [ 'panier', 'article1', 'article2' ]

// Côté langage : copier une variable copie la référence, pas l'objet.
let a = { donnees: new Array(3).fill('x') };
const b = a;
a = null; // l'objet reste accessible par b
console.log(b.donnees.length); // 3
```

## Comment ça fonctionne

La **pile d'appels** contient un cadre par fonction en cours d'exécution. Ce cadre disparaît quand la fonction
retourne : sa mémoire est récupérée immédiatement, sans ramasse-miettes. Le **tas** accueille tout ce dont la durée de
vie n'est pas liée à un appel : objets, tableaux, fonctions, et les environnements capturés par les closures. Ce
découpage est un modèle mental ; les moteurs l'optimisent — V8 place la plupart des valeurs sur le tas, garde les petits
entiers directement dans les variables, et déplace sur le tas toute variable capturée par une closure.

Une variable qui « contient » un objet contient en réalité une **référence** vers lui. Affecter, passer en argument ou
ranger dans un tableau copie la référence, jamais l'objet. Dans l'exemple, `a = null` ne détruit rien : l'objet reste
accessible par `b`. On ne libère donc jamais un objet ; on **supprime des chemins** vers lui.

Le ramasse-miettes part des **racines** : l'objet global, les variables de tous les cadres de la pile, les callbacks
programmés (minuteurs, promesses, écouteurs enregistrés). Il **marque** tout ce qu'il atteint en suivant les
références, puis **balaie** le reste. Un cycle isolé comme `ancienPanier` ↔ `article3` est libéré : les deux objets se
référencent, mais aucun chemin ne part d'une racine. C'est la grande différence avec le **comptage de références**,
ancienne stratégie incapable de libérer un cycle.

Les moteurs réels raffinent cet algorithme. V8 est **générationnel** : la plupart des objets meurent jeunes, donc les
nouveaux objets sont alloués dans une petite zone nettoyée très souvent et à faible coût ; ceux qui survivent passent
dans une zone ancienne, marquée et compactée plus rarement. Le travail est **incrémental** et en partie **concurrent**
pour limiter les pauses. Conséquence pratique : le moment de la collecte est imprévisible, et le code ne doit jamais en
dépendre.

On ne déclenche pas le ramasse-miettes soi-même. `node --expose-gc` rend disponible `global.gc()` pour des mesures de
diagnostic, jamais pour du code applicatif. `WeakRef` et `FinalizationRegistry` observent la collecte sans la
contrôler : une `WeakRef` peut devenir vide à n'importe quel moment après que l'objet est devenu inaccessible, ou
jamais.

La pile a une taille limitée : une récursion trop profonde lève `RangeError: Maximum call stack size exceeded`. Le tas
est beaucoup plus grand, mais pas infini : une application qui garde trop de références finit par ralentir, puis par
échouer avec une erreur de mémoire.

## Erreurs fréquentes

**Croire que `variable = null` libère l'objet.** Seul le dernier chemin compte.

**Penser que les cycles provoquent des fuites.** Le marquage libère les cycles inaccessibles.

**Appeler `global.gc()` dans une application.** C'est un outil de diagnostic, et il bloque l'exécution.

**Compter sur `WeakRef` ou `FinalizationRegistry` pour une logique métier.** La collecte n'a pas de moment garanti.

**Récurser sur des données de profondeur arbitraire.** Une boucle avec une pile explicite n'a pas la limite de la pile
d'appels.

## À retenir

- La pile porte les appels en cours ; le tas porte les objets et les closures.
- Une variable objet contient une référence : copier une variable copie la référence.
- Un objet vit tant qu'il est accessible depuis une racine.
- Marquer et balayer libère aussi les cycles isolés.
- La collecte est générationnelle, incrémentale et imprévisible : ne jamais en dépendre.

## Exercices

1. Pour chaque objet créé ci-dessous, dis s'il peut être collecté à la fin du script, et pourquoi.

   ```js
   const cache = [];
   function charger() {
     const temporaire = { taille: 1000 };
     const resultat = { id: 1 };
     cache.push(resultat);
     return temporaire.taille;
   }
   charger();
   let parent = { nom: 'parent' };
   parent.enfant = { parent };
   parent = null;
   ```

   :::indice
   Cherche, pour chaque objet, un chemin depuis une variable globale ou de module encore vivante.
   :::

   :::solution
   - `temporaire` peut être collecté : seule la variable locale le référençait, et le cadre de `charger` a disparu.
   - `resultat` reste en mémoire : `cache`, variable du module, le référence.
   - `parent` et son `enfant` peuvent être collectés : ils forment un cycle, mais plus aucun chemin ne part d'une
     racine depuis `parent = null`.
   :::

2. Écris `compterReferences(tas)` qui renvoie, pour chaque objet du tas miniature de l'exemple, le nombre de références
   entrantes. Montre qu'un ramasse-miettes par comptage de références ne libérerait jamais le cycle isolé.

   :::indice
   Parcours chaque liste de références et incrémente un compteur dans une `Map`.
   :::

   :::solution
   ```js
   const tas = new Map([
     ['session', ['utilisateur']],
     ['utilisateur', []],
     ['ancienPanier', ['article3']],
     ['article3', ['ancienPanier']],
   ]);

   function compterReferences(tas) {
     const compteurs = new Map([...tas.keys()].map((objet) => [objet, 0]));
     for (const cibles of tas.values()) {
       for (const cible of cibles) compteurs.set(cible, compteurs.get(cible) + 1);
     }
     return compteurs;
   }

   console.log(compterReferences(tas));
   // Map(4) { 'session' => 0, 'utilisateur' => 1, 'ancienPanier' => 1, 'article3' => 1 }
   ```

   Aucun compteur du cycle ne tombe à zéro : un comptage de références le garderait pour toujours, alors qu'il est
   inaccessible depuis `session`. (La racine `session` est à zéro, mais elle est retenue par la pile ou le global.)
   :::

3. `profondeur(noeud)` calcule récursivement la profondeur d'un arbre et lève une `RangeError` sur une liste chaînée de
   100 000 nœuds. Réécris-la sans récursion.

   :::indice
   Remplace la pile d'appels par un tableau de paires `[noeud, niveau]`.
   :::

   :::solution
   ```js
   function profondeur(racine) {
     let maximum = 0;
     const pile = [[racine, 1]];
     while (pile.length > 0) {
       const [noeud, niveau] = pile.pop();
       maximum = Math.max(maximum, niveau);
       for (const enfant of noeud.enfants) pile.push([enfant, niveau + 1]);
     }
     return maximum;
   }

   let chaine = { enfants: [] };
   for (let i = 1; i < 100_000; i += 1) chaine = { enfants: [chaine] };

   console.log(profondeur(chaine)); // 100000
   console.log(profondeur({ enfants: [{ enfants: [] }, { enfants: [{ enfants: [] }] }] })); // 3
   ```

   Le tableau `pile` vit sur le tas, dont la taille dépasse de très loin celle de la pile d'appels.
   :::

## Questions d'entretien

- Comment le ramasse-miettes de JavaScript décide-t-il qu'un objet peut être libéré ?

  :::indice
  Parle de racines et d'accessibilité, pas de compteurs.
  :::

  :::reponse
  Il part des racines — objet global, variables de la pile d'appels, callbacks programmés — et marque tout objet
  atteignable en suivant les références. Les objets non marqués sont libérés. Un objet vit donc tant qu'un chemin existe
  depuis une racine, peu importe qu'il soit encore référencé par d'autres objets eux-mêmes inaccessibles. Dans V8, ce
  marquage est générationnel, incrémental et en partie concurrent.
  :::

- Les références circulaires provoquent-elles des fuites mémoire en JavaScript ?

  :::indice
  Compare le comptage de références et le marquage.
  :::

  :::reponse
  Non. Un cycle inaccessible depuis les racines n'est pas marqué, il est donc libéré. Le comptage de références, utilisé
  par de vieux moteurs pour les objets DOM, gardait ces cycles ; ce n'est plus le cas des moteurs modernes. Un cycle ne
  fuit que s'il reste accessible, par exemple parce qu'un de ses objets est enregistré dans un cache global.
  :::

- Qu'est-ce qui est stocké sur la pile, et sur le tas ?

  :::indice
  Pense à la durée de vie des données.
  :::

  :::reponse
  La pile contient les cadres des appels en cours : paramètres, variables locales, adresse de retour. Elle est libérée
  dès qu'une fonction retourne, et sa taille est limitée, d'où la `RangeError` des récursions profondes. Le tas contient
  les objets, tableaux, fonctions et environnements de closures, dont la durée de vie est gérée par le ramasse-miettes.
  C'est un modèle : les moteurs placent en pratique la plupart des valeurs sur le tas, et y déplacent les variables
  capturées par une closure.
  :::
