---
id: javascript-descripteurs
title: "Descripteurs : writable, enumerable et configurable"
slug: descripteurs-de-proprietes
technology: javascript
level: advanced
module: descripteurs
order: 1
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-classes-accesseurs
skills:
  - property-descriptors
tags:
  - javascript
  - avance
---

## Objectifs

- Lire le descripteur d'une propriété et comprendre ses attributs.
- Définir une propriété en lecture seule, cachée ou non supprimable avec `Object.defineProperty`.
- Distinguer propriété de données et propriété accesseur, et copier correctement des propriétés avec leurs descripteurs.

## Introduction

Une propriété n'est pas seulement un nom et une valeur. Elle possède des **attributs** qui décident si elle peut être
modifiée, si elle apparaît quand on liste les clés, et si elle peut être supprimée. Ces attributs expliquent pourquoi
les méthodes d'une classe n'apparaissent pas dans `Object.keys`, pourquoi `Math.PI` ne se réaffecte pas, et comment
les bibliothèques définissent des propriétés calculées. Les manipuler permet de concevoir des objets plus robustes.

## Concept

**Propriété de données** :

| Attribut | Rôle | Valeur par défaut avec un littéral | Avec `defineProperty` |
| --- | --- | --- | --- |
| `value` | la valeur | — | `undefined` |
| `writable` | peut être réaffectée | `true` | `false` |
| `enumerable` | apparaît dans `Object.keys`, `for...in`, `JSON.stringify` | `true` | `false` |
| `configurable` | peut être supprimée ou redéfinie | `true` | `false` |

**Propriété accesseur** : `get` et `set` remplacent `value` et `writable` ; `enumerable` et `configurable` restent.

| Fonction | Rôle |
| --- | --- |
| `Object.getOwnPropertyDescriptor(objet, cle)` | lit le descripteur d'une propriété propre |
| `Object.getOwnPropertyDescriptors(objet)` | lit tous les descripteurs |
| `Object.defineProperty(objet, cle, descripteur)` | crée ou modifie une propriété |
| `Object.defineProperties(objet, descripteurs)` | en définit plusieurs |

Attention : avec `defineProperty`, tout attribut **omis vaut `false`**.

## Exemple

```js
const commande = { total: 30 };
console.log(Object.getOwnPropertyDescriptor(commande, 'total'));
// { value: 30, writable: true, enumerable: true, configurable: true }

Object.defineProperty(commande, 'id', { value: 7, enumerable: true });
try {
  commande.id = 8; // writable omis, donc false
} catch (erreur) {
  console.log(erreur.name); // 'TypeError' en mode strict
}

Object.defineProperty(commande, 'cleInterne', { value: 'abc123', writable: false });
console.log(Object.keys(commande), JSON.stringify(commande)); // ['total', 'id'] '{"total":30,"id":7}'
console.log(commande.cleInterne); // 'abc123' : cachée des énumérations, mais lisible

Object.defineProperty(commande, 'totalTTC', {
  get() {
    return Math.round(this.total * 1.2 * 100) / 100;
  },
  enumerable: true,
});
commande.total = 50;
console.log(commande.totalTTC); // 60

try {
  delete commande.id; // configurable omis, donc false
} catch (erreur) {
  console.log(erreur.name); // 'TypeError'
}

class Produit {
  afficher() {}
}
console.log(Object.getOwnPropertyDescriptor(Produit.prototype, 'afficher').enumerable); // false

const avecGetter = { get maintenant() { return 'calculé'; } };
const copieAssign = Object.assign({}, avecGetter);
const copieFidele = Object.defineProperties({}, Object.getOwnPropertyDescriptors(avecGetter));
console.log('get' in Object.getOwnPropertyDescriptor(copieAssign, 'maintenant')); // false : valeur figée
console.log('get' in Object.getOwnPropertyDescriptor(copieFidele, 'maintenant')); // true : accesseur conservé
```

## Comment ça fonctionne

Chaque propriété propre d'un objet est stockée avec son **descripteur**. Un littéral d'objet ou une affectation crée
une propriété aux attributs permissifs — modifiable, énumérable, configurable —, ce qui explique qu'on ignore
habituellement leur existence. `Object.defineProperty` inverse ces valeurs par défaut : tout attribut non précisé vaut
`false`. C'est la première source d'erreur avec cette fonction : une propriété créée ainsi, sans y penser, est en
lecture seule, invisible et impossible à supprimer.

`writable: false` rend la valeur non réaffectable : l'écriture échoue en silence en mode non strict, et lève une
`TypeError` en mode strict, donc dans les modules et les classes. `enumerable: false` cache la propriété des
énumérations — `Object.keys`, `for...in`, le spread, `Object.assign`, `JSON.stringify` — sans la rendre inaccessible :
on la lit toujours par son nom. C'est ainsi que les méthodes d'une classe, définies non énumérables sur le prototype,
n'encombrent pas l'affichage des instances.

`configurable: false` est le verrou le plus fort : la propriété ne peut plus être supprimée, ni transformée en
accesseur, ni voir ses attributs changer. La seule modification encore permise est de passer `writable` de `true` à
`false`, jamais l'inverse. Ce choix est **irréversible**.

Une propriété **accesseur** n'a pas de valeur stockée : son descripteur contient `get` et `set`. Mélanger `value` et
`get` dans un même descripteur lève une `TypeError`. Les accesseurs de classe et les `get` des littéraux produisent
exactement ce type de propriété.

La copie révèle la différence entre valeur et descripteur. `Object.assign` et le spread **lisent** chaque propriété —
en exécutant les getters — et **écrivent** des propriétés de données ordinaires : les accesseurs deviennent des valeurs
figées, et les propriétés non énumérables ne sont pas copiées. Pour une copie fidèle, on combine
`Object.getOwnPropertyDescriptors` et `Object.defineProperties`, ou `Object.create` avec ces descripteurs pour conserver
aussi le prototype.

## Erreurs fréquentes

**Oublier que `defineProperty` met les attributs omis à `false`.** Précise explicitement ceux dont tu as besoin.

**Croire qu'une propriété non énumérable est privée.** Elle est seulement absente des énumérations.

**Rendre une propriété non configurable par défaut.** Le choix est irréversible.

**Copier un objet à accesseurs avec le spread.** Les getters deviennent des valeurs figées.

**Mélanger `value` et `get`.** Un descripteur est de données ou accesseur, jamais les deux.

## À retenir

- Propriété de données : `value`, `writable`, `enumerable`, `configurable` ; accesseur : `get`, `set`, `enumerable`,
  `configurable`.
- Littéral : attributs à `true` ; `defineProperty` : attributs omis à `false`.
- Non énumérable : invisible pour `Object.keys` et `JSON`, mais lisible.
- Non configurable : ni suppression ni redéfinition, de façon irréversible.
- Copie fidèle : `Object.defineProperties({}, Object.getOwnPropertyDescriptors(source))`.

## Exercices

1. Ajoute à un objet `utilisateur` une propriété `id` en lecture seule, visible dans `Object.keys` et le JSON, puis une
   propriété `_cache` modifiable mais absente des énumérations.

   :::indice
   Précise tous les attributs utiles : `defineProperty` met à `false` ceux qu'on omet.
   :::

   :::solution
   ```js
   const utilisateur = { nom: 'Ada' };

   Object.defineProperty(utilisateur, 'id', { value: 42, enumerable: true });
   Object.defineProperty(utilisateur, '_cache', { value: null, writable: true, enumerable: false });

   utilisateur._cache = { derniereConnexion: '2026-09-17' };
   console.log(Object.keys(utilisateur), JSON.stringify(utilisateur)); // ['nom', 'id'] '{"nom":"Ada","id":42}'
   console.log(utilisateur._cache.derniereConnexion); // '2026-09-17'
   try {
     utilisateur.id = 1;
   } catch (erreur) {
     console.log(erreur.name); // 'TypeError'
   }
   ```
   :::

2. Écris `definirConstante(objet, nom, valeur)` qui ajoute une propriété énumérable, ni modifiable ni supprimable, et
   lève une erreur explicite si la propriété existe déjà.

   :::indice
   `Object.hasOwn` indique si la propriété existe déjà sur l'objet lui-même.
   :::

   :::solution
   ```js
   function definirConstante(objet, nom, valeur) {
     if (Object.hasOwn(objet, nom)) {
       throw new Error(`La propriété « ${nom} » existe déjà`);
     }
     return Object.defineProperty(objet, nom, {
       value: valeur,
       enumerable: true,
       writable: false,
       configurable: false,
     });
   }

   const reglages = {};
   definirConstante(reglages, 'TVA', 0.2);
   console.log(Object.getOwnPropertyDescriptor(reglages, 'TVA'));
   // { value: 0.2, writable: false, enumerable: true, configurable: false }
   try {
     definirConstante(reglages, 'TVA', 0.1);
   } catch (erreur) {
     console.log(erreur.message); // 'La propriété « TVA » existe déjà'
   }
   ```
   :::

3. Écris `copierFidelement(source)` qui conserve le prototype, les accesseurs et les propriétés non énumérables, puis
   compare avec le spread sur un objet à accesseur.

   :::indice
   `Object.create` accepte un prototype et un objet de descripteurs.
   :::

   :::solution
   ```js
   function copierFidelement(source) {
     return Object.create(Object.getPrototypeOf(source), Object.getOwnPropertyDescriptors(source));
   }

   class Panier {
     constructor() {
       this.articles = [2, 3];
     }
     get total() {
       return this.articles.reduce((somme, prix) => somme + prix, 0);
     }
   }

   const panier = new Panier();
   Object.defineProperty(panier, 'version', { value: 1, enumerable: false });

   const fidele = copierFidelement(panier);
   const etalee = { ...panier };

   console.log(fidele instanceof Panier, fidele.total, fidele.version); // true 5 1
   console.log(etalee instanceof Panier, etalee.total, etalee.version); // false undefined undefined
   ```

   Le spread perd le prototype, donc le getter `total` défini sur la classe, et ignore la propriété non énumérable. La
   copie reste superficielle : `fidele.articles` et `panier.articles` sont le même tableau.
   :::

## Questions d'entretien

- Quelle différence entre une propriété créée par affectation et par `Object.defineProperty` ?

  :::indice
  Regarde la valeur par défaut des attributs dans chaque cas.
  :::

  :::reponse
  L'affectation crée une propriété de données dont `writable`, `enumerable` et `configurable` valent `true`.
  `Object.defineProperty` met à `false` tous les attributs qu'on ne précise pas : la propriété est alors en lecture
  seule, invisible des énumérations et définitive. Sur une propriété existante, `defineProperty` ne modifie que les
  attributs fournis, dans les limites posées par `configurable`.
  :::

- Qu'implique `configurable: false` ?

  :::indice
  Cherche ce qu'on peut encore faire sur la propriété, et si l'on peut revenir en arrière.
  :::

  :::reponse
  La propriété ne peut plus être supprimée, ni passer de données à accesseur, ni voir `enumerable` ou `configurable`
  changer. Seul le passage de `writable: true` à `writable: false` reste permis, et la valeur reste modifiable tant que
  `writable` vaut `true`. C'est irréversible : c'est ce que fait `Object.seal` sur toutes les propriétés, et ce qui
  protège des propriétés comme `Math.PI`.
  :::

- Pourquoi les méthodes d'une classe n'apparaissent-elles pas dans `for...in` sur une instance ?

  :::indice
  Où sont-elles définies, et avec quel attribut ?
  :::

  :::reponse
  Elles sont définies sur le prototype avec `enumerable: false`. `for...in` parcourt aussi les propriétés énumérables
  héritées, et verrait donc des méthodes ajoutées au prototype par affectation ; la syntaxe `class` évite ce bruit. Les
  instances n'ont en propre que les champs, qui sont énumérables. `Object.keys` et le spread, eux, se limitent de toute
  façon aux propriétés propres.
  :::
