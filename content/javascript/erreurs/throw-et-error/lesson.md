---
id: javascript-throw-error
title: "throw et l'objet Error"
slug: throw-et-error
technology: javascript
level: intermediate
module: erreurs
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-familles-erreurs
skills:
  - error-objects
tags:
  - javascript
  - erreurs
---

## Objectifs

- Lever une erreur avec `throw` et un objet `Error` porteur d'un message utile.
- Lire les propriétés d'une erreur : `name`, `message`, `stack` et `cause`.
- Reconnaître les types d'erreurs natifs et ce que chacun signale.

## Introduction

Le chapitre précédent a classé les erreurs. Celui-ci s'intéresse à l'objet qui les transporte.
Une erreur bien construite dit ce qui s'est passé, où, et pourquoi ; une erreur mal construite — une
chaîne de caractères levée à la hâte, un message vague — fait perdre des heures au moment du
diagnostic. Tout commence par `throw` et par le constructeur `Error`.

## Concept

`throw` interrompt l'exécution et remonte la pile jusqu'au premier `catch`. On peut lever n'importe
quelle valeur, mais on lève **toujours un objet `Error`** :

| Propriété | Contenu |
| --- | --- |
| `message` | la description, écrite pour un développeur |
| `name` | le type : `'Error'`, `'TypeError'`… |
| `stack` | la pile d'appels au moment de la création de l'erreur |
| `cause` | l'erreur d'origine, passée avec `new Error(message, { cause })` |

Les types natifs, levés par le moteur ou utilisables directement :

| Type | Signale | Exemple déclencheur |
| --- | --- | --- |
| `TypeError` | une valeur du mauvais type | `null.x`, appeler une non-fonction |
| `RangeError` | une valeur hors des bornes | `new Array(-1)` |
| `ReferenceError` | un nom inexistant | lire une variable non déclarée |
| `SyntaxError` | un texte non analysable | `JSON.parse('{')` |
| `URIError` | un URI mal formé | `decodeURIComponent('%')` |
| `AggregateError` | plusieurs erreurs réunies | `Promise.any` quand tout échoue |

## Exemple

```js
function retirer(solde, montant) {
  if (typeof montant !== 'number' || Number.isNaN(montant)) {
    throw new TypeError(`Montant invalide : ${montant}`);
  }
  if (montant > solde) {
    throw new RangeError(`Retrait de ${montant} supérieur au solde de ${solde}`);
  }
  return solde - montant;
}

try {
  retirer(100, 250);
} catch (erreur) {
  console.log(erreur.name); // 'RangeError'
  console.log(erreur.message); // 'Retrait de 250 supérieur au solde de 100'
  console.log(erreur instanceof RangeError, erreur instanceof Error); // true true
  console.log(erreur.stack.split('\n')[0]); // 'RangeError: Retrait de 250 supérieur au solde de 100'
}

function lireConfiguration(texte) {
  try {
    return JSON.parse(texte);
  } catch (erreur) {
    throw new Error('Configuration illisible', { cause: erreur });
  }
}

try {
  lireConfiguration('{ port: 3000 }');
} catch (erreur) {
  console.log(erreur.message, '←', erreur.cause.name); // 'Configuration illisible ← SyntaxError'
}

try {
  throw 'échec'; // à éviter
} catch (valeur) {
  console.log(typeof valeur, valeur.stack); // 'string' undefined : aucune pile
}
```

## Comment ça fonctionne

`throw` arrête immédiatement la fonction en cours et remonte la pile d'appels : chaque fonction est
quittée à son tour, jusqu'à trouver un `catch` englobant. Sans `catch`, l'erreur atteint le niveau
supérieur : le navigateur l'affiche dans la console, Node.js arrête le processus.

La propriété `stack` est remplie **au moment où l'objet `Error` est créé**, pas au moment où il est
levé. Elle indique la chaîne d'appels qui a conduit à cette création, avec fichiers et numéros de
ligne. C'est la raison principale de lever un objet `Error` : une chaîne ou un nombre levés n'ont
aucune pile, et le `catch` ne peut ni lire `message` ni tester le type avec `instanceof`.

Le **message** s'adresse à un développeur : il doit contenir les valeurs en cause — « Retrait de 250
supérieur au solde de 100 » plutôt que « Erreur de retrait ». Il n'est pas destiné à être affiché tel
quel à un utilisateur, qui a besoin d'un texte adapté, produit plus haut dans l'application.

L'option **`cause`**, disponible depuis ES2022, résout un dilemme ancien. Quand une couche du
programme rattrape une erreur technique pour lui donner un sens métier, elle perdait l'erreur
d'origine ; désormais elle la conserve : `new Error('Configuration illisible', { cause })`. Les outils
de journalisation et la console de Node.js affichent la chaîne complète des causes.

Choisir le **type** a un intérêt pratique : `TypeError` pour une valeur du mauvais type, `RangeError`
pour une valeur hors bornes, ce qui permet au code appelant de réagir différemment. Pour les erreurs
propres au domaine — validation, droits, ressource introuvable —, on crée ses propres classes, sujet
du chapitre 4.

Deux détails utiles au diagnostic. `message` et `stack` ne sont **pas énumérables** :
`JSON.stringify(erreur)` renvoie `'{}'`, et une erreur envoyée telle quelle dans un journal JSON perd
tout son contenu. On sérialise donc explicitement `name`, `message`, `stack` et `cause`. Et `Error` peut
s'appeler avec ou sans `new`, avec le même résultat.

## Erreurs fréquentes

**Lever une chaîne ou un nombre.** Aucune pile, aucun `instanceof` : lève un objet `Error`.

**Écrire un message vague.** Inclus les valeurs en cause.

**Relever une nouvelle erreur sans `cause`.** L'erreur d'origine disparaît du diagnostic.

**Journaliser une erreur avec `JSON.stringify`.** Le résultat est `'{}'`.

**Utiliser le message technique comme texte pour l'utilisateur.** Traduis-le plus haut.

## À retenir

- `throw` interrompt et remonte la pile jusqu'au premier `catch`.
- On lève toujours un objet `Error`, ou une sous-classe.
- `name`, `message`, `stack`, et `cause` pour chaîner l'erreur d'origine.
- La pile est capturée à la création de l'objet `Error`.
- `message` et `stack` ne sont pas énumérables : sérialise-les explicitement.

## Exercices

1. Écris `diviser(a, b)` qui lève une `TypeError` si un argument n'est pas un nombre, et une
   `RangeError` si `b` vaut `0`, avec des messages qui citent les valeurs reçues.

   :::indice
   Teste le type d'abord, puis la borne ; `Number.isFinite` écarte aussi `NaN` et `Infinity`.
   :::

   :::solution
   ```js
   function diviser(a, b) {
     if (!Number.isFinite(a) || !Number.isFinite(b)) {
       throw new TypeError(`diviser attend deux nombres, reçu ${a} et ${b}`);
     }
     if (b === 0) {
       throw new RangeError(`Division de ${a} par zéro`);
     }
     return a / b;
   }

   console.log(diviser(10, 4)); // 2.5
   for (const [a, b] of [['10', 2], [10, 0]]) {
     try {
       diviser(a, b);
     } catch (erreur) {
       console.log(erreur.name, '-', erreur.message);
     }
   }
   // 'TypeError - diviser attend deux nombres, reçu 10 et 2'
   // 'RangeError - Division de 10 par zéro'
   ```
   :::

2. Écris `versJournal(erreur)` qui transforme une erreur en objet sérialisable avec `name`, `message`,
   la première ligne de `stack`, et sa `cause` convertie de la même façon si elle existe.

   :::indice
   Les propriétés utiles ne sont pas énumérables : copie-les explicitement, et appelle la fonction
   récursivement sur `cause`.
   :::

   :::solution
   ```js
   function versJournal(erreur) {
     if (!(erreur instanceof Error)) {
       return { valeur: String(erreur) };
     }
     return {
       name: erreur.name,
       message: erreur.message,
       origine: erreur.stack?.split('\n')[1]?.trim(),
       cause: erreur.cause === undefined ? undefined : versJournal(erreur.cause),
     };
   }

   const erreur = new Error('Paiement refusé', { cause: new TypeError('montant manquant') });
   const journal = versJournal(erreur);
   console.log(JSON.stringify(erreur)); // '{}'
   console.log(journal.message, '←', journal.cause.name); // 'Paiement refusé ← TypeError'
   ```

   `JSON.stringify` ignore les propriétés `undefined` : une erreur sans cause produit un objet sans clé
   `cause`.
   :::

3. Écris `lirePort(texte)` qui analyse un JSON de la forme `{ "port": 3000 }`. Un JSON invalide doit
   produire l'erreur « Configuration illisible » avec la `SyntaxError` en cause ; un port absent ou non
   entier, une `RangeError` qui cite la valeur reçue.

   :::indice
   Un `try` court autour de `JSON.parse` seulement ; la validation du port se fait après, hors du `try`.
   :::

   :::solution
   ```js
   function lirePort(texte) {
     let configuration;
     try {
       configuration = JSON.parse(texte);
     } catch (erreur) {
       throw new Error('Configuration illisible', { cause: erreur });
     }
     if (!Number.isInteger(configuration.port)) {
       throw new RangeError(`Port invalide : ${configuration.port}`);
     }
     return configuration.port;
   }

   console.log(lirePort('{"port": 3000}')); // 3000
   for (const texte of ['{port: 3000}', '{"port": "3000"}']) {
     try {
       lirePort(texte);
     } catch (erreur) {
       console.log(erreur.message, erreur.cause?.name ?? '');
     }
   }
   // 'Configuration illisible SyntaxError'
   // 'Port invalide : 3000 '
   ```
   :::

## Questions d'entretien

- Pourquoi lever un objet `Error` plutôt qu'une chaîne ?

  :::indice
  Que perd-on quand on lève `'échec'` ?
  :::

  :::reponse
  Un objet `Error` capture la pile d'appels à sa création, porte un `name` et un `message` que le code
  appelant peut lire, et permet de distinguer les cas avec `instanceof`. Une chaîne levée n'a aucune
  pile : on ne sait plus d'où vient l'erreur, et le `catch` ne peut ni la classer ni l'enrichir. Les
  outils de journalisation et de suivi d'erreurs s'appuient eux aussi sur ces propriétés.
  :::

- À quoi sert l'option `cause` ?

  :::indice
  Pense à une couche qui transforme une erreur technique en erreur métier.
  :::

  :::reponse
  Elle permet de lever une nouvelle erreur, avec un message qui a du sens à ce niveau du programme,
  tout en conservant l'erreur d'origine : `new Error('Paiement refusé', { cause: erreur })`. Avant
  ES2022, on devait choisir entre un message utile et une information de diagnostic complète. Les
  consoles et les outils de journalisation affichent désormais la chaîne des causes.
  :::

- Quels sont les principaux types d'erreurs natifs, et que signalent-ils ?

  :::indice
  Pense aux erreurs levées par le moteur pour un mauvais type, une borne, un nom, un texte.
  :::

  :::reponse
  `TypeError` pour une valeur du mauvais type, comme une propriété lue sur `undefined` ; `RangeError`
  pour une valeur hors bornes, comme une longueur de tableau négative ; `ReferenceError` pour un nom
  qui n'existe pas ; `SyntaxError` pour un code ou un texte non analysable, notamment par `JSON.parse` ;
  `URIError` pour un URI mal formé ; et `AggregateError` pour plusieurs erreurs réunies. Toutes héritent
  d'`Error`.
  :::
