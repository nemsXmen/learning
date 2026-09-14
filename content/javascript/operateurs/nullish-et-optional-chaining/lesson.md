---
id: javascript-nullish-optional-chaining
title: "?? et ?. : gérer l'absence de valeur"
slug: nullish-et-optional-chaining
technology: javascript
level: intermediate
module: operateurs
order: 4
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-operateurs-logiques
skills:
  - nullish-optional
tags:
  - javascript
  - operateurs
---

## Objectifs

- Fournir une valeur par défaut avec `??` sans écraser `0`, `''` ou `false`.
- Accéder sans erreur à une propriété, un élément ou une méthode qui peut manquer, avec
  `?.`.
- Savoir quand ces raccourcis masquent un vrai bug.

## Introduction

Les données réelles sont incomplètes : un client sans adresse, une option non
configurée, une réponse d'API sans le champ attendu. Pendant des années, on a écrit
`client && client.adresse && client.adresse.ville` et `volume || 50`, avec les pièges du
chapitre précédent. Depuis ES2020, deux opérateurs expriment exactement l'intention :
`??` pour une valeur par défaut, `?.` pour un accès prudent.

## Concept

**`a ?? b`** (*nullish coalescing*) renvoie `b` seulement si `a` vaut `null` ou
`undefined` :

| Expression | `\|\|` | `??` |
| --- | --- | --- |
| `0 ?? 42` | `42` | `0` |
| `'' ?? 'défaut'` | `'défaut'` | `''` |
| `false ?? true` | `true` | `false` |
| `null ?? 42` | `42` | `42` |
| `undefined ?? 42` | `42` | `42` |

**`?.`** (*optional chaining*) interrompt l'accès si ce qui précède vaut `null` ou
`undefined`, et renvoie alors `undefined` au lieu de lever une erreur :

| Forme | Usage |
| --- | --- |
| `objet?.propriete` | lire une propriété |
| `objet?.[cle]` | lire une propriété calculée ou un élément de tableau |
| `fonction?.()` | appeler une fonction seulement si elle existe |

`a ??= b` affecte `b` à `a` seulement si `a` vaut `null` ou `undefined`.

## Exemple

```js
const reglages = { volume: 0, theme: '' };

console.log(reglages.volume || 50); // 50 : le volume 0 est perdu
console.log(reglages.volume ?? 50); // 0 : le volume 0 est conservé
console.log(reglages.langue ?? 'fr'); // 'fr' : la propriété manque

const commande = { client: { nom: 'Ada' } };
console.log(commande.client?.adresse?.ville); // undefined, sans erreur
console.log(commande.client?.adresse?.ville ?? 'Ville inconnue'); // 'Ville inconnue'

const produits = null;
console.log(produits?.[0]); // undefined

const options = {};
options.onSuccess?.('ok'); // rien ne se passe : la fonction n'existe pas

reglages.langue ??= 'fr';
console.log(reglages.langue); // 'fr'
```

## Comment ça fonctionne

`a ?? b` équivaut à `(a !== null && a !== undefined) ? a : b`, en n'évaluant `a` qu'une
fois.

`?.` **court-circuite toute la suite de la chaîne**. Si `commande.client` vaut
`undefined`, `commande.client?.adresse.ville` renvoie `undefined` sans évaluer `.ville` —
et sans évaluer non plus les arguments d'un appel placé ensuite. En revanche, si
`client` existe mais pas `adresse`, l'accès `.ville` sur `undefined` lève une
`TypeError` : chaque maillon qui peut manquer a besoin de son propre `?.`.

`?.()` ne vérifie que `null` et `undefined`. Si la propriété existe mais n'est pas une
fonction, l'appel lève une `TypeError`.

Deux règles de syntaxe :

```js
const a = null ?? 1 || 2; // SyntaxError : parenthèses obligatoires
const b = (null ?? 1) || 2; // 1

const utilisateur = {};
utilisateur?.nom = 'Ada'; // SyntaxError : ?. ne peut pas recevoir d'affectation
```

## Erreurs fréquentes

**Mélanger `??` avec `||` ou `&&` sans parenthèses.** C'est une erreur de syntaxe,
volontaire : l'ordre d'évaluation serait ambigu.

**Mettre `?.` partout.** Si une commande doit toujours avoir un client, `commande?.client`
cache un bug : le code continue avec `undefined` et échoue plus loin, loin de la cause.
Réserve `?.` aux données réellement optionnelles.

**Oublier un `?.` au milieu de la chaîne.** `client?.adresse.ville` protège contre un
client absent, pas contre une adresse absente.

**Utiliser `?.` à gauche d'une affectation.** `objet?.cle = 1` est interdit. Vérifie
l'objet avant d'écrire.

## À retenir

- `??` ne remplace que `null` et `undefined` ; `0`, `''` et `false` sont conservés.
- `?.` renvoie `undefined` au lieu de lever une erreur quand ce qui précède est absent.
- Trois formes : `?.propriete`, `?.[cle]` et `?.()`.
- `??` ne se mélange pas à `||` ou `&&` sans parenthèses.
- Un `?.` sur une donnée obligatoire masque un bug au lieu de le révéler.

## Exercices

1. Ce code doit utiliser 50 quand aucun volume n'est configuré, mais un volume à 0 est
   remplacé. Corrige-le.

   ```js
   const volume = reglages.volume || 50;
   ```

   :::indice
   Quelle valeur légitime est falsy ici ?
   :::

   :::solution
   ```js
   const volume = reglages.volume ?? 50;
   ```

   `||` remplace toute valeur falsy, dont `0`. `??` ne remplace que `null` et `undefined` :
   un volume configuré à 0 reste à 0.
   :::

2. Affiche la ville de livraison `commande.client.adresse.ville`, sans erreur si le client
   ou son adresse manquent, et « Ville inconnue » par défaut.

   :::indice
   Chaque maillon qui peut manquer a besoin de son propre `?.`. Combine ensuite avec `??`.
   :::

   :::solution
   ```js
   const commande = { client: { nom: 'Ada' } };

   const ville = commande.client?.adresse?.ville ?? 'Ville inconnue';
   console.log(ville); // 'Ville inconnue'
   ```
   :::

3. Un objet `options` peut contenir une fonction `onSuccess`. Appelle-la avec `resultat`
   seulement si elle a été fournie.

   :::indice
   Il existe une forme de `?.` placée juste avant les parenthèses d'appel.
   :::

   :::solution
   ```js
   const resultat = { id: 42 };

   const sansRappel = {};
   sansRappel.onSuccess?.(resultat); // rien ne se passe

   const avecRappel = { onSuccess: (donnee) => console.log('Reçu', donnee.id) };
   avecRappel.onSuccess?.(resultat); // Reçu 42
   ```

   Si `onSuccess` existe mais n'est pas une fonction, l'appel lève une `TypeError` : `?.()`
   ne protège que contre `null` et `undefined`.
   :::

## Questions d'entretien

- Quelle est la différence entre `??` et `||` ?

  :::indice
  Quelles valeurs déclenchent la valeur par défaut dans chaque cas ?
  :::

  :::reponse
  `||` renvoie le second opérande dès que le premier est falsy : `false`, `0`, `''`,
  `null`, `undefined`, `NaN`. `??` ne le renvoie que si le premier vaut `null` ou
  `undefined`. `??` correspond donc à l'intention « valeur par défaut si rien n'est
  défini », sans écraser un `0` ou une chaîne vide légitimes.
  :::

- Pourquoi `a || b ?? c` est-il une erreur de syntaxe ?

  :::indice
  Quel ordre d'évaluation un lecteur supposerait-il ?
  :::

  :::reponse
  La spécification interdit volontairement de mélanger `??` avec `||` ou `&&` sans
  parenthèses. Les deux lectures possibles, `(a || b) ?? c` et `a || (b ?? c)`, ont des
  résultats différents, et aucune priorité ne paraît évidente. On écrit donc les
  parenthèses explicitement, ce qui rend l'intention lisible.
  :::

- Quand l'optional chaining devient-il une mauvaise idée ?

  :::indice
  Que se passe-t-il quand une donnée censée toujours exister est absente ?
  :::

  :::reponse
  Quand la donnée est obligatoire. `utilisateur?.id` sur un utilisateur qui doit toujours
  exister transforme une erreur claire et immédiate en `undefined` qui se propage, et le
  programme échoue plus loin, loin de la cause. On réserve `?.` aux données réellement
  optionnelles, et on valide les données obligatoires à l'entrée — avec une erreur
  explicite si elles manquent.
  :::
