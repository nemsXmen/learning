---
id: typescript-01-quest-ce-que-typescript
title: Qu’est-ce que TypeScript ?
slug: quest-ce-que-typescript
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: sn1
estimatedMinutes: 15
difficulty: 1
xp: 40
prerequisites: []
skills: [typescript-basics]
tags: [typescript, introduction]
---

## Objectifs

- Définir clairement ce qu’est TypeScript
- Comprendre sa relation avec JavaScript
- Savoir ce que TypeScript apporte (et ce qu’il n’apporte pas)
- Identifier les cas d’usage principaux

## Introduction

TypeScript est devenu le langage de choix pour la majorité des projets JavaScript modernes de taille moyenne à grande. Pourtant, beaucoup de développeurs l’utilisent sans vraiment comprendre ce qu’il *est*.

Cette leçon pose les bases : TypeScript n’est pas un framework, ni un runtime, ni un concurrent de JavaScript. C’est un **superset de JavaScript** qui ajoute un système de types statiques.

## Concept

**TypeScript** est un langage de programmation open-source développé et maintenu par Microsoft. Il a été créé par Anders Hejlsberg (également père de C# et Turbo Pascal).

La définition officielle est simple :

> TypeScript is JavaScript with syntax for types.

En pratique :

- Tout code JavaScript valide est du TypeScript valide (à quelques très rares exceptions près).
- TypeScript ajoute une couche de **types statiques** qui est vérifiée **à la compilation**.
- Une fois compilé, TypeScript disparaît complètement : le navigateur ou Node.js n’exécute que du JavaScript pur.

TypeScript se compose de deux parties principales :

1. **Le langage** (syntaxe + système de types)
2. **Le compilateur `tsc`** (qui transforme le `.ts` en `.js` et vérifie les types)

## Exemple

Voici un fichier JavaScript classique :

```js
function add(a, b) {
  return a + b;
}

console.log(add(2, 3));     // 5
console.log(add("2", 3));   // "23"  ← comportement souvent indésirable
```

La même chose en TypeScript :

```ts
function add(a: number, b: number): number {
  return a + b;
}

console.log(add(2, 3));     // 5
console.log(add("2", 3));   // ❌ Erreur de compilation
```

Le compilateur TypeScript refuse le second appel parce que `"2"` n’est pas un `number`.

## Comment ça fonctionne

1. Tu écris du code dans un fichier `.ts` (ou `.tsx` pour React).
2. Le compilateur TypeScript (`tsc`) lit ce fichier.
3. Il effectue le **type-checking** (vérification des types).
4. S’il n’y a pas d’erreur, il **émet** (transpile) du JavaScript standard.
5. Ce JavaScript est ensuite exécuté par Node.js, le navigateur, Deno, Bun, etc.

Le type-checking est **statique** : il se produit *avant* l’exécution. TypeScript ne protège **pas** contre les erreurs runtime (division par zéro, `null` non géré, etc.) sauf si tu utilises des techniques supplémentaires (narrowing, validation runtime, etc.).

## Erreurs fréquentes

- **Croire que TypeScript s’exécute dans le navigateur**  
  Non. Le navigateur ne comprend que le JavaScript. TypeScript doit être compilé.

- **Penser que TypeScript remplace JavaScript**  
  TypeScript *est* JavaScript + types. Tout ce que tu apprends en JavaScript reste valable.

- **Confondre TypeScript avec un linter**  
  ESLint + Prettier sont des outils de style et de règles. TypeScript est un système de types + compilateur.

- **Croire que les types existent à l’exécution**  
  Les types sont complètement effacés (type erasure). `typeof` à runtime ne voit jamais tes annotations TypeScript.

## À retenir

- TypeScript = JavaScript + système de types statiques
- Tout fichier `.ts` est compilé en `.js`
- Les types n’existent qu’à la compilation
- TypeScript ne change pas le runtime : il rend le code plus sûr *avant* l’exécution
- C’est un **superset** : tu peux migrer progressivement

## Exercices

1. Explique avec tes propres mots la différence entre « TypeScript est un langage » et « TypeScript est un compilateur ».

   :::indice
   Pense à la distinction entre le code source que tu écris et l’outil qui le transforme.
   :::

   :::solution
   TypeScript désigne à la fois :
   - le **langage** (la syntaxe et le système de types que tu utilises dans tes fichiers `.ts`)
   - le **compilateur** (`tsc`) qui vérifie les types et produit du JavaScript.
   Le langage est ce que tu écris ; le compilateur est l’outil qui le traite.
   :::

2. Pourquoi dit-on que « tout JavaScript valide est du TypeScript valide » ?

   :::indice
   Regarde ce qui se passe si tu renommes un fichier `.js` en `.ts` sans rien changer.
   :::

   :::solution
   Parce que TypeScript est un *superset* de JavaScript. La syntaxe JavaScript est entièrement acceptée. Les annotations de types sont *optionnelles*. Un fichier JavaScript pur compilé avec `tsc` produit (presque) le même JavaScript en sortie.
   :::

## Questions d'entretien

1. Qu’est-ce que TypeScript et en quoi diffère-t-il de JavaScript ?

   :::indice
   Commence par la relation de superset, puis parle du moment où les types interviennent.
   :::

   :::reponse
   TypeScript est un superset de JavaScript développé par Microsoft. Il ajoute un système de types statiques vérifié à la compilation. Une fois compilé, TypeScript disparaît et ne laisse que du JavaScript standard exécutable par n’importe quel runtime JavaScript. Contrairement à JavaScript, TypeScript permet de détecter un grand nombre d’erreurs *avant* l’exécution.
   :::

2. Les types TypeScript existent-ils à l’exécution ? Pourquoi ?

   :::indice
   Pense au processus de compilation et au terme « type erasure ».
   :::

   :::reponse
   Non. TypeScript applique une *type erasure* : toutes les annotations de types sont supprimées lors de la compilation. Le JavaScript généré ne contient aucune information de type. C’est pourquoi on ne peut pas faire de réflexion de types à runtime avec TypeScript seul (il faut des solutions comme les decorators + reflect-metadata ou des schémas de validation).
   :::
