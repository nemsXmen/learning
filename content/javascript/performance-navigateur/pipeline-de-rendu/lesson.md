---
id: javascript-pipeline-de-rendu
title: "Le pipeline de rendu : reflow, repaint et layout thrashing"
slug: pipeline-de-rendu
technology: javascript
level: advanced
module: performance-navigateur
order: 1
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-dom-modifier
  - javascript-event-loop
skills:
  - rendering-pipeline
tags:
  - javascript
  - performance
  - navigateur
  - dom
---

## Objectifs

- Décrire les étapes qui transforment le DOM en pixels : style, mise en page, peinture, composition.
- Savoir quelles modifications déclenchent un *reflow*, un *repaint*, ou seulement une composition.
- Reconnaître le *layout thrashing* et le corriger en groupant lectures et écritures.
- Animer avec `transform` et `opacity`, et caler les écritures sur `requestAnimationFrame`.

## Introduction

Modifier le DOM ne dessine rien immédiatement. Le navigateur note ce qui a changé, et c'est plus tard, avant
d'afficher l'image suivante, qu'il recalcule les styles, la géométrie et les pixels. Ce fonctionnement différé est
efficace : cent modifications d'affilée ne coûtent qu'un seul calcul. Mais un code qui lit une dimension au mauvais
moment oblige le navigateur à tout recalculer tout de suite, et le même travail peut alors être refait des
centaines de fois.

Ce chapitre explique ce que fait le navigateur entre votre JavaScript et l'écran, et comment ne pas le forcer à
travailler pour rien. C'est la base de tout le reste du module.

## Concept

**Le pipeline d'une image.**

```text
JavaScript → Style → Layout (mise en page) → Paint (peinture) → Composite (composition) → écran
```

| Étape | Ce que calcule le navigateur | Déclenchée par |
| --- | --- | --- |
| Style | les règles CSS qui s'appliquent à chaque élément | ajout ou retrait de classe, style en ligne, nouvel élément |
| Layout, ou *reflow* | la taille et la position de chaque boîte | `width`, `height`, `margin`, `padding`, `top`, `font-size`, contenu texte, ajout d'élément |
| Paint, ou *repaint* | les pixels de chaque couche | `color`, `background`, `box-shadow`, `border-color`, `visibility` |
| Composite | l'assemblage des couches, déplacées ou rendues transparentes | `transform`, `opacity` sur un élément qui a sa propre couche |

Chaque étape entraîne les suivantes : un changement de géométrie coûte style, layout, peinture et composition ; un
changement de couleur, style, peinture et composition ; un `transform`, souvent la composition seule.

À 60 images par seconde, le navigateur dispose d'environ **16,7 ms** par image, pour votre JavaScript et tout ce
pipeline. Au-delà, des images sont sautées : l'animation saccade.

**Lectures qui forcent la mise en page.** Ces propriétés et méthodes renvoient une géométrie à jour : si le DOM a
changé depuis le dernier calcul, le navigateur doit refaire la mise en page **immédiatement**, avant de répondre.

| Famille | Exemples |
| --- | --- |
| dimensions et positions | `offsetWidth`, `offsetHeight`, `offsetTop`, `clientWidth`, `scrollHeight` |
| défilement | `scrollTop`, `scrollY`, `scrollIntoView()` |
| géométrie | `getBoundingClientRect()`, `getClientRects()` |
| styles calculés | `getComputedStyle(el).width`, et les propriétés liées à la mise en page |
| texte rendu | `innerText` |

## Exemple

Mille cartes doivent prendre la moitié de la largeur de leur bloc parent. Les deux versions produisent la même page :

```js
const cartes = document.querySelectorAll('.carte');

// Version 1 : lecture et écriture alternées.
for (const carte of cartes) {
  const largeur = carte.parentElement.offsetWidth; // lecture : exige une mise en page à jour
  carte.style.width = `${largeur / 2}px`; // écriture : invalide la mise en page
}
```

```js
const cartes = document.querySelectorAll('.carte');

// Version 2 : toutes les lectures, puis toutes les écritures.
const largeurs = Array.from(cartes, (carte) => carte.parentElement.offsetWidth);
cartes.forEach((carte, i) => {
  carte.style.width = `${largeurs[i] / 2}px`;
});
```

Mesurées dans Chromium, sur 1 000 cartes : environ **900 ms** pour la première version, **18 ms** pour la
seconde. La première bloque l'interface pendant près d'une seconde.

## Comment ça fonctionne

**Invalider, puis recalculer au dernier moment.** Quand on écrit `carte.style.width = '100px'`, le navigateur ne
recalcule rien : il marque la mise en page comme périmée. Normalement, le recalcul a lieu une fois, avant l'image
suivante, quel que soit le nombre de modifications. C'est pourquoi la seconde version est rapide : une mise en page
pour les lectures, qui ne font que la consulter, puis mille écritures qui ne font qu'invalider, puis une seule mise
en page avant l'affichage.

**La mise en page synchrone forcée.** Dans la première version, chaque tour de boucle lit `offsetWidth` alors que le
tour précédent vient d'invalider la mise en page. Pour répondre juste, le navigateur doit recalculer la géométrie
**tout de suite**, de façon synchrone : c'est un *forced reflow*. Répété dans une boucle, c'est le **layout
thrashing** : mille mises en page au lieu d'une, chacune sur toute la page. L'onglet Performance des DevTools
l'affiche en violet, avec l'avertissement *Forced reflow is a likely performance bottleneck*.

**La règle : grouper.** D'abord toutes les lectures, ensuite toutes les écritures. Quand le code est dispersé entre
plusieurs composants, on reporte les écritures à l'image suivante avec `requestAnimationFrame`, qui s'exécute juste
avant la mise en page du navigateur. Les lectures faites ailleurs, pendant le traitement des événements, trouvent
ainsi une mise en page encore valide.

```js
function placerInfobulle(infobulle, ancre) {
  const { left, bottom } = ancre.getBoundingClientRect(); // lecture, maintenant
  requestAnimationFrame(() => {
    // écriture, juste avant l'image suivante
    infobulle.style.transform = `translate(${left}px, ${bottom + 8}px)`;
  });
}
```

Attention : une lecture placée **dans** le callback de `requestAnimationFrame`, après des écritures du même callback,
force encore une mise en page. Le principe reste le même : lectures d'abord, écritures ensuite.

**Reflow, repaint, composition.** Une mise en page est chère parce qu'un changement se propage : agrandir un élément
peut déplacer tous ses voisins et ses descendants. Une peinture est moins chère, mais redessine une zone. La
composition, elle, déplace ou rend transparente une couche déjà peinte, souvent sur le processeur graphique. D'où la
règle des animations : on anime `transform` et `opacity`, jamais `left`, `top`, `width` ou `margin`.

```css
/* Déclenche une mise en page à chaque image. */
.tiroir-lent { transition: left 300ms; }

/* Composition seulement. */
.tiroir { transition: transform 300ms; }
.tiroir.ouvert { transform: translateX(0); }
```

`will-change: transform` demande au navigateur de préparer une couche à l'avance. Chaque couche consomme de la
mémoire graphique : on le réserve aux éléments qui vont vraiment s'animer, jamais à `*`.

**Réduire la portée d'une mise en page.** `contain: layout` ou `contain: content` en CSS indique qu'un élément ne
modifie pas la géométrie de l'extérieur : un changement à l'intérieur n'oblige pas à recalculer toute la page. Et
une modification sur un élément `display: none`, ou pas encore inséré dans le document, ne coûte aucune mise en page.

## Erreurs fréquentes

**Lire une dimension dans une boucle qui modifie le DOM.** C'est le layout thrashing : lis tout d'abord, écris ensuite.

**Animer `left`, `top`, `width` ou `height`.** Anime `transform` et `opacity`.

**Mettre `will-change` partout.** Chaque couche coûte de la mémoire ; réserve-le aux éléments animés.

**Lire `offsetHeight` « pour voir » dans un code chaud.** Une lecture de géométrie n'est pas gratuite : si le DOM a
changé, elle déclenche une mise en page.

**Écrire style par style.** `el.style.width = …; el.style.height = …; el.style.margin = …` ne coûte qu'une mise en page
s'il n'y a aucune lecture entre les écritures ; mais basculer une classe CSS est plus lisible et regroupe tout.

**Optimiser sans regarder l'onglet Performance.** Il montre exactement quelles étapes coûtent, et où.

## À retenir

- Pipeline : JavaScript, style, mise en page, peinture, composition ; environ 16,7 ms par image à 60 Hz.
- Géométrie modifiée : reflow ; apparence seule : repaint ; `transform` et `opacity` : composition.
- Une écriture invalide la mise en page, une lecture de géométrie la force si elle est périmée.
- Alterner lectures et écritures provoque le layout thrashing ; on groupe les lectures, puis les écritures.
- `requestAnimationFrame` reporte les écritures juste avant l'image suivante.
- On anime `transform` et `opacity`, et on vérifie dans l'onglet Performance.

## Exercices

1. Pour chaque modification, indique l'étape la plus coûteuse déclenchée : mise en page, peinture ou composition.
   - a) `el.style.backgroundColor = 'red'`
   - b) `el.style.transform = 'translateY(20px)'`
   - c) `el.textContent = 'Un texte bien plus long qu’avant'`
   - d) `el.classList.add('large')`, où `.large { padding: 2rem; }`
   - e) `el.style.opacity = '0.5'`, sur un élément animé qui a sa propre couche

   :::indice
   La géométrie change-t-elle ? Sinon, les pixels de l'élément changent-ils, ou seulement la façon d'assembler sa
   couche ?
   :::

   :::solution
   - a) Peinture : la couleur change, pas la géométrie.
   - b) Composition : la couche est déplacée sans nouvelle mise en page. Sans couche dédiée, une peinture peut
     s'ajouter, mais toujours pas de mise en page.
   - c) Mise en page : un texte plus long peut changer la taille de l'élément et déplacer ses voisins.
   - d) Mise en page : le `padding` change la taille de la boîte.
   - e) Composition : l'opacité est appliquée à la couche lors de l'assemblage.
   :::

2. Ce code aligne la hauteur de chaque ligne d'un tableau sur celle de la ligne correspondante d'un second tableau.
   Il provoque du layout thrashing. Explique pourquoi, puis corrige-le.

   ```js
   function alignerLignes(gauche, droite) {
     gauche.forEach((ligne, i) => {
       ligne.style.height = 'auto';
       droite[i].style.height = 'auto';
       const hauteur = Math.max(ligne.offsetHeight, droite[i].offsetHeight);
       ligne.style.height = `${hauteur}px`;
       droite[i].style.height = `${hauteur}px`;
     });
   }
   ```

   :::indice
   Il y a trois phases : remettre les hauteurs à `auto`, mesurer, appliquer. Chacune peut se faire pour toutes les
   lignes d'un coup.
   :::

   :::solution
   À chaque tour, les écritures invalident la mise en page, puis `offsetHeight` la force : une mise en page par
   ligne. On sépare les trois phases : toutes les écritures `auto`, une seule mise en page pour toutes les mesures,
   puis toutes les écritures finales.

   ```js
   function alignerLignes(gauche, droite) {
     for (const ligne of [...gauche, ...droite]) ligne.style.height = 'auto';

     const hauteurs = gauche.map((ligne, i) => Math.max(ligne.offsetHeight, droite[i].offsetHeight));

     gauche.forEach((ligne, i) => {
       ligne.style.height = `${hauteurs[i]}px`;
       droite[i].style.height = `${hauteurs[i]}px`;
     });
   }
   ```

   La première mesure force une mise en page, les suivantes la réutilisent : elle reste valide tant qu'on n'écrit
   rien.
   :::

3. Un menu latéral s'ouvre en animant `left` de `-300px` à `0`, et l'animation saccade sur mobile. Réécris le CSS et le
   JavaScript pour une animation fluide.

   ```js
   bouton.addEventListener('click', () => {
     menu.style.left = menu.style.left === '0px' ? '-300px' : '0px';
   });
   ```

   :::indice
   Quelle propriété déplace un élément sans mise en page ? Et plutôt qu'un style en ligne, une classe.
   :::

   :::solution
   `left` modifie la géométrie : chaque image de l'animation refait une mise en page. `transform` déplace la couche
   du menu à l'étape de composition.

   ```css
   .menu {
     position: fixed;
     left: 0;
     width: 300px;
     transform: translateX(-100%);
     transition: transform 250ms ease-out;
   }

   .menu.ouvert {
     transform: translateX(0);
   }
   ```

   ```js
   bouton.addEventListener('click', () => {
     const ouvert = menu.classList.toggle('ouvert');
     bouton.setAttribute('aria-expanded', String(ouvert));
   });
   ```

   Basculer une classe laisse la mise en forme au CSS, et `aria-expanded` annonce l'état du menu aux technologies
   d'assistance. Pendant l'animation, le navigateur n'a plus qu'à composer.
   :::

## Questions d'entretien

- Quelle différence entre reflow et repaint ?

  :::indice
  L'un calcule la géométrie, l'autre les pixels.
  :::

  :::reponse
  Le reflow, ou mise en page, recalcule la taille et la position des éléments ; il est déclenché par un changement de
  géométrie, comme `width`, `padding`, `font-size` ou un ajout d'élément, et il peut se propager aux voisins et aux
  descendants. Le repaint redessine les pixels d'une zone quand l'apparence change sans changer la géométrie, comme
  `color` ou `background`. Un reflow entraîne toujours un repaint, l'inverse non. Enfin, `transform` et `opacity`
  peuvent n'entraîner qu'une composition, la moins coûteuse des étapes.
  :::

- Qu'est-ce que le layout thrashing, et comment l'éviter ?

  :::indice
  Pense à une boucle qui lit `offsetHeight` après chaque modification.
  :::

  :::reponse
  C'est l'alternance de lectures de géométrie et d'écritures dans le DOM. Chaque écriture invalide la mise en page,
  et la lecture suivante oblige le navigateur à la recalculer immédiatement, de façon synchrone. Dans une boucle, on
  obtient une mise en page par tour au lieu d'une seule. On l'évite en groupant : toutes les lectures, puis toutes
  les écritures ; et, quand le code est dispersé, en reportant les écritures à `requestAnimationFrame`. L'onglet
  Performance le signale par des blocs violets marqués *Forced reflow*.
  :::

- Pourquoi anime-t-on `transform` plutôt que `left` ?

  :::indice
  Quelles étapes du pipeline chaque propriété déclenche-t-elle à chaque image ?
  :::

  :::reponse
  Animer `left` modifie la géométrie à chaque image : style, mise en page, peinture et composition, soit beaucoup de
  travail sur le fil principal, qui fait aussi tourner le JavaScript. `transform` déplace une couche déjà peinte à
  l'étape de composition, que le navigateur peut confier au processeur graphique. L'animation reste fluide même quand
  le fil principal est occupé. Même chose pour `opacity`.
  :::
