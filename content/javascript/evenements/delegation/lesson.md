---
id: javascript-delegation
title: "Délégation d'événements"
slug: delegation
technology: javascript
level: intermediate
module: evenements
order: 3
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-propagation
  - javascript-dom-creer
skills:
  - event-delegation
tags:
  - javascript
  - navigateur
---

## Objectifs

- Gérer les événements de nombreux éléments avec un seul écouteur posé sur leur conteneur.
- Retrouver l'élément concerné avec `closest`, et lire ses données.
- Faire fonctionner des éléments ajoutés après coup sans écouteur supplémentaire.

## Introduction

Une liste de tâches affiche un bouton « Supprimer » par ligne. Attacher un écouteur à chaque bouton pose deux
problèmes : cent lignes font cent écouteurs, et chaque ligne ajoutée plus tard doit recevoir le sien, sans
oublier de le retirer à la suppression. La **délégation** exploite le bouillonnement : un seul écouteur sur la
liste reçoit tous les clics de ses descendants, et identifie celui qui l'intéresse.

## Concept

```js
conteneur.addEventListener('click', (event) => {
  const bouton = event.target.closest('.supprimer');
  if (!bouton || !conteneur.contains(bouton)) return;
  // traiter le bouton trouvé
});
```

| Étape | Rôle |
| --- | --- |
| Écouteur sur le conteneur | reçoit, par bouillonnement, les événements de tous les descendants |
| `event.target.closest(selecteur)` | remonte de l'élément touché jusqu'à l'élément significatif |
| Test `null` | ignore les clics qui ne concernent aucun élément ciblé |
| `conteneur.contains(element)` | écarte un ancêtre situé hors du conteneur |
| `element.dataset` | lit l'identifiant ou l'action portés par l'élément |

Un attribut `data-action` permet même de gérer plusieurs actions avec le même écouteur.

## Exemple

```js
document.body.innerHTML = `
  <form id="ajout"><input name="titre"><button>Ajouter</button></form>
  <ul id="taches">
    <li data-id="1"><span>Écrire le test</span> <button data-action="terminer">✓</button> <button data-action="supprimer">✕</button></li>
  </ul>`;

const liste = document.getElementById('taches');
let prochainId = 2;

liste.addEventListener('click', (event) => {
  const bouton = event.target.closest('button[data-action]');
  if (!bouton || !liste.contains(bouton)) return;

  const ligne = bouton.closest('li');
  if (bouton.dataset.action === 'supprimer') {
    ligne.remove();
  } else if (bouton.dataset.action === 'terminer') {
    ligne.classList.toggle('terminee');
  }
});

document.getElementById('ajout').addEventListener('submit', (event) => {
  event.preventDefault();
  const titre = new FormData(event.currentTarget).get('titre');
  const ligne = document.createElement('li');
  ligne.dataset.id = prochainId++;
  const texte = document.createElement('span');
  texte.textContent = titre;
  const terminer = Object.assign(document.createElement('button'), { textContent: '✓' });
  terminer.dataset.action = 'terminer';
  ligne.append(texte, ' ', terminer);
  liste.append(ligne); // aucun écouteur à ajouter
});

const formulaire = document.getElementById('ajout');
formulaire.elements.titre.value = 'Corriger le bug';
formulaire.requestSubmit();

liste.querySelector('[data-id="2"] [data-action="terminer"]').click(); // ligne ajoutée après coup
liste.querySelector('[data-id="1"] [data-action="supprimer"]').click();

console.log(Array.from(liste.children, (li) => `${li.dataset.id}:${li.classList.contains('terminee')}`));
// ['2:true']
```

## Comment ça fonctionne

Un clic sur le bouton « ✓ » d'une ligne bouillonne jusqu'à la liste, dont l'écouteur s'exécute avec
`event.target` égal à l'élément exact cliqué. Cet élément n'est pas toujours celui qu'on attend : le clic peut
tomber sur un `<span>` ou une icône à l'intérieur du bouton. `closest('button[data-action]')` résout ce problème
en remontant jusqu'au bouton, ou renvoie `null` si le clic a eu lieu ailleurs dans la liste — sur le texte d'une
ligne, par exemple —, auquel cas l'écouteur ne fait rien.

Le test `liste.contains(bouton)` couvre un cas plus rare : si la liste est elle-même placée dans un bouton ou un
élément correspondant au sélecteur, `closest` pourrait remonter **au-delà** du conteneur et trouver un ancêtre
extérieur. Vérifier l'appartenance rend l'écouteur robuste quel que soit le contexte d'intégration.

La délégation apporte trois avantages. Un **seul écouteur**, quelle que soit la taille de la liste. Les
éléments **ajoutés plus tard** fonctionnent immédiatement, puisque l'écouteur est sur le conteneur, qui existe
depuis le début. Et rien n'est à **nettoyer** quand une ligne disparaît : aucun écouteur ne reste attaché à un
élément retiré de la page. C'est pourquoi les bibliothèques d'interface l'utilisent en interne.

L'attribut `data-action` rend l'écouteur déclaratif : le HTML dit ce que fait chaque bouton, et l'écouteur
aiguille vers la bonne opération. Ajouter une action consiste à ajouter un bouton et une branche — ou mieux, une
entrée dans un objet qui associe chaque action à sa fonction.

La délégation a des limites. Elle repose sur le bouillonnement : pour `focus` et `blur`, on délègue avec
`focusin` et `focusout`. Et pour des événements très fréquents comme `mousemove` ou `scroll`, un écouteur
global exécuté à chaque mouvement sur toute une zone doit rester très léger.

## Erreurs fréquentes

**Utiliser `event.target` directement comme bouton.** Le clic peut viser un enfant : utilise `closest`.

**Oublier le cas `null`.** Un clic hors des éléments ciblés fait alors planter l'écouteur.

**Déléguer au document entier par facilité.** Choisis le conteneur le plus proche.

**Déléguer `focus` ou `blur`.** Ils ne bouillonnent pas : utilise `focusin` et `focusout`.

**Continuer à attacher un écouteur par élément ajouté.** L'écouteur du conteneur suffit.

## À retenir

- Un écouteur sur le conteneur reçoit, par bouillonnement, les événements de tous ses descendants.
- `event.target.closest(selecteur)` retrouve l'élément significatif, ou `null`.
- Les éléments ajoutés plus tard fonctionnent sans écouteur supplémentaire.
- `data-action` et `dataset` rendent le traitement déclaratif.
- Pour les événements qui ne bouillonnent pas, on délègue leurs équivalents qui bouillonnent.

## Exercices

1. Un tableau affiche une ligne par produit avec un bouton « Ajouter au panier » portant `data-id`. Écris un seul
   écouteur qui ajoute l'identifiant au tableau `panier`, y compris quand le clic tombe sur l'icône du bouton.

   :::indice
   `closest('button[data-id]')` remonte depuis l'icône jusqu'au bouton.
   :::

   :::solution
   ```js
   document.body.innerHTML = `
     <table id="produits"><tbody>
       <tr><td>Clavier</td><td><button data-id="7"><i class="icone"></i> Ajouter au panier</button></td></tr>
       <tr><td>Souris</td><td><button data-id="9"><i class="icone"></i> Ajouter au panier</button></td></tr>
     </tbody></table>`;

   const panier = [];
   const tableau = document.getElementById('produits');

   tableau.addEventListener('click', (event) => {
     const bouton = event.target.closest('button[data-id]');
     if (!bouton || !tableau.contains(bouton)) return;
     panier.push(Number(bouton.dataset.id));
   });

   tableau.querySelector('[data-id="9"] .icone').click(); // clic sur l'icône
   tableau.querySelector('td').click(); // clic hors d'un bouton : ignoré
   console.log(panier); // [9]
   ```
   :::

2. Remplace la chaîne de `if` de l'exemple par un objet qui associe chaque valeur de `data-action` à une fonction, et
   ajoute une action `dupliquer` qui insère une copie de la ligne juste après elle.

   :::indice
   `actions[bouton.dataset.action]?.(ligne)` appelle la fonction si l'action existe.
   :::

   :::solution
   ```js
   document.body.innerHTML = `
     <ul id="taches">
       <li data-id="1"><span>Écrire le test</span> <button data-action="dupliquer">⧉</button></li>
     </ul>`;

   const liste = document.getElementById('taches');
   const actions = {
     supprimer: (ligne) => ligne.remove(),
     terminer: (ligne) => ligne.classList.toggle('terminee'),
     dupliquer: (ligne) => ligne.after(ligne.cloneNode(true)),
   };

   liste.addEventListener('click', (event) => {
     const bouton = event.target.closest('button[data-action]');
     if (!bouton || !liste.contains(bouton)) return;
     actions[bouton.dataset.action]?.(bouton.closest('li'));
   });

   liste.querySelector('[data-action="dupliquer"]').click();
   liste.querySelectorAll('[data-action="dupliquer"]')[1].click(); // la copie fonctionne aussi
   console.log(liste.children.length); // 3
   ```

   La copie créée par `cloneNode` n'a aucun écouteur, et pourtant son bouton fonctionne : c'est la délégation.
   :::

3. Un formulaire contient des dizaines de champs. Affiche le nom du champ actif dans `#aide` quand il reçoit le focus,
   avec un seul écouteur posé sur le formulaire.

   :::indice
   `focus` ne bouillonne pas ; son équivalent qui bouillonne permet de déléguer.
   :::

   :::solution
   ```js
   document.body.innerHTML = `
     <form id="profil"><input name="nom"><input name="email"><input name="ville"></form>
     <p id="aide"></p>`;

   const formulaire = document.getElementById('profil');
   const aide = document.getElementById('aide');

   formulaire.addEventListener('focusin', (event) => {
     if (event.target.matches('input[name]')) {
       aide.textContent = `Champ actif : ${event.target.name}`;
     }
   });

   formulaire.elements.email.focus();
   console.log(aide.textContent); // 'Champ actif : email'
   ```
   :::

## Questions d'entretien

- Qu'est-ce que la délégation d'événements, et quels problèmes résout-elle ?

  :::indice
  Pense au nombre d'écouteurs et aux éléments ajoutés après le chargement.
  :::

  :::reponse
  C'est le fait de poser un seul écouteur sur un conteneur plutôt qu'un écouteur par élément, en s'appuyant sur le
  bouillonnement pour recevoir les événements des descendants. Elle réduit le nombre d'écouteurs, fait fonctionner
  automatiquement les éléments ajoutés plus tard, et évite d'avoir à retirer des écouteurs quand des éléments sont
  supprimés. Dans l'écouteur, on identifie l'élément concerné avec `event.target.closest`.
  :::

- Pourquoi utiliser `closest` plutôt qu'`event.target` directement ?

  :::indice
  Sur quel élément le clic tombe-t-il quand un bouton contient une icône ?
  :::

  :::reponse
  Parce que `event.target` est l'élément le plus profond touché, qui peut être un enfant de l'élément voulu : une
  icône, un `<span>` dans un bouton. `closest` remonte de cet élément jusqu'au premier ancêtre correspondant au
  sélecteur, lui-même compris, et renvoie `null` si le clic n'était dans aucun élément ciblé. On vérifie aussi que
  l'élément trouvé appartient bien au conteneur.
  :::

- Quelles sont les limites de la délégation ?

  :::indice
  Pense aux événements qui ne bouillonnent pas, et à ceux qui se produisent très souvent.
  :::

  :::reponse
  Elle ne fonctionne qu'avec les événements qui bouillonnent : pour `focus`, `blur`, `mouseenter` ou `mouseleave`, il
  faut utiliser leurs équivalents `focusin`, `focusout`, `mouseover` et `mouseout`. Pour les événements très
  fréquents, comme `mousemove`, l'écouteur est exécuté pour chaque mouvement sur toute la zone et doit rester très
  léger. Enfin, un `stopPropagation` posé plus bas empêche l'événement d'atteindre le conteneur.
  :::
