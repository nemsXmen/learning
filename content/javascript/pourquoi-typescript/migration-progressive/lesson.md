---
id: javascript-migration-progressive
title: "Migrer progressivement un projet JavaScript vers TypeScript"
slug: migration-progressive
technology: javascript
level: advanced
module: pourquoi-typescript
order: 3
estimatedMinutes: 40
difficulty: 4
xp: 100
prerequisites:
  - javascript-compiler-et-configurer-typescript
skills:
  - js-ts-migration
tags:
  - javascript
  - typescript
  - migration
---

## Objectifs

- Planifier une migration par étapes, sans jamais bloquer le développement.
- Faire cohabiter fichiers JavaScript et TypeScript avec `allowJs` et `checkJs`.
- Typer d'abord avec JSDoc, puis convertir les fichiers en commençant par les feuilles du graphe.
- Activer la strictesse progressivement, et suivre le nombre d'erreurs.
- Contenir les compromis : `@ts-expect-error` commenté plutôt que `any` dispersés.

## Introduction

Réécrire une application entière en TypeScript d'un coup est une mauvaise idée : des semaines de travail sans nouvelle
fonctionnalité, une énorme pull request impossible à relire, et des bugs introduits pendant la conversion. La bonne
approche est **progressive** : l'application continue de fonctionner et d'évoluer, pendant que les types gagnent du
terrain fichier par fichier.

TypeScript a été conçu pour cela : il sait lire des fichiers JavaScript, les vérifier à partir d'annotations JSDoc, et
mélanger `.js` et `.ts` dans un même projet.

## Concept

| Étape | Configuration | Effet |
| --- | --- | --- |
| 1. brancher TypeScript | `allowJs: true`, `checkJs: false`, `strict: false` | `tsc` lit le projet sans rien signaler ; l'éditeur profite déjà des types inférés |
| 2. vérifier le JavaScript | `checkJs: true`, ou `// @ts-check` fichier par fichier | les erreurs apparaissent ; on les corrige avec des annotations JSDoc |
| 3. convertir | renommer `.js` en `.ts`, des feuilles vers les racines | les annotations deviennent de la syntaxe TypeScript |
| 4. durcir | `noImplicitAny`, puis `strictNullChecks`, puis `strict` | chaque option ajoute une famille de vérifications |
| 5. finir | plus de `.js`, plus de `any` non justifié | `allowJs` peut être retiré |

| Compromis temporaire | Quand | Pourquoi |
| --- | --- | --- |
| `// @ts-expect-error raison` | une erreur connue, qu'on corrigera plus tard | signale une erreur si elle disparaît : le compromis ne survit pas à sa correction |
| `unknown` | une donnée dont on ne connaît pas encore la forme | oblige à vérifier avant usage |
| `any` | en dernier recours, localisé et commenté | désactive toute vérification sur la valeur |

## Exemple

Un petit projet JavaScript, `panier.js` et `affichage.js`. On commence par brancher TypeScript sans rien exiger :

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "strict": false,
    "noEmit": true,
    "module": "nodenext",
    "target": "es2023"
  },
  "include": ["src"]
}
```

`tsc` passe sans erreur, et l'éditeur propose déjà l'autocomplétion. On active ensuite `checkJs` et `strict` pour voir
l'ampleur du travail :

```text
$ npx tsc
src/affichage.js(3,24): error TS7006: Parameter 'lignes' implicitly has an 'any' type.
src/panier.js(1,23): error TS7006: Parameter 'lignes' implicitly has an 'any' type.
src/panier.js(2,25): error TS7006: Parameter 'somme' implicitly has an 'any' type.
…
$ npx tsc | grep -c "error TS"
7
```

On type `panier.js`, une feuille du graphe, sans le renommer, en JSDoc :

```js
/**
 * @typedef {object} Ligne
 * @property {string} sku
 * @property {number} prix
 * @property {number} quantite
 */

/** @param {Ligne[]} lignes */
export function total(lignes) {
  return lignes.reduce((somme, l) => somme + l.prix * l.quantite, 0);
}

/**
 * @param {Ligne[]} lignes
 * @param {string} sku
 */
export function trouverLigne(lignes, sku) {
  return lignes.find((l) => l.sku === sku);
}
```

Puis on convertit `affichage.js` en `affichage.ts`, qui importe le type défini en JSDoc :

```ts
import { total, trouverLigne, type Ligne } from './panier.js';

export function resume(lignes: Ligne[]): string {
  const lampe = trouverLigne(lignes, 'lampe');
  return `Total : ${total(lignes)} € — lampes : ${lampe.quantite}`;
}
```

```text
$ npx tsc
src/affichage.ts(5,51): error TS18048: 'lampe' is possibly 'undefined'.
```

La migration révèle un vrai bug : un panier sans lampe faisait planter `resume`. On le corrige avec
`lampe?.quantite ?? 0`, et `tsc` ne signale plus rien. Chaque étape est une petite pull request, et l'application
fonctionne à chacune.

## Comment ça fonctionne

**`allowJs` et `checkJs`.** `allowJs` fait entrer les fichiers JavaScript dans le projet : TypeScript les lit, infère ce
qu'il peut, et les fichiers `.ts` peuvent les importer. `checkJs` fait vérifier ces fichiers, en tirant les types des
annotations JSDoc. On peut aussi vérifier un seul fichier avec `// @ts-check` en tête, ou en exclure un avec
`// @ts-nocheck`. Un projet peut rester longtemps dans cet état mixte, et certains y restent définitivement.

**Attention au mode strict par défaut.** Dans les versions récentes de TypeScript, dont la version 7, `strict` est activé
par défaut. Pour brancher TypeScript
sur un projet existant sans être submergé, on écrit explicitement `"strict": false` au départ, puis on active les
vérifications une à une. Avec un projet neuf, au contraire, on garde la valeur par défaut.

**Des feuilles vers les racines.** On convertit d'abord les modules qui n'importent rien du projet : utilitaires,
calculs, modèles de données. Leurs types se propagent ensuite automatiquement à tous les modules qui les utilisent. On
convertit en dernier les points d'entrée, qui importent tout. Convertir d'abord `main.js` obligerait à typer tout ce qu'il
utilise en même temps.

**Durcir par étapes.** `noImplicitAny` oblige à typer chaque paramètre : la première étape, mécanique. `strictNullChecks`
rend visibles les valeurs possiblement absentes : c'est là que la migration trouve les vrais bugs, comme la lampe
absente. On peut activer une option, compter les erreurs avec `tsc | grep -c "error TS"`, et suivre ce nombre dans le
temps. Une règle simple aide : aucun **nouveau** fichier n'est écrit en JavaScript, et une erreur corrigée ne revient pas.

**Les compromis, visibles et temporaires.** Parfois, une erreur ne peut pas être corrigée tout de suite : une
bibliothèque sans types, un code ancien trop risqué à toucher. `// @ts-expect-error` suivi d'une explication supprime
l'erreur de la ligne suivante, et signale une erreur **s'il n'y a plus rien à supprimer** : le jour où le problème est
corrigé, le commentaire doit partir. C'est mieux que `// @ts-ignore`, qui reste silencieux pour toujours, et bien mieux
qu'un `any`, qui désactive la vérification de la valeur partout où elle circule. Pour une donnée de forme inconnue,
`unknown` oblige à la vérifier avant usage.

**Les dépendances non typées.** La plupart des paquets fournissent leurs types, ou en ont dans `@types/<paquet>`. Pour
les autres, un fichier de déclaration minimal, `declare module 'vieux-paquet';`, les rend importables, en `any`, en
attendant de décrire les fonctions réellement utilisées.

**Ce qu'on gagne en chemin.** Une migration n'est pas une fin en soi. Chaque étape apporte déjà quelque chose : de
l'autocomplétion dès l'étape 1, des bugs trouvés dès l'étape 2, des refactorings sûrs ensuite. On peut s'arrêter à
n'importe quelle étape si le rapport coût-bénéfice ne justifie pas la suivante.

## Erreurs fréquentes

**Tout convertir d'un coup.** La pull request est impossible à relire, et le projet est bloqué pendant la conversion.

**Commencer par le point d'entrée.** Il importe tout ; commence par les feuilles.

**Oublier que `strict` est actif par défaut.** Écris `"strict": false` au départ d'une migration, puis active les
vérifications une à une.

**Remplacer chaque erreur par `any`.** On obtient du TypeScript sans vérification ; utilise `unknown` ou corrige.

**Des `@ts-ignore` sans explication.** Préfère `@ts-expect-error` avec la raison.

**Mélanger conversion et changement de comportement.** Une migration est un refactoring : les tests ne changent pas.

## À retenir

- On migre par étapes : `allowJs`, `checkJs` et JSDoc, conversion des fichiers, durcissement, fin.
- Au départ, `"strict": false` explicite, car TypeScript l'active par défaut.
- On convertit des feuilles du graphe vers les points d'entrée.
- `noImplicitAny`, puis `strictNullChecks` : c'est là que se trouvent les vrais bugs.
- Les compromis sont visibles et temporaires : `@ts-expect-error` avec une raison, `unknown` plutôt que `any`.

## Exercices

1. Ordonne la conversion de ces modules, sachant que la flèche signifie « importe » : `main.js` → `routes.js` →
   `commandes.js` → `prix.js` ; `routes.js` → `utilisateurs.js` → `validation.js` ; `commandes.js` → `validation.js`.
   Justifie l'ordre.

   :::indice
   Commence par les modules qui n'importent aucun autre module du projet.
   :::

   :::solution
   1. `prix.js` et `validation.js` : ils n'importent rien du projet, ce sont les feuilles.
   2. `commandes.js` et `utilisateurs.js` : leurs dépendances sont déjà typées.
   3. `routes.js`, qui importe les deux précédents.
   4. `main.js`, le point d'entrée, en dernier.

   À chaque étape, les types des modules déjà convertis se propagent : convertir `commandes.js` ne demande de typer que
   son propre code, puisque `prix` et `validation` sont déjà typés. Chaque conversion est une petite pull request, relue et
   testée séparément.
   :::

2. Pendant une migration, `tsc` signale cette erreur, due à une bibliothèque de graphiques sans types, qu'on remplacera le
   mois prochain. Écris le compromis le plus sûr, et montre ce qui se passe quand le problème disparaît.

   ```ts
   import { tracer } from 'vieux-graphiques';
   // error TS7016: Could not find a declaration file for module 'vieux-graphiques'.
   ```

   :::indice
   Un fichier de déclaration minimal, ou `@ts-expect-error`. Lequel se signale tout seul quand il devient inutile ?
   :::

   :::solution
   Pour une seule ligne, `@ts-expect-error` avec la raison :

   ```ts
   // @ts-expect-error vieux-graphiques n'a pas de types ; remplacé par la bibliothèque X en octobre (ticket #620)
   import { tracer } from 'vieux-graphiques';
   ```

   Le jour où la bibliothèque est remplacée par une bibliothèque typée, la ligne ne produit plus d'erreur, et
   `@ts-expect-error` signale alors `Unused '@ts-expect-error' directive` : on est forcé de retirer le compromis. Un
   `@ts-ignore` serait resté pour toujours. Si la bibliothèque est importée dans plusieurs fichiers, on préfère décrire
   ce qu'on utilise dans un fichier de déclaration, par exemple
   `declare module 'vieux-graphiques' { export function tracer(element: HTMLElement, donnees: number[]): void; }`, ce qui
   donne en plus des types utiles.
   :::

3. Après avoir activé `strictNullChecks`, le projet affiche 214 erreurs. L'équipe veut continuer à livrer des
   fonctionnalités pendant qu'elle les corrige. Propose une organisation.

   :::indice
   Pense à empêcher les nouvelles erreurs sans bloquer tout le monde, et à mesurer le progrès.
   :::

   :::solution
   - Garder `strictNullChecks` actif dans l'éditeur et dans un script `typecheck:strict`, qui affiche le nombre
     d'erreurs, tandis que l'intégration continue vérifie avec la configuration précédente plus une règle : le nombre
     d'erreurs strictes ne doit pas **augmenter**. Un petit script compare le nombre à une valeur de référence commitée,
     et la baisse à chaque correction.
   - Corriger par module, en commençant par les feuilles, dans des pull requests dédiées, sans mélanger avec des
     fonctionnalités.
   - Écrire tout nouveau code en mode strict : les fichiers neufs n'ajoutent aucune erreur.
   - Quand le compteur atteint zéro, activer l'option dans la configuration principale et supprimer le mécanisme de
     référence.

   On livre pendant toute la durée, le progrès est mesurable, et aucune erreur nouvelle n'entre dans le code.
   :::

## Questions d'entretien

- Comment migrerais-tu une grosse application JavaScript vers TypeScript ?

  :::indice
  Par étapes, des feuilles vers les racines, en durcissant progressivement.
  :::

  :::reponse
  Progressivement, sans arrêter les livraisons. D'abord brancher TypeScript avec `allowJs`, sans vérification et avec
  `strict` désactivé explicitement, pour profiter de l'éditeur. Puis activer `checkJs`, fichier par fichier ou
  globalement, et typer en JSDoc. Ensuite convertir les fichiers en `.ts`, en commençant par les modules sans
  dépendances internes, et durcir option par option, `noImplicitAny` puis `strictNullChecks`, en mesurant le nombre
  d'erreurs et en interdisant qu'il augmente. Tout nouveau code est écrit en TypeScript strict. Chaque étape est une
  petite pull request, et les tests garantissent qu'aucun comportement ne change.
  :::

- Quelle différence entre `@ts-ignore`, `@ts-expect-error` et `any` ?

  :::indice
  Portée, et que se passe-t-il quand l'erreur disparaît ?
  :::

  :::reponse
  `@ts-ignore` masque toute erreur sur la ligne suivante, pour toujours, même quand il n'y en a plus. `@ts-expect-error`
  fait de même mais signale une erreur quand il n'y a plus rien à masquer : le compromis est retiré dès que le problème
  est corrigé. On l'accompagne d'une explication. `any` est plus large : il désactive la vérification sur la valeur,
  partout où elle circule, et contamine les types qui en dérivent. On préfère `unknown` pour une valeur de forme inconnue,
  qu'il faut vérifier avant usage.
  :::

- Faut-il toujours aller jusqu'au bout d'une migration ?

  :::indice
  Coût et bénéfice de chaque étape.
  :::

  :::reponse
  Pas forcément. Chaque étape apporte déjà un bénéfice : autocomplétion avec `allowJs`, bugs trouvés avec `checkJs` et
  JSDoc, refactorings sûrs avec des fichiers typés. Certains projets s'arrêtent volontairement à JavaScript vérifié par
  JSDoc, qui évite toute étape de compilation. Ce qui compte, c'est que la direction soit claire, que le nouveau code
  respecte le niveau visé, et que les compromis restent visibles et suivis.
  :::
