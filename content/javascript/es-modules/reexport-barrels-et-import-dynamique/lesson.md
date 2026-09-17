---
id: javascript-reexport
title: "Réexports, fichiers barrel et import dynamique"
slug: reexport-barrels-et-import-dynamique
technology: javascript
level: intermediate
module: es-modules
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-es-modules
skills:
  - module-reexports
tags:
  - javascript
  - modules
---

## Objectifs

- Réexporter les éléments d'autres modules pour offrir un point d'entrée unique.
- Connaître le coût caché des fichiers barrel.
- Charger un module à la demande avec `import()`.

## Introduction

Quand un dossier contient dix modules, les importer un à un depuis le reste de l'application devient
fastidieux, et expose l'organisation interne du dossier. Les **réexports** permettent de publier une
façade : un fichier qui rassemble ce que le dossier offre. À l'inverse, certains modules lourds ne
devraient être chargés que si l'utilisateur en a besoin : c'est le rôle de l'**import dynamique**.

## Concept

| Écriture | Effet |
| --- | --- |
| `export { formaterDate } from './dates.js';` | réexporte un export nommé |
| `export { default as Bouton } from './bouton.js';` | réexporte un défaut sous un nom |
| `export * from './prix.js';` | réexporte tous les exports nommés, **sans** le défaut |
| `export * as Prix from './prix.js';` | réexporte tout, rangé dans un espace de noms |
| `const module = await import('./lourd.js');` | charge un module à l'exécution, renvoie une promesse |

Un **fichier barrel** — souvent `index.js` — ne contient que des réexports : il sert de point d'entrée
unique à un dossier.

## Exemple

```js
// outils/dates.js
export const formaterDate = (date) => date.toISOString().slice(0, 10);

// outils/graphiques.js — un module volumineux
export const dessiner = () => 'graphique';

// outils/index.js — le fichier barrel
export { formaterDate } from './dates.js';
export { dessiner } from './graphiques.js';
export * as Prix from './prix.js';

// rapport.js
import { formaterDate, Prix } from './outils/index.js';
console.log(formaterDate(new Date('2026-09-17T10:00:00Z')), Prix.prixTTC(10)); // '2026-09-17' 12
// Attention : graphiques.js a quand même été chargé et évalué.

// tableau-de-bord.js — le module lourd, chargé seulement quand on en a besoin
export async function afficherGraphique(utilisateurVeutUnGraphique) {
  if (!utilisateurVeutUnGraphique) {
    return 'aucun graphique';
  }
  const { dessiner } = await import('./outils/graphiques.js');
  return dessiner();
}
```

## Comment ça fonctionne

Un réexport établit une liaison directe entre le module qui importe et le module d'origine : le fichier
barrel ne crée ni copie ni variable, il sert d'aiguillage. L'appelant écrit
`import { formaterDate } from './outils/index.js'` sans savoir dans quel fichier se trouve la fonction,
et le dossier peut se réorganiser sans casser ses importateurs.

`export * from` réexporte tous les exports **nommés**, mais pas l'export par défaut : un module ne peut
avoir qu'un défaut, et le moteur ne choisit pas lequel garder. On réexporte donc un défaut explicitement,
sous un nom : `export { default as Bouton } from './bouton.js'`. Si deux `export *` exposent le même nom,
ce nom devient ambigu et n'est pas exporté.

Le fichier barrel a un **coût caché**. Importer un seul nom depuis `index.js` oblige à charger et évaluer
**tous** les modules qu'il réexporte : dans l'exemple, `graphiques.js` est évalué alors que `rapport.js`
n'en a pas besoin. Dans un navigateur sans outil de build, ou en test, cela ralentit le démarrage. Les
outils de build éliminent souvent le code inutilisé, mais seulement si les modules n'ont pas d'effet de
bord à leur évaluation. Les barrels favorisent aussi les **dépendances circulaires**, sujet du chapitre
suivant. On les réserve donc à la frontière publique d'un dossier, et on les évite à l'intérieur.

`import()` est une expression, pas une déclaration : on peut l'écrire dans une condition, une fonction,
un gestionnaire de clic. Elle renvoie une **promesse** de l'objet espace de noms du module ; l'export par
défaut se trouve sous `.default`. Le module n'est téléchargé et évalué qu'au premier appel, puis mis en
cache : un second `import()` renvoie le même module. Les outils de build découpent automatiquement le code
autour de ces imports, ce qui allège le chargement initial d'une application — c'est le principe du
*code splitting*, détaillé dans la partie Performance.

## Erreurs fréquentes

**Attendre le défaut d'un `export *`.** Réexporte-le explicitement avec `default as`.

**Importer depuis un barrel à l'intérieur de son propre dossier.** C'est un raccourci vers un cycle ;
importe le fichier voisin directement.

**Créer un barrel pour chaque dossier.** Chacun ajoute des évaluations inutiles.

**Oublier `await` sur `import()`.** On obtient une promesse, pas le module.

**Chercher le défaut directement sur le résultat d'`import()`.** Il est sous `.default`.

## À retenir

- `export { x } from`, `export * from`, `export * as Nom from` : réexporter sans copier.
- `export *` n'inclut pas le défaut.
- Un barrel évalue tous les modules qu'il réexporte : à réserver aux frontières publiques.
- `import()` charge à la demande, renvoie une promesse, et le défaut est sous `.default`.
- Un module chargé dynamiquement est mis en cache comme les autres.

## Exercices

1. Le dossier `validation/` contient `email.js`, qui exporte `estEmailValide`, et `mot-de-passe.js`, qui
   exporte par défaut `verifierMotDePasse`. Écris `validation/index.js` pour que le reste de l'application
   écrive `import { estEmailValide, verifierMotDePasse } from './validation/index.js'`.

   :::indice
   Un export nommé se réexporte tel quel ; un défaut doit recevoir un nom.
   :::

   :::solution
   ```js
   // validation/index.js
   export { estEmailValide } from './email.js';
   export { default as verifierMotDePasse } from './mot-de-passe.js';
   ```

   `export * from './mot-de-passe.js'` n'aurait rien exposé : le module n'a qu'un export par défaut.
   :::

2. `boutons/index.js` contient `export * from './bouton.js';`, mais `import { Bouton } from './boutons/index.js'`
   échoue alors que `bouton.js` contient `export default class Bouton {}`. Explique et corrige.

   :::indice
   Que réexporte exactement `export *` ?
   :::

   :::solution
   `export *` ne réexporte que les exports **nommés**. `bouton.js` n'a qu'un export par défaut : le barrel
   n'expose donc rien, et l'import nommé `Bouton` ne trouve aucun export de ce nom.

   ```js
   // boutons/index.js
   export { default as Bouton } from './bouton.js';
   ```

   Une autre option est de passer `bouton.js` à un export nommé, `export class Bouton {}`, et de garder
   `export *`.
   :::

3. L'export PDF s'appuie sur un module volumineux, utilisé par peu d'utilisateurs. Écris
   `exporterEnPDF(donnees)` pour qu'il ne soit chargé qu'au premier export, et vérifie qu'un second appel ne le
   recharge pas.

   :::indice
   `await import('./pdf.js')` dans la fonction ; le moteur met le module en cache après le premier chargement.
   :::

   :::solution
   ```js
   // pdf.js
   console.log('module PDF chargé');
   export default function genererPDF(donnees) {
     return `PDF de ${donnees.length} lignes`;
   }

   // export.js
   export async function exporterEnPDF(donnees) {
     const { default: genererPDF } = await import('./pdf.js');
     return genererPDF(donnees);
   }

   // bouton-export.js
   import { exporterEnPDF } from './export.js';
   console.log(await exporterEnPDF([1, 2])); // 'module PDF chargé', puis 'PDF de 2 lignes'
   console.log(await exporterEnPDF([1])); // 'PDF de 1 lignes' : pas de second chargement
   ```

   Le défaut est récupéré par déstructuration sous le nom `default`, renommé en `genererPDF`.
   :::

## Questions d'entretien

- Qu'est-ce qu'un fichier barrel, et quels sont ses inconvénients ?

  :::indice
  Pense à ce qui est évalué quand on importe un seul nom.
  :::

  :::reponse
  C'est un fichier, souvent `index.js`, qui ne fait que réexporter le contenu d'un dossier pour offrir un point
  d'entrée unique. Il simplifie les imports et cache l'organisation interne. Mais importer un seul nom oblige à
  évaluer tous les modules réexportés, ce qui alourdit le démarrage et les tests, et les barrels favorisent les
  dépendances circulaires quand un fichier du dossier importe son propre barrel. On les réserve à la frontière
  publique d'un ensemble de modules.
  :::

- Pourquoi `export *` n'inclut-il pas l'export par défaut ?

  :::indice
  Combien d'exports par défaut un module peut-il avoir ?
  :::

  :::reponse
  Parce qu'un module n'a qu'un seul export par défaut : si `export *` l'incluait, réexporter deux modules
  produirait deux défauts en conflit, sans règle pour choisir. Le défaut doit donc être réexporté explicitement,
  avec un nom : `export { default as Bouton } from './bouton.js'`. Pour la même raison, deux `export *` qui
  exposent le même nom le rendent ambigu, et ce nom n'est pas exporté.
  :::

- Quand utiliser `import()` plutôt qu'un `import` statique ?

  :::indice
  Pense au moment du chargement et aux conditions.
  :::

  :::reponse
  Quand un module n'est nécessaire que dans certains cas — une fonctionnalité rarement utilisée, un module lourd,
  un choix qui dépend de l'environnement ou de l'utilisateur. `import()` s'écrit n'importe où, renvoie une
  promesse, et ne charge le module qu'au premier appel, puis le garde en cache. Les outils de build en profitent
  pour découper l'application en morceaux chargés à la demande. Pour les dépendances toujours nécessaires, les
  imports statiques restent préférables : ils sont vérifiés avant l'exécution.
  :::
