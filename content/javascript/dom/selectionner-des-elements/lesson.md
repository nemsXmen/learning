---
id: javascript-dom-selection
title: "Le DOM et la sélection d'éléments"
slug: selectionner-des-elements
technology: javascript
level: beginner
module: dom
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-objets-creer
skills:
  - dom-selection
tags:
  - javascript
  - navigateur
---

## Objectifs

- Comprendre ce qu'est le DOM : une représentation vivante de la page, sous forme d'arbre d'objets.
- Sélectionner des éléments avec `querySelector`, `querySelectorAll` et `closest`.
- Distinguer une liste statique d'une collection vivante, et éléments de nœuds.

## Introduction

Le navigateur lit le HTML et construit en mémoire un arbre d'objets : le **DOM**, pour *Document
Object Model*. Chaque balise devient un objet avec des propriétés et des méthodes, et modifier ces
objets modifie immédiatement la page affichée. Tout ce que JavaScript fait dans une page — afficher un
message, réagir à un clic, remplir une liste — commence par la même étape : trouver le bon élément.

## Concept

L'objet `document` est la racine. Pour y trouver des éléments :

| Méthode | Renvoie | Remarque |
| --- | --- | --- |
| `document.querySelector(selecteur)` | le premier élément correspondant, ou `null` | n'importe quel sélecteur CSS |
| `document.querySelectorAll(selecteur)` | une `NodeList` **statique** | photographie au moment de l'appel |
| `document.getElementById(id)` | l'élément, ou `null` | le plus direct pour un identifiant |
| `document.getElementsByClassName(nom)` | une `HTMLCollection` **vivante** | se met à jour avec la page |
| `element.querySelector(selecteur)` | cherche seulement **dans** cet élément | limite la recherche |
| `element.closest(selecteur)` | l'ancêtre le plus proche qui correspond, lui-même compris | remonte l'arbre |
| `element.matches(selecteur)` | `true` si l'élément correspond | teste sans chercher |

Les sélecteurs sont ceux du CSS : `#id`, `.classe`, `li.produit`, `[data-id="2"]`, `ul > li:first-child`.

## Exemple

```js
document.body.innerHTML = `
  <main id="catalogue">
    <ul class="produits">
      <li class="produit" data-id="1"><span class="nom">Clavier</span></li>
      <li class="produit" data-id="2"><span class="nom">Souris</span></li>
    </ul>
  </main>`;

const catalogue = document.getElementById('catalogue');
const premier = catalogue.querySelector('.produit');
console.log(premier.textContent); // 'Clavier'

const tous = document.querySelectorAll('.produit');
console.log(tous.length); // 2
tous.forEach((produit) => console.log(produit.dataset.id)); // '1', puis '2'

const souris = document.querySelector('[data-id="2"]');
const nom = souris.querySelector('.nom');
console.log(nom.closest('.produit') === souris); // true : l'ancêtre le plus proche
console.log(souris.matches('li.produit')); // true

console.log(document.querySelector('.inexistant')); // null : toujours tester avant d'utiliser

const statique = document.querySelectorAll('.produit');
const vivante = document.getElementsByClassName('produit');
const nouveau = document.createElement('li');
nouveau.className = 'produit';
document.querySelector('.produits').append(nouveau);
console.log(statique.length, vivante.length); // 2 3 : seule la collection vivante a suivi
```

## Comment ça fonctionne

Le DOM est un **arbre de nœuds**. Les éléments — `<main>`, `<li>`, `<span>` — sont des nœuds, mais les
textes aussi, y compris les espaces et retours à la ligne entre les balises, et les commentaires. C'est
pourquoi le DOM offre deux familles de propriétés : `childNodes`, `firstChild` et `nextSibling` parcourent
**tous** les nœuds, alors que `children`, `firstElementChild` et `nextElementSibling` ne voient que les
**éléments**. Dans la plupart des cas, ce sont les éléments qui intéressent.

`querySelector` utilise le moteur de sélecteurs CSS du navigateur : tout ce qu'on écrit dans une feuille de
style fonctionne, et la recherche s'arrête au premier résultat dans l'ordre du document. Appelée sur un
élément plutôt que sur `document`, elle ne cherche que dans ses descendants, ce qui est plus rapide et
évite de sélectionner par erreur un élément d'une autre partie de la page.

`querySelectorAll` renvoie une `NodeList` **statique** : c'est une photographie, qui ne change pas quand la
page change. Elle possède `forEach`, mais pas `map` ni `filter` : on la convertit avec `Array.from` ou le
spread. `getElementsByClassName` et `getElementsByTagName` renvoient au contraire une `HTMLCollection`
**vivante**, qui se met à jour à chaque modification du document — pratique parfois, déroutante souvent,
notamment quand on retire des éléments en la parcourant.

`closest` remonte l'arbre à partir d'un élément, en commençant par lui-même, et renvoie le premier ancêtre
qui correspond au sélecteur. C'est l'outil central de la délégation d'événements, vue au module suivant :
à partir de l'élément précis qui a été cliqué, on retrouve la carte ou la ligne qui le contient.

Une sélection qui ne trouve rien renvoie `null`. Appeler une propriété sur ce `null` est l'erreur la plus
fréquente du code DOM : `Cannot read properties of null`. Elle signale souvent un sélecteur mal écrit, ou un
script exécuté avant que le HTML correspondant existe — d'où l'attribut `defer` sur les balises `<script>`,
ou le chargement en module, qui attendent que le document soit analysé.

## Erreurs fréquentes

**Utiliser le résultat d'une sélection sans tester `null`.** Vérifie, ou échoue avec un message explicite.

**Exécuter un script avant que le HTML existe.** Utilise `defer` ou `type="module"`.

**Appeler `map` sur une `NodeList`.** Convertis-la avec `Array.from`.

**Parcourir une `HTMLCollection` vivante en retirant des éléments.** La collection rétrécit pendant la boucle.

**Chercher dans tout le document ce qui se trouve dans un composant.** Cherche depuis l'élément parent.

## À retenir

- Le DOM est un arbre de nœuds ; `children` et `nextElementSibling` ne voient que les éléments.
- `querySelector` renvoie le premier élément ou `null` ; `querySelectorAll` une `NodeList` statique.
- `getElementsByClassName` renvoie une collection vivante.
- `closest` remonte jusqu'à l'ancêtre qui correspond ; `matches` teste un élément.
- Un script qui manipule le DOM doit s'exécuter après l'analyse du HTML.

## Exercices

1. Dans le HTML de l'exemple, récupère le tableau des noms de produits, puis l'identifiant du produit dont le nom
   est « Souris ».

   :::indice
   `querySelectorAll` puis `Array.from` pour utiliser `map` et `find` ; `closest` pour remonter du nom au produit.
   :::

   :::solution
   ```js
   const noms = Array.from(document.querySelectorAll('.produit .nom'), (nom) => nom.textContent);
   console.log(noms); // ['Clavier', 'Souris']

   const nomSouris = Array.from(document.querySelectorAll('.nom')).find((nom) => nom.textContent === 'Souris');
   console.log(nomSouris.closest('.produit').dataset.id); // '2'
   ```

   Le second argument d'`Array.from` transforme chaque élément au passage, sans `map` supplémentaire.
   :::

2. Ce code lève `Cannot read properties of null (reading 'textContent')`. Donne deux causes possibles, et écris
   une fonction `texteDe(selecteur)` qui échoue avec un message explicite.

   ```js
   const total = document.querySelector('#total-panier').textContent;
   ```

   :::indice
   Soit l'élément n'existe pas avec ce sélecteur, soit il n'existe pas **encore** au moment de l'exécution.
   :::

   :::solution
   Première cause : le sélecteur ne correspond à aucun élément — faute de frappe, identifiant renommé. Seconde
   cause : le script s'exécute avant que le HTML soit analysé, par exemple un `<script>` placé dans `<head>` sans
   `defer`.

   ```js
   function texteDe(selecteur, racine = document) {
     const element = racine.querySelector(selecteur);
     if (!element) {
       throw new Error(`Élément introuvable : ${selecteur}`);
     }
     return element.textContent;
   }

   document.body.innerHTML = '<p id="total">42 €</p>';
   console.log(texteDe('#total')); // '42 €'
   try {
     texteDe('#total-panier');
   } catch (erreur) {
     console.log(erreur.message); // 'Élément introuvable : #total-panier'
   }
   ```
   :::

3. On veut retirer tous les éléments ayant la classe `temporaire`. Explique pourquoi cette boucle en oublie un sur
   deux, puis corrige.

   ```js
   const temporaires = document.getElementsByClassName('temporaire');
   for (let i = 0; i < temporaires.length; i++) {
     temporaires[i].remove();
   }
   ```

   :::indice
   Que devient la collection vivante après chaque suppression ?
   :::

   :::solution
   `getElementsByClassName` renvoie une collection **vivante** : à chaque `remove`, l'élément disparaît de la
   collection, les suivants se décalent d'un index, et `i++` saute celui qui vient de prendre la place.

   ```js
   document.body.innerHTML = '<p class="temporaire">1</p><p class="temporaire">2</p><p class="temporaire">3</p>';

   document.querySelectorAll('.temporaire').forEach((element) => element.remove());
   console.log(document.querySelectorAll('.temporaire').length); // 0
   ```

   La `NodeList` statique renvoyée par `querySelectorAll` ne change pas pendant la boucle.
   :::

## Questions d'entretien

- Qu'est-ce que le DOM ?

  :::indice
  Quelle relation entre le HTML, cet arbre d'objets et ce qui est affiché ?
  :::

  :::reponse
  Le DOM est la représentation en mémoire du document, construite par le navigateur à partir du HTML : un arbre
  de nœuds — éléments, textes, commentaires — exposés comme des objets avec des propriétés et des méthodes.
  JavaScript le lit et le modifie, et le navigateur répercute ces modifications à l'écran. Le HTML n'est que le
  point de départ : après chargement, c'est le DOM qui décrit la page, et il peut s'en écarter complètement.
  :::

- Quelle différence entre `querySelectorAll` et `getElementsByClassName` ?

  :::indice
  Que se passe-t-il pour chaque résultat quand la page change ?
  :::

  :::reponse
  `querySelectorAll` accepte n'importe quel sélecteur CSS et renvoie une `NodeList` statique, figée au moment de
  l'appel. `getElementsByClassName` ne cherche que par classe et renvoie une `HTMLCollection` vivante, mise à jour
  à chaque modification du document. La collection vivante surprend quand on ajoute ou retire des éléments en la
  parcourant ; `querySelectorAll` est le choix par défaut dans le code moderne.
  :::

- À quoi sert `closest` ?

  :::indice
  Pense à un clic sur une icône à l'intérieur d'une carte produit.
  :::

  :::reponse
  `closest(selecteur)` remonte l'arbre depuis un élément, lui-même compris, et renvoie le premier ancêtre qui
  correspond au sélecteur, ou `null`. On l'utilise pour retrouver le conteneur significatif d'un élément
  précis : la carte produit à partir de l'icône cliquée, la ligne de tableau à partir d'un bouton. C'est la pièce
  centrale de la délégation d'événements.
  :::
