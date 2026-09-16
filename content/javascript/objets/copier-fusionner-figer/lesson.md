---
id: javascript-objets-copies
title: "Copier, fusionner et figer un objet"
slug: copier-fusionner-figer
technology: javascript
level: intermediate
module: objets
order: 4
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-objets-syntaxe-moderne
skills:
  - objects-copies
tags:
  - javascript
  - objets
---

## Objectifs

- Distinguer une référence partagée, une copie superficielle et une copie profonde.
- Choisir entre le spread, `structuredClone` et le passage par JSON.
- Figer un objet avec `Object.freeze`, et comprendre les limites du gel.

## Introduction

« J'ai copié l'objet, mais la modification s'est propagée. » C'est probablement le bug le
plus fréquent du JavaScript des applications. Il vient d'une confusion entre copier la
**référence**, copier le **premier niveau** et copier **toute la structure**. Ce chapitre
met les trois cas à plat, et donne l'outil adapté à chacun.

## Concept

| Écriture | Ce qui est copié | Objets imbriqués |
| --- | --- | --- |
| `const b = a` | rien : même objet | partagés |
| `{ ...a }` / `Object.assign({}, a)` | le premier niveau | partagés |
| `structuredClone(a)` | toute la structure | copiés |
| `JSON.parse(JSON.stringify(a))` | toute la structure, avec pertes | copiés |

Et pour empêcher les modifications :

| Écriture | Effet |
| --- | --- |
| `Object.freeze(objet)` | interdit ajout, suppression et modification, au premier niveau |
| `Object.isFrozen(objet)` | indique si l'objet est gelé |

## Exemple

```js
const original = {
  nom: 'Atelier',
  options: { theme: 'sombre' },
  creeLe: new Date('2026-01-15'),
};

const meme = original;
meme.nom = 'Modifié';
console.log(original.nom); // 'Modifié' : même objet

const superficiel = { ...original };
superficiel.nom = 'Copie'; // ne touche pas l'original
superficiel.options.theme = 'clair'; // touche l'original !
console.log(original.nom, original.options.theme); // 'Modifié' 'clair'

const profond = structuredClone(original);
profond.options.theme = 'sombre';
console.log(original.options.theme); // 'clair' : indépendant
console.log(profond.creeLe instanceof Date); // true

const viaJson = JSON.parse(JSON.stringify(original));
console.log(typeof viaJson.creeLe); // 'string' : la date est devenue du texte

const config = Object.freeze({ port: 3000, hote: 'localhost' });
console.log(Object.isFrozen(config)); // true
```

## Comment ça fonctionne

Affecter un objet à une variable copie une **référence** : les deux noms désignent la même
zone mémoire.

Le spread crée un nouvel objet et y recopie les valeurs du premier niveau. Pour les
primitives, c'est une copie réelle ; pour les objets imbriqués, ce sont les mêmes
références. D'où la règle : une copie superficielle suffit quand on ne modifie que le
premier niveau, et il faut recopier chaque niveau touché,
`{ ...objet, options: { ...objet.options, theme: 'clair' } }`.

`structuredClone` fait une copie profonde native : il gère les dates, les `Map`, les `Set`,
les tableaux typés, et même les références circulaires. Il ne sait pas copier les
**fonctions** ni les symboles, et lève alors une `DataCloneError`.

Le passage par JSON copie aussi en profondeur, mais **perd** beaucoup : une `Date` devient
une chaîne, `undefined` et les fonctions disparaissent, `Map` et `Set` deviennent `{}`,
`NaN` et `Infinity` deviennent `null`, et une référence circulaire lève une erreur. C'est
une technique acceptable pour des données purement JSON, pas une copie profonde générale.

`Object.freeze` est **superficiel** lui aussi : les objets imbriqués restent modifiables.
Pour tout geler, on écrit une fonction récursive. Une écriture sur un objet gelé échoue
silencieusement en mode non strict, et lève une `TypeError` dans un module ou en mode
strict — c'est-à-dire presque toujours dans du code moderne.

Enfin, deux objets ne sont jamais égaux par leur contenu : `{ a: 1 } === { a: 1 }` vaut
`false`, car `===` compare les références.

## Erreurs fréquentes

**Croire que `const copie = objet` copie.** Rien n'est copié.

**Modifier un objet imbriqué après un spread.** L'original change aussi.

**Utiliser JSON pour copier des données riches.** Dates, `Map`, `Set` et `undefined` sont
perdus.

**Croire qu'un objet gelé l'est en profondeur.** `Object.freeze(config)` laisse
`config.serveur` modifiable.

**Comparer deux objets avec `===`.** Il faut comparer les propriétés utiles, ou passer par
une fonction d'égalité profonde.

## À retenir

- Affectation : même objet. Spread : premier niveau. `structuredClone` : tout.
- Pour modifier un niveau imbriqué, recopie chaque niveau traversé.
- `structuredClone` gère dates, `Map`, `Set` et cycles, mais pas les fonctions.
- JSON perd les dates, `undefined`, les fonctions, `Map` et `Set`.
- `Object.freeze` est superficiel ; `===` compare des références, pas du contenu.

## Exercices

1. Montre qu'un spread ne protège pas un objet imbriqué, puis corrige le code pour changer
   le thème sans toucher à l'original.

   :::indice
   Il faut recopier aussi le niveau qu'on modifie.
   :::

   :::solution
   ```js
   const original = { nom: 'Atelier', options: { theme: 'sombre' } };

   const mauvais = { ...original };
   mauvais.options.theme = 'clair';
   console.log(original.options.theme); // 'clair' : raté

   const remis = { nom: 'Atelier', options: { theme: 'sombre' } };
   const bon = { ...remis, options: { ...remis.options, theme: 'clair' } };
   console.log(bon.options.theme, remis.options.theme); // 'clair' 'sombre'
   ```
   :::

2. Copie en profondeur une configuration contenant une date et un tableau imbriqué, de sorte
   que la date reste un objet `Date`. Compare avec le résultat d'un aller-retour JSON.

   :::indice
   Une fonction native fait la copie profonde en gérant les dates.
   :::

   :::solution
   ```js
   const config = { creeLe: new Date('2026-01-15'), tags: ['a', 'b'] };

   const copie = structuredClone(config);
   copie.tags.push('c');

   console.log(copie.creeLe instanceof Date); // true
   console.log(config.tags.length); // 2 : indépendant

   const viaJson = JSON.parse(JSON.stringify(config));
   console.log(typeof viaJson.creeLe); // 'string' : la date est perdue
   ```
   :::

3. Écris une fonction `figerProfondement(objet)` qui gèle un objet et tous ses objets
   imbriqués.

   :::indice
   Gèle l'objet, puis applique la même fonction à chaque valeur qui est elle-même un objet.
   :::

   :::indice
   `typeof valeur === 'object' && valeur !== null` reconnaît un objet, en écartant `null`.
   :::

   :::solution
   ```js
   function figerProfondement(objet) {
     for (const valeur of Object.values(objet)) {
       if (typeof valeur === 'object' && valeur !== null) {
         figerProfondement(valeur);
       }
     }
     return Object.freeze(objet);
   }

   const config = figerProfondement({ port: 3000, serveur: { hote: 'localhost' } });
   console.log(Object.isFrozen(config.serveur)); // true
   ```

   En module, `config.serveur.hote = 'ailleurs'` lève désormais une `TypeError` au lieu
   d'échouer en silence.
   :::

## Questions d'entretien

- Comment choisir entre le spread, `structuredClone` et `JSON.parse(JSON.stringify(...))` ?

  :::indice
  Quelle profondeur, et quels types de valeurs, chacun gère-t-il ?
  :::

  :::reponse
  Le spread suffit quand seules les propriétés de premier niveau changent, et c'est le cas le
  plus courant. `structuredClone` est la copie profonde native : elle gère dates, `Map`, `Set`
  et cycles, mais pas les fonctions. L'aller-retour JSON ne devrait servir que pour des
  données purement JSON, car il perd les dates, `undefined`, les fonctions et les collections.
  En pratique, on préfère recopier explicitement les niveaux modifiés, ce qui est à la fois
  plus rapide et plus lisible qu'une copie profonde systématique.
  :::

- Pourquoi `{ a: 1 } === { a: 1 }` vaut-il `false` ?

  :::indice
  Que compare `===` pour des valeurs non primitives ?
  :::

  :::reponse
  Pour des objets, `===` compare les **références** : ces deux littéraux créent deux objets
  distincts en mémoire, donc le résultat est `false`. Deux variables ne sont égales que si
  elles désignent le même objet. Pour comparer des contenus, on compare les propriétés
  utiles, on utilise une fonction d'égalité profonde, ou on compare des identifiants — ce que
  font aussi les bibliothèques qui détectent les changements par référence.
  :::

- Que fait exactement `Object.freeze` ?

  :::indice
  Essaie de modifier une propriété imbriquée d'un objet gelé.
  :::

  :::reponse
  `Object.freeze` empêche d'ajouter, de supprimer ou de modifier les propriétés **propres**
  de l'objet, et les rend non configurables. Le gel est superficiel : un objet ou un tableau
  imbriqué reste modifiable, et il faut une fonction récursive pour tout geler. Une écriture
  interdite échoue silencieusement en mode non strict, mais lève une `TypeError` dans un
  module ES ou en mode strict.
  :::
