---
id: javascript-currying
title: "Fonctions qui renvoient des fonctions : currying et composition"
slug: currying-et-composition
technology: javascript
level: advanced
module: fonctions-avancees
order: 4
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-callbacks
skills:
  - currying-composition
tags:
  - javascript
  - fonctions
---

## Objectifs

- Écrire une fonction qui renvoie une fonction, et comprendre ce qu'elle retient.
- Fabriquer une version spécialisée d'une fonction par application partielle.
- Enchaîner des transformations avec une composition, et savoir quand s'en abstenir.

## Introduction

Une fonction peut recevoir une fonction ; elle peut aussi en **renvoyer** une. Cela permet
de fabriquer des fonctions sur mesure à partir d'une fonction générale : une seule fonction
`multiplier` donne `doubler` et `tripler`. C'est la base du style fonctionnel — puissant,
et facile à pousser trop loin, ce que ce chapitre dit aussi.

## Concept

| Technique | Idée | Exemple |
| --- | --- | --- |
| Fabrique | une fonction renvoie une fonction configurée | `multiplier(2)` donne `doubler` |
| Application partielle | fixer une partie des arguments maintenant, le reste plus tard | `journal('info')` |
| Currying | transformer `f(a, b)` en `f(a)(b)` | `somme(1)(2)` |
| Composition | enchaîner des fonctions, la sortie de l'une devenant l'entrée de la suivante | `pipe(trim, majuscules)` |

Deux ordres d'enchaînement existent :

- `pipe(f, g)(x)` vaut `g(f(x))` — on lit de gauche à droite, dans l'ordre d'exécution ;
- `compose(f, g)(x)` vaut `f(g(x))` — l'ordre des mathématiques, de droite à gauche.

## Exemple

```js
const multiplier = (facteur) => (nombre) => nombre * facteur;

const doubler = multiplier(2);
const tripler = multiplier(3);
console.log(doubler(5), tripler(5)); // 10 15
console.log(multiplier(10)(5)); // 50 : les deux appels d'affilée

const journal = (niveau) => (message) => `[${niveau}] ${message}`;
const info = journal('info');
console.log(info('serveur démarré')); // '[info] serveur démarré'

const pipe = (...fonctions) => (valeur) =>
  fonctions.reduce((resultat, fonction) => fonction(resultat), valeur);

const nettoyer = pipe(
  (texte) => texte.trim(),
  (texte) => texte.toLowerCase(),
  (texte) => texte.replaceAll(' ', '-'),
);
console.log(nettoyer('  Mon Titre  ')); // 'mon-titre'

console.log([1, 2, 3].map(multiplier(10))); // [10, 20, 30]
```

## Comment ça fonctionne

Quand `multiplier(2)` s'exécute, la fonction interne est créée et **retient** `facteur`.
Cette mémoire s'appelle une closure : c'est le sujet du module 13, et c'est elle qui rend
tout ce chapitre possible. `doubler` n'est pas une copie de `multiplier` : c'est une
fonction d'un seul paramètre, attachée à un environnement où `facteur` vaut 2.

Le **currying** transforme une fonction à plusieurs paramètres en une chaîne de fonctions à
un paramètre : `somme(1, 2)` devient `somme(1)(2)`. L'**application partielle** est plus
souple : elle fixe certains arguments et laisse les autres, sans imposer un appel par
argument. En pratique, c'est l'application partielle qu'on utilise le plus, pour fabriquer
des variantes spécialisées d'une fonction générale.

L'intérêt principal apparaît avec les fonctions d'ordre supérieur : `map(multiplier(10))` se
lit mieux que `map((n) => n * 10)` quand la transformation porte un nom métier, et ce nom
peut être testé isolément.

La composition s'écrit avec `reduce` : on part de la valeur d'entrée et on applique chaque
fonction au résultat de la précédente. `pipe` suit l'ordre de lecture ; `compose` suit la
notation mathématique. Les deux exigent des fonctions à **un seul argument**, ce qui est
précisément ce que produit l'application partielle.

Le revers est réel : une composition de fonctions anonymes rend les piles d'appels opaques,
et une fonction curryfiée à trois niveaux se débogue mal. Le style fonctionnel se justifie
quand il nomme des étapes réutilisables, pas quand il remplace une suite d'instructions
parfaitement claire.

## Erreurs fréquentes

**Confondre `pipe` et `compose`.** L'ordre des fonctions est inversé : vérifie lequel tu
utilises.

**Curryfier une fonction variadique.** Une fonction à nombre libre d'arguments ne sait pas
quand elle a tout reçu ; le currying suppose une arité connue.

**Composer des fonctions à plusieurs arguments.** Chaque étape ne reçoit qu'une valeur :
applique partiellement d'abord.

**Abstraire trop tôt.** Une `pipe` de trois fonctions anonymes utilisée une seule fois est
plus difficile à lire que trois lignes successives.

## À retenir

- Une fonction qui renvoie une fonction retient ses arguments par closure.
- Application partielle : fixer une partie des arguments pour fabriquer une variante.
- Currying : `f(a, b)` devient `f(a)(b)`, un argument à la fois.
- `pipe` se lit de gauche à droite, `compose` de droite à gauche.
- Ces outils servent à **nommer** des étapes, pas à compresser du code.

## Exercices

1. Écris `multiplier` de sorte que `multiplier(2)(5)` vaille 10, puis fabrique `doubler` et
   `tripler`.

   :::indice
   La fonction externe reçoit le facteur et renvoie une fonction qui reçoit le nombre.
   :::

   :::solution
   ```js
   const multiplier = (facteur) => (nombre) => nombre * facteur;

   const doubler = multiplier(2);
   const tripler = multiplier(3);

   console.log(multiplier(2)(5), doubler(5), tripler(5)); // 10 10 15
   console.log([1, 2, 3].map(doubler)); // [2, 4, 6]
   ```
   :::

2. Écris `pipe(...fonctions)` qui renvoie une fonction appliquant chaque transformation dans
   l'ordre, et utilise-la pour transformer `'  Mon Titre  '` en `'mon-titre'`.

   :::indice
   `reduce` part de la valeur d'entrée et applique chaque fonction au résultat précédent.
   :::

   :::indice
   `pipe` renvoie une fonction : c'est donc une fonction qui renvoie une fonction.
   :::

   :::solution
   ```js
   const pipe = (...fonctions) => (valeur) =>
     fonctions.reduce((resultat, fonction) => fonction(resultat), valeur);

   const versSlug = pipe(
     (texte) => texte.trim(),
     (texte) => texte.toLowerCase(),
     (texte) => texte.replaceAll(' ', '-'),
   );

   console.log(versSlug('  Mon Titre  ')); // 'mon-titre'
   ```
   :::

3. À partir de `journal(niveau, message)`, fabrique `info` et `erreur` sans réécrire la
   logique.

   :::indice
   Fixe le premier argument maintenant, laisse le second pour plus tard.
   :::

   :::solution
   ```js
   const journal = (niveau) => (message) => `[${niveau}] ${message}`;

   const info = journal('info');
   const erreur = journal('erreur');

   console.log(info('serveur démarré')); // '[info] serveur démarré'
   console.log(erreur('connexion perdue')); // '[erreur] connexion perdue'
   ```

   Sans currying, la même idée s'écrit avec une fonction ordinaire :
   `const info = (message) => journalComplet('info', message)`. C'est souvent plus lisible, et
   parfaitement légitime.
   :::

## Questions d'entretien

- Quelle différence entre currying et application partielle ?

  :::indice
  Combien d'arguments chaque appel accepte-t-il ?
  :::

  :::reponse
  Le currying transforme une fonction de `n` arguments en `n` fonctions d'un argument :
  `f(a, b, c)` devient `f(a)(b)(c)`. L'application partielle fixe simplement une partie des
  arguments et renvoie une fonction attendant le reste, sans contrainte sur le découpage :
  `partielle(f, a, b)` peut encore accepter `c` et `d` ensemble. Le currying est une forme
  stricte ; l'application partielle est ce dont on a besoin la plupart du temps.
  :::

- À quoi sert une fonction `pipe` ?

  :::indice
  Que devient une suite d'appels imbriqués quand on la compose ?
  :::

  :::reponse
  À nommer et enchaîner des transformations : `pipe(trim, minuscules, slugifier)` remplace
  `slugifier(minuscules(trim(texte)))`, qui se lit de l'intérieur vers l'extérieur. Chaque
  étape est une fonction à un argument, testable séparément et réutilisable ailleurs. La
  composition n'apporte rien si les étapes n'ont pas de nom propre : trois instructions
  successives sont alors plus claires.
  :::

- Quand faut-il éviter ce style ?

  :::indice
  Pense au lecteur du code et à la pile d'appels d'une erreur.
  :::

  :::reponse
  Quand l'abstraction n'est utilisée qu'une fois, quand les fonctions composées sont anonymes
  — la pile d'appels devient illisible au moment du diagnostic —, ou quand la fonction de
  départ est variadique, auquel cas le currying n'a pas d'arité fixe à respecter. Le critère
  est simple : si chaque étape mérite un nom et sera réutilisée, ce style aide ; sinon, il
  ajoute une couche à traverser pour rien.
  :::
