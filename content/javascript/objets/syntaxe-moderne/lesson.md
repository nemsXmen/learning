---
id: javascript-objets-syntaxe-moderne
title: "Syntaxe moderne : raccourcis, destructuring et spread"
slug: syntaxe-moderne
technology: javascript
level: intermediate
module: objets
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-objets-creer
skills:
  - objects-modern-syntax
tags:
  - javascript
  - objets
---

## Objectifs

- Écrire des objets avec les raccourcis de propriété, de méthode et de clé calculée.
- Extraire des valeurs avec le destructuring : renommage, valeur par défaut, imbrication,
  reste.
- Fusionner et copier des objets avec le spread, et retirer une propriété sans muter.

## Introduction

Le code qui manipule des objets est partout : réponses d'API, options de fonctions, état
d'interface. La syntaxe ajoutée depuis ES2015 permet d'écrire en une ligne ce qui en
demandait cinq. Ce chapitre regroupe ces raccourcis, indispensables pour lire n'importe
quel code JavaScript moderne.

## Concept

**À l'écriture** :

| Écriture | Équivalent |
| --- | --- |
| `{ nom, age }` | `{ nom: nom, age: age }` |
| `{ [cle]: valeur }` | clé calculée à partir de la variable `cle` |
| `{ saluer() {} }` | `{ saluer: function () {} }` |
| `{ ...base, role: 'admin' }` | copie de `base`, puis `role` écrasé ou ajouté |

**À la lecture** (destructuring) :

| Écriture | Effet |
| --- | --- |
| `const { nom } = utilisateur` | `nom` reçoit `utilisateur.nom` |
| `const { nom: n } = utilisateur` | la variable s'appelle `n` |
| `const { role = 'membre' } = utilisateur` | valeur par défaut si `undefined` |
| `const { adresse: { ville } } = utilisateur` | destructuring imbriqué |
| `const { id, ...reste } = utilisateur` | `reste` reçoit les autres propriétés |
| `function f({ nom, actif = true })` | destructuring d'un paramètre |

## Exemple

```js
const nom = 'Ada';
const age = 36;
const cleDynamique = 'niveau';

const utilisateur = {
  nom,
  age,
  [cleDynamique]: 3,
  saluer() {
    return `Bonjour ${this.nom}`;
  },
};
console.log(utilisateur); // { nom: 'Ada', age: 36, niveau: 3, saluer: [Function] }

const { nom: prenom, role = 'membre', niveau } = utilisateur;
console.log(prenom, role, niveau); // 'Ada' 'membre' 3

const compte = { id: 7, email: 'ada@example.com', motDePasse: 'secret' };
const { motDePasse, ...compteSansSecret } = compte;
console.log(compteSansSecret); // { id: 7, email: 'ada@example.com' }
console.log(compte.motDePasse); // 'secret' : l'original est intact

const parDefaut = { theme: 'clair', langue: 'fr', animations: true };
const options = { theme: 'sombre' };
console.log({ ...parDefaut, ...options }); // theme: 'sombre', le reste par défaut

function creerBouton({ texte, variante = 'primaire' }) {
  return `${variante} : ${texte}`;
}
console.log(creerBouton({ texte: 'Envoyer' })); // 'primaire : Envoyer'
```

## Comment ça fonctionne

Le spread copie les propriétés **propres et énumérables** dans un nouvel objet, dans
l'ordre d'écriture : en cas de doublon, **la dernière gagne**. C'est ce qui rend
`{ ...parDefaut, ...options }` idiomatique pour appliquer des valeurs par défaut. Comme pour
les tableaux, la copie est **superficielle** : un objet imbriqué reste partagé.

`Object.assign(cible, ...sources)` fait un travail proche, mais **modifie** `cible` et
renvoie cet objet. `Object.assign({}, a, b)` équivaut donc à `{ ...a, ...b }`.

Le reste `...reste` collecte les propriétés non nommées dans un nouvel objet : c'est la
façon la plus courte de retirer une propriété sans toucher à l'original.

Une valeur par défaut ne s'applique que si la valeur est **`undefined`**, pas `null` :
`const { role = 'membre' } = { role: null }` donne `null`.

Destructurer `undefined` ou `null` lève une `TypeError`. Pour un paramètre optionnel, on
donne un objet vide par défaut : `function f({ a } = {})`.

Enfin, en **affectation** — sans `const` —, il faut des parenthèses, sinon l'accolade est
lue comme un bloc : `({ nom } = utilisateur)`.

## Erreurs fréquentes

**Attendre une copie profonde du spread.** Les objets imbriqués restent partagés :
`{ ...config, serveur: { ...config.serveur, port: 80 } }` pour modifier un niveau
supplémentaire.

**Mettre les sources dans le mauvais ordre.** `{ ...options, ...parDefaut }` écrase les
choix de l'utilisateur par les valeurs par défaut.

**Attendre qu'une valeur par défaut remplace `null`.** Seul `undefined` la déclenche ;
sinon, `valeur ?? repli`.

**Destructurer un résultat qui peut être absent.** `const { data } = await charger()` échoue
si la fonction renvoie `undefined`.

**Oublier les parenthèses en affectation.** `{ nom } = utilisateur` est une erreur de
syntaxe.

## À retenir

- `{ nom }` abrège `{ nom: nom }` ; `{ [cle]: v }` calcule le nom de la clé.
- Le spread copie les propriétés propres ; en cas de doublon, la dernière gagne.
- `const { a, ...reste } = objet` retire `a` sans modifier `objet`.
- Une valeur par défaut ne se déclenche que sur `undefined`.
- Destructurer `undefined` lève une `TypeError` : prévois `= {}`.

## Exercices

1. À partir de `{ nom: 'Ada', age: 36 }`, extrais le nom dans une variable `prenom`, et un
   `role` qui vaut `'membre'` quand la propriété est absente.

   :::indice
   Le renommage s'écrit `{ cle: nouveauNom }`, la valeur par défaut `{ cle = valeur }`.
   :::

   :::solution
   ```js
   const utilisateur = { nom: 'Ada', age: 36 };

   const { nom: prenom, role = 'membre' } = utilisateur;
   console.log(prenom, role); // 'Ada' 'membre'
   ```
   :::

2. À partir de `{ id: 7, email: 'ada@example.com', motDePasse: 'secret' }`, crée un objet
   sans le mot de passe, sans modifier l'original.

   :::indice
   Le destructuring permet de nommer la propriété à écarter et de collecter le reste.
   :::

   :::solution
   ```js
   const compte = { id: 7, email: 'ada@example.com', motDePasse: 'secret' };

   const { motDePasse, ...compteSansSecret } = compte;

   console.log(compteSansSecret); // { id: 7, email: 'ada@example.com' }
   console.log(Object.hasOwn(compte, 'motDePasse')); // true : original intact
   ```

   La variable `motDePasse` est créée mais inutilisée : c'est le prix de cette technique, et
   les configurations d'ESLint courantes savent l'ignorer.
   :::

3. Écris une fonction `configurer(options)` qui complète les options reçues avec
   `{ theme: 'clair', langue: 'fr' }`, et qui fonctionne même appelée sans argument.

   :::indice
   Pour que les options gagnent sur les valeurs par défaut, dans quel ordre écrire les deux
   spreads ?
   :::

   :::indice
   Un paramètre peut avoir une valeur par défaut : `function configurer(options = {})`.
   :::

   :::solution
   ```js
   const PAR_DEFAUT = { theme: 'clair', langue: 'fr' };

   function configurer(options = {}) {
     return { ...PAR_DEFAUT, ...options };
   }

   console.log(configurer({ theme: 'sombre' })); // { theme: 'sombre', langue: 'fr' }
   console.log(configurer()); // { theme: 'clair', langue: 'fr' }
   ```
   :::

## Questions d'entretien

- Quelle différence entre le spread et `Object.assign` ?

  :::indice
  Lequel des deux crée un nouvel objet ?
  :::

  :::reponse
  `{ ...a, ...b }` crée toujours un nouvel objet. `Object.assign(cible, source)` copie **dans**
  `cible`, qu'il modifie et renvoie : `Object.assign(objet, patch)` mute `objet`, ce qui est
  parfois voulu, souvent non. Les deux font une copie superficielle des propriétés propres
  énumérables ; `Object.assign` déclenche en plus les accesseurs de la cible. En pratique, on
  écrit le spread, et `Object.assign({}, a, b)` quand les sources sont dans un tableau.
  :::

- Comment retirer une propriété d'un objet sans le modifier ?

  :::indice
  Une syntaxe vue dans ce chapitre nomme ce qu'on écarte et collecte le reste.
  :::

  :::reponse
  Avec le destructuring et le reste : `const { motDePasse, ...reste } = compte`. `reste` est
  un nouvel objet sans la propriété, et `compte` est intact. `delete compte.motDePasse`
  modifierait l'objet d'origine, donc toutes les références. Pour une clé dynamique, on peut
  aussi filtrer les entrées : `Object.fromEntries(Object.entries(objet).filter(([cle]) => cle !== aRetirer))`.
  :::

- Pourquoi `{ nom } = utilisateur` provoque-t-il une erreur de syntaxe ?

  :::indice
  Comment le moteur interprète-t-il une accolade en début d'instruction ?
  :::

  :::reponse
  En début d'instruction, une accolade ouvre un **bloc**, pas un objet : le moteur lit un bloc
  contenant `nom`, puis rencontre un `=` inattendu. Il faut des parenthèses pour forcer la
  lecture en expression : `({ nom } = utilisateur)`. Le problème ne se pose pas avec `const`
  ou `let`, car l'accolade suit alors le mot-clé de déclaration.
  :::
