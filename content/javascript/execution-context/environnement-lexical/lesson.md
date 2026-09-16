---
id: javascript-environnement-lexical
title: "Environnement lexical et environnement de variables"
slug: environnement-lexical
technology: javascript
level: advanced
module: execution-context
order: 3
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-phases-execution
skills:
  - lexical-environment
tags:
  - javascript
  - runtime
---

## Objectifs

- Décrire un environnement : une table de liaisons et un lien vers l'extérieur.
- Distinguer l'environnement lexical, qui suit les blocs, de l'environnement de variables,
  qui couvre toute la fonction.
- Expliquer comment une fonction retrouve, à l'appel, l'environnement où elle a été écrite.

## Introduction

« Portée lexicale », « chaîne de portée », « closure » : ces notions ont été présentées
comme des règles. Elles reposent toutes sur une seule structure interne du moteur,
l'**environnement**. Comprendre cette structure, c'est pouvoir dessiner ce que voit
n'importe quelle ligne de code, et expliquer les closures sans formule magique. C'est aussi
le vocabulaire exact de la spécification, qu'on retrouve dans les messages d'erreur et les
débogueurs.

## Concept

Un **environnement** est fait de deux choses :

| Élément | Rôle |
| --- | --- |
| Un registre de liaisons | les noms déclarés à ce niveau et leurs valeurs |
| Un lien extérieur | une référence vers l'environnement qui l'englobe, ou `null` au sommet |

Un contexte d'exécution en tient deux :

| Environnement | Contient | Change pendant l'exécution ? |
| --- | --- | --- |
| Environnement de variables | les `var` et les déclarations de fonction | non, il couvre toute la fonction |
| Environnement lexical | les `let`, `const`, `class`, et l'accès au reste | oui, un nouveau à chaque bloc |

Enfin, chaque **objet fonction** garde une référence interne, notée `[[Environment]]` dans
la spécification : l'environnement lexical en vigueur **au moment où la fonction a été
créée**. C'est cette référence, et elle seule, qui rend la portée lexicale et les closures
possibles.

## Exemple

```js
const niveau = 'module';

function traiter(liste) {
  var total = 0; // environnement de variables de traiter

  for (const element of liste) {
    // nouvel environnement lexical pour ce tour de boucle
    const double = element * 2;
    total += double;
  }

  if (total > 10) {
    let message = 'élevé'; // environnement du bloc if
    var trace = message; // remonte dans l'environnement de variables
  }

  console.log(total, trace, niveau); // 12 'élevé' 'module'
  // console.log(message); // ReferenceError : l'environnement du bloc est quitté
}

traiter([1, 2, 3]);

function fabriquer() {
  const secret = 'dedans';
  return () => secret; // [[Environment]] = environnement de fabriquer
}
const lire = fabriquer();
console.log(lire()); // 'dedans' : fabriquer a terminé, son environnement survit
```

## Comment ça fonctionne

Quand un **bloc** commence — `if`, boucle, accolades seules —, le moteur crée un nouvel
environnement dont le lien extérieur pointe vers l'environnement lexical courant, puis en
fait l'environnement lexical courant. À la sortie du bloc, il rétablit le précédent. Les
`let` et `const` du bloc vivent donc dans un environnement qui disparaît avec lui. Les `var`,
elles, ont été enregistrées dans l'**environnement de variables** de la fonction pendant la
phase de création : elles survivent au bloc.

Pour résoudre un nom, le moteur interroge l'environnement lexical courant, puis suit les
liens extérieurs. La chaîne de portée **est** cette suite de liens.

Le point décisif est la création des fonctions. Au moment où une fonction est **définie**,
son objet reçoit `[[Environment]]`, la référence vers l'environnement lexical courant. Au
moment où elle est **appelée**, le nouvel environnement de l'appel a pour lien extérieur
cette référence — et non l'environnement de l'appelant. C'est la définition exacte de la
portée lexicale.

C'est aussi la définition d'une closure : tant qu'une fonction est référencée, son
`[[Environment]]` l'est aussi, et le ramasse-miettes ne peut pas libérer cet environnement.
Dans l'exemple, `fabriquer` a terminé, mais `lire` maintient en vie l'environnement où
`secret` est lié. La référence porte sur l'environnement, pas sur une copie des valeurs :
si la liaison change, la closure voit la nouvelle valeur.

Au niveau global d'un script, l'environnement a deux registres : un registre **objet**, qui
correspond aux propriétés de l'objet global et reçoit les `var` et déclarations de
fonction, et un registre **déclaratif** pour `let`, `const` et `class`. C'est pourquoi
`var x` au sommet d'un script crée `window.x`, et `let y` non. Un module ES n'a qu'un
environnement de module, sans lien avec l'objet global.

## Erreurs fréquentes

**Croire qu'une closure copie les valeurs.** Elle référence l'environnement : les
modifications restent visibles.

**Penser que l'appelant fournit l'environnement extérieur.** C'est la définition qui le
fournit, via `[[Environment]]`.

**Confondre les deux environnements.** Les `var` vivent au niveau de la fonction, les `let`
au niveau du bloc.

**Chercher une variable `let` globale sur `window`.** Elle vit dans le registre déclaratif,
pas sur l'objet global.

## À retenir

- Environnement = registre de liaisons + lien vers l'extérieur.
- L'environnement lexical change à chaque bloc ; l'environnement de variables couvre la
  fonction.
- Chaque fonction garde `[[Environment]]`, l'environnement de sa **définition**.
- La chaîne de portée est la suite des liens extérieurs.
- Une closure maintient un environnement en vie, elle ne copie pas ses valeurs.

## Exercices

1. Dessine la chaîne d'environnements visible depuis la ligne marquée, du plus proche au
   plus lointain, en listant les noms liés à chaque niveau.

   ```js
   const appli = 'Atelier';
   function afficher(utilisateur) {
     var titre = 'Profil';
     if (utilisateur) {
       const nom = utilisateur.nom;
       // ← ici
     }
   }
   ```

   :::indice
   Pars du bloc `if`, puis remonte : la fonction, puis le niveau supérieur.
   :::

   :::solution
   1. Environnement du bloc `if` : `nom`.
   2. Environnement de la fonction `afficher` : `utilisateur` et `titre` (la `var` appartient
      à l'environnement de variables de la fonction).
   3. Dans un module ES : l'environnement du module, avec `appli` et `afficher`, puis
      l'environnement global, avec les objets natifs comme `console`. Dans un script
      classique, ces deux niveaux n'en font qu'un : `appli` et `afficher` sont liés
      directement dans l'environnement global.

   Chaque niveau pointe vers le suivant par son lien extérieur ; la résolution de `appli`
   depuis la ligne marquée remonte deux niveaux avant de la trouver.
   :::

2. Explique pourquoi, dans un script classique, ce code affiche `1` puis `undefined`.

   ```js
   var a = 1;
   let b = 2;
   console.log(window.a);
   console.log(window.b);
   ```

   :::indice
   L'environnement global d'un script a deux registres distincts.
   :::

   :::solution
   Le registre **objet** de l'environnement global correspond aux propriétés de `window` : il
   reçoit les `var` et les déclarations de fonction, donc `window.a` vaut 1. Le registre
   **déclaratif** reçoit `let`, `const` et `class` : `b` y est liée, mais n'est pas une
   propriété de `window`, qui renvoie donc `undefined`. Dans un module ES, les deux lignes
   afficheraient `undefined`, car un module a son propre environnement.
   :::

3. Montre que deux appels d'une même fabrique produisent deux environnements indépendants,
   et que chaque closure voit les modifications de son propre environnement.

   :::indice
   Crée deux compteurs, incrémente-en un seul, et lis les deux.
   :::

   :::solution
   ```js
   function creerCompteur() {
     let valeur = 0;
     return {
       incrementer: () => (valeur += 1),
       lire: () => valeur,
     };
   }

   const a = creerCompteur();
   const b = creerCompteur();
   a.incrementer();
   a.incrementer();

   console.log(a.lire(), b.lire()); // 2 0
   ```

   Chaque appel crée un environnement avec sa propre liaison `valeur`. Les deux fonctions
   d'un même compteur partagent le même `[[Environment]]` : `lire` voit ce qu'`incrementer`
   a modifié, ce qui prouve qu'il s'agit d'une référence et non d'une copie.
   :::

## Questions d'entretien

- Quelle différence entre environnement lexical et environnement de variables ?

  :::indice
  Lequel change quand on entre dans un bloc ?
  :::

  :::reponse
  L'environnement de variables d'un contexte contient les `var` et les déclarations de
  fonction ; il est fixé à la création et couvre toute la fonction. L'environnement lexical
  est l'environnement **courant** : il commence égal au précédent, puis un nouvel
  environnement est empilé à chaque bloc pour ses `let`, `const` et `class`, et retiré à la
  sortie. C'est la raison pour laquelle une `var` déclarée dans un `if` survit au bloc, et
  pas un `let`.
  :::

- Qu'est-ce que `[[Environment]]`, et quel rapport avec les closures ?

  :::indice
  Quand cette référence est-elle fixée, et qu'est-ce qu'elle empêche ?
  :::

  :::reponse
  C'est une référence interne portée par chaque objet fonction, fixée à sa **définition** :
  elle pointe vers l'environnement lexical où la fonction a été écrite. À chaque appel, le
  nouvel environnement prend cette référence comme lien extérieur, ce qui donne la portée
  lexicale. Tant que la fonction est référencée, cet environnement ne peut pas être libéré :
  c'est exactement ce qu'on appelle une closure.
  :::

- Pourquoi une `var` globale devient-elle une propriété de `window`, et pas un `let` ?

  :::indice
  L'environnement global d'un script n'est pas un registre unique.
  :::

  :::reponse
  L'environnement global d'un script combine un registre objet, adossé à l'objet global, et un
  registre déclaratif. Les `var` et les déclarations de fonction vont dans le registre objet,
  pour des raisons de compatibilité historique : elles deviennent des propriétés de `window`.
  `let`, `const` et `class` vont dans le registre déclaratif et ne polluent pas l'objet global.
  Dans un module ES, il n'y a qu'un environnement de module, et rien n'est ajouté à `window`.
  :::
