---
id: javascript-debug-console
title: "Déboguer avec la console, au-delà de console.log"
slug: console
technology: javascript
level: beginner
module: debugging
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-throw-error
skills:
  - console-debugging
tags:
  - javascript
  - debogage
---

## Objectifs

- Afficher des valeurs lisibles et nommées, et choisir la bonne méthode de `console` pour chaque besoin.
- Mesurer une durée, compter des passages et vérifier une hypothèse sans interrompre le programme.
- Éviter le piège des objets affichés par référence dans les outils du navigateur.

## Introduction

`console.log` est le premier outil de débogage de tout développeur JavaScript, et souvent le seul.
Bien utilisé, il est rapide et efficace ; mal utilisé, il noie l'information dans des dizaines de
lignes anonymes. L'objet `console` offre pourtant une dizaine de méthodes qui répondent chacune à une
question précise : que contient cet objet, combien de fois passe-t-on ici, combien de temps cela
prend-il, d'où vient cet appel ?

## Concept

| Question | Méthode | Exemple |
| --- | --- | --- |
| Que vaut cette variable ? | `console.log({ variable })` | affiche `{ total: 70 }`, nom compris |
| Que contient ce tableau d'objets ? | `console.table(liste)` | un tableau aligné par propriété |
| Quelle est la structure complète ? | `console.dir(objet, { depth: null })` | sans limite de profondeur, dans Node.js |
| Combien de fois passe-t-on ici ? | `console.count(libelle)` | `clic: 1`, `clic: 2` |
| Cette hypothèse est-elle vraie ? | `console.assert(condition, message)` | n'affiche que si la condition est fausse |
| Combien de temps cela prend-il ? | `console.time(libelle)` / `console.timeEnd(libelle)` | `calcul: 0.21ms` |
| Qui a appelé cette fonction ? | `console.trace(message)` | la pile d'appels à cet endroit |
| Comment regrouper des messages ? | `console.group(titre)` / `console.groupEnd()` | messages indentés et repliables |
| Quel niveau d'importance ? | `console.warn`, `console.error` | filtrables dans la console |

## Exemple

```js
const commande = {
  id: 42,
  articles: [
    { nom: 'clavier', prix: 50, quantite: 1 },
    { nom: 'câble', prix: 5, quantite: 4 },
  ],
};

function calculerTotal(commande) {
  console.group(`commande ${commande.id}`);
  let total = 0;
  for (const article of commande.articles) {
    const ligne = article.prix * article.quantite;
    console.log({ article: article.nom, ligne }); // chaque valeur affichée avec son nom
    total += ligne;
  }
  console.assert(total > 0, 'total nul pour la commande', commande.id); // silencieux si vrai
  console.groupEnd();
  return total;
}

console.table(commande.articles); // les articles, alignés en colonnes
console.time('calcul');
const total = calculerTotal(commande);
console.timeEnd('calcul'); // 'calcul: 0.2ms', par exemple
console.log({ total }); // { total: 70 }

for (const evenement of ['clic', 'clic', 'survol']) {
  console.count(evenement); // 'clic: 1', 'clic: 2', 'survol: 1'
}
```

## Comment ça fonctionne

Écrire `console.log({ total })` plutôt que `console.log(total)` utilise le raccourci de propriété : on
affiche un objet dont la clé est le nom de la variable. Quand dix messages s'enchaînent, chaque valeur
reste identifiable, sans avoir à écrire `'total :'` à la main.

Dans les DevTools d'un navigateur, un objet affiché n'est **pas une copie** : la console garde une
référence, et quand on déplie l'objet plus tard, on voit son état **actuel**, pas celui du moment de
l'appel. Un objet modifié juste après le `console.log` semble donc avoir eu sa valeur finale dès le
départ, ce qui envoie le diagnostic sur une fausse piste. Pour figer l'état, on affiche une copie :
`console.log(structuredClone(etat))`, ou `JSON.stringify(etat)` pour des données simples. Dans Node.js,
l'objet est converti en texte immédiatement, et le problème ne se pose pas.

`console.assert` exprime une **hypothèse** : il ne dit rien tant qu'elle est vraie, et affiche
« Assertion failed » avec le message quand elle est fausse, sans interrompre le programme. On peut
ainsi semer des vérifications dans un code suspect et ne lire que les échecs. `console.count` compte les
passages par libellé — utile pour découvrir qu'un gestionnaire d'événement est attaché deux fois.

`console.time` et `console.timeEnd` mesurent une durée entre deux points du code. Ils donnent un ordre de
grandeur, suffisant pour repérer une opération anormalement lente ; pour des mesures fines, le chapitre
suivant présente les outils de performance.

`console.trace` affiche la pile d'appels à l'endroit où il est appelé, sans lever d'erreur : il répond à
la question « par quel chemin arrive-t-on ici ? ». Les niveaux `warn` et `error` s'affichent en couleur et
peuvent être filtrés dans les DevTools, ce qui aide à retrouver les messages importants.

Enfin, les messages de débogage ne doivent pas rester dans le code livré : ils encombrent la console,
peuvent exposer des données, et coûtent un peu. Une règle de lint comme `no-console` les signale.

## Erreurs fréquentes

**Afficher des valeurs sans nom.** Utilise `console.log({ variable })`.

**Faire confiance à un objet déplié plus tard dans le navigateur.** Affiche une copie pour figer l'état.

**Multiplier les `console.log` au hasard.** Formule une hypothèse, puis affiche ce qui la confirme ou
l'infirme.

**Laisser les messages de débogage dans le code livré.** Retire-les, ou passe par un vrai journal.

**Afficher un tableau d'objets avec `console.log`.** `console.table` le rend lisible.

## À retenir

- `console.log({ variable })` affiche chaque valeur avec son nom.
- `table` pour les listes d'objets, `dir` pour les structures profondes, `trace` pour la pile.
- `assert` ne parle qu'en cas d'échec ; `count` compte les passages ; `time` mesure une durée.
- Dans le navigateur, un objet affiché est une référence : affiche une copie pour figer l'état.
- Les messages de débogage ne restent pas dans le code livré.

## Exercices

1. Un gestionnaire de clic semble s'exécuter deux fois par clic. Sans point d'arrêt, écris ce qu'il faut
   ajouter pour le confirmer, puis corrige le défaut.

   ```js
   function initialiser(bouton, compteur) {
     bouton.addEventListener('click', () => compteur.valeur++);
   }
   ```

   :::indice
   `console.count` compte les passages. Qui appelle `initialiser`, et combien de fois ?
   :::

   :::solution
   ```js
   function initialiser(bouton, compteur) {
     console.count('initialiser'); // révèle un second appel
     bouton.addEventListener('click', () => {
       console.count('clic traité');
       compteur.valeur++;
     });
   }
   ```

   Si `initialiser: 2` apparaît, deux écouteurs identiques sont attachés. On corrige en appelant
   `initialiser` une seule fois, ou en protégeant l'attachement :

   ```js
   const initialises = new WeakSet();
   function initialiser(bouton, compteur) {
     if (initialises.has(bouton)) return;
     initialises.add(bouton);
     bouton.addEventListener('click', () => compteur.valeur++);
   }
   ```
   :::

2. Dans le navigateur, ce code affiche un panier qui semble déjà contenir trois articles au premier
   `console.log`. Explique pourquoi, puis modifie l'affichage pour voir l'état réel de chaque étape.

   ```js
   const panier = { articles: [] };
   panier.articles.push('clavier');
   console.log(panier);
   panier.articles.push('souris', 'écran');
   console.log(panier);
   ```

   :::indice
   Qu'est-ce que la console du navigateur conserve : une copie de l'objet, ou une référence vers lui ?
   :::

   :::solution
   La console du navigateur garde une **référence** vers l'objet. Quand on déplie le premier message
   après l'exécution, elle affiche l'objet dans son état actuel, avec trois articles. Il faut afficher
   une copie, figée au moment de l'appel.

   ```js
   const panier = { articles: [] };
   panier.articles.push('clavier');
   console.log(structuredClone(panier)); // { articles: ['clavier'] }
   panier.articles.push('souris', 'écran');
   console.log(structuredClone(panier)); // { articles: ['clavier', 'souris', 'écran'] }
   ```
   :::

3. `moyenne` renvoie parfois `NaN`. Ajoute des assertions qui ne parlent qu'en cas d'anomalie, trouve le
   cas fautif, puis corrige la fonction.

   ```js
   function moyenne(notes) {
     const somme = notes.reduce((total, note) => total + note, 0);
     return somme / notes.length;
   }
   ```

   :::indice
   Formule les hypothèses : les notes sont des nombres, et la liste n'est pas vide.
   :::

   :::solution
   ```js
   function moyenneInstrumentee(notes) {
     console.assert(notes.length > 0, 'liste de notes vide');
     console.assert(notes.every(Number.isFinite), 'note non numérique dans', notes);
     const somme = notes.reduce((total, note) => total + note, 0);
     return somme / notes.length;
   }

   moyenneInstrumentee([12, 15]); // aucun message
   moyenneInstrumentee([]); // 'Assertion failed: liste de notes vide' → 0 / 0 donne NaN

   function moyenne(notes) {
     if (notes.length === 0) {
       return null;
     }
     return notes.reduce((total, note) => total + note, 0) / notes.length;
   }

   console.log(moyenne([12, 15]), moyenne([])); // 13.5 null
   ```

   Les assertions ont confirmé l'hypothèse sans interrompre le programme ; la correction, elle, traite
   explicitement le cas vide.
   :::

## Questions d'entretien

- Pourquoi `console.log({ variable })` plutôt que `console.log(variable)` ?

  :::indice
  Que devient la lisibilité quand dix messages s'enchaînent ?
  :::

  :::reponse
  Le raccourci de propriété crée un objet dont la clé est le nom de la variable : chaque valeur affichée
  est étiquetée sans effort, et l'on peut en afficher plusieurs d'un coup, `console.log({ total, taux })`.
  Quand de nombreux messages se succèdent, on sait immédiatement à quoi correspond chaque valeur, ce qui
  évite des erreurs de lecture pendant le diagnostic.
  :::

- Pourquoi un objet affiché dans la console du navigateur peut-il induire en erreur ?

  :::indice
  La console affiche-t-elle l'état du moment de l'appel ou l'état au moment où on déplie l'objet ?
  :::

  :::reponse
  Parce que la console du navigateur conserve une référence vers l'objet, et l'évalue quand on le déplie.
  Si l'objet a été modifié entre-temps, on voit son état final, pas celui du moment du `console.log`, et
  l'on conclut à tort qu'une valeur était déjà présente. Pour figer l'état, on affiche une copie avec
  `structuredClone` ou `JSON.stringify`, ou l'on pose un point d'arrêt.
  :::

- Quand préférer `console.assert` à `console.log` ?

  :::indice
  Que se passe-t-il quand la condition est vraie ?
  :::

  :::reponse
  Quand on veut vérifier une hypothèse plutôt qu'afficher une valeur. `console.assert(condition, message)`
  reste silencieux tant que la condition est vraie, et n'affiche un message que lorsqu'elle est fausse,
  sans interrompre le programme. On peut ainsi semer des vérifications dans un code suspect et ne lire que
  les anomalies, au lieu de parcourir des centaines de lignes de journal.
  :::
