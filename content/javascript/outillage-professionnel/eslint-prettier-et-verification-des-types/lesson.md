---
id: javascript-eslint-prettier-et-verification-des-types
title: "ESLint, Prettier et vérification des types"
slug: eslint-prettier-et-verification-des-types
technology: javascript
level: intermediate
module: outillage-professionnel
order: 1
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-npm-et-package-json
  - javascript-nommage-et-petites-unites
skills:
  - js-lint-format-types
tags:
  - javascript
  - outillage
  - qualite
---

## Objectifs

- Distinguer trois outils complémentaires : le linter, le formateur et le vérificateur de types.
- Configurer ESLint avec le format de configuration à plat, et choisir des règles qui attrapent de vrais bugs.
- Déléguer toute la mise en forme à Prettier, et éviter les conflits avec ESLint.
- Vérifier les types d'un projet JavaScript avec JSDoc et TypeScript, sans le réécrire.
- Brancher ces outils sur l'éditeur et sur des scripts npm.

## Introduction

Relire le code d'un collègue pour lui signaler un `==` au lieu de `===`, une variable inutilisée ou une indentation
irrégulière est une perte de temps pour tout le monde. Ce travail mécanique appartient à des outils, qui le font
instantanément, sans oubli et sans froisser personne. Le temps humain se consacre alors à ce qu'aucun outil ne sait
juger : le besoin, la conception, la justesse des règles métier.

Trois outils se partagent ce travail en JavaScript. **ESLint** cherche les erreurs et les pratiques risquées.
**Prettier** met le code en forme. **TypeScript**, même sur un projet en JavaScript, vérifie que les valeurs ont le type
attendu.

## Concept

| Outil | Question à laquelle il répond | Exemple de détection |
| --- | --- | --- |
| ESLint, le linter | ce code contient-il une erreur probable ou une pratique risquée ? | variable inutilisée, `==`, expression sans effet |
| Prettier, le formateur | ce code est-il présenté selon la convention ? | indentation, guillemets, points-virgules, longueur des lignes |
| TypeScript, `tsc` | les valeurs ont-elles les types attendus ? | propriété inexistante, chaîne passée à la place d'un nombre |

| Script npm | Commande | Modifie les fichiers ? |
| --- | --- | --- |
| `lint` | `eslint .` | non |
| `lint:fix` | `eslint . --fix` | oui, pour les règles réparables |
| `format` | `prettier --write .` | oui |
| `format:check` | `prettier --check .` | non : pour l'intégration continue |
| `typecheck` | `tsc --noEmit` | non |

## Exemple

Un fichier écrit à la hâte, avec des annotations JSDoc de types :

```js
// @ts-check

/**
 * @param {{ poids: number, total: number }} commande
 * @returns {number}
 */
export function fraisExpress(commande) {
  let frais = 9.9
  const inutile = 'debug'
  if (commande.poids > 5) frais = frais + (commande.poids - 5) * 2
  if (commande.total > 100) frais == 0
  if (commande.pays == 'FR') frais -= 1
  return frais
}

fraisExpress({ poids: '3', total: 50 })
```

La configuration d'ESLint, au format à plat, dans `eslint.config.js` :

```js
import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'coverage/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.node },
    rules: {
      eqeqeq: 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
    },
  },
];
```

Les trois outils, lancés sur ce fichier :

```text
$ npx eslint src
src/frais.js
   9:9   error  'inutile' is assigned a value but never used                           no-unused-vars
  11:29  error  Expected an assignment or function call and instead saw an expression  no-unused-expressions
  11:35  error  Expected '===' and instead saw '=='                                    eqeqeq
  12:21  error  Expected '===' and instead saw '=='                                    eqeqeq
✖ 4 problems (4 errors, 0 warnings)

$ npx prettier --check src
[warn] src/frais.js
[warn] Code style issues found in the above file. Run Prettier with --write to fix.

$ npx tsc --noEmit
src/frais.js(12,16): error TS2339: Property 'pays' does not exist on type '{ poids: number; total: number; }'.
src/frais.js(16,16): error TS2322: Type 'string' is not assignable to type 'number'.
```

Chaque outil trouve ce que les autres ne voient pas. ESLint repère le bug de la ligne 11, `frais == 0`, une comparaison
dont le résultat est ignoré, celui de la revue de code du chapitre précédent. TypeScript repère une propriété `pays` qui
n'existe pas et un poids passé en chaîne. Prettier ne juge rien : il remet en forme.

## Comment ça fonctionne

**ESLint analyse le code sans l'exécuter.** Il le transforme en arbre syntaxique, et chaque règle parcourt cet arbre à
la recherche d'un motif : une variable déclarée mais jamais lue, une expression qui ne fait rien, une comparaison
lâche. `js.configs.recommended` active les règles qui signalent presque toujours un bug ; on ajoute celles qui
correspondent aux conventions de l'équipe. Une règle se règle à `'off'`, `'warn'` ou `'error'`, et seules les erreurs
font échouer la commande. Beaucoup de règles se corrigent automatiquement avec `--fix`.

**La configuration à plat.** Depuis ESLint 9, la configuration est un tableau d'objets dans `eslint.config.js`, lus dans
l'ordre : chaque objet peut viser des fichiers avec `files`, déclarer les globales de l'environnement avec
`languageOptions.globals`, ajouter des extensions et régler des règles. Les anciens fichiers `.eslintrc` ne sont plus
lus. Des extensions ajoutent des règles pour React, pour les imports, pour les tests ou pour TypeScript.

**Prettier décide de la forme, une fois pour toutes.** Prettier réimprime tout le fichier selon ses règles : il ne
propose pas, il impose. C'est justement son intérêt : les débats sur les guillemets et les virgules disparaissent, les
diffs ne contiennent plus que des changements de fond, et le code a partout le même aspect. Il n'a que quelques options,
dans `.prettierrc` : guillemets simples, largeur de ligne, virgules finales. On ne laisse pas ESLint s'occuper de la mise
en forme : ses règles de style entreraient en conflit avec Prettier. La configuration recommandée d'ESLint n'en contient
plus, et `eslint-config-prettier` désactive celles qu'une extension ajouterait.

**Des types sans réécrire en TypeScript.** Le commentaire `// @ts-check`, ou l'option `checkJs` dans un `tsconfig.json`,
demande à TypeScript de vérifier des fichiers JavaScript. Les annotations JSDoc, `@param`, `@returns`, `@typedef`,
déclarent les types attendus ; TypeScript en déduit beaucoup d'autres tout seul. `tsc --noEmit` vérifie sans produire de
fichiers. C'est un excellent premier pas vers TypeScript, que la partie suivante du cours aborde, et beaucoup de
bibliothèques s'en contentent.

**Dans l'éditeur, puis partout.** Les extensions d'ESLint et de Prettier pour l'éditeur soulignent les problèmes pendant
la frappe et formatent à l'enregistrement : la plupart des erreurs disparaissent avant même le commit. Les mêmes
vérifications tournent ensuite dans des scripts npm, lancés par l'intégration continue : ce qui passe sur un poste passe
partout, parce que les versions des outils sont fixées dans le `package.json` et le fichier de verrouillage.

**Des règles au service de l'équipe.** Chaque règle doit attraper un vrai problème ou appliquer une vraie convention.
Une remarque qui revient en revue de code devient une règle ; une règle que tout le monde désactive avec des
commentaires `eslint-disable` doit être supprimée ou assouplie. Désactiver une règle pour une ligne se justifie, avec un
commentaire qui explique pourquoi.

## Erreurs fréquentes

**Confier la mise en forme à ESLint et à Prettier à la fois.** Les deux se contredisent ; Prettier formate, ESLint
cherche les erreurs.

**Lancer `--fix` ou `--write` en intégration continue.** L'intégration continue vérifie, avec `--check` ; elle ne
réécrit pas le code.

**Accumuler des centaines d'avertissements.** Plus personne ne les lit ; une règle est une erreur ou n'existe pas.

**Désactiver une règle sans explication.** Un `eslint-disable` doit dire pourquoi.

**Installer les outils globalement.** Les versions divergent entre postes ; installe-les en `devDependencies`.

**Écrire des types JSDoc sans les faire vérifier.** Sans `@ts-check` ou `checkJs`, ce ne sont que des commentaires.

## À retenir

- ESLint trouve les erreurs probables, Prettier met en forme, TypeScript vérifie les types.
- Configuration à plat d'ESLint dans `eslint.config.js` : `recommended`, globales, règles de l'équipe.
- Prettier impose la forme ; pas de règles de style dans ESLint.
- `// @ts-check` ou `checkJs`, des annotations JSDoc et `tsc --noEmit` vérifient un projet JavaScript.
- Éditeur pour le retour immédiat, scripts npm en mode vérification pour l'intégration continue.

## Exercices

1. Pour chaque problème, indique quel outil le signale : ESLint, Prettier ou TypeScript avec `checkJs`.
   - a) Un appel `total.toFixed()` sur une variable qui peut valoir `undefined`.
   - b) Une ligne de 180 caractères.
   - c) Une variable importée mais jamais utilisée.
   - d) Un `if (x = 3)` au lieu de `if (x === 3)`.
   - e) Des guillemets doubles dans un projet qui utilise des simples.
   - f) Un objet passé à une fonction sans une propriété obligatoire décrite en JSDoc.

   :::indice
   Style : formateur. Motif risqué : linter. Types des valeurs : vérificateur de types.
   :::

   :::solution
   - a) TypeScript, en mode strict : il sait que la valeur peut être `undefined`.
   - b) Prettier, qui revient à la ligne selon la largeur configurée.
   - c) ESLint, règle `no-unused-vars`.
   - d) ESLint, règle `no-cond-assign`, incluse dans la configuration recommandée.
   - e) Prettier, avec l'option `singleQuote: true`.
   - f) TypeScript, qui compare l'objet au type déclaré par `@param`.
   :::

2. Écris le `package.json` des scripts de qualité d'un projet, avec : lint, correction automatique, formatage,
   vérification du formatage, vérification des types, et un script `check` pour l'intégration continue qui lance toutes
   les vérifications sans rien modifier. Ajoute une configuration Prettier en guillemets simples et 110 caractères.

   :::indice
   Les scripts de l'intégration continue utilisent `--check` et `--noEmit`, jamais `--fix` ni `--write`.
   :::

   :::solution
   ```json
   {
     "scripts": {
       "lint": "eslint .",
       "lint:fix": "eslint . --fix",
       "format": "prettier --write .",
       "format:check": "prettier --check .",
       "typecheck": "tsc --noEmit",
       "check": "npm run format:check && npm run lint && npm run typecheck"
     }
   }
   ```

   ```json
   {
     "singleQuote": true,
     "printWidth": 110
   }
   ```

   La seconde configuration va dans `.prettierrc`. `check` s'arrête à la première vérification qui échoue ; un
   développeur lance `npm run format` et `npm run lint:fix` en local pour corriger, puis `npm run check` pour s'assurer
   que l'intégration continue passera.
   :::

3. Ajoute des annotations JSDoc à cette fonction pour que `tsc` signale l'appel erroné, puis corrige l'appel.

   ```js
   // @ts-check
   export function remise(prix, pourcentage) {
     return Math.round(prix * (1 - pourcentage / 100) * 100) / 100;
   }

   remise('49.90', 10);
   ```

   :::indice
   `@param {number} prix`, et un type de retour.
   :::

   :::solution
   ```js
   // @ts-check

   /**
    * Applique une remise en pourcentage et arrondit au centime.
    * @param {number} prix Prix en euros.
    * @param {number} pourcentage Entre 0 et 100.
    * @returns {number}
    */
   export function remise(prix, pourcentage) {
     return Math.round(prix * (1 - pourcentage / 100) * 100) / 100;
   }

   console.log(remise(49.9, 10)); // 44.91
   ```

   Avec l'appel d'origine, `tsc --noEmit` signale : `Argument of type 'string' is not assignable to parameter of type
   'number'`. Sans vérification, `'49.90' * …` aurait fonctionné par conversion implicite ici, mais la même erreur avec
   une addition, `'49.90' + 5`, aurait produit `'49.905'`. Le type documente et vérifie à la fois.
   :::

## Questions d'entretien

- Quelle différence entre ESLint et Prettier ?

  :::indice
  Erreurs probables contre mise en forme.
  :::

  :::reponse
  ESLint est un linter : il analyse le code pour trouver des erreurs probables et des pratiques risquées, comme une
  variable inutilisée, une comparaison lâche ou une expression sans effet, et applique des conventions de code. Prettier
  est un formateur : il réimprime le code selon une présentation fixe, indentation, guillemets, retours à la ligne, sans
  juger le fond. On les utilise ensemble, en laissant la mise en forme à Prettier seul pour éviter les conflits, avec
  `eslint-config-prettier` si une extension ajoute des règles de style.
  :::

- Comment vérifier les types d'un projet JavaScript sans le migrer vers TypeScript ?

  :::indice
  Un commentaire, une option, des annotations.
  :::

  :::reponse
  Avec TypeScript en mode vérification : `// @ts-check` en tête de fichier, ou `allowJs` et `checkJs` dans un
  `tsconfig.json`, puis `tsc --noEmit` dans un script et en intégration continue. Les types s'écrivent en JSDoc, avec
  `@param`, `@returns`, `@typedef`, et TypeScript infère le reste. On obtient une grande partie des bénéfices, erreurs
  détectées, autocomplétion, documentation vérifiée, sans étape de compilation, et c'est une migration progressive
  possible vers TypeScript.
  :::

- Comment éviter que les outils de qualité deviennent une gêne ?

  :::indice
  Règles utiles, retour immédiat, pas d'avertissements ignorés.
  :::

  :::reponse
  En choisissant des règles qui attrapent de vrais problèmes, et en supprimant celles que l'équipe contourne sans cesse.
  En donnant un retour immédiat dans l'éditeur, avec formatage à l'enregistrement, pour que les corrections se fassent
  au fil de l'eau. En traitant les avertissements comme des erreurs ou en les supprimant, pour qu'aucune liste ignorée ne
  s'accumule. Et en rendant les commandes identiques sur les postes et en intégration continue, avec des versions fixées.
  :::
