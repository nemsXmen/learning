---
id: javascript-this
title: "Comprendre this"
slug: comprendre-this
technology: javascript
level: intermediate
module: this-et-liaison
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-phases-execution
skills:
  - this-binding
tags:
  - javascript
  - runtime
---

## Objectifs

- Déterminer la valeur de `this` à partir de la forme de l'appel, et non de l'endroit où la
  fonction est écrite.
- Appliquer les quatre règles de liaison d'une fonction classique.
- Expliquer et corriger la perte de `this` quand une méthode est détachée de son objet.

## Introduction

`this` est probablement le mot-clé le plus mal compris de JavaScript, parce qu'il
contredit l'intuition construite par la portée lexicale. Une variable se résout là où la
fonction est **écrite** ; `this`, lui, dépend de la façon dont la fonction est **appelée**.
La même fonction peut donc voir trois `this` différents en trois appels. Une fois les règles
connues, il n'y a plus de mystère — seulement quatre cas à reconnaître.

## Concept

Pour une fonction classique — déclaration, expression ou méthode, mais pas une fonction
fléchée —, `this` est fixé au moment de l'appel, selon cette priorité :

| Forme de l'appel | Valeur de `this` |
| --- | --- |
| `new Fonction()` | le nouvel objet en cours de construction |
| `fonction.call(objet)`, `apply`, ou fonction issue de `bind` | l'objet fourni explicitement |
| `objet.methode()` | l'objet situé avant le point |
| `fonction()` seule | `undefined` en mode strict, l'objet global sinon |

Le mode strict est actif d'office dans les modules ES et les classes : dans du code moderne,
un appel seul donne donc `undefined`.

## Exemple

```js
// Dans un module ES : mode strict.
const compteur = {
  valeur: 0,
  incrementer() {
    this.valeur += 1;
    return this.valeur;
  },
};

console.log(compteur.incrementer()); // 1 : this = compteur

const autre = { valeur: 10, incrementer: compteur.incrementer };
console.log(autre.incrementer()); // 11 : même fonction, this = autre

const detachee = compteur.incrementer;
// detachee(); // TypeError: Cannot read properties of undefined (reading 'valeur')

function Utilisateur(nom) {
  this.nom = nom; // this = le nouvel objet
}
const ada = new Utilisateur('Ada');
console.log(ada.nom); // 'Ada'

const panier = {
  articles: ['clavier', 'souris'],
  lister() {
    function formater(article) {
      return `${this?.prefixe ?? '?'} ${article}`; // appel seul : this = undefined
    }
    return this.articles.map(formater);
  },
  prefixe: '-',
};
console.log(panier.lister()); // ['? clavier', '? souris']
```

## Comment ça fonctionne

`this` est fixé pendant la phase de création du contexte, à partir de la **forme de
l'appel**. Le moteur ne regarde ni l'endroit où la fonction est écrite, ni l'objet dans
lequel elle a été définie : `compteur.incrementer` et `autre.incrementer` sont la même
fonction, et chacune de ces deux formes d'appel lui donne un `this` différent.

La règle de la méthode ne s'applique qu'au moment exact de l'appel `objet.methode()`.
Dès qu'on range la fonction dans une variable — `const detachee = compteur.incrementer` —,
l'appel devient `detachee()`, sans objet devant le point : c'est un appel seul. En mode
strict, `this` vaut alors `undefined`, et la première lecture de `this.valeur` lève une
`TypeError`. En mode non strict, `this` vaudrait l'objet global, et le code modifierait
silencieusement une propriété globale — c'est l'une des raisons d'être du mode strict.

Le même phénomène se produit dès qu'on **passe** une méthode :
`setTimeout(compteur.incrementer)` ou `bouton.addEventListener('click', compteur.incrementer)`
transmettent la fonction seule, et c'est l'appelant qui décide du `this` : `setTimeout`
fournit l'objet global dans un navigateur et un objet `Timeout` dans Node, un écouteur
fournit l'élément écouté. Dans aucun cas ce n'est `compteur`. C'est le cas le plus courant
de `this` perdu.

Une fonction classique **imbriquée** dans une méthode ne reçoit pas le `this` de la
méthode : elle est appelée seule, par `map` dans l'exemple, et obtient son propre `this`,
`undefined`. Deux solutions : une fonction fléchée, qui hérite du `this` extérieur, ou une
liaison explicite, vue au chapitre suivant.

Quand plusieurs règles semblent s'appliquer, la priorité est : `new`, puis liaison
explicite, puis méthode, puis appel seul.

## Erreurs fréquentes

**Croire que `this` désigne l'objet où la fonction est écrite.** Il dépend de l'appel.

**Détacher une méthode.** `const f = objet.methode; f()` perd l'objet : lie-la, ou appelle-la
depuis une fonction fléchée.

**Passer une méthode en callback.** `setTimeout(objet.methode, 100)` exécute la méthode sans
son objet.

**Attendre le `this` de la méthode dans une fonction classique imbriquée.** Elle a le sien.

**Compter sur l'objet global en mode non strict.** Le code fonctionne par accident et casse
dès qu'il passe en module.

## À retenir

- `this` dépend de la forme de l'appel, pas du lieu d'écriture.
- Priorité : `new` > `call` / `apply` / `bind` > `objet.methode()` > appel seul.
- Appel seul : `undefined` en mode strict, donc dans les modules et les classes.
- Détacher ou passer une méthode fait perdre son objet.
- Une fonction classique imbriquée ne voit pas le `this` de la méthode englobante.

## Exercices

1. Dans un module ES, donne la valeur de `this` pour chacun de ces quatre appels.

   ```js
   function qui() { return this; }
   const objet = { nom: 'objet', qui };

   qui();
   objet.qui();
   new qui();
   qui.call(objet);
   ```

   :::indice
   Reconnais la forme de chaque appel, puis applique la règle correspondante.
   :::

   :::solution
   - `qui()` : appel seul en mode strict, `this` vaut `undefined`.
   - `objet.qui()` : appel de méthode, `this` vaut `objet`.
   - `new qui()` : `this` est le nouvel objet vide en construction ; comme la fonction
     renvoie un objet — `this` lui-même —, c'est lui que `new` renvoie.
   - `qui.call(objet)` : liaison explicite, `this` vaut `objet`.
   :::

2. Ce code affiche `NaN` au lieu d'incrémenter le compteur. Explique pourquoi, puis
   corrige-le de deux façons.

   ```js
   const compteur = {
     valeur: 0,
     incrementer() {
       this.valeur += 1;
       console.log(this.valeur);
     },
   };
   setTimeout(compteur.incrementer, 0);
   ```

   :::indice
   Qu'est-ce que `setTimeout` reçoit exactement, et comment l'appelle-t-il ?
   :::

   :::indice
   Il faut soit fixer le `this`, soit conserver la forme `compteur.incrementer()`.
   :::

   :::solution
   `setTimeout` reçoit la fonction seule, sans `compteur`. Il l'appelle avec son propre
   `this` : l'objet global `window` dans un navigateur, quel que soit le mode, et un objet
   `Timeout` dans Node. Dans les deux cas, `this.valeur` vaut `undefined`, et
   `undefined + 1` donne `NaN` — sans aucune erreur, ce qui rend le bug discret.

   ```js
   setTimeout(() => compteur.incrementer(), 0); // la forme méthode est conservée
   setTimeout(compteur.incrementer.bind(compteur), 0); // this fixé définitivement
   ```
   :::

3. Corrige `lister` pour que chaque article soit préfixé par `this.prefixe`.

   ```js
   const panier = {
     prefixe: '-',
     articles: ['clavier', 'souris'],
     lister() {
       return this.articles.map(function (article) {
         return `${this.prefixe} ${article}`;
       });
     },
   };
   ```

   :::indice
   La fonction passée à `map` est une fonction classique appelée seule : elle a son propre
   `this`.
   :::

   :::solution
   ```js
   const panier = {
     prefixe: '-',
     articles: ['clavier', 'souris'],
     lister() {
       return this.articles.map((article) => `${this.prefixe} ${article}`);
     },
   };

   console.log(panier.lister()); // ['- clavier', '- souris']
   ```

   La fonction fléchée n'a pas de `this` propre : elle utilise celui de `lister`, qui vaut
   `panier` lors de l'appel `panier.lister()`.
   :::

## Questions d'entretien

- Comment la valeur de `this` est-elle déterminée ?

  :::indice
  Ce n'est pas le lieu d'écriture qui compte. Il y a quatre formes d'appel.
  :::

  :::reponse
  Pour une fonction classique, par la forme de l'appel, selon cette priorité : `new` lie
  `this` au nouvel objet ; `call`, `apply` et `bind` le lient à l'objet fourni ;
  `objet.methode()` le lie à l'objet devant le point ; un appel seul donne `undefined` en
  mode strict et l'objet global sinon. Les fonctions fléchées font exception : elles n'ont
  pas de `this` propre et utilisent celui de l'environnement où elles sont écrites.
  :::

- Pourquoi une méthode perd-elle son `this` quand on la passe en callback ?

  :::indice
  Qu'est-ce qui est transmis : la méthode, ou la méthode et son objet ?
  :::

  :::reponse
  Parce que `objet.methode` sans parenthèses produit la fonction seule : le lien avec
  `objet` n'existe que dans la forme d'appel `objet.methode()`. Le code qui reçoit la
  fonction l'appelle comme il l'entend : seule, et `this` vaut `undefined` en mode strict,
  ou avec un `this` de son choix, comme `window` pour `setTimeout` dans un navigateur.
  Jamais avec l'objet d'origine. On corrige en enveloppant l'appel dans une fonction fléchée, en liant la
  méthode avec `bind`, ou en déclarant la méthode comme champ fléché dans une classe.
  :::

- Que change le mode strict pour `this` ?

  :::indice
  Que vaut `this` dans un appel seul, avec et sans mode strict ?
  :::

  :::reponse
  Dans un appel seul, le mode non strict remplace un `this` absent par l'objet global, si
  bien qu'une méthode détachée modifie silencieusement des propriétés globales. Le mode
  strict laisse `this` à `undefined`, ce qui fait échouer immédiatement la première lecture
  de propriété. Comme les modules ES et les classes sont en mode strict d'office, le code
  moderne a ce comportement par défaut, et les pertes de `this` se voient tout de suite.
  :::
