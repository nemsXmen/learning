---
id: typescript-01-javascript-vs-typescript
title: JavaScript vs TypeScript
slug: javascript-vs-typescript
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 3
estimatedMinutes: 20
difficulty: 1
xp: 50
prerequisites: [typescript-01-quest-ce-que-typescript]
skills: [typescript-basics]
tags: [typescript, javascript, comparaison]
---

## Objectifs

- Comparer clairement JavaScript et TypeScript
- Comprendre ce qui est identique et ce qui change
- Savoir ce que TypeScript ajoute (et ce qu’il n’enlève pas)
- Éviter les confusions courantes entre les deux

## Introduction

« TypeScript c’est juste JavaScript avec des types » est une phrase que l’on entend souvent. Elle est *presque* vraie, mais elle masque des nuances importantes.

Cette leçon clarifie exactement où les deux langages se rejoignent et où ils divergent.

## Concept

### Points communs

- Même syntaxe de base (variables, fonctions, classes, modules, async/await…)
- Même modèle d’exécution (event loop, prototypes, closures…)
- Même écosystème (npm, Node.js, navigateurs…)
- Tout code JavaScript valide peut être mis dans un fichier `.ts`

### Différences fondamentales

| Aspect                    | JavaScript                          | TypeScript                              |
|---------------------------|-------------------------------------|-----------------------------------------|
| Types                     | Dynamiques (runtime)                | Statiques (compilation) + dynamiques    |
| Vérification              | Uniquement à l’exécution            | À la compilation + à l’exécution        |
| Fichiers                  | `.js` / `.mjs` / `.cjs`             | `.ts` / `.tsx` (+ `.js` possible)       |
| Compilation               | Non nécessaire (ou Babel/SWC)       | Nécessaire (`tsc` ou équivalent)        |
| Erreurs de types          | Souvent découvertes tard            | Découvertes tôt                         |
| Autocomplétion            | Limitée                             | Très précise                            |
| Refactoring               | Risqué                              | Beaucoup plus sûr                       |

### Ce que TypeScript *ajoute*

- Annotations de types
- Interfaces et type aliases
- Generics
- Enums (avec nuances)
- Namespaces (legacy)
- Décorateurs (expérimental / stage 3)
- Utilitaires de types avancés (`Partial`, `Pick`, mapped types, conditional types…)

### Ce que TypeScript *n’enlève pas*

Tu peux toujours écrire du JavaScript « dynamique » en TypeScript :

```ts
let value: any = "hello";
value = 42;
value = { x: 1 };
```

Ou même sans annotation du tout (grâce à l’inférence).

## Exemple

**JavaScript**

```js
function greet(person) {
  return "Hello, " + person.name.toUpperCase();
}

greet({ name: "Alice" });     // OK
greet({ fullName: "Bob" });   // Runtime error: Cannot read properties of undefined
greet(null);                  // Runtime error
```

**TypeScript équivalent**

```ts
interface Person {
  name: string;
}

function greet(person: Person): string {
  return "Hello, " + person.name.toUpperCase();
}

greet({ name: "Alice" });           // OK
greet({ fullName: "Bob" });         // ❌ Property 'name' is missing
greet(null);                        // ❌ Argument of type 'null' is not assignable
```

Le comportement à runtime reste le même une fois compilé. La différence se joue *avant*.

## Comment ça fonctionne

TypeScript ne change pas le modèle d’exécution de JavaScript. Il ajoute une phase supplémentaire :

```
Code source (.ts)
      ↓
Type-checking (tsc)
      ↓
Émission de JavaScript (.js)
      ↓
Exécution (Node / navigateur / …)
```

Le JavaScript généré ressemble très fort au TypeScript d’origine, sans les annotations.

## Erreurs fréquentes

- **« TypeScript est plus lent que JavaScript »**  
  À l’exécution, non. Le JavaScript produit a les mêmes performances. Seul le temps de *compilation* s’ajoute.

- **Croire que TypeScript interdit le code dynamique**  
  Non. Tu peux utiliser `any`, `unknown`, des index signatures, etc. TypeScript te donne le choix.

- **Penser que les classes TypeScript sont différentes des classes JavaScript**  
  Depuis ES2015, les classes sont quasi identiques. TypeScript ajoute surtout des modificateurs (`private`, `protected`, `readonly`) et le typage.

- **Confondre « compilation TypeScript » et « transpilation Babel »**  
  `tsc` fait les deux (type-check + émission). Babel (avec preset TypeScript) ne fait *que* la transpilation et ignore les erreurs de types.

## À retenir

- TypeScript = JavaScript + couche de types statiques
- Le runtime reste 100 % JavaScript
- Les types aident à la rédaction et à la maintenance, pas à l’exécution
- Tu peux écrire du TypeScript très proche de JavaScript ou très strict
- La différence se voit surtout dans l’éditeur et au moment de la compilation

## Exercices

1. Prends ce code JavaScript et ajoute les annotations TypeScript minimales pour le rendre sûr :

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

```js
function formatUser(user) {
  return user.firstName + " " + user.lastName;
}
```

   :::indice
   Crée une interface ou un type pour `user` et type le retour de la fonction.
   :::

   :::solution
   ```ts
   interface User {
     firstName: string;
     lastName: string;
   }

   function formatUser(user: User): string {
     return user.firstName + " " + user.lastName;
   }
   ```
   :::

2. Explique pourquoi ce code TypeScript compile sans erreur alors qu’il peut planter à runtime :

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

```ts
function getLength(obj: { length: number }) {
  return obj.length;
}

getLength("hello");     // OK
getLength([1, 2, 3]);   // OK
getLength({ length: 10 }); // OK
```

   :::indice
   Pense au structural typing (typage structurel).
   :::

   :::solution
   TypeScript utilise le *typage structurel* (duck typing). Tout objet qui possède une propriété `length` de type `number` est accepté. Les strings et les tableaux ont naturellement une propriété `length`. TypeScript ne vérifie pas l’identité exacte du type, seulement sa structure.
   :::

## Questions d'entretien

1. TypeScript est-il un langage différent de JavaScript ou un simple outil au-dessus ?

   :::indice
   Parle de la relation de superset et du processus de compilation.
   :::

   :::reponse
   TypeScript est un langage à part entière, mais conçu comme un *superset* de JavaScript. Tout JavaScript valide est du TypeScript valide. À la compilation, TypeScript est entièrement transformé en JavaScript. On peut donc le voir à la fois comme un langage et comme une couche d’outils (type-checker + transpileur) au-dessus de JavaScript.
   :::

2. Quelles sont les principales différences entre le typage de JavaScript et celui de TypeScript ?

   :::indice
   Dynamique vs statique, moment de la vérification.
   :::

   :::reponse
   JavaScript a un typage dynamique : les types sont vérifiés (et peuvent changer) à l’exécution. TypeScript ajoute un typage statique vérifié à la compilation. Les deux coexistent : TypeScript efface ses types et laisse le typage dynamique de JavaScript opérer à runtime.
   :::
