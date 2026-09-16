---
id: javascript-chaines-decouper
title: "Découper et remplacer : split, replace et replaceAll"
slug: decouper-et-remplacer
technology: javascript
level: beginner
module: chaines
order: 4
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-chaines-transformer
skills:
  - strings-split-replace
tags:
  - javascript
  - chaines
---

## Objectifs

- Découper un texte en tableau avec `split`, et le reconstituer avec `join`.
- Remplacer la première occurrence d'un texte avec `replace`, toutes avec `replaceAll`.
- Utiliser une expression régulière simple pour remplacer selon un motif.

## Introduction

Une ligne de fichier CSV, une liste de tags saisie par un utilisateur, un titre à
transformer en adresse web : tous ces cas demandent de **découper** un texte ou d'y
**remplacer** des morceaux. `split` et `replace` existent depuis les débuts du langage ;
`replaceAll`, arrivé en 2021, a enfin corrigé le piège qui faisait écrire des expressions
régulières pour un simple remplacement.

## Concept

| Méthode | Rôle | Exemple | Résultat |
| --- | --- | --- | --- |
| `split(separateur)` | découpe en tableau | `'a,b,c'.split(',')` | `['a', 'b', 'c']` |
| `tableau.join(separateur)` | rassemble un tableau en chaîne | `['a', 'b'].join('-')` | `'a-b'` |
| `replace(motif, remplacement)` | remplace **la première** occurrence | `'a-b-c'.replace('-', '+')` | `'a+b-c'` |
| `replaceAll(motif, remplacement)` | remplace **toutes** les occurrences | `'a-b-c'.replaceAll('-', '+')` | `'a+b+c'` |

`split` et `join` sont réciproques : `texte.split(x).join(y)` remplace chaque `x` par `y`.

Le motif de `replace` et `replaceAll` peut être une chaîne ou une **expression
régulière**. Une expression régulière décrit un motif plutôt qu'un texte exact :
`/\s+/g` signifie « un ou plusieurs espaces blancs, partout dans le texte ». Le drapeau
`g` (*global*) demande toutes les occurrences.

## Exemple

```js
const ligneCsv = 'Ada;Lovelace;1815';
const [prenom, nom, naissance] = ligneCsv.split(';');
console.log(nom); // 'Lovelace'

const saisieTags = 'js, react ,node ';
const tags = saisieTags.split(',').map((tag) => tag.trim());
console.log(tags); // ['js', 'react', 'node']

const titre = 'Les Closures en JavaScript';
const slug = titre.toLowerCase().replaceAll(' ', '-');
console.log(slug); // 'les-closures-en-javascript'

const modele = 'Bonjour {nom}, votre commande {numero} est prête.';
const message = modele.replace('{nom}', 'Ada').replace('{numero}', 'CMD-42');
console.log(message);

const espacesMultiples = 'Bonjour     le    monde';
console.log(espacesMultiples.replace(/\s+/g, ' ')); // 'Bonjour le monde'
```

## Comment ça fonctionne

`split` coupe le texte à chaque séparateur et renvoie les morceaux, **y compris les
morceaux vides** : `'a,,b'.split(',')` donne `['a', '', 'b']`. Un deuxième argument limite
le nombre de morceaux : `'a,b,c'.split(',', 2)` donne `['a', 'b']`.

`split('')` découpe en unités de code UTF-16, ce qui casse les emojis en deux morceaux
illisibles. Pour obtenir des caractères, on utilise le spread : `[...texte]`.

Avec une **chaîne** comme motif, `replace` ne remplace que la première occurrence.
`replaceAll` les remplace toutes. Avec une **expression régulière**, `replace` remplace
toutes les occurrences si le drapeau `g` est présent, et `replaceAll` exige ce drapeau :
sans lui, il lève une `TypeError`.

Le texte de remplacement interprète quelques motifs spéciaux commençant par `$` : `$&`
insère le texte trouvé. Un remplacement qui contient un `$` littéral peut donc surprendre ;
passer une fonction évite toute interprétation :

```js
console.log('prix'.replace('prix', () => '5 $&')); // '5 $&' : texte littéral
console.log('prix'.replace('prix', '5 $&')); // '5 prix' : $& a inséré le texte trouvé
```

## Erreurs fréquentes

**Utiliser `replace` en croyant tout remplacer.** `'a-b-c'.replace('-', '')` donne
`'ab-c'`. Utilise `replaceAll`, ou une expression régulière avec `g`.

**Découper sans nettoyer les morceaux.** `'js, react'.split(',')` donne
`['js', ' react']`, avec un espace. Applique `trim` à chaque morceau.

**Oublier les morceaux vides.** Deux séparateurs consécutifs, ou un séparateur final,
produisent des chaînes vides dans le tableau. Filtre-les si besoin.

**Découper un texte avec emojis par `split('')`.** Les emojis sont coupés en deux. Utilise
`[...texte]`.

**Oublier `g` avec `replaceAll` et une expression régulière.** C'est une `TypeError`.

## À retenir

- `split` découpe en tableau, `join` rassemble : ils sont réciproques.
- `replace` avec une chaîne ne remplace que la première occurrence ; `replaceAll`, toutes.
- Une expression régulière avec `g` remplace partout, selon un motif.
- `split` garde les morceaux vides ; nettoie avec `trim` et filtre.
- `[...texte]` découpe par caractère, sans casser les emojis.

## Exercices

1. Transforme la saisie `'js, react ,node'` en tableau `['js', 'react', 'node']`.

   :::indice
   Découpe d'abord sur la virgule, puis nettoie chaque morceau.
   :::

   :::solution
   ```js
   const saisie = 'js, react ,node';
   const tags = saisie.split(',').map((tag) => tag.trim());
   console.log(tags); // ['js', 'react', 'node']
   ```

   `map`, vu au module 07, applique `trim` à chaque élément du tableau.
   :::

2. Remplace toutes les suites d'espaces de `'Bonjour    le   monde'` par un seul espace.

   :::indice
   Le nombre d'espaces varie : il faut un motif, pas un texte exact. Dans une expression
   régulière, `\s` désigne un espace blanc et `+` « une ou plusieurs fois ».
   :::

   :::solution
   ```js
   const texte = 'Bonjour    le   monde';
   console.log(texte.replace(/\s+/g, ' ')); // 'Bonjour le monde'
   ```

   Le drapeau `g` applique le remplacement à toutes les suites d'espaces, pas seulement à
   la première.
   :::

3. Transforme le titre `'  Les Closures en JS '` en slug d'URL : `'les-closures-en-js'`.

   :::indice
   Trois étapes : retirer les espaces aux extrémités, passer en minuscules, remplacer les
   espaces restants par des tirets.
   :::

   :::solution
   ```js
   const titre = '  Les Closures en JS ';
   const slug = titre.trim().toLowerCase().replaceAll(' ', '-');
   console.log(slug); // 'les-closures-en-js'
   ```

   Pour un titre avec accents ou ponctuation, on ajouterait un retrait des diacritiques et
   des caractères spéciaux avant le remplacement.
   :::

## Questions d'entretien

- Quelle différence entre `replace` et `replaceAll` ?

  :::indice
  Compare leur comportement avec une simple chaîne comme motif.
  :::

  :::reponse
  Avec une chaîne comme motif, `replace` ne remplace que la première occurrence, alors que
  `replaceAll` les remplace toutes. Avec une expression régulière, `replace` remplace tout
  si le drapeau `g` est présent, et `replaceAll` exige ce drapeau sous peine de
  `TypeError`. `replaceAll` rend donc lisible le cas le plus courant : remplacer un texte
  exact partout.
  :::

- Pourquoi `'😀'.split('')` pose-t-il problème, et comment l'éviter ?

  :::indice
  Sur quelle unité `split('')` coupe-t-il le texte ?
  :::

  :::reponse
  `split('')` découpe en unités de code UTF-16. Un emoji occupe deux unités : il est coupé
  en deux moitiés qui ne forment plus un caractère valide. Le spread `[...texte]` et
  `Array.from(texte)` découpent par point de code Unicode et gardent chaque emoji entier.
  Pour des graphèmes composés, comme les drapeaux, il faut `Intl.Segmenter`.
  :::

- Comment remplaçait-on toutes les occurrences d'un texte avant `replaceAll` ?

  :::indice
  Deux techniques existaient : l'une avec une expression régulière, l'autre avec deux
  méthodes réciproques.
  :::

  :::reponse
  Avec une expression régulière globale, `texte.replace(/motif/g, remplacement)`, en
  pensant à échapper les caractères spéciaux du motif. Ou avec
  `texte.split(motif).join(remplacement)`, qui évite tout échappement. `replaceAll`, arrivé
  avec ES2021, rend ces contournements inutiles pour un texte exact.
  :::
