---
id: javascript-chaines-creer
title: "Créer des chaînes : littéraux, template literals et longueur"
slug: creer-des-chaines
technology: javascript
level: beginner
module: chaines
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-types-primitifs
skills:
  - strings-basics
tags:
  - javascript
  - chaines
---

## Objectifs

- Créer une chaîne avec des apostrophes, des guillemets ou des backticks.
- Insérer des valeurs dans un texte et écrire sur plusieurs lignes avec les template
  literals.
- Lire la longueur d'une chaîne et un caractère précis, en connaissant les pièges
  d'Unicode.

## Introduction

Messages d'erreur, adresses e-mail, noms de fichiers, contenu d'une page : une grande
partie des données d'une application est du texte. JavaScript le représente avec le type
`string`. Depuis ES2015, les **template literals** ont rendu obsolètes les longues
concaténations pleines de `+` et d'apostrophes échappées. Il reste à connaître ce qu'une
chaîne est vraiment en mémoire, pour comprendre pourquoi un emoji a une « longueur » de 2.

## Concept

Trois délimiteurs créent une chaîne :

| Délimiteur | Exemple | Particularité |
| --- | --- | --- |
| apostrophes `' '` | `'Bonjour'` | le plus courant |
| guillemets `" "` | `"Aujourd'hui"` | pratique quand le texte contient une apostrophe |
| backticks `` ` ` `` | `` `Bonjour ${prenom}` `` | interpolation et plusieurs lignes |

Les **template literals**, entre backticks, évaluent toute expression placée dans `${ }` et
en insèrent le résultat converti en chaîne. Ils conservent aussi les retours à la ligne
tels quels.

Les **séquences d'échappement** insèrent des caractères spéciaux :

| Séquence | Produit |
| --- | --- |
| `\n` | un retour à la ligne |
| `\t` | une tabulation |
| `\'` et `\"` | une apostrophe ou un guillemet dans une chaîne délimitée par ce même caractère |
| `\\` | une barre oblique inverse |
| `é` | le caractère Unicode U+00E9, soit `é` |

`chaine.length` donne la longueur, `chaine[i]` le caractère à l'index `i`, et
`chaine.at(-1)` le dernier caractère.

## Exemple

```js
const prenom = 'Ada';
const ville = "Londres";
const age = 36;

const presentation = `${prenom} a ${age} ans et habite à ${ville}.`;
console.log(presentation); // Ada a 36 ans et habite à Londres.

const recu = `Commande n° ${1024}
Articles : ${3}
Total : ${(19.9 * 3).toFixed(2)} €`;
console.log(recu); // trois lignes

console.log(prenom.length); // 3
console.log(prenom[0]); // 'A'
console.log(prenom.at(-1)); // 'a'
console.log(prenom[10]); // undefined : index hors de la chaîne

console.log('Ligne 1\nLigne 2'); // deux lignes
```

## Comment ça fonctionne

Une chaîne JavaScript est une suite d'**unités de code UTF-16**. La plupart des caractères
occupent une unité, mais les emojis et certains symboles en occupent deux. `length` compte
les unités, pas les caractères visibles :

```js
console.log('é'.length); // 1
console.log('😀'.length); // 2 : un seul emoji, deux unités de code
console.log([...'😀'].length); // 1 : le spread découpe par caractère Unicode
```

Dans un template literal, chaque `${ }` est évalué puis converti en chaîne comme le ferait
`String(valeur)`. Un objet devient donc `[object Object]`, et un tableau ses éléments séparés
par des virgules.

Une chaîne est **immuable**. `prenom[0] = 'E'` ne modifie rien ; les méthodes qui
« transforment » une chaîne renvoient toujours une nouvelle chaîne.

## Erreurs fréquentes

**Additionner des nombres dans une concaténation.** `'Total : ' + 1 + 2` donne
`'Total : 12'`, car l'évaluation va de gauche à droite. Dans un template literal, écris le
calcul dans `${ }` : `` `Total : ${1 + 2}` ``.

**Mettre une apostrophe dans une chaîne entre apostrophes.** `'Aujourd'hui'` est une
erreur de syntaxe. Utilise des guillemets, des backticks, ou échappe l'apostrophe.

**Écrire `${ }` entre apostrophes.** `'Bonjour ${prenom}'` affiche le texte tel quel :
seuls les backticks interpolent.

**Se fier à `length` pour compter des caractères visibles.** Un emoji compte pour 2.
Pour compter les caractères, `[...texte].length`.

## À retenir

- Trois délimiteurs ; les backticks permettent l'interpolation et le texte sur plusieurs
  lignes.
- `${expression}` évalue n'importe quelle expression et la convertit en chaîne.
- `length` compte des unités de code UTF-16 : un emoji en vaut 2.
- `texte.at(-1)` lit le dernier caractère ; un index hors limite renvoie `undefined`.
- Une chaîne ne se modifie jamais : on en construit une nouvelle.

## Exercices

1. À partir des variables `prenom`, `age` et `ville`, construis la phrase
   « Ada a 36 ans et habite à Londres. » avec un template literal.

   :::indice
   Tout le texte va entre backticks, et chaque variable dans un `${ }`.
   :::

   :::solution
   ```js
   const prenom = 'Ada';
   const age = 36;
   const ville = 'Londres';

   const phrase = `${prenom} a ${age} ans et habite à ${ville}.`;
   console.log(phrase); // Ada a 36 ans et habite à Londres.
   ```
   :::

2. Cette ligne provoque une erreur de syntaxe. Corrige-la de deux façons différentes.

   ```js
   const phrase = 'Aujourd'hui, il fait beau';
   ```

   :::indice
   L'apostrophe de « Aujourd'hui » ferme la chaîne trop tôt. Change de délimiteur, ou
   indique que cette apostrophe fait partie du texte.
   :::

   :::solution
   ```js
   const avecGuillemets = "Aujourd'hui, il fait beau";
   const avecEchappement = 'Aujourd\'hui, il fait beau';
   const avecBackticks = `Aujourd'hui, il fait beau`;
   ```

   Les trois produisent la même chaîne. En pratique, on choisit le délimiteur qui évite
   l'échappement, ce qui garde le texte lisible.
   :::

3. Affiche le dernier caractère d'une chaîne, quelle que soit sa longueur.

   :::indice
   Le dernier index d'une chaîne vaut sa longueur moins un. Il existe aussi une méthode qui
   accepte un index négatif.
   :::

   :::solution
   ```js
   const mot = 'JavaScript';

   console.log(mot[mot.length - 1]); // 't'
   console.log(mot.at(-1)); // 't'
   ```

   `at(-1)` est plus lisible. Sur une chaîne vide, les deux écritures renvoient `undefined`.
   :::

## Questions d'entretien

- Quelle différence entre les apostrophes, les guillemets et les backticks ?

  :::indice
  Deux de ces délimiteurs sont strictement équivalents.
  :::

  :::reponse
  Les apostrophes et les guillemets sont équivalents : ils créent une chaîne simple, et on
  choisit celui qui évite d'échapper le texte. Les backticks créent un template literal :
  il interpole les expressions placées dans `${ }`, conserve les retours à la ligne, et
  peut être « balisé » par une fonction (*tagged template*). La plupart des équipes fixent
  une convention, souvent les apostrophes, et utilisent les backticks dès qu'il y a une
  interpolation.
  :::

- Pourquoi `'😀'.length` vaut-il 2 ?

  :::indice
  Qu'est-ce que `length` compte réellement : des caractères, ou autre chose ?
  :::

  :::reponse
  Les chaînes JavaScript sont encodées en UTF-16, et `length` compte des unités de code.
  Les caractères au-delà du plan multilingue de base, comme les emojis, occupent deux
  unités : une paire de substitution. `length` vaut donc 2. Pour compter les caractères
  Unicode, on écrit `[...texte].length`, et pour des graphèmes composés (drapeaux, emojis
  avec teinte de peau), on utilise `Intl.Segmenter`.
  :::

- Qu'implique l'immutabilité des chaînes ?

  :::indice
  Que se passe-t-il après `nom.toUpperCase()` si l'on n'utilise pas le résultat ?
  :::

  :::reponse
  Aucune opération ne peut modifier une chaîne existante : écrire dans un index est ignoré,
  ou lève une `TypeError` en mode strict, et toutes les méthodes renvoient une nouvelle
  chaîne. Il faut donc toujours récupérer le résultat : `nom = nom.trim()`. En contrepartie,
  une chaîne peut être partagée sans risque, puisque personne ne peut la modifier à distance.
  :::
