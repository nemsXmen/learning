---
id: javascript-evenements
title: "Écouter des événements : addEventListener et l'objet Event"
slug: ecouter-des-evenements
technology: javascript
level: beginner
module: evenements
order: 1
estimatedMinutes: 30
difficulty: 2
xp: 70
prerequisites:
  - javascript-dom-modifier
  - javascript-callbacks
skills:
  - dom-events
tags:
  - javascript
  - navigateur
---

## Objectifs

- Réagir à un clic, une saisie, une touche ou une soumission avec `addEventListener`.
- Lire l'objet événement : `type`, `target`, `currentTarget`, `key`.
- Retirer un écouteur, avec `removeEventListener`, l'option `once` ou un `AbortController`.

## Introduction

Une page ne fait rien tant que l'utilisateur n'agit pas : il clique, tape, fait défiler, envoie un
formulaire. Chacune de ces actions produit un **événement**, et le navigateur appelle les fonctions qu'on
a enregistrées pour lui. C'est l'application directe du modèle asynchrone vu plus tôt : les écouteurs sont
des callbacks placés dans la file des macrotâches, exécutés quand la pile est vide.

## Concept

```js
element.addEventListener(type, ecouteur, options);
```

| Famille | Types courants |
| --- | --- |
| Souris et pointeur | `click`, `dblclick`, `pointerdown`, `mouseover` |
| Clavier | `keydown`, `keyup` — la touche est dans `event.key` |
| Formulaire | `input` à chaque saisie, `change` à la validation d'une valeur, `submit` |
| Focus | `focus`, `blur`, `focusin`, `focusout` |
| Document | `DOMContentLoaded`, `scroll`, `resize` |

Propriétés de l'objet événement :

| Propriété | Contenu |
| --- | --- |
| `type` | le nom de l'événement |
| `target` | l'élément sur lequel l'événement s'est produit |
| `currentTarget` | l'élément auquel **cet** écouteur est attaché |
| `key` | la touche, pour le clavier : `'Enter'`, `'Escape'`, `'a'` |

Options utiles : `{ once: true }` retire l'écouteur après le premier appel, `{ signal }` le retire quand un
`AbortController` est annulé, `{ passive: true }` promet de ne pas appeler `preventDefault`.

## Exemple

```js
document.body.innerHTML = `
  <label>Recherche <input id="recherche"></label>
  <p id="apercu"></p>
  <button id="compteur">Cliqué 0 fois</button>`;

const recherche = document.getElementById('recherche');
const apercu = document.getElementById('apercu');
recherche.addEventListener('input', (event) => {
  apercu.textContent = `Recherche : ${event.target.value}`;
});
recherche.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.currentTarget.value = '';
    apercu.textContent = '';
  }
});

let clics = 0;
const bouton = document.getElementById('compteur');
function compter() {
  clics += 1;
  bouton.textContent = `Cliqué ${clics} fois`;
}
bouton.addEventListener('click', compter);

bouton.click();
bouton.click();
bouton.removeEventListener('click', compter); // même référence de fonction : retrait effectif
bouton.click();
console.log(bouton.textContent); // 'Cliqué 2 fois'

recherche.value = 'clavier';
recherche.dispatchEvent(new Event('input'));
console.log(apercu.textContent); // 'Recherche : clavier'
recherche.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
console.log(JSON.stringify(recherche.value), JSON.stringify(apercu.textContent)); // "" ""
```

## Comment ça fonctionne

Quand l'utilisateur agit, le navigateur crée un objet événement et appelle, dans l'ordre d'enregistrement,
les écouteurs du type correspondant. Ces appels sont des macrotâches : un écouteur long bloque la page, et
une modification du DOM faite dans un écouteur n'est dessinée qu'à la fin de la tâche.

`addEventListener` permet d'attacher **plusieurs** écouteurs au même événement, contrairement à l'ancienne
écriture `bouton.onclick = f`, qui remplace l'écouteur précédent. Pour en retirer un avec
`removeEventListener`, il faut passer **la même référence de fonction** et les mêmes options de capture :
une fonction fléchée écrite directement dans l'appel ne peut donc jamais être retirée, puisqu'on n'en garde
aucune référence. Deux solutions modernes évitent ce piège : `{ once: true }` pour un écouteur qui ne doit
servir qu'une fois, et `{ signal }` avec un `AbortController`, dont l'appel à `abort()` retire en une fois tous
les écouteurs qui partagent ce signal — idéal quand un composant est détruit.

`target` et `currentTarget` ne désignent pas toujours le même élément. `target` est l'élément réellement
touché, par exemple une icône à l'intérieur d'un bouton ; `currentTarget` est l'élément auquel l'écouteur est
attaché, le bouton. Dans un écouteur écrit en fonction classique, `this` vaut `currentTarget`, comme vu dans
la partie Runtime ; lire `event.currentTarget` est plus explicite et fonctionne aussi avec une fonction fléchée.

Les événements de formulaire se ressemblent mais diffèrent. `input` se déclenche à chaque modification de la
valeur, lettre par lettre ; `change` se déclenche quand la valeur est validée, en général à la perte du focus
pour un champ texte, immédiatement pour une case à cocher ou une liste. `submit` se déclenche sur le
formulaire, et non sur le bouton, que la soumission vienne d'un clic ou de la touche Entrée : c'est donc
l'événement à écouter pour traiter un formulaire.

Pour le clavier, `event.key` donne la touche logique — `'Enter'`, `'Escape'`, `'a'` — en tenant compte de la
disposition du clavier ; les anciennes propriétés numériques comme `keyCode` sont obsolètes.

## Erreurs fréquentes

**Passer une fonction anonyme puis tenter de la retirer.** Garde une référence, ou utilise `once` ou `signal`.

**Écrire `bouton.addEventListener('click', compter())`.** La fonction est appelée tout de suite ; passe `compter`.

**Écouter `click` sur le bouton d'un formulaire.** La touche Entrée soumet sans clic : écoute `submit`.

**Confondre `target` et `currentTarget`.** Pour l'élément de l'écouteur, lis `currentTarget`.

**Oublier de retirer les écouteurs d'un composant supprimé.** Ils retiennent le composant en mémoire.

## À retenir

- `addEventListener(type, ecouteur, options)` attache un écouteur, sans remplacer les autres.
- `target` : l'élément touché ; `currentTarget` : l'élément de l'écouteur.
- `input` à chaque saisie, `change` à la validation, `submit` sur le formulaire.
- `removeEventListener` exige la même référence de fonction.
- `{ once: true }` et `{ signal }` retirent les écouteurs sans garder de référence.

## Exercices

1. Écris un compteur de caractères : sous une zone de texte limitée à 140 caractères, affiche « 23 / 140 » à
   chaque saisie, et ajoute la classe `limite` au compteur au-delà de 120.

   :::indice
   L'événement `input` se déclenche à chaque modification ; la longueur est `event.target.value.length`.
   :::

   :::solution
   ```js
   document.body.innerHTML = '<textarea id="message" maxlength="140"></textarea><p id="compteur">0 / 140</p>';

   const message = document.getElementById('message');
   const compteur = document.getElementById('compteur');

   message.addEventListener('input', (event) => {
     const longueur = event.target.value.length;
     compteur.textContent = `${longueur} / 140`;
     compteur.classList.toggle('limite', longueur > 120);
   });

   message.value = 'x'.repeat(125);
   message.dispatchEvent(new Event('input'));
   console.log(compteur.textContent, compteur.classList.contains('limite')); // '125 / 140' true
   ```
   :::

2. Traite ce formulaire d'inscription : empêche le rechargement, lis l'email avec `FormData`, et affiche
   « Adresse invalide » dans `#erreur` si elle ne contient pas `@`, sinon « Inscription enregistrée ».

   ```html
   <form id="inscription"><input name="email"><button>S'inscrire</button></form>
   <p id="erreur"></p>
   ```

   :::indice
   Écoute `submit` sur le formulaire, appelle `event.preventDefault()`, puis
   `new FormData(event.currentTarget).get('email')`.
   :::

   :::solution
   ```js
   document.body.innerHTML = `
     <form id="inscription"><input name="email"><button>S'inscrire</button></form>
     <p id="erreur"></p>`;

   const formulaire = document.getElementById('inscription');
   const retour = document.getElementById('erreur');

   formulaire.addEventListener('submit', (event) => {
     event.preventDefault();
     const email = String(new FormData(event.currentTarget).get('email')).trim();
     retour.textContent = email.includes('@') ? 'Inscription enregistrée' : 'Adresse invalide';
   });

   formulaire.elements.email.value = 'ada.exemple.fr';
   formulaire.requestSubmit();
   console.log(retour.textContent); // 'Adresse invalide'
   formulaire.elements.email.value = 'ada@exemple.fr';
   formulaire.requestSubmit();
   console.log(retour.textContent); // 'Inscription enregistrée'
   ```

   `requestSubmit()` simule une vraie soumission, qui déclenche l'événement `submit` — contrairement à `submit()`.
   :::

3. Une fenêtre modale écoute la touche Échap sur le document pour se fermer. Écris `ouvrirModale(modale)` qui pose les
   écouteurs nécessaires et les retire tous à la fermeture, sans garder de référence aux fonctions.

   :::indice
   Un `AbortController` créé à l'ouverture ; son `signal` est passé à chaque `addEventListener`, et `abort()` est
   appelé à la fermeture.
   :::

   :::solution
   ```js
   document.body.innerHTML = '<div id="modale" hidden><button class="fermer">Fermer</button></div>';

   function ouvrirModale(modale) {
     const controleur = new AbortController();
     const { signal } = controleur;
     modale.hidden = false;

     function fermer() {
       console.log('modale fermée');
       modale.hidden = true;
       controleur.abort(); // retire tous les écouteurs liés au signal
     }

     document.addEventListener('keydown', (event) => {
       if (event.key === 'Escape') fermer();
     }, { signal });
     modale.querySelector('.fermer').addEventListener('click', fermer, { signal });
   }

   const modale = document.getElementById('modale');
   ouvrirModale(modale);
   document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
   document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); // plus d'écouteur
   console.log(modale.hidden); // true, et « modale fermée » n'a été affiché qu'une fois
   ```
   :::

## Questions d'entretien

- Quelle différence entre `event.target` et `event.currentTarget` ?

  :::indice
  Pense à un clic sur une icône placée dans un bouton qui porte l'écouteur.
  :::

  :::reponse
  `target` est l'élément sur lequel l'événement s'est réellement produit, par exemple l'icône. `currentTarget` est
  l'élément auquel l'écouteur en cours d'exécution est attaché, ici le bouton. `target` reste identique pendant tout
  le trajet de l'événement, alors que `currentTarget` change à chaque élément traversé. On lit `currentTarget` pour
  l'élément qu'on gère, et `target` pour savoir précisément ce qui a été touché.
  :::

- Pourquoi `removeEventListener` ne retire-t-il parfois rien ?

  :::indice
  Que faut-il lui passer exactement ?
  :::

  :::reponse
  Parce qu'il faut lui passer la même référence de fonction et la même option de capture qu'à l'ajout. Une fonction
  fléchée écrite directement dans `addEventListener` n'est référencée nulle part, et une nouvelle fonction identique
  en apparence est un autre objet : rien n'est retiré. On garde la fonction dans une variable, ou on utilise
  `{ once: true }` ou un `AbortController` et son `signal`, qui retirent l'écouteur sans référence.
  :::

- Quelle différence entre les événements `input` et `change` ?

  :::indice
  À quel moment chacun se déclenche-t-il pour un champ texte ?
  :::

  :::reponse
  `input` se déclenche à chaque modification de la valeur, caractère par caractère : il sert aux retours immédiats,
  comme une recherche instantanée ou un compteur. `change` se déclenche quand la valeur est validée : à la perte du
  focus pour un champ texte, et immédiatement pour une case à cocher, un bouton radio ou une liste déroulante. Il
  convient aux traitements plus lourds, comme un enregistrement.
  :::
