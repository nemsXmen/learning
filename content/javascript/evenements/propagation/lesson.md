---
id: javascript-propagation
title: "Propagation : capture, bouillonnement, preventDefault et stopPropagation"
slug: propagation
technology: javascript
level: intermediate
module: evenements
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-evenements
skills:
  - event-propagation
tags:
  - javascript
  - navigateur
---

## Objectifs

- Décrire les trois phases d'un événement : capture, cible, bouillonnement.
- Distinguer `preventDefault`, qui annule l'action par défaut, de `stopPropagation`, qui arrête le trajet.
- Savoir quels événements ne remontent pas, et comment les écouter quand même.

## Introduction

Un clic sur un bouton est aussi un clic sur le formulaire qui le contient, sur la section, sur le corps de la
page. L'événement ne reste pas sur l'élément cliqué : il **voyage** dans l'arbre. Ce trajet explique pourquoi
un écouteur posé sur un parent reçoit les clics de ses enfants, pourquoi un clic dans une fenêtre modale peut
la fermer par erreur, et comment empêcher un lien de naviguer.

## Concept

Un événement parcourt l'arbre en trois phases :

| Phase | Trajet | Écouteurs appelés |
| --- | --- | --- |
| 1. Capture | de `window` jusqu'au parent de la cible | ceux posés avec `{ capture: true }` |
| 2. Cible | sur l'élément concerné | tous ceux de la cible |
| 3. Bouillonnement | de la cible jusqu'à `window` | ceux posés sans option de capture, le cas par défaut |

Après le trajet, le navigateur exécute l'**action par défaut** : suivre un lien, soumettre un formulaire,
cocher une case.

| Méthode | Effet |
| --- | --- |
| `event.preventDefault()` | annule l'action par défaut ; le trajet continue |
| `event.stopPropagation()` | arrête le trajet vers les autres éléments ; l'action par défaut a lieu |
| `event.stopImmediatePropagation()` | arrête aussi les autres écouteurs du même élément |

Certains événements **ne bouillonnent pas** : `focus`, `blur`, `mouseenter`, `mouseleave`. Leurs équivalents
`focusin`, `focusout`, `mouseover` et `mouseout` bouillonnent.

## Exemple

```js
document.body.innerHTML = `
  <section id="section">
    <form id="formulaire">
      <input id="email" name="email" value="ada@exemple.fr">
      <button id="envoyer">Envoyer</button>
    </form>
  </section>`;

const trajet = [];
const section = document.getElementById('section');
const bouton = document.getElementById('envoyer');

section.addEventListener('click', () => trajet.push('section — capture'), { capture: true });
section.addEventListener('click', (e) => trajet.push(`section — bouillonnement, cible ${e.target.id}`));
bouton.addEventListener('click', () => trajet.push('bouton — cible'));

document.getElementById('formulaire').addEventListener('submit', (event) => {
  event.preventDefault(); // pas de rechargement de la page
  trajet.push(`soumission annulée pour ${new FormData(event.currentTarget).get('email')}`);
});

bouton.click();
console.log(trajet);
// ['section — capture', 'bouton — cible', 'section — bouillonnement, cible envoyer',
//  'soumission annulée pour ada@exemple.fr']

const focus = [];
section.addEventListener('focus', () => focus.push('focus'));
section.addEventListener('focusin', () => focus.push('focusin'));
document.getElementById('email').focus();
console.log(focus); // ['focusin'] : focus ne bouillonne pas
```

## Comment ça fonctionne

Le navigateur calcule d'abord le **chemin** de l'événement : la liste des ancêtres de la cible, de `window`
jusqu'à elle. Il le parcourt ensuite vers le bas pour la phase de capture, appelle les écouteurs de la cible,
puis remonte le chemin pour la phase de bouillonnement. La plupart des écouteurs sont posés en bouillonnement,
ce qui correspond à l'intuition : l'élément le plus précis réagit en premier, puis ses conteneurs. La capture
sert surtout aux cas où un conteneur doit intervenir **avant** ses enfants, par exemple pour intercepter tous
les clics d'une zone.

Pendant tout ce trajet, `event.target` reste l'élément d'origine, alors que `event.currentTarget` change à
chaque étape. C'est ce qui permet à un seul écouteur posé sur un parent de savoir quel enfant a été touché —
le principe de la délégation, sujet du chapitre suivant.

`preventDefault` et `stopPropagation` agissent sur deux choses indépendantes. Le premier annule l'**action
par défaut** du navigateur — suivre un lien, soumettre un formulaire, insérer un caractère — mais laisse
l'événement continuer son trajet. Le second arrête le **trajet**, mais n'annule rien : un lien dont l'écouteur
appelle seulement `stopPropagation` navigue quand même. Pour savoir si l'action a été annulée, on lit
`event.defaultPrevented`. Un événement n'est annulable que s'il est `cancelable`, ce qui est le cas de `click`,
`submit` ou `keydown`, mais pas de `scroll`.

`stopPropagation` est à utiliser avec parcimonie. Il masque l'événement pour tous les écouteurs situés plus
haut, y compris ceux dont on ignore l'existence : une bibliothèque qui ferme un menu quand on clique ailleurs,
un outil de mesure d'audience. Une meilleure approche consiste souvent à vérifier, dans l'écouteur du parent,
d'où vient l'événement — `event.target.closest(...)`.

Les écouteurs **passifs** — `{ passive: true }` — promettent de ne pas appeler `preventDefault`. Pour les
événements de défilement et de toucher, cette promesse permet au navigateur de faire défiler la page sans
attendre la fin de l'écouteur, ce qui rend le défilement fluide.

Enfin, `focus` et `blur` ne bouillonnent pas, pour des raisons historiques. Pour réagir au focus de n'importe
quel champ d'un formulaire depuis le formulaire lui-même, on écoute `focusin` et `focusout`.

## Erreurs fréquentes

**Utiliser `stopPropagation` pour empêcher un lien de naviguer.** C'est `preventDefault` qu'il faut.

**Arrêter la propagation par précaution.** D'autres écouteurs légitimes ne reçoivent plus rien.

**Écouter `focus` sur un conteneur.** Il ne remonte pas : écoute `focusin`.

**Appeler `preventDefault` dans un écouteur passif.** L'appel est ignoré.

**Supposer que `currentTarget` reste l'élément cliqué.** Il change à chaque étape du trajet.

## À retenir

- Trois phases : capture vers le bas, cible, bouillonnement vers le haut.
- Par défaut, les écouteurs réagissent au bouillonnement.
- `preventDefault` annule l'action par défaut, `stopPropagation` arrête le trajet : ils sont indépendants.
- `focus`, `blur`, `mouseenter` ne bouillonnent pas ; `focusin` et `focusout` si.
- `{ passive: true }` fluidifie le défilement en renonçant à `preventDefault`.

## Exercices

1. Un clic sur le lien « Supprimer » doit afficher une confirmation au lieu de naviguer, et ce clic ne doit pas
   ouvrir la carte, qui s'ouvre quand on clique ailleurs dessus. Écris les deux écouteurs sans
   `stopPropagation`.

   :::indice
   `preventDefault` sur le lien ; dans l'écouteur de la carte, ignore les clics dont la cible est dans le lien.
   :::

   :::solution
   ```js
   document.body.innerHTML = `
     <article class="carte">
       <h2>Commande 42</h2>
       <a class="supprimer" href="/commandes/42/supprimer">Supprimer</a>
     </article>`;

   const journal = [];
   const carte = document.querySelector('.carte');

   carte.querySelector('.supprimer').addEventListener('click', (event) => {
     event.preventDefault();
     journal.push('confirmation demandée');
   });

   carte.addEventListener('click', (event) => {
     if (event.target.closest('.supprimer')) return;
     journal.push('carte ouverte');
   });

   carte.querySelector('.supprimer').click();
   carte.querySelector('h2').click();
   console.log(journal); // ['confirmation demandée', 'carte ouverte']
   ```

   Sans `stopPropagation`, d'autres écouteurs plus haut dans la page reçoivent toujours le clic.
   :::

2. Cliquer **dans** le contenu de la modale la ferme, alors que seul un clic sur le fond sombre devrait le faire.
   Explique pourquoi et corrige.

   ```js
   const fond = document.querySelector('.fond');
   fond.addEventListener('click', () => fond.remove());
   ```

   ```html
   <div class="fond"><div class="contenu"><button>Valider</button></div></div>
   ```

   :::indice
   Un clic sur le contenu bouillonne jusqu'au fond. Comment savoir si c'est le fond lui-même qui a été cliqué ?
   :::

   :::solution
   Le clic sur `.contenu` ou sur le bouton **bouillonne** jusqu'à `.fond`, dont l'écouteur s'exécute. Il faut vérifier
   que l'élément cliqué est le fond lui-même.

   ```js
   document.body.innerHTML = '<div class="fond"><div class="contenu"><button>Valider</button></div></div>';

   const fond = document.querySelector('.fond');
   fond.addEventListener('click', (event) => {
     if (event.target === event.currentTarget) {
       fond.remove();
     }
   });

   document.querySelector('button').click();
   console.log(document.querySelector('.fond') !== null); // true : toujours ouverte
   fond.click();
   console.log(document.querySelector('.fond')); // null : fermée par un clic sur le fond
   ```

   Ajouter `stopPropagation` sur le contenu fonctionnerait aussi, mais bloquerait tous les autres écouteurs de clic
   situés plus haut.
   :::

3. Donne l'ordre des messages pour un clic sur `#c`, sous la forme `X Y Z`.

   ```js
   // <div id="a"><div id="b"><button id="c"></button></div></div>
   a.addEventListener('click', () => log('a-bulle'));
   a.addEventListener('click', () => log('a-capture'), { capture: true });
   b.addEventListener('click', () => log('b-bulle'));
   c.addEventListener('click', () => log('c'));
   ```

   :::indice
   Capture de haut en bas, puis la cible, puis bouillonnement de bas en haut.
   :::

   :::solution
   L'ordre est `a-capture c b-bulle a-bulle`. La capture descend et rencontre l'écouteur de capture de `#a` ; la cible
   `#c` exécute son écouteur ; le bouillonnement remonte par `#b` puis `#a`.

   ```js
   document.body.innerHTML = '<div id="a"><div id="b"><button id="c"></button></div></div>';
   const ordre = [];
   const log = (message) => ordre.push(message);
   const [a, b, c] = ['a', 'b', 'c'].map((id) => document.getElementById(id));

   a.addEventListener('click', () => log('a-bulle'));
   a.addEventListener('click', () => log('a-capture'), { capture: true });
   b.addEventListener('click', () => log('b-bulle'));
   c.addEventListener('click', () => log('c'));

   c.click();
   console.log(ordre.join(' ')); // 'a-capture c b-bulle a-bulle'
   ```
   :::

## Questions d'entretien

- Qu'est-ce que le bouillonnement d'un événement ?

  :::indice
  Que se passe-t-il après que la cible a traité l'événement ?
  :::

  :::reponse
  Après la phase de capture et le traitement sur la cible, l'événement remonte l'arbre du DOM, d'ancêtre en ancêtre,
  jusqu'à `window`, et chaque écouteur posé sans capture est appelé au passage. C'est pourquoi un écouteur posé sur un
  conteneur reçoit les événements de tous ses descendants. La plupart des événements bouillonnent, à l'exception
  notable de `focus`, `blur`, `mouseenter` et `mouseleave`.
  :::

- Quelle différence entre `preventDefault` et `stopPropagation` ?

  :::indice
  L'un agit sur ce que fait le navigateur, l'autre sur le trajet de l'événement.
  :::

  :::reponse
  `preventDefault` annule l'action par défaut du navigateur — suivre un lien, soumettre un formulaire, insérer un
  caractère —, mais l'événement continue de se propager. `stopPropagation` interrompt le trajet vers les autres
  éléments, mais laisse l'action par défaut se produire. Ils sont indépendants : pour empêcher un lien de naviguer,
  c'est `preventDefault` qu'il faut.
  :::

- Pourquoi éviter `stopPropagation` ?

  :::indice
  Qui d'autre écoute peut-être le même événement plus haut dans la page ?
  :::

  :::reponse
  Parce qu'il masque l'événement pour tous les écouteurs situés plus haut, y compris ceux qu'on ne connaît pas : un
  menu qui se ferme quand on clique ailleurs, une bibliothèque d'analyse, une délégation d'événements. Le bug apparaît
  loin de sa cause. On préfère vérifier l'origine de l'événement dans l'écouteur concerné, avec `event.target`,
  `currentTarget` ou `closest`, et laisser l'événement suivre son trajet normal.
  :::
