---
id: javascript-prototype-proto
title: "prototype, __proto__ et Object.getPrototypeOf"
slug: prototype-et-proto
technology: javascript
level: intermediate
module: prototypes
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-chaine-prototypes
skills:
  - prototype-property
tags:
  - javascript
  - runtime
---

## Objectifs

- Distinguer trois notions aux noms trompeurs : `[[Prototype]]`, `__proto__` et `.prototype`.
- Lire et modifier le prototype d'un objet avec les fonctions recommandées.
- Expliquer ce que vérifie réellement `instanceof`.

## Introduction

Le vocabulaire des prototypes est un piège à lui seul : « le prototype de `Voiture` » peut
désigner deux objets différents selon qu'on parle du lien de la fonction ou de sa propriété
`prototype`. Ce chapitre ne présente aucun mécanisme nouveau ; il met des noms précis sur
les trois notions que le chapitre précédent a utilisées, pour ne plus jamais les confondre.

## Concept

| Notion | Ce que c'est | Qui la possède |
| --- | --- | --- |
| `[[Prototype]]` | le lien interne vers l'objet suivant de la chaîne | tout objet |
| `__proto__` | un accesseur historique qui lit ou écrit `[[Prototype]]` | les objets qui héritent d'`Object.prototype` |
| `.prototype` | un objet ordinaire, qui deviendra le `[[Prototype]]` des instances créées avec `new` | les fonctions classiques et les classes |

Les outils recommandés pour manipuler le lien :

| Besoin | Écriture |
| --- | --- |
| Lire le prototype | `Object.getPrototypeOf(objet)` |
| Créer un objet avec un prototype donné | `Object.create(prototype)` |
| Changer le prototype d'un objet existant | `Object.setPrototypeOf(objet, prototype)` — à éviter |
| Tester la présence d'un prototype dans la chaîne | `prototype.isPrototypeOf(objet)` |

## Exemple

```js
function Voiture(marque) {
  this.marque = marque;
}
Voiture.prototype.rouler = function () {
  return `${this.marque} roule`;
};

const clio = new Voiture('Renault');
console.log(clio.rouler()); // 'Renault roule'

console.log(Object.getPrototypeOf(clio) === Voiture.prototype); // true
console.log(clio.__proto__ === Voiture.prototype); // true, mais déconseillé

// Voiture.prototype n'est PAS le prototype de la fonction Voiture :
console.log(Object.getPrototypeOf(Voiture) === Function.prototype); // true
console.log(Object.getPrototypeOf(Voiture) === Voiture.prototype); // false

console.log(Voiture.prototype.constructor === Voiture); // true
console.log(clio.constructor === Voiture, Object.hasOwn(clio, 'constructor')); // true false

console.log(clio instanceof Voiture); // true
console.log(Voiture.prototype.isPrototypeOf(clio)); // true

const fleche = () => {};
console.log(fleche.prototype); // undefined : une fléchée ne construit rien

const dictionnaire = Object.create(null);
console.log(Object.getPrototypeOf(dictionnaire), dictionnaire.__proto__); // null undefined
```

## Comment ça fonctionne

`[[Prototype]]` est le seul lien réellement utilisé par la recherche de propriété. Les deux
autres noms n'en sont que des voies d'accès.

`__proto__` n'est pas une propriété de chaque objet : c'est un **accesseur** défini sur
`Object.prototype`, que les objets trouvent en remontant leur chaîne. Il lit ou modifie
`[[Prototype]]`. Il a été standardisé tardivement pour compatibilité et reste déconseillé :
un objet créé par `Object.create(null)` ne l'a pas, et une clé `"__proto__"` venant de données
externes peut altérer une chaîne par accident. `Object.getPrototypeOf` fonctionne dans tous
les cas.

`.prototype` est une propriété ordinaire que possèdent les fonctions classiques et les
classes. Elle ne sert **qu'à `new`** : quand on écrit `new Voiture()`, le nouvel objet reçoit
`Voiture.prototype` comme `[[Prototype]]`. Le prototype **de la fonction** `Voiture`, lui,
est `Function.prototype`, d'où viennent `call`, `apply` et `bind`. Les fonctions fléchées et
les méthodes abrégées n'ont pas de propriété `prototype`, puisqu'elles ne peuvent pas être
appelées avec `new`.

Chaque `.prototype` créé automatiquement contient une propriété `constructor` qui pointe vers
la fonction. Les instances la trouvent par héritage : `clio.constructor` vaut `Voiture`, sans
être une propriété propre. Si l'on **remplace** entièrement `Voiture.prototype` par un nouvel
objet, cette propriété disparaît, et il faut la rétablir soi-même.

`objet instanceof F` ne regarde pas comment l'objet a été créé : il remonte la chaîne de
`objet` et renvoie `true` s'il y rencontre `F.prototype`. Changer `F.prototype` après coup
peut donc faire mentir `instanceof` sur les instances existantes.

Enfin, `Object.setPrototypeOf` modifie la chaîne d'un objet déjà créé. C'est permis, mais les
moteurs optimisent les objets en supposant que leur forme et leur chaîne restent stables : un
changement de prototype à chaud peut ralentir durablement tout le code qui manipule cet objet.
On préfère fixer le prototype à la création, avec `Object.create` ou une classe.

## Erreurs fréquentes

**Confondre `F.prototype` et le prototype de `F`.** Le premier sert aux instances, le second
est `Function.prototype`.

**Utiliser `__proto__` dans du code applicatif.** Préfère `Object.getPrototypeOf` et
`Object.create`.

**Remplacer `F.prototype` sans rétablir `constructor`.** `instance.constructor` pointe alors
vers `Object`.

**Changer le prototype d'objets déjà utilisés.** `setPrototypeOf` dégrade les optimisations
du moteur.

## À retenir

- `[[Prototype]]` : le lien interne. `__proto__` : un accesseur historique vers ce lien.
- `.prototype` : la propriété d'une fonction qui devient le prototype des instances de `new`.
- Le prototype d'une fonction est `Function.prototype`, pas sa propriété `prototype`.
- `instanceof` cherche `F.prototype` dans la chaîne de l'objet.
- Lire : `Object.getPrototypeOf`. Créer : `Object.create`. Éviter : `setPrototypeOf`.

## Exercices

1. Dis si chaque expression vaut `true` ou `false`, et justifie.

   ```js
   function Livre(titre) { this.titre = titre; }
   const livre = new Livre('Dune');

   Object.getPrototypeOf(livre) === Livre.prototype;
   Object.getPrototypeOf(Livre) === Livre.prototype;
   Object.hasOwn(livre, 'constructor');
   livre instanceof Object;
   ```

   :::indice
   Distingue la chaîne de l'instance et celle de la fonction.
   :::

   :::solution
   - `true` : `new` donne à l'instance `Livre.prototype` comme prototype.
   - `false` : le prototype de la fonction `Livre` est `Function.prototype`.
   - `false` : `constructor` est défini sur `Livre.prototype`, l'instance l'hérite.
   - `true` : `Object.prototype` figure plus haut dans la chaîne de `livre`.
   :::

2. Écris `estInstanceDe(objet, Constructeur)` qui reproduit `instanceof` sans l'utiliser.

   :::indice
   Remonte la chaîne de l'objet et compare chaque maillon à `Constructeur.prototype`.
   :::

   :::solution
   ```js
   function estInstanceDe(objet, Constructeur) {
     let courant = Object.getPrototypeOf(objet);
     while (courant !== null) {
       if (courant === Constructeur.prototype) {
         return true;
       }
       courant = Object.getPrototypeOf(courant);
     }
     return false;
   }

   console.log(estInstanceDe([], Array), estInstanceDe([], Object)); // true true
   console.log(estInstanceDe({}, Array)); // false
   ```

   Le vrai `instanceof` gère en plus les valeurs primitives, qui donnent toujours `false`, et
   la méthode `Symbol.hasInstance` qu'une classe peut redéfinir.
   :::

3. Après ce remplacement, `new Point(1, 2).constructor` vaut `Object`. Explique, puis corrige
   sans perdre les méthodes.

   ```js
   function Point(x, y) { this.x = x; this.y = y; }
   Point.prototype = {
     distance() { return Math.hypot(this.x, this.y); },
   };
   ```

   :::indice
   Le nouvel objet affecté à `Point.prototype` contient-il une propriété `constructor` ?
   :::

   :::solution
   Le littéral remplace l'objet créé automatiquement, qui contenait `constructor`. La lecture
   de `constructor` remonte donc jusqu'à `Object.prototype.constructor`, qui vaut `Object`.

   ```js
   function Point(x, y) { this.x = x; this.y = y; }
   Point.prototype = {
     constructor: Point,
     distance() { return Math.hypot(this.x, this.y); },
   };

   const p = new Point(3, 4);
   console.log(p.constructor === Point, p.distance()); // true 5
   ```

   Ajouter les méthodes une à une, `Point.prototype.distance = function () {}`, évite
   entièrement le problème.
   :::

## Questions d'entretien

- Quelle différence entre `prototype` et `__proto__` ?

  :::indice
  L'un appartient aux fonctions, l'autre donne accès au lien de n'importe quel objet.
  :::

  :::reponse
  `__proto__` est un accesseur historique, hérité d'`Object.prototype`, qui lit ou écrit le
  lien `[[Prototype]]` de l'objet sur lequel on l'utilise. `prototype` est une propriété
  ordinaire des fonctions classiques et des classes : c'est l'objet qui deviendra le
  `[[Prototype]]` des instances créées avec `new`. Ainsi `instance.__proto__ ===
  Constructeur.prototype`. En code moderne, on remplace `__proto__` par
  `Object.getPrototypeOf` et `Object.create`.
  :::

- Comment fonctionne `instanceof` ?

  :::indice
  Regarde-t-il la fonction qui a créé l'objet ?
  :::

  :::reponse
  `objet instanceof F` remonte la chaîne de prototypes de `objet` et renvoie `true` dès qu'il
  y trouve `F.prototype`. Il ne sait rien de la création réelle de l'objet : un objet fabriqué
  avec `Object.create(F.prototype)` passe le test, et remplacer `F.prototype` fait échouer le
  test pour les instances existantes. Une classe peut personnaliser ce comportement avec la
  méthode statique `Symbol.hasInstance`.
  :::

- Pourquoi éviter `Object.setPrototypeOf` ?

  :::indice
  Pense à ce que les moteurs supposent sur la forme des objets.
  :::

  :::reponse
  Les moteurs optimisent l'accès aux propriétés en supposant que la forme d'un objet et sa
  chaîne de prototypes restent stables. Changer le prototype d'un objet déjà utilisé invalide
  ces hypothèses et peut ralentir tout le code qui le manipule, bien au-delà de l'instruction
  elle-même. On fixe donc le prototype à la création, avec `Object.create` ou une classe, et
  l'on réserve `setPrototypeOf` aux outils et aux cas exceptionnels.
  :::
