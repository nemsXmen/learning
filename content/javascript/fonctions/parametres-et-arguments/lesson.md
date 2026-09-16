---
id: javascript-fonctions-parametres
title: "Paramètres, arguments et valeurs par défaut"
slug: parametres-et-arguments
technology: javascript
level: beginner
module: fonctions
order: 2
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-functions
skills:
  - functions-parameters
tags:
  - javascript
  - fonctions
---

## Objectifs

- Distinguer un paramètre d'un argument, et savoir ce qui arrive quand ils ne
  correspondent pas.
- Donner des valeurs par défaut, et comprendre quand elles s'appliquent.
- Remplacer une longue liste de paramètres par un objet d'options.

## Introduction

Une fonction est une machine : les paramètres sont ses entrées. Tout ce qui rend une
fonction agréable ou pénible à utiliser se joue là — le nombre d'entrées, leur ordre, ce
qui se passe quand on en oublie une. JavaScript est très permissif sur ce point : il
n'impose ni le nombre d'arguments, ni leur type. À nous de rendre les appels lisibles.

## Concept

| Terme | Où | Exemple |
| --- | --- | --- |
| Paramètre | dans la déclaration | `function saluer(nom)` |
| Argument | à l'appel | `saluer('Ada')` |
| Valeur par défaut | dans la déclaration | `function saluer(nom = 'invité')` |

Ce qui se passe quand les deux ne correspondent pas :

| Appel | Résultat |
| --- | --- |
| Argument manquant | le paramètre vaut `undefined`, ou sa valeur par défaut |
| Argument en trop | il est ignoré |
| `f.length` | le nombre de paramètres avant le premier défaut |

## Exemple

```js
function creerUtilisateur(nom, role = 'membre', actif = true) {
  return { nom, role, actif };
}

console.log(creerUtilisateur('Ada')); // { nom: 'Ada', role: 'membre', actif: true }
console.log(creerUtilisateur('Grace', 'admin')); // role: 'admin'
console.log(creerUtilisateur('Linus', undefined, false)); // role: 'membre', actif: false
console.log(creerUtilisateur('Ken', null)); // role: null : le défaut ne s'applique pas

function aire(largeur, hauteur = largeur) {
  return largeur * hauteur;
}
console.log(aire(3), aire(3, 4)); // 9 12

// Une liste d'arguments illisible à l'appel…
function envoyer(message, urgent, silencieux, archiver) {}
envoyer('Bonjour', true, false, true);

// …devient un objet d'options nommées.
function envoyerOptions(message, { urgent = false, archiver = false } = {}) {
  return `${message} (urgent: ${urgent}, archivé: ${archiver})`;
}
console.log(envoyerOptions('Bonjour', { archiver: true }));
```

## Comment ça fonctionne

Une valeur par défaut s'applique quand l'argument vaut **`undefined`** — qu'il soit absent
ou explicitement `undefined`. Elle ne s'applique pas à `null`, à `0` ni à `''`, qui sont
des valeurs comme les autres.

Le défaut est **évalué à chaque appel**, pas une fois pour toutes : `function f(liste = [])`
crée un tableau neuf à chaque appel, sans le piège de partage qu'on trouve dans d'autres
langages. Il peut aussi utiliser les paramètres déclarés avant lui, comme
`function aire(largeur, hauteur = largeur)`.

Les arguments sont passés **par valeur**. Pour un objet, cette valeur est une référence :
la fonction ne peut pas remplacer l'objet de l'appelant, mais elle peut le **modifier**.

```js
function renommer(utilisateur) {
  utilisateur.nom = 'Modifié'; // visible par l'appelant
  utilisateur = { nom: 'Ignoré' }; // réaffecte la variable locale, sans effet
}
```

Dans une fonction classique, l'objet `arguments` contient tous les arguments reçus, même
non déclarés. Il n'existe pas dans les fonctions fléchées, et les paramètres du reste
`...args`, vus au module suivant, le remplacent avantageusement.

Enfin, `f.length` compte les paramètres **avant** le premier paramètre à valeur par défaut
ou de reste : `(a, b = 1, c) => {}` a une longueur de 1.

## Erreurs fréquentes

**Enchaîner les paramètres booléens.** `envoyer('Bonjour', true, false, true)` est
indéchiffrable à la lecture. Passe un objet d'options.

**Passer `null` en espérant la valeur par défaut.** Seul `undefined` la déclenche.

**Oublier `= {}` sur un paramètre objet destructuré.** `f()` lève alors une `TypeError`.

**Modifier l'objet reçu sans le dire.** L'appelant subit une modification qu'il n'a pas
demandée : travaille sur une copie, ou documente clairement l'intention.

## À retenir

- Paramètre à la déclaration, argument à l'appel ; les arguments en trop sont ignorés.
- Le défaut ne se déclenche que sur `undefined`, jamais sur `null` ou `0`.
- Les défauts sont évalués à chaque appel et peuvent utiliser les paramètres précédents.
- Modifier un objet reçu est visible par l'appelant ; le réaffecter ne l'est pas.
- Au-delà de deux ou trois entrées, un objet d'options se lit mieux.

## Exercices

1. Écris `saluer(nom, salutation)` qui affiche « Bonjour Ada » par défaut, et accepte une
   autre salutation.

   :::indice
   La valeur par défaut se déclare directement dans la liste des paramètres.
   :::

   :::solution
   ```js
   function saluer(nom, salutation = 'Bonjour') {
     return `${salutation} ${nom}`;
   }

   console.log(saluer('Ada')); // 'Bonjour Ada'
   console.log(saluer('Ada', 'Salut')); // 'Salut Ada'
   ```
   :::

2. Transforme `envoyer(message, urgent, silencieux, archiver)` en une fonction dont l'appel
   se lit sans deviner l'ordre des booléens, et qui fonctionne sans second argument.

   :::indice
   Un objet nommé remplace les positions ; le destructuring lui donne des valeurs par défaut.
   :::

   :::indice
   Sans `= {}` à la fin, appeler la fonction sans options lèverait une `TypeError`.
   :::

   :::solution
   ```js
   function envoyer(message, { urgent = false, silencieux = false, archiver = false } = {}) {
     return { message, urgent, silencieux, archiver };
   }

   console.log(envoyer('Bonjour'));
   console.log(envoyer('Alerte', { urgent: true }));
   ```

   À l'appel, chaque option est nommée : plus besoin de compter les positions.
   :::

3. Montre qu'une fonction peut modifier l'objet qu'on lui passe, puis corrige-la pour
   qu'elle laisse l'original intact.

   :::indice
   Modifier une propriété de l'objet reçu, et réaffecter le paramètre, n'ont pas le même
   effet.
   :::

   :::solution
   ```js
   const utilisateur = { nom: 'Ada', role: 'membre' };

   function promouvoir(cible) {
     cible.role = 'admin'; // modifie l'objet de l'appelant
   }
   promouvoir(utilisateur);
   console.log(utilisateur.role); // 'admin'

   function promu(cible) {
     return { ...cible, role: 'admin' }; // renvoie une nouvelle version
   }
   const remis = { nom: 'Ada', role: 'membre' };
   console.log(promu(remis).role, remis.role); // 'admin' 'membre'
   ```
   :::

## Questions d'entretien

- Quelle différence entre un paramètre et un argument ?

  :::indice
  L'un appartient à la déclaration, l'autre à l'appel.
  :::

  :::reponse
  Le paramètre est le nom déclaré entre les parenthèses de la fonction : c'est une variable
  locale. L'argument est la valeur réellement passée lors de l'appel. JavaScript ne vérifie
  ni leur nombre ni leur type : un argument manquant laisse le paramètre à `undefined`, un
  argument en trop est ignoré — accessible seulement via `arguments` ou un paramètre de
  reste.
  :::

- Quand une valeur par défaut s'applique-t-elle ?

  :::indice
  Essaie avec un argument absent, puis `undefined`, `null` et `0`.
  :::

  :::reponse
  Uniquement quand l'argument vaut `undefined`, c'est-à-dire absent ou passé explicitement
  à `undefined`. `null`, `0`, `''` et `false` sont des valeurs légitimes et n'activent pas le
  défaut. Le défaut est réévalué à chaque appel, ce qui rend `= []` ou `= {}` sûrs, et il
  peut s'appuyer sur les paramètres déclarés avant lui.
  :::

- JavaScript passe-t-il les arguments par valeur ou par référence ?

  :::indice
  Que se passe-t-il si la fonction modifie l'objet reçu ? Et si elle le remplace ?
  :::

  :::reponse
  Toujours par valeur. Pour un objet, la valeur copiée est une **référence** : la fonction
  et l'appelant désignent le même objet, donc modifier une propriété est visible des deux
  côtés. En revanche, réaffecter le paramètre ne change que la variable locale : l'appelant
  garde son objet. On résume parfois cela par « passage par partage » ; la conséquence
  pratique est qu'il faut annoncer clairement toute fonction qui modifie ce qu'elle reçoit.
  :::
