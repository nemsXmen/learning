---
id: javascript-chaines-rechercher
title: "Chercher dans une chaîne : includes, startsWith, endsWith et indexOf"
slug: rechercher-dans-une-chaine
technology: javascript
level: beginner
module: chaines
order: 2
estimatedMinutes: 20
difficulty: 2
xp: 60
prerequisites:
  - javascript-chaines-creer
skills:
  - strings-search
tags:
  - javascript
  - chaines
---

## Objectifs

- Tester la présence d'un texte avec `includes`, `startsWith` et `endsWith`.
- Trouver la position d'un texte avec `indexOf` et `lastIndexOf`.
- Rechercher sans tenir compte des majuscules, et éviter le piège de `indexOf` dans une
  condition.

## Introduction

Une adresse se termine-t-elle par le bon domaine ? Un message d'erreur contient-il un code
précis ? Un chemin commence-t-il par `/admin` ? Chercher dans du texte est une opération de
tous les jours, et JavaScript propose une méthode pour chaque question. Choisir la bonne
méthode rend le code plus lisible — et évite un bug devenu classique avec `indexOf`.

## Concept

| Méthode | Question posée | Renvoie |
| --- | --- | --- |
| `texte.includes(valeur)` | le texte contient-il la valeur ? | `true` / `false` |
| `texte.startsWith(valeur)` | commence-t-il par la valeur ? | `true` / `false` |
| `texte.endsWith(valeur)` | se termine-t-il par la valeur ? | `true` / `false` |
| `texte.indexOf(valeur)` | à quelle position apparaît-elle pour la première fois ? | un index, ou `-1` |
| `texte.lastIndexOf(valeur)` | à quelle position pour la dernière fois ? | un index, ou `-1` |

Toutes ces méthodes sont **sensibles à la casse** : `'Bonjour'.includes('bonjour')` vaut
`false`.

Elles acceptent une position en second argument : `includes` et `indexOf` commencent la
recherche à cet index, `startsWith` teste à partir de cet index, et `endsWith` considère la
chaîne comme si elle s'arrêtait à cette longueur.

## Exemple

```js
const email = 'ada.lovelace@exemple.fr';
const url = 'https://exemple.fr/docs/guide.pdf';
const log = '[2026-09-14 10:32] ERREUR 503 : service indisponible';

console.log(email.endsWith('@exemple.fr')); // true
console.log(url.startsWith('https://')); // true
console.log(log.includes('ERREUR')); // true

const arobase = email.indexOf('@'); // 12
const identifiant = email.slice(0, arobase);
console.log(identifiant); // 'ada.lovelace'

const dernierPoint = url.lastIndexOf('.');
console.log(url.slice(dernierPoint + 1)); // 'pdf'
```

## Comment ça fonctionne

Les méthodes booléennes répondent directement à la question « oui ou non ». `indexOf`
répond à « où ? » : il renvoie l'index de la première occurrence, ou `-1` si la valeur est
absente.

Ce `-1` est la source d'un bug répandu : utiliser `indexOf` directement dans une condition.

```js
const phrase = 'Erreur de connexion';

if (phrase.indexOf('Erreur')) {
  console.log('Contient une erreur'); // jamais affiché !
}
```

`indexOf` renvoie `0`, car le mot est au début, et `0` est falsy. À l'inverse, une valeur
absente renvoie `-1`, qui est truthy. La condition fait exactement le contraire de ce qu'on
veut. Pour tester la présence, `includes` est fait pour cela ; pour utiliser `indexOf`, on
compare explicitement : `phrase.indexOf('Erreur') !== -1`.

Pour une recherche **insensible à la casse**, on met les deux textes dans la même casse
avant de chercher. Pour ignorer aussi les accents, on décompose les caractères, puis on
retire les signes diacritiques :

```js
const sansAccents = (texte) =>
  texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

console.log(sansAccents('Élève').includes(sansAccents('eleve'))); // true
```

## Erreurs fréquentes

**Utiliser `indexOf` comme condition.** `0` (trouvé au début) est falsy et `-1` (absent)
est truthy. Utilise `includes`, ou compare à `-1`.

**Oublier la sensibilité à la casse.** `'JavaScript'.includes('javascript')` vaut `false`.
Normalise la casse des deux côtés.

**Tester une extension avec `includes`.** `'rapport.pdf.exe'.includes('.pdf')` vaut
`true`. Pour une fin de texte, `endsWith`.

**Chercher un domaine avec `includes`.** `'pirate@exemple.fr.evil.com'` contient
`'@exemple.fr'`. Pour un suffixe, `endsWith` ; pour de la sécurité, une vraie validation.

## À retenir

- `includes`, `startsWith`, `endsWith` répondent par un booléen.
- `indexOf` et `lastIndexOf` renvoient une position, ou `-1`.
- Ne jamais écrire `if (texte.indexOf(x))` : `0` est falsy, `-1` truthy.
- Toutes les recherches sont sensibles à la casse.
- Pour ignorer casse et accents : `normalize('NFD')`, retrait des diacritiques,
  `toLowerCase()`.

## Exercices

1. Vérifie qu'une URL commence par `https://` et se termine par `.pdf`.

   :::indice
   Il existe une méthode pour le début d'un texte et une autre pour sa fin. Combine-les
   avec `&&`.
   :::

   :::solution
   ```js
   const url = 'https://exemple.fr/docs/guide.pdf';

   const estPdfSecurise = url.startsWith('https://') && url.endsWith('.pdf');
   console.log(estPdfSecurise); // true
   ```
   :::

2. Cette condition ne détecte pas « Erreur » quand le mot est en début de phrase. Explique
   pourquoi, puis corrige-la.

   ```js
   if (message.indexOf('Erreur')) {
     alerter();
   }
   ```

   :::indice
   Que renvoie `indexOf` quand le mot est trouvé à la position 0 ? Et quand il est absent ?
   :::

   :::solution
   Trouvé au début, `indexOf` renvoie `0`, qui est falsy : l'alerte ne se déclenche pas.
   Absent, il renvoie `-1`, qui est truthy : l'alerte se déclenche à tort.

   ```js
   if (message.includes('Erreur')) {
     alerter();
   }
   ```
   :::

3. Vérifie si « JavaScript » apparaît dans `'Je code en JAVASCRIPT'`, quelle que soit la
   casse.

   :::indice
   Mets les deux textes dans la même casse avant de chercher.
   :::

   :::solution
   ```js
   const phrase = 'Je code en JAVASCRIPT';
   const recherche = 'JavaScript';

   console.log(phrase.toLowerCase().includes(recherche.toLowerCase())); // true
   ```
   :::

## Questions d'entretien

- Pourquoi `if (texte.indexOf(mot))` est-il un bug ?

  :::indice
  Quelles valeurs renvoie `indexOf`, et lesquelles sont falsy ?
  :::

  :::reponse
  `indexOf` renvoie la position de la première occurrence, ou `-1` si le mot est absent.
  Dans une condition, `0` — mot trouvé au tout début — est falsy, et `-1` est truthy. La
  condition est donc fausse quand le mot commence le texte et vraie quand il est absent. On
  utilise `includes` pour tester la présence, ou `indexOf(mot) !== -1`.
  :::

- Quelle différence entre `includes` et `indexOf` ?

  :::indice
  L'un répond à « est-ce présent ? », l'autre à « où est-ce ? ».
  :::

  :::reponse
  `includes` renvoie un booléen et exprime directement l'intention « le texte contient-il
  cette valeur ». `indexOf` renvoie la position de la première occurrence, ou `-1`, et sert
  quand on a besoin de cette position, par exemple pour découper le texte autour. Pour un
  simple test de présence, `includes` est plus lisible et évite le piège du `0` falsy.
  :::

- Comment rechercher un texte sans tenir compte des majuscules ni des accents ?

  :::indice
  Il faut rendre les deux textes comparables avant de chercher.
  :::

  :::reponse
  On transforme les deux textes de la même façon : `normalize('NFD')` décompose les
  caractères accentués en lettre plus diacritique, `replace(/\p{Diacritic}/gu, '')` retire
  les diacritiques, et `toLowerCase()` uniformise la casse. Ensuite `includes` suffit. Pour
  comparer ou trier, `localeCompare` avec l'option `sensitivity: 'base'`, ou
  `Intl.Collator`, gère ces règles selon la langue.
  :::
