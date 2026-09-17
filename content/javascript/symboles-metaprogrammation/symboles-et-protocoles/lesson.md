---
id: javascript-symboles
title: "Symboles et symboles bien connus"
slug: symboles-et-protocoles
technology: javascript
level: advanced
module: symboles-metaprogrammation
order: 1
estimatedMinutes: 25
difficulty: 4
xp: 90
prerequisites:
  - javascript-iterateurs
skills:
  - symbols
tags:
  - javascript
  - avance
---

## Objectifs

- Créer des symboles et les utiliser comme clés de propriété sans risque de collision.
- Distinguer les symboles locaux, partagés par le registre global, et bien connus.
- Personnaliser le comportement d'un objet avec `Symbol.toPrimitive`, `Symbol.toStringTag` et `Symbol.hasInstance`.

## Introduction

Le chapitre sur les itérateurs a utilisé `Symbol.iterator` comme une clé un peu étrange. C'est un **symbole** : le
septième type primitif de JavaScript, conçu pour une seule chose — créer des clés de propriété **uniques**. Ils
permettent aux bibliothèques d'ajouter des informations à un objet sans jamais écraser une propriété existante, et au
langage lui-même d'exposer des points d'extension, les symboles bien connus.

## Concept

| Écriture | Résultat |
| --- | --- |
| `Symbol('description')` | un symbole **unique** ; la description ne sert qu'au débogage |
| `Symbol.for('app.cle')` | un symbole **partagé**, pris dans le registre global par sa clé |
| `objet[symbole] = valeur` | une propriété dont la clé est le symbole |
| `Object.getOwnPropertySymbols(objet)` | les clés symboles d'un objet |

Les propriétés à clé symbole sont ignorées par `Object.keys`, `for...in` et `JSON.stringify`.

Les **symboles bien connus** permettent de brancher un objet sur les mécanismes du langage :

| Symbole | Mécanisme personnalisé |
| --- | --- |
| `Symbol.iterator` / `Symbol.asyncIterator` | `for...of` / `for await...of` |
| `Symbol.toPrimitive` | conversion en nombre ou en chaîne |
| `Symbol.toStringTag` | le nom affiché par `Object.prototype.toString` |
| `Symbol.hasInstance` | le résultat de `instanceof` |

## Exemple

```js
const identifiant = Symbol('identifiant');
const autre = Symbol('identifiant');
console.log(identifiant === autre, identifiant.description); // false 'identifiant'

const utilisateur = { nom: 'Ada', [identifiant]: 42 };
console.log(Object.keys(utilisateur), JSON.stringify(utilisateur)); // ['nom'] '{"nom":"Ada"}'
console.log(utilisateur[identifiant]); // 42
console.log(Reflect.ownKeys(utilisateur)); // ['nom', Symbol(identifiant)]

console.log(Symbol.for('app.session') === Symbol.for('app.session')); // true : même symbole partagé

class Montant {
  constructor(centimes) {
    this.centimes = centimes;
  }

  [Symbol.toPrimitive](indice) {
    return indice === 'string' ? `${(this.centimes / 100).toFixed(2)} €` : this.centimes / 100;
  }

  get [Symbol.toStringTag]() {
    return 'Montant';
  }
}

const prix = new Montant(1250);
console.log(`${prix}`); // '12.50 €' : conversion en chaîne
console.log(prix * 2, prix + 1); // 25 13.5 : conversion en nombre
console.log(Object.prototype.toString.call(prix)); // '[object Montant]'

class NombrePair {
  static [Symbol.hasInstance](valeur) {
    return Number.isInteger(valeur) && valeur % 2 === 0;
  }
}
console.log(4 instanceof NombrePair, 3 instanceof NombrePair); // true false
```

## Comment ça fonctionne

Chaque appel à `Symbol()` crée une valeur **unique**, même avec la même description : deux symboles ne sont jamais
égaux. Une propriété dont la clé est un symbole ne peut donc pas entrer en collision avec une autre, ni être atteinte
par un code qui ne possède pas ce symbole. C'est utile pour attacher une information à un objet qu'on ne contrôle pas —
une bibliothèque qui marque les objets qu'elle a déjà traités — sans risquer d'écraser une propriété existante.

Ces propriétés sont **discrètes** plutôt que privées : `Object.keys`, `for...in` et `JSON.stringify` les ignorent, mais
`Object.getOwnPropertySymbols` et `Reflect.ownKeys` les révèlent. Pour une véritable confidentialité, on utilise les
champs privés `#`. Un symbole ne se convertit pas implicitement en chaîne : l'insérer dans un gabarit lève une
`TypeError` ; on écrit `String(symbole)` ou `symbole.description`.

`Symbol.for(cle)` consulte un **registre global** : le même appel renvoie toujours le même symbole, même depuis un autre
module ou une autre fenêtre du même programme. C'est le moyen de partager un symbole sans l'exporter, au prix de
réintroduire un espace de noms global — d'où l'usage de clés préfixées comme `app.session`.

Les **symboles bien connus** sont des propriétés statiques de `Symbol` que le langage consulte à des moments précis.
`Symbol.toPrimitive` est appelé quand un objet doit devenir une valeur primitive ; son argument, l'**indice**, vaut
`'string'` dans un gabarit ou avec `String`, `'number'` dans une opération arithmétique comme `*`, et `'default'` pour
`+` ou `==`, qui peuvent attendre l'un ou l'autre. `Symbol.toStringTag` personnalise le nom renvoyé par
`Object.prototype.toString`, utilisé par certains outils pour identifier le type d'un objet. `Symbol.hasInstance` permet à
une classe de redéfinir `instanceof`.

Ces points d'extension sont puissants, mais ils rendent le comportement moins prévisible : un objet qui se convertit
silencieusement en nombre peut masquer une erreur. On les réserve aux types de valeur qui ont une représentation
naturelle, comme un montant ou une date.

## Erreurs fréquentes

**Croire qu'une propriété symbole est privée.** Elle est seulement discrète : utilise `#` pour la confidentialité.

**Insérer un symbole dans un gabarit.** `TypeError` : utilise `description`.

**Utiliser `Symbol()` là où un symbole partagé est nécessaire.** Deux appels créent deux symboles différents.

**Compter sur `JSON.stringify` pour transmettre une propriété symbole.** Elle est ignorée.

**Abuser de `Symbol.toPrimitive`.** Une conversion implicite surprenante masque des erreurs.

## À retenir

- `Symbol()` crée une clé unique ; `Symbol.for()` un symbole partagé par le registre global.
- Les propriétés symboles sont ignorées par `Object.keys` et `JSON.stringify`, mais pas cachées.
- Les symboles bien connus branchent un objet sur le langage : itération, conversion, `instanceof`.
- `Symbol.toPrimitive` reçoit l'indice `'string'`, `'number'` ou `'default'`.
- Pour la confidentialité, les champs privés `#`, pas les symboles.

## Exercices

1. Une bibliothèque doit marquer les objets qu'elle a déjà enregistrés, sans modifier leurs clés visibles ni leur
   sérialisation. Écris `marquer(objet)` et `estMarque(objet)` avec un symbole.

   :::indice
   Un symbole créé une fois dans le module sert de clé ; il n'apparaît ni dans `Object.keys` ni dans le JSON.
   :::

   :::solution
   ```js
   const ENREGISTRE = Symbol('enregistré');

   function marquer(objet) {
     objet[ENREGISTRE] = true;
     return objet;
   }

   function estMarque(objet) {
     return objet[ENREGISTRE] === true;
   }

   const commande = marquer({ id: 7, total: 30 });
   console.log(estMarque(commande), estMarque({ id: 8 })); // true false
   console.log(Object.keys(commande), JSON.stringify(commande)); // ['id', 'total'] '{"id":7,"total":30}'
   ```
   :::

2. Ajoute à une classe `Duree(secondes)` une conversion qui donne `'2 min 5 s'` en chaîne et le nombre de secondes dans un
   calcul, pour que `` `${d}` `` et `d + 10` fonctionnent naturellement.

   :::indice
   `[Symbol.toPrimitive](indice)` : renvoie la chaîne quand l'indice vaut `'string'`, le nombre sinon.
   :::

   :::solution
   ```js
   class Duree {
     constructor(secondes) {
       this.secondes = secondes;
     }

     [Symbol.toPrimitive](indice) {
       if (indice === 'string') {
         return `${Math.floor(this.secondes / 60)} min ${this.secondes % 60} s`;
       }
       return this.secondes;
     }
   }

   const pause = new Duree(125);
   console.log(`${pause}`, pause + 10, pause > 120); // '2 min 5 s' 135 true
   ```
   :::

3. Deux modules chargés séparément doivent partager la même clé symbole sans s'importer mutuellement. Montre pourquoi
   `Symbol('app.cache')` ne convient pas, puis corrige.

   :::indice
   Deux appels à `Symbol` créent-ils la même valeur ? Quelle fonction consulte un registre commun ?
   :::

   :::solution
   ```js
   // module A
   const cleA = Symbol('app.cache');
   // module B
   const cleB = Symbol('app.cache');
   console.log(cleA === cleB); // false : deux symboles distincts, même avec la même description

   const partageA = Symbol.for('app.cache');
   const partageB = Symbol.for('app.cache');
   const objet = { [partageA]: 'donnée en cache' };
   console.log(partageA === partageB, objet[partageB]); // true 'donnée en cache'
   ```

   `Symbol.for` retrouve le symbole dans le registre global par sa clé. La clé préfixée limite le risque qu'une autre
   bibliothèque utilise la même.
   :::

## Questions d'entretien

- À quoi servent les symboles ?

  :::indice
  Pense aux clés de propriété et aux points d'extension du langage.
  :::

  :::reponse
  Un symbole est une valeur primitive unique, utilisée principalement comme clé de propriété qui ne peut entrer en
  collision avec aucune autre. Il permet d'attacher des informations à un objet sans risquer d'écraser une propriété, et
  ces propriétés sont ignorées par `Object.keys` et `JSON.stringify`. Le langage s'en sert aussi pour ses points
  d'extension, les symboles bien connus comme `Symbol.iterator` ou `Symbol.toPrimitive`.
  :::

- Une propriété à clé symbole est-elle privée ?

  :::indice
  Existe-t-il un moyen de lister les clés symboles d'un objet ?
  :::

  :::reponse
  Non. Elle est seulement discrète : les énumérations habituelles et la sérialisation JSON l'ignorent, mais
  `Object.getOwnPropertySymbols` et `Reflect.ownKeys` la révèlent, et n'importe quel code qui possède le symbole peut la
  lire. Pour des données réellement inaccessibles de l'extérieur, on utilise les champs privés `#` d'une classe ou une
  closure.
  :::

- Quelle différence entre `Symbol('x')` et `Symbol.for('x')` ?

  :::indice
  Que renvoient deux appels successifs de chacune ?
  :::

  :::reponse
  `Symbol('x')` crée à chaque appel un nouveau symbole unique ; la description ne sert qu'au débogage. `Symbol.for('x')`
  consulte un registre global : le premier appel crée le symbole, les suivants renvoient le même, y compris depuis un autre
  module. On utilise `Symbol.for` pour partager une clé entre parties d'un programme qui ne s'importent pas.
  :::
