---
id: javascript-call-apply-bind
title: "call, apply et bind : la liaison explicite"
slug: call-apply-bind
technology: javascript
level: intermediate
module: this-et-liaison
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-this
skills:
  - explicit-binding
tags:
  - javascript
  - runtime
---

## Objectifs

- Appeler une fonction avec un `this` choisi grâce à `call` et `apply`.
- Créer une fonction liée de façon permanente avec `bind`, et fixer au passage des arguments.
- Emprunter la méthode d'un objet pour l'appliquer à un autre.

## Introduction

Le chapitre précédent a montré que `this` dépend de l'appel. Parfois, on veut décider
soi-même : appliquer une méthode à un objet qui ne la possède pas, ou transmettre une
méthode en callback sans perdre son objet. Les fonctions ont pour cela trois méthodes,
`call`, `apply` et `bind`. Elles forment la deuxième règle de liaison, prioritaire sur la
règle de la méthode.

## Concept

| Méthode | Appelle immédiatement ? | Arguments | Renvoie |
| --- | --- | --- | --- |
| `f.call(objet, a, b)` | oui | séparés | le résultat de `f` |
| `f.apply(objet, [a, b])` | oui | dans un tableau | le résultat de `f` |
| `f.bind(objet, a)` | non | fixés d'avance, complétés plus tard | une **nouvelle fonction** |

Moyen mnémotechnique : **a**pply prend un **a**rray, **c**all prend des arguments séparés
par des **c**ommas.

Une fonction produite par `bind` est liée **définitivement** : ni `call`, ni `apply`, ni un
second `bind` ne peuvent changer son `this`. Seul `new` passe outre.

## Exemple

```js
function presenter(salutation, ponctuation) {
  return `${salutation}, je suis ${this.nom}${ponctuation}`;
}

const ada = { nom: 'Ada' };
const grace = { nom: 'Grace' };

console.log(presenter.call(ada, 'Bonjour', '.')); // 'Bonjour, je suis Ada.'
console.log(presenter.apply(grace, ['Salut', ' !'])); // 'Salut, je suis Grace !'

const adaSalue = presenter.bind(ada, 'Hello');
console.log(adaSalue('?')); // 'Hello, je suis Ada?'
console.log(adaSalue.call(grace, '!')); // 'Hello, je suis Ada!' : liaison définitive

const compteur = {
  valeur: 0,
  incrementer() {
    this.valeur += 1;
  },
};
const incrementerLie = compteur.incrementer.bind(compteur);
[1, 2, 3].forEach(() => incrementerLie());
console.log(compteur.valeur); // 3

const semblableTableau = { 0: 'a', 1: 'b', length: 2 };
console.log(Array.prototype.map.call(semblableTableau, (x) => x.toUpperCase())); // ['A', 'B']
```

## Comment ça fonctionne

`call` et `apply` exécutent la fonction **immédiatement**, en fixant `this` au premier
argument. Ils ne diffèrent que par la façon de passer les autres arguments. Depuis
l'arrivée du spread, `f.apply(objet, tableau)` s'écrit aussi `f.call(objet, ...tableau)` :
`apply` reste utile surtout dans du code ancien.

`bind` n'exécute rien. Il renvoie une **fonction liée** : une nouvelle fonction qui, à chaque
appel, invoque l'originale avec le `this` et les arguments fixés. Les arguments passés à
`bind` sont placés **avant** ceux de l'appel, ce qui en fait aussi un outil d'application
partielle : `presenter.bind(ada, 'Hello')` fixe le `this` et le premier argument.

La liaison de `bind` est définitive. Une fonction liée ignore le `this` qu'on tente de lui
imposer ensuite avec `call`, `apply` ou un second `bind` ; seuls ses arguments
supplémentaires sont pris en compte. La seule exception est `new` : une fonction liée
appelée avec `new` construit un nouvel objet et ignore le `this` lié.

L'**emprunt de méthode** repose sur le fait que la plupart des méthodes natives ne vérifient
pas le type de `this`, seulement la présence des propriétés dont elles ont besoin.
`Array.prototype.map` a besoin d'un `length` et de clés numériques : un objet semblable à un
tableau suffit. C'était la façon historique de convertir `arguments` en tableau, avant
`Array.from` et le paramètre de reste.

Si le premier argument vaut `null` ou `undefined`, la fonction reçoit ce `this` tel quel en
mode strict. En mode non strict, il serait remplacé par l'objet global.

`bind` crée une nouvelle fonction à chaque appel. `element.removeEventListener('click',
f.bind(this))` ne retire donc rien : il faut conserver la référence de la fonction liée pour
pouvoir la retirer.

## Erreurs fréquentes

**Confondre `bind` et `call`.** `bind` ne lance pas la fonction : il faut appeler ce qu'il
renvoie.

**Tenter de relier une fonction déjà liée.** Le second `this` est ignoré.

**Lier à nouveau à chaque ajout d'écouteur.** Chaque `bind` produit une fonction différente,
impossible à retirer ensuite.

**Passer les arguments d'`apply` séparément.** `apply` attend un tableau en second argument.

## À retenir

- `call(objet, a, b)` et `apply(objet, [a, b])` exécutent tout de suite.
- `bind(objet, a)` renvoie une nouvelle fonction, liée définitivement.
- Les arguments de `bind` sont placés avant ceux de l'appel.
- Une fonction liée ignore les `call`, `apply` et `bind` suivants, mais pas `new`.
- Conserve la référence d'une fonction liée pour pouvoir retirer un écouteur.

## Exercices

1. Sans modifier `ada` ni `grace`, fais afficher à `presenter` le nom de chacune, une fois
   avec `call` et une fois avec `apply`.

   ```js
   function presenter(salutation) {
     return `${salutation}, je suis ${this.nom}`;
   }
   const ada = { nom: 'Ada' };
   const grace = { nom: 'Grace' };
   ```

   :::indice
   Le premier argument de `call` et d'`apply` devient `this` ; seule la forme des autres
   arguments change.
   :::

   :::solution
   ```js
   console.log(presenter.call(ada, 'Bonjour')); // 'Bonjour, je suis Ada'
   console.log(presenter.apply(grace, ['Salut'])); // 'Salut, je suis Grace'
   ```
   :::

2. Écris une fonction `journaliser(niveau, message)` qui renvoie `[niveau] message`, puis
   fabrique `erreur` avec `bind`, sans utiliser `this`.

   :::indice
   Quand la fonction n'utilise pas `this`, le premier argument de `bind` peut être `null`.
   :::

   :::solution
   ```js
   function journaliser(niveau, message) {
     return `[${niveau}] ${message}`;
   }

   const erreur = journaliser.bind(null, 'erreur');
   console.log(erreur('connexion perdue')); // '[erreur] connexion perdue'
   ```

   Les arguments passés à `bind` sont placés avant ceux de l'appel : c'est de l'application
   partielle.
   :::

3. Prédis les trois affichages, puis explique le dernier.

   ```js
   function lireX() {
     return this.x;
   }
   const lie = lireX.bind({ x: 1 });
   console.log(lireX.call({ x: 2 }));
   console.log(lie());
   console.log(lie.call({ x: 3 }));
   ```

   :::indice
   Une fonction produite par `bind` accepte-t-elle un nouveau `this` ?
   :::

   :::solution
   Les affichages sont `2`, `1` et `1`. Le premier appel fixe `this` à `{ x: 2 }`. `lie` est
   liée à `{ x: 1 }`. Le dernier `call` tente d'imposer `{ x: 3 }`, mais une fonction liée
   ignore tout nouveau `this` : elle appelle toujours `lireX` avec l'objet fixé par `bind`.
   :::

## Questions d'entretien

- Quelle différence entre `call`, `apply` et `bind` ?

  :::indice
  Deux questions : la fonction est-elle exécutée tout de suite, et comment passe-t-on les
  arguments ?
  :::

  :::reponse
  `call` et `apply` exécutent immédiatement la fonction avec le `this` fourni ; `call` reçoit
  les arguments séparément, `apply` dans un tableau. `bind` n'exécute rien : il renvoie une
  nouvelle fonction dont le `this` et éventuellement les premiers arguments sont fixés
  définitivement. On utilise `bind` quand la fonction sera appelée plus tard par quelqu'un
  d'autre, typiquement en callback.
  :::

- Peut-on changer le `this` d'une fonction liée ?

  :::indice
  Essaie `call`, un second `bind`, puis `new`.
  :::

  :::reponse
  Non avec `call`, `apply` ou un second `bind` : la fonction liée ignore le `this` proposé et
  utilise celui fixé à l'origine, seuls les arguments supplémentaires sont pris en compte. La
  seule exception est `new` : appelée comme constructeur, une fonction liée crée un nouvel
  objet et l'utilise comme `this`. En pratique, lier une fonction est une décision définitive.
  :::

- Qu'est-ce que l'emprunt de méthode ?

  :::indice
  Que vérifie réellement une méthode native comme `map` sur son `this` ?
  :::

  :::reponse
  C'est le fait d'appliquer à un objet une méthode qu'il ne possède pas, avec `call` ou
  `apply`. Cela fonctionne parce que beaucoup de méthodes natives ne vérifient pas le type de
  `this`, seulement les propriétés dont elles ont besoin : `Array.prototype.map.call(objet, f)`
  marche sur tout objet doté d'un `length` et de clés numériques. C'était la conversion
  classique d'`arguments` ou d'une `NodeList` en tableau, remplacée aujourd'hui par
  `Array.from` et le spread.
  :::
