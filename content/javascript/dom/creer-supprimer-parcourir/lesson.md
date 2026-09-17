---
id: javascript-dom-creer
title: "Créer, insérer, supprimer et parcourir des éléments"
slug: creer-supprimer-parcourir
technology: javascript
level: intermediate
module: dom
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-dom-modifier
skills:
  - dom-structure
tags:
  - javascript
  - navigateur
---

## Objectifs

- Construire des éléments à partir de données, et les insérer au bon endroit.
- Insérer de nombreux éléments d'un coup avec un fragment ou un `<template>`.
- Supprimer, remplacer et parcourir des éléments en se déplaçant dans l'arbre.

## Introduction

Une page dynamique affiche des données qui n'existaient pas dans le HTML d'origine : les résultats d'une
recherche, les articles d'un panier, les messages d'une conversation. Il faut donc **fabriquer** des
éléments, les placer, puis les retirer quand les données changent. Le DOM moderne offre pour cela des
méthodes simples et sûres, qui remplacent avantageusement la construction de HTML par concaténation de
chaînes.

## Concept

| Action | Méthode |
| --- | --- |
| Créer un élément | `document.createElement('li')` |
| Insérer à la fin / au début d'un parent | `parent.append(...enfants)` / `parent.prepend(...enfants)` |
| Insérer à côté d'un élément | `element.before(...)` / `element.after(...)` |
| Remplacer un élément | `element.replaceWith(nouveau)` |
| Supprimer un élément | `element.remove()` |
| Vider un parent | `parent.replaceChildren()` |
| Copier un élément | `element.cloneNode(true)` |
| Insérer beaucoup d'éléments | un `DocumentFragment`, ou le contenu d'un `<template>` |

Se déplacer dans l'arbre :

| Direction | Propriété |
| --- | --- |
| Parent | `parentElement` ; ancêtre qui correspond : `closest(selecteur)` |
| Enfants | `children`, `firstElementChild`, `lastElementChild` |
| Voisins | `previousElementSibling`, `nextElementSibling` |

`append` accepte aussi des chaînes, insérées comme **texte** : `parent.append('Total : ', total)`.

## Exemple

```js
document.body.innerHTML = `
  <ul id="panier"></ul>
  <template id="modele-article">
    <li class="article"><span class="nom"></span> <button class="retirer">Retirer</button></li>
  </template>`;

const articles = [
  { id: 1, nom: 'Clavier' },
  { id: 2, nom: 'Souris' },
  { id: 3, nom: 'Écran' },
];

const panier = document.getElementById('panier');
const modele = document.getElementById('modele-article');
const fragment = document.createDocumentFragment();

for (const { id, nom } of articles) {
  const copie = modele.content.cloneNode(true);
  const ligne = copie.querySelector('.article');
  ligne.dataset.id = id;
  ligne.querySelector('.nom').textContent = nom;
  fragment.append(copie);
}
panier.append(fragment); // une seule insertion dans la page
console.log(panier.children.length); // 3

const souris = panier.querySelector('[data-id="2"]');
console.log(souris.previousElementSibling.dataset.id, souris.nextElementSibling.dataset.id); // '1' '3'

const promo = document.createElement('li');
promo.className = 'promotion';
promo.append('Code BIENVENUE : -10 %');
panier.prepend(promo);

souris.remove();
panier.querySelector('[data-id="3"]').replaceWith(Object.assign(document.createElement('li'), { textContent: 'Écran 27 pouces' }));
console.log(Array.from(panier.children, (li) => li.textContent.trim()));
// ['Code BIENVENUE : -10 %', 'Clavier Retirer', 'Écran 27 pouces']

panier.replaceChildren();
console.log(panier.children.length); // 0
```

## Comment ça fonctionne

Un élément créé avec `createElement` existe en mémoire, mais n'apparaît pas tant qu'il n'est pas **inséré**
dans le document. On peut donc le préparer entièrement — classe, texte, attributs, enfants — avant de
l'ajouter en une seule opération. Insérer un élément déjà présent dans la page le **déplace** : un nœud
n'a qu'un seul parent à la fois.

Chaque modification du document peut obliger le navigateur à recalculer la mise en page. Insérer cent
lignes une par une dans une liste affichée multiplie ce travail. Un **`DocumentFragment`** est un conteneur
léger, hors du document : on y ajoute toutes les lignes, puis on insère le fragment en une fois. Le fragment
se vide alors de ses enfants, transférés dans la page. `append` accepte aussi plusieurs arguments, ce qui
suffit souvent pour quelques éléments.

L'élément **`<template>`** contient du HTML qui n'est ni affiché ni actif : les images ne se chargent pas, les
scripts ne s'exécutent pas. Sa propriété `content` est un fragment qu'on copie avec `cloneNode(true)` pour
chaque donnée. Le balisage reste lisible dans le HTML, et les valeurs sont insérées avec `textContent`, donc
sans risque d'injection — l'alternative sûre à la construction de chaînes passées à `innerHTML`.

Pour supprimer, `element.remove()` retire l'élément de son parent, et `parent.replaceChildren()` sans argument
vide un conteneur. Un élément retiré de la page n'est pas forcément libéré : s'il reste référencé par une
variable ou par un écouteur d'événement, il demeure en mémoire. C'est le cas classique des éléments
**détachés** qu'on retrouve dans les instantanés mémoire.

Pour **parcourir**, on préfère les propriétés qui ne voient que les éléments : `parentElement`, `children`,
`nextElementSibling`. Les versions sans « Element » — `childNodes`, `nextSibling` — incluent les nœuds de
texte, y compris les espaces entre les balises, et surprennent souvent.

Enfin, reconstruire toute une liste à chaque changement est simple et suffisant pour de petites listes. Les
bibliothèques d'interface comme React calculent à la place les modifications minimales ; comprendre ces
opérations de base permet de savoir ce qu'elles font sous le capot.

## Erreurs fréquentes

**Construire du HTML par concaténation avec des données.** Crée les éléments ou utilise un `<template>`.

**Insérer les éléments un par un dans une grande liste affichée.** Passe par un fragment.

**Croire qu'insérer un élément existant le copie.** Il est déplacé : utilise `cloneNode(true)`.

**Oublier `true` dans `cloneNode`.** Sans lui, les enfants ne sont pas copiés.

**Parcourir avec `nextSibling` et tomber sur du texte.** Utilise `nextElementSibling`.

## À retenir

- `createElement` prépare un élément ; il n'apparaît qu'une fois inséré.
- `append`, `prepend`, `before`, `after`, `replaceWith`, `remove` couvrent les insertions et suppressions.
- Un fragment ou un `<template>` insère de nombreux éléments en une opération, sans `innerHTML`.
- Insérer un élément existant le déplace ; `cloneNode(true)` le copie avec ses enfants.
- Pour parcourir : `parentElement`, `children`, `nextElementSibling`.

## Exercices

1. Écris `afficherListe(conteneur, taches)` qui vide le conteneur puis affiche une ligne `<li>` par tâche, avec la
   classe `faite` pour les tâches terminées, en une seule insertion.

   :::indice
   `replaceChildren()` pour vider, un fragment pour préparer les lignes, puis un seul `append`.
   :::

   :::solution
   ```js
   document.body.innerHTML = '<ul id="taches"><li>ancienne</li></ul>';

   function afficherListe(conteneur, taches) {
     const fragment = document.createDocumentFragment();
     for (const tache of taches) {
       const ligne = document.createElement('li');
       ligne.textContent = tache.titre;
       ligne.classList.toggle('faite', tache.faite);
       fragment.append(ligne);
     }
     conteneur.replaceChildren(fragment);
   }

   const liste = document.getElementById('taches');
   afficherListe(liste, [{ titre: 'Écrire le test', faite: true }, { titre: 'Corriger le bug', faite: false }]);
   console.log(liste.children.length, liste.querySelectorAll('.faite').length); // 2 1
   ```

   `replaceChildren(fragment)` vide et insère en une seule opération ; le second argument de `toggle` force l'état
   de la classe.
   :::

2. Dans une liste de lignes `.article`, écris `monter(ligne)` et `descendre(ligne)` qui échangent une ligne avec sa
   voisine, sans rien faire aux extrémités.

   :::indice
   Insérer un élément existant le déplace : `precedente.before(ligne)` place la ligne juste avant sa voisine.
   :::

   :::solution
   ```js
   document.body.innerHTML = '<ul><li class="article">A</li><li class="article">B</li><li class="article">C</li></ul>';

   function monter(ligne) {
     const precedente = ligne.previousElementSibling;
     if (precedente) precedente.before(ligne);
   }

   function descendre(ligne) {
     const suivante = ligne.nextElementSibling;
     if (suivante) suivante.after(ligne);
   }

   const [a, , c] = document.querySelectorAll('.article');
   monter(c);
   descendre(a);
   monter(document.querySelector('li')); // déjà en tête : rien ne change
   const ordre = () => Array.from(document.querySelectorAll('.article'), (li) => li.textContent).join('');
   console.log(ordre()); // 'CAB'
   ```

   `monter(c)` donne A C B, puis `descendre(a)` échange A et C : C A B. Le dernier appel porte sur la première
   ligne, qui n'a pas de voisine précédente : l'ordre ne change pas.
   :::

3. Cette fonction construit les lignes d'un tableau par concaténation de chaînes. Réécris-la avec le `<template>`
   fourni, sans `innerHTML`, pour qu'un nom contenant du HTML s'affiche comme du texte.

   ```js
   function afficherContacts(corps, contacts) {
     corps.innerHTML = contacts.map((c) => '<tr><td>' + c.nom + '</td><td>' + c.email + '</td></tr>').join('');
   }
   ```

   ```html
   <template id="modele-contact"><tr><td class="nom"></td><td class="email"></td></tr></template>
   ```

   :::indice
   Pour chaque contact, clone le contenu du modèle, remplis les cellules avec `textContent`, puis insère le tout
   en une fois.
   :::

   :::solution
   ```js
   document.body.innerHTML = `
     <table><tbody id="contacts"></tbody></table>
     <template id="modele-contact"><tr><td class="nom"></td><td class="email"></td></tr></template>`;

   function afficherContacts(corps, contacts) {
     const modele = document.getElementById('modele-contact');
     const lignes = contacts.map(({ nom, email }) => {
       const copie = modele.content.cloneNode(true);
       copie.querySelector('.nom').textContent = nom;
       copie.querySelector('.email').textContent = email;
       return copie;
     });
     corps.replaceChildren(...lignes);
   }

   const corps = document.getElementById('contacts');
   afficherContacts(corps, [
     { nom: 'Ada', email: 'ada@exemple.fr' },
     { nom: '<b>Mallory</b>', email: 'm@exemple.fr' },
   ]);
   console.log(corps.rows.length, corps.querySelector('b')); // 2 null
   ```
   :::

## Questions d'entretien

- Pourquoi utiliser un `DocumentFragment` pour insérer beaucoup d'éléments ?

  :::indice
  Combien de fois le document est-il modifié dans chaque approche ?
  :::

  :::reponse
  Un fragment est un conteneur hors du document : on y prépare tous les éléments sans toucher à la page, puis on
  l'insère en une seule opération, et il se vide de ses enfants au passage. Le document n'est modifié qu'une fois,
  ce qui évite des recalculs répétés de mise en page quand on ajoute de nombreuses lignes à une liste affichée.
  `append` avec plusieurs arguments, ou `replaceChildren`, offre le même avantage pour un tableau d'éléments.
  :::

- À quoi sert l'élément `<template>` ?

  :::indice
  Son contenu est-il affiché ? Actif ?
  :::

  :::reponse
  `<template>` contient du HTML inerte : non affiché, sans chargement d'images ni exécution de scripts. On clone son
  `content` pour chaque donnée, on remplit les copies avec `textContent`, puis on les insère. Le balisage reste
  lisible dans le HTML, et les données ne sont jamais interprétées comme du HTML, ce qui évite les injections
  qu'entraîne la construction de chaînes passées à `innerHTML`.
  :::

- Que se passe-t-il quand on insère un élément qui est déjà dans la page ?

  :::indice
  Un nœud peut-il avoir deux parents ?
  :::

  :::reponse
  Il est **déplacé** : un nœud n'appartient qu'à un seul parent, donc l'insérer ailleurs le retire de sa position
  d'origine. C'est pratique pour réordonner une liste sans recréer d'éléments. Pour obtenir une copie, on utilise
  `cloneNode(true)`, qui duplique l'élément et ses descendants — mais pas les écouteurs d'événements attachés avec
  `addEventListener`.
  :::
