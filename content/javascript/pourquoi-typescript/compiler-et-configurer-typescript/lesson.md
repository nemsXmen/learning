---
id: javascript-compiler-et-configurer-typescript
title: "Compiler, exécuter et configurer TypeScript"
slug: compiler-et-configurer-typescript
technology: javascript
level: intermediate
module: pourquoi-typescript
order: 2
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-limites-de-javascript-et-typage-statique
  - javascript-build-vite-bundlers-et-source-maps
skills:
  - js-ts-compiler-config
tags:
  - javascript
  - typescript
  - outillage
---

## Objectifs

- Distinguer les deux rôles de TypeScript : vérifier les types, et produire du JavaScript.
- Exécuter du TypeScript de trois façons : compilation avec `tsc`, exécution directe par Node, outil de build.
- Savoir que Node et Vite effacent les types **sans les vérifier**, et où placer la vérification.
- Lire et écrire un `tsconfig.json` : strictesse, modules, cible, sorties, fichiers inclus.

## Introduction

TypeScript fait deux choses distinctes, souvent confondues. Il **vérifie** les types : c'est son intérêt. Et il
**transforme** le code TypeScript en JavaScript exécutable, en retirant les annotations. Aujourd'hui, la seconde tâche
est souvent confiée à d'autres outils, plus rapides : Node lui-même, Vite, esbuild. Mais ces outils se contentent
d'effacer les types, ils ne les vérifient jamais.

Comprendre cette séparation évite une surprise désagréable : une application qui démarre et se construit sans erreur,
alors que `tsc` signale des erreurs de type que personne n'a lancées.

## Concept

| Façon d'exécuter | Vérifie les types ? | Usage |
| --- | --- | --- |
| `tsc`, puis `node dist/main.js` | oui, puis produit du JavaScript dans `outDir` | bibliothèques, serveurs compilés |
| `node src/main.ts` | non : Node efface les types | scripts, serveurs en développement, Node 22.18 et plus |
| `vite`, `vite build` | non : Vite efface les types | applications front-end |
| `tsc --noEmit` | oui, sans rien produire | la vérification, dans l'éditeur, un script et l'intégration continue |

| Option de `tsconfig.json` | Rôle |
| --- | --- |
| `strict` | active toutes les vérifications strictes, dont `strictNullChecks` ; indispensable |
| `noUncheckedIndexedAccess` | `tableau[i]` et `objet[cle]` peuvent être `undefined` |
| `target` | la version de JavaScript produite : `es2023`, `esnext` |
| `module` | le système de modules : `nodenext` pour Node, `preserve` pour un outil de build |
| `rootDir`, `outDir` | où sont les sources, où écrire le JavaScript produit |
| `noEmit` | vérifier seulement, sans produire de fichiers |
| `sourceMap`, `declaration` | cartes de sources, fichiers `.d.ts` pour une bibliothèque |
| `erasableSyntaxOnly` | interdit la syntaxe qui ne s'efface pas, comme `enum` : compatible avec Node |
| `include`, `exclude` | les fichiers du projet |

## Exemple

Deux fichiers TypeScript, dans un projet `"type": "module"` :

```ts
// src/prix.ts
export function prixTTC(ht: number, taux = 0.2): number {
  return Math.round(ht * (1 + taux) * 100) / 100;
}
```

```ts
// src/main.ts
import { prixTTC } from './prix.ts';

console.log(`Prix TTC : ${prixTTC(49.9)} €`);
```

Un `tsconfig.json` pour un projet Node :

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "rootDir": "src",
    "outDir": "dist",
    "sourceMap": true,
    "allowImportingTsExtensions": true,
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Les trois façons d'exécuter, et ce qui se passe quand on ajoute une erreur de type, `prixTTC('49.90')` :

```text
$ node src/main.ts
Prix TTC : 59.88 €

$ npx tsc
$ ls dist
main.js  main.js.map  prix.js  prix.js.map
$ node dist/main.js
Prix TTC : 59.88 €

# on ajoute : console.log(prixTTC('49.90'));
$ npx tsc
src/main.ts(4,21): error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
$ echo $?
2
$ node src/main.ts
Prix TTC : 59.88 €
59.88                      ← l'erreur de type ne l'empêche pas de s'exécuter
$ npx vite build
✓ built in 78ms            ← Vite non plus
```

Seul `tsc` signale l'erreur. Node et Vite effacent les annotations et exécutent le JavaScript restant, dans lequel
`'49.90' * 1.2` est converti silencieusement.

## Comment ça fonctionne

**Vérifier et transformer, deux étapes séparables.** `tsc` fait les deux : il vérifie tout le projet, puis écrit le
JavaScript dans `outDir`. Il écrit ce JavaScript même en cas d'erreur de type, sauf avec `noEmitOnError`, mais sort avec
un code d'erreur. Les autres outils ne font que la seconde étape, fichier par fichier, sans connaître le reste du projet :
c'est ce qui les rend si rapides. On vérifie donc les types à part, avec `tsc --noEmit`, dans l'éditeur, dans un script
`typecheck`, et surtout dans l'intégration continue, où l'échec bloque la fusion.

**Node exécute du TypeScript.** Depuis Node 22.18, `node fichier.ts` fonctionne sans option : Node remplace les
annotations par des espaces et exécute le reste. Cela impose deux règles. Les imports locaux portent l'extension réelle,
`./prix.ts` : Node ne devine pas les extensions. Et la syntaxe doit être **effaçable** : les `enum`, les `namespace` et
les propriétés déclarées dans les paramètres du constructeur génèrent du code, et Node les refuse avec
`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. L'option `erasableSyntaxOnly` fait signaler ces constructions par `tsc`, et
`rewriteRelativeImportExtensions` fait écrire `./prix.js` dans le JavaScript produit, pour que le même code fonctionne
compilé ou exécuté directement.

**Les outils de build.** Vite, esbuild ou les frameworks effacent les types au passage, fichier par fichier. Pour une
application front-end, on configure `"module": "preserve"` et `"noEmit": true` : `tsc` ne sert qu'à vérifier, et
l'outil de build produit les fichiers. `isolatedModules` ou `verbatimModuleSyntax` signalent les constructions qu'un outil
qui traite un fichier à la fois ne peut pas transformer correctement, comme un import utilisé seulement comme type sans
le mot-clé `import type`.

**`strict`, non négociable pour un nouveau projet.** `strict` regroupe plusieurs vérifications, dont la plus importante :
`null` et `undefined` ne sont plus acceptés partout, ce qui oblige à traiter les absences. Sans `strict`, TypeScript
laisse passer la moitié des bugs qu'il pourrait trouver. `noUncheckedIndexedAccess` complète en rendant explicite
qu'un élément de tableau ou une clé d'objet peut manquer. Pour un projet existant, on peut activer ces options
progressivement, comme on le verra au chapitre suivant.

**Cible et modules.** `target` indique la version de JavaScript à produire : pour Node 22 ou des navigateurs récents,
une version récente, qui évite de transformer inutilement la syntaxe moderne. `module` indique comment traiter les
imports : `nodenext` suit exactement les règles de Node, `.js` ou `.ts` compris ; `preserve` laisse les imports tels quels
pour un outil de build. `tsc --init` génère un fichier de départ commenté, avec des valeurs modernes et strictes.

**Bibliothèques : déclarations.** Une bibliothèque publiée en JavaScript fournit ses types dans des fichiers `.d.ts`,
générés avec `declaration: true`, et référencés dans le `package.json`. Les paquets qui n'en fournissent pas ont souvent
des types dans `@types/<nom>`, comme `@types/node`. `skipLibCheck` évite de revérifier tous ces fichiers de déclaration,
ce qui accélère beaucoup la vérification.

## Erreurs fréquentes

**Croire que le serveur de développement vérifie les types.** Vite et Node les effacent ; lance `tsc --noEmit`.

**Ne pas vérifier les types dans l'intégration continue.** Les erreurs s'accumulent sans que personne ne les voie.

**Un `tsconfig` sans `strict`.** On perd l'essentiel de la valeur de TypeScript.

**Importer `./prix` sans extension avec Node.** Node n'ajoute pas d'extension ; écris `./prix.ts`.

**Utiliser `enum` avec l'exécution directe par Node.** Préfère une union de chaînes ou un objet `as const`.

**Commiter le dossier `dist`.** Il se reconstruit ; ignore-le comme `node_modules`.

## À retenir

- TypeScript vérifie les types et produit du JavaScript : deux étapes séparables.
- `node fichier.ts` et Vite effacent les types sans les vérifier ; `tsc --noEmit` vérifie, en intégration continue.
- Avec Node : imports avec extension `.ts`, syntaxe effaçable, `erasableSyntaxOnly`.
- `strict` et `noUncheckedIndexedAccess` pour tout nouveau projet.
- `module: nodenext` pour Node, `preserve` et `noEmit` avec un outil de build ; `declaration` pour une bibliothèque.

## Exercices

1. Une application Vite affiche `NaN` en production. En local, `pnpm dev` démarre sans erreur, et l'intégration continue
   lance seulement `pnpm test` et `pnpm build`. Explique comment une erreur de type a pu passer, et corrige les scripts.

   :::indice
   Qui, dans cette chaîne, vérifie réellement les types ?
   :::

   :::solution
   Personne. Vite, en développement comme au build, efface les types sans les vérifier ; Vitest aussi. Une erreur comme
   un nombre passé en chaîne passe toutes les étapes, et le JavaScript produit convertit silencieusement la valeur. On
   ajoute la vérification explicite :

   ```json
   {
     "scripts": {
       "dev": "vite",
       "typecheck": "tsc --noEmit",
       "test": "vitest run",
       "build": "tsc --noEmit && vite build",
       "check": "npm run typecheck && npm test"
     }
   }
   ```

   L'intégration continue lance `typecheck` avant les tests ; le build refuse aussi de produire une version qui ne passe
   pas la vérification. Dans l'éditeur, le serveur de langage TypeScript souligne l'erreur pendant la frappe.
   :::

2. Ce fichier refuse de s'exécuter avec `node commande.ts`. Explique l'erreur et réécris-le pour qu'il soit exécutable
   directement par Node, avec le même comportement.

   ```ts
   enum Statut {
     Brouillon = 'brouillon',
     Payee = 'payee',
   }

   class Commande {
     constructor(public id: string, public statut: Statut) {}
   }

   console.log(new Commande('c1', Statut.Payee));
   ```

   :::indice
   Deux constructions génèrent du JavaScript au lieu de s'effacer : lesquelles ?
   :::

   :::solution
   Node n'efface que les annotations. Un `enum` génère un objet à l'exécution, et `public id` dans les paramètres du
   constructeur génère des affectations : Node les refuse avec `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. On les remplace par
   des constructions effaçables :

   ```ts
   const STATUTS = ['brouillon', 'payee'] as const;
   type Statut = (typeof STATUTS)[number]; // 'brouillon' | 'payee'

   class Commande {
     id: string;
     statut: Statut;
     constructor(id: string, statut: Statut) {
       this.id = id;
       this.statut = statut;
     }
   }

   console.log(new Commande('c1', 'payee')); // Commande { id: 'c1', statut: 'payee' }
   ```

   L'union de chaînes offre la même sécurité que l'enum, `'expediee'` serait refusé, et `STATUTS` reste disponible à
   l'exécution pour une validation ou une liste déroulante. L'option `erasableSyntaxOnly` aurait signalé les deux
   constructions dès la vérification des types.
   :::

3. Écris le `tsconfig.json` d'une application front-end construite avec Vite, et explique chaque option importante.

   :::indice
   Vite produit les fichiers : `tsc` ne fait que vérifier.
   :::

   :::solution
   ```json
   {
     "compilerOptions": {
       "target": "es2022",
       "lib": ["es2023", "dom", "dom.iterable"],
       "module": "preserve",
       "moduleResolution": "bundler",
       "noEmit": true,
       "strict": true,
       "noUncheckedIndexedAccess": true,
       "verbatimModuleSyntax": true,
       "skipLibCheck": true,
       "types": ["vite/client"]
     },
     "include": ["src"]
   }
   ```

   `noEmit` : Vite produit les fichiers, `tsc` vérifie seulement. `module: preserve` et `moduleResolution: bundler` : les
   imports sont résolus comme le fait un outil de build, sans extension obligatoire. `lib` avec `dom` : les types du
   navigateur, `document`, `fetch`. `verbatimModuleSyntax` : impose `import type` pour les imports de types, qu'un outil
   qui traite un fichier à la fois doit pouvoir retirer. `types: ["vite/client"]` : les types de `import.meta.env` et des
   imports de fichiers statiques. `strict` et `noUncheckedIndexedAccess`, comme toujours.
   :::

## Questions d'entretien

- Quelle différence entre `tsc` et l'exécution d'un fichier `.ts` par Vite ou Node ?

  :::indice
  Vérifier contre effacer.
  :::

  :::reponse
  `tsc` analyse tout le projet et vérifie les types, puis produit le JavaScript. Vite, esbuild ou Node traitent chaque
  fichier isolément et se contentent d'effacer les annotations, sans vérifier : c'est pourquoi ils sont très rapides. Un
  code avec des erreurs de type s'exécute donc normalement avec eux. On combine les deux : l'outil rapide pour exécuter
  et construire, et `tsc --noEmit` dans l'éditeur, dans un script et dans l'intégration continue pour vérifier.
  :::

- Quelles options de `tsconfig` actives-tu toujours ?

  :::indice
  Strictesse, indexation, modules.
  :::

  :::reponse
  `strict`, qui active entre autres la vérification stricte de `null` et `undefined` ; `noUncheckedIndexedAccess`, pour
  que les accès par index soient considérés comme possiblement absents ; `skipLibCheck`, pour ne pas revérifier les
  déclarations des dépendances ; `verbatimModuleSyntax` ou `isolatedModules`, pour rester compatible avec les outils qui
  transforment un fichier à la fois. Puis `module` et `target` selon l'environnement : `nodenext` pour Node, `preserve`
  avec `noEmit` pour une application construite par un bundler.
  :::

- Pourquoi éviter les `enum` dans un projet moderne ?

  :::indice
  Que devient un `enum` à l'exécution ?
  :::

  :::reponse
  Un `enum` n'est pas une simple annotation : il génère un objet JavaScript, avec des particularités, comme la
  correspondance inverse des enums numériques. Il ne s'efface donc pas, ce qui le rend incompatible avec l'exécution
  directe par Node et avec l'option `erasableSyntaxOnly`. Une union de chaînes littérales, éventuellement dérivée d'un
  tableau `as const`, offre la même sécurité, reste lisible dans les données et le JSON, et disparaît à la compilation.
  :::
