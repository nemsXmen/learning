---
id: javascript-this-fleches
title: "this dans les fonctions fléchées et les callbacks"
slug: this-fleches-et-callbacks
technology: javascript
level: advanced
module: this-et-liaison
order: 3
estimatedMinutes: 25
difficulty: 4
xp: 90
prerequisites:
  - javascript-call-apply-bind
  - javascript-fonctions-flechees
skills:
  - this-arrow-callbacks
tags:
  - javascript
  - runtime
---

## Objectifs

- Expliquer d'où une fonction fléchée tire son `this`, et pourquoi on ne peut pas le changer.
- Garder le bon `this` dans un `setTimeout`, une méthode de tableau ou un écouteur
  d'événement.
- Choisir entre fonction fléchée, `bind` et champ de classe selon la situation.

## Introduction

Les callbacks sont l'endroit où `this` se perd le plus souvent : on passe une méthode à
`setTimeout` ou à `addEventListener`, et elle s'exécute sans son objet. Les fonctions
fléchées ont été conçues en grande partie pour régler ce problème. Mais elles ne suivent
pas les quatre règles du chapitre précédent — ce qui les rend précieuses dans un callback
et piégeuses comme méthode d'objet.

## Concept

Une fonction fléchée **n'a pas de `this` propre**. Elle utilise celui de l'environnement où
elle est **écrite**, exactement comme une variable ordinaire.

| Situation | Fonction classique | Fonction fléchée |
| --- | --- | --- |
| `objet.methode()` | `this` = objet | `this` extérieur |
| Callback de `setTimeout` | `window` (navigateur), `Timeout` (Node) | `this` extérieur |
| `call`, `apply`, `bind` | `this` fourni | ignoré |
| `new` | nouvel objet | `TypeError` |
| Écouteur `addEventListener` | l'élément écouté | `this` extérieur |

Conséquence pratique : une fléchée écrite **dans une méthode** récupère le `this` de la
méthode, et c'est le bon réflexe pour un callback. Une fléchée écrite **comme méthode** d'un
objet littéral récupère le `this` du module, soit `undefined`.

## Exemple

```js
// Dans un module ES : this vaut undefined au niveau supérieur.
const minuteur = {
  secondes: 0,
  demarrerCasse() {
    setTimeout(function () {
      // this n'est pas minuteur ici : window dans un navigateur, Timeout dans Node
      console.log('classique', this?.secondes); // 'classique' undefined
    }, 0);
  },
  demarrer() {
    setTimeout(() => {
      this.secondes += 1; // this = minuteur, hérité de demarrer
      console.log('fléchée', this.secondes); // 'fléchée' 1
    }, 0);
  },
  mauvaiseMethode: () => typeof this, // this du module
};

minuteur.demarrerCasse();
minuteur.demarrer();
console.log(minuteur.mauvaiseMethode()); // 'undefined'

const fleche = () => this;
console.log(fleche.call({ nom: 'ignoré' })); // undefined : call n'y change rien

class Bouton {
  clics = 0;
  gererClic = () => {
    this.clics += 1; // champ fléché : lié à l'instance
    return this.clics;
  };
}
const bouton = new Bouton();
const gestionnaire = bouton.gererClic; // détaché
console.log(gestionnaire(), gestionnaire()); // 1 2
```

## Comment ça fonctionne

Pendant la phase de création, une fonction classique reçoit un `this` calculé à partir de
l'appel. Une fonction fléchée n'en reçoit pas : quand elle lit `this`, le moteur le cherche
dans les environnements extérieurs, jusqu'à trouver celui d'une fonction classique ou du
niveau supérieur. Son `this` est donc fixé par l'endroit où elle est **écrite**, et `call`,
`apply` ou `bind` n'ont rien à modifier.

Dans `demarrer`, la fléchée est créée pendant l'appel `minuteur.demarrer()`, où `this` vaut
`minuteur` : c'est ce `this` qu'elle utilise, même exécutée plus tard par `setTimeout`. La
fonction classique de `demarrerCasse` est appelée par le minuteur avec son propre `this` —
`window` dans un navigateur, un objet `Timeout` dans Node — qui n'a pas de propriété
`secondes`. Note au passage l'ordre des affichages de l'exemple : les deux
callbacks de `setTimeout` s'exécutent après tout le code synchrone.

Les méthodes de tableau acceptent un second argument, `thisArg`, qui fixe le `this` d'un
callback classique : `liste.map(function (x) { return this.facteur * x; }, objet)`. Avec une
fléchée, ce paramètre est ignoré ; c'est rarement un problème, puisque la fléchée voit déjà
le bon `this`.

Pour un **écouteur d'événement**, une fonction classique reçoit comme `this` l'élément
auquel l'écouteur est attaché, soit `event.currentTarget`. Une fléchée reçoit le `this`
extérieur. Si l'élément est nécessaire, `event.currentTarget` est plus explicite que `this`
dans les deux cas.

Dans une **classe**, un champ initialisé avec une fléchée, `gererClic = () => {}`, est créé
pour chaque instance au moment de sa construction : son `this` est l'instance, même une fois
la fonction détachée. Le coût est une fonction par instance au lieu d'une méthode partagée
sur le prototype. Lier dans le constructeur avec `bind` a le même coût ; l'alternative est
de garder une méthode classique et d'envelopper à l'endroit de l'usage.

## Erreurs fréquentes

**Écrire une méthode d'objet littéral en fléchée.** Elle prend le `this` du module, pas de
l'objet.

**Espérer changer le `this` d'une fléchée avec `bind`.** L'appel est ignoré sans erreur.

**Utiliser `this` dans un écouteur fléché pour désigner l'élément.** Utilise
`event.currentTarget`.

**Transformer toutes les méthodes de classe en champs fléchés.** Chaque instance porte alors
ses propres fonctions ; réserve ce motif aux méthodes réellement passées en callback.

## À retenir

- Une fléchée n'a pas de `this` : elle utilise celui de l'environnement où elle est écrite.
- `call`, `apply`, `bind` et `thisArg` n'ont aucun effet sur une fléchée.
- Dans une méthode, une fléchée garde le `this` de la méthode pour ses callbacks.
- Comme méthode d'objet littéral, une fléchée perd l'objet.
- Écouteur d'événement : `event.currentTarget` plutôt que `this`.

## Exercices

1. Corrige `demarrer` pour que le callback incrémente bien `secondes` chaque seconde.

   ```js
   const chrono = {
     secondes: 0,
     demarrer() {
       setInterval(function () {
         this.secondes += 1;
       }, 1000);
     },
   };
   ```

   :::indice
   Le callback est une fonction classique appelée par le minuteur, sans `chrono`. Quelle
   forme de fonction hérite du `this` de `demarrer` ?
   :::

   :::solution
   ```js
   const chrono = {
     secondes: 0,
     demarrer() {
       return setInterval(() => {
         this.secondes += 1;
       }, 1000);
     },
   };
   ```

   La fléchée est créée pendant l'appel `chrono.demarrer()` et utilise son `this`. Renvoyer
   l'identifiant de l'intervalle permet de l'arrêter plus tard avec `clearInterval`.
   :::

2. Explique pourquoi `utilisateur.saluer()` renvoie `'Bonjour undefined'`, et corrige.

   ```js
   const utilisateur = {
     nom: 'Ada',
     saluer: () => `Bonjour ${this?.nom}`,
   };
   ```

   :::indice
   Où la fonction fléchée est-elle écrite, et quel est le `this` de cet endroit ?
   :::

   :::solution
   La fléchée est écrite au niveau supérieur du module, dans un littéral d'objet — qui ne crée
   pas de portée. Son `this` est celui du module, `undefined`, donc `this?.nom` vaut
   `undefined`. Une méthode doit être une fonction classique :

   ```js
   const utilisateur = {
     nom: 'Ada',
     saluer() {
       return `Bonjour ${this.nom}`;
     },
   };
   console.log(utilisateur.saluer()); // 'Bonjour Ada'
   ```
   :::

3. Cette classe perd son `this` quand `valider` est passée en callback. Propose deux
   corrections et donne le coût de chacune.

   ```js
   class Formulaire {
     erreurs = [];
     valider(champ) {
       if (!champ) this.erreurs.push('champ vide');
     }
   }
   const formulaire = new Formulaire();
   ['', 'ok'].forEach(formulaire.valider);
   ```

   :::indice
   On peut fixer le `this` au niveau de l'instance, ou seulement à l'endroit de l'usage.
   :::

   :::solution
   ```js
   // 1. À l'usage : aucune fonction supplémentaire par instance.
   ['', 'ok'].forEach((champ) => formulaire.valider(champ));

   // 2. Dans la classe : un champ fléché, lié à chaque instance.
   class FormulaireLie {
     erreurs = [];
     valider = (champ) => {
       if (!champ) this.erreurs.push('champ vide');
     };
   }
   const lie = new FormulaireLie();
   ['', 'ok'].forEach(lie.valider);
   console.log(lie.erreurs); // ['champ vide']
   ```

   La première solution laisse la méthode sur le prototype, partagée par toutes les
   instances. La seconde crée une fonction par instance, mais permet de passer
   `lie.valider` partout sans précaution.
   :::

## Questions d'entretien

- Comment une fonction fléchée détermine-t-elle `this` ?

  :::indice
  En reçoit-elle un pendant sa phase de création ?
  :::

  :::reponse
  Elle n'en reçoit pas. Quand elle lit `this`, le moteur le cherche dans les environnements
  extérieurs, comme une variable, jusqu'à la première fonction classique ou le niveau
  supérieur. Son `this` est donc déterminé par l'endroit où elle est écrite, une fois pour
  toutes : `call`, `apply`, `bind` et le paramètre `thisArg` des méthodes de tableau n'ont
  aucun effet, et elle ne peut pas être appelée avec `new`.
  :::

- Pourquoi ne pas écrire les méthodes d'un objet littéral en fonctions fléchées ?

  :::indice
  Un littéral d'objet crée-t-il une portée ?
  :::

  :::reponse
  Parce qu'un littéral d'objet ne crée pas de portée : une fléchée écrite comme propriété
  prend le `this` de l'endroit où l'objet est construit — le module, soit `undefined`, ou
  la fonction englobante. Elle ne peut donc jamais désigner l'objet. Les méthodes doivent
  être des fonctions classiques ; les fléchées servent à l'intérieur de ces méthodes, pour
  les callbacks qui doivent garder leur `this`.
  :::

- Que vaut `this` dans un écouteur d'événement ?

  :::indice
  La réponse change selon la forme de la fonction passée à `addEventListener`.
  :::

  :::reponse
  Avec une fonction classique, `this` vaut l'élément auquel l'écouteur est attaché,
  c'est-à-dire `event.currentTarget`. Avec une fonction fléchée, `this` vaut celui de
  l'environnement où elle est écrite, souvent l'instance d'un composant. Pour désigner
  l'élément sans ambiguïté, on lit `event.currentTarget`, et l'on réserve `this` à l'objet
  qui gère l'événement.
  :::
