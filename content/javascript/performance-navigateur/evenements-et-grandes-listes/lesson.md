---
id: javascript-evenements-et-grandes-listes
title: "Événements performants et grandes listes"
slug: evenements-et-grandes-listes
technology: javascript
level: advanced
module: performance-navigateur
order: 2
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-pipeline-de-rendu
  - javascript-delegation
  - javascript-debounce-et-throttle
skills:
  - large-lists-events
tags:
  - javascript
  - performance
  - navigateur
  - evenements
---

## Objectifs

- Garder les gestionnaires d'événements courts, pour que l'interface réponde vite (INP).
- Utiliser les écouteurs passifs, la délégation et les observateurs à la place des écouteurs coûteux.
- Afficher de grandes listes sans bloquer la page : pagination, insertion groupée, `content-visibility`.
- Écrire une liste virtuelle qui n'affiche que les lignes visibles, en restant accessible.

## Introduction

Une page réactive, c'est une page dont le fil principal est libre quand l'utilisateur agit. Or le fil principal
fait tout : exécuter le JavaScript, traiter les événements, calculer la mise en page, peindre. Un gestionnaire de
clic qui travaille 300 ms, c'est 300 ms pendant lesquelles rien ne s'affiche, pas même l'effet du clic.

Les grandes listes sont le cas le plus fréquent de ce problème. Chaque élément du DOM coûte de la mémoire, du calcul
de style et de la mise en page : dix mille lignes de tableau suffisent à rendre une page lente à ouvrir, à faire
défiler et à mettre à jour. Ce chapitre montre comment traiter les événements sans bloquer, puis comment n'afficher
que ce qui est utile.

## Concept

| Problème | Solution |
| --- | --- |
| un écouteur par élément, sur des milliers d'éléments | la délégation : un écouteur sur le conteneur |
| un écouteur `touchmove` ou `wheel` qui peut bloquer le défilement | `{ passive: true }` |
| un écouteur `scroll` qui teste si un élément est visible | `IntersectionObserver` |
| un écouteur `resize` qui mesure un élément | `ResizeObserver` |
| un gestionnaire qui fait un long travail | afficher la réaction d'abord, puis céder la main et continuer |

| Liste de n éléments | Stratégie | Nœuds dans le DOM |
| --- | --- | --- |
| quelques centaines | tout afficher, en une insertion groupée | n |
| quelques milliers, ou un parcours par pages | pagination, « charger plus », `content-visibility: auto` | une page, ou n allégés |
| des dizaines de milliers et plus, défilement continu | virtualisation | les lignes visibles, plus une marge |

## Exemple

Une liste de 100 000 clients, dans un conteneur de 400 px de haut qui défile. La **virtualisation** n'insère dans le
DOM que les lignes visibles, plus une petite marge, et les positionne dans un espaceur qui a la hauteur de la liste
complète :

```js
function creerListeVirtuelle(conteneur, { elements, hauteurLigne, rendreLigne, marge = 5 }) {
  const espaceur = document.createElement('div');
  espaceur.style.position = 'relative';
  espaceur.style.height = `${elements.length * hauteurLigne}px`;
  conteneur.replaceChildren(espaceur);

  let debutAffiche = -1;
  let finAffichee = -1;

  function afficher() {
    const { scrollTop, clientHeight } = conteneur; // lectures d'abord
    const debut = Math.max(0, Math.floor(scrollTop / hauteurLigne) - marge);
    const fin = Math.min(elements.length, Math.ceil((scrollTop + clientHeight) / hauteurLigne) + marge);
    if (debut === debutAffiche && fin === finAffichee) return;
    debutAffiche = debut;
    finAffichee = fin;

    const fragment = document.createDocumentFragment();
    for (let i = debut; i < fin; i++) {
      const ligne = rendreLigne(elements[i], i);
      ligne.style.position = 'absolute';
      ligne.style.insetInline = '0';
      ligne.style.height = `${hauteurLigne}px`;
      ligne.style.transform = `translateY(${i * hauteurLigne}px)`;
      ligne.setAttribute('aria-posinset', String(i + 1));
      ligne.setAttribute('aria-setsize', String(elements.length));
      fragment.append(ligne);
    }
    espaceur.replaceChildren(fragment); // écritures ensuite, en une fois
  }

  let programme = false;
  conteneur.addEventListener(
    'scroll',
    () => {
      if (programme) return;
      programme = true;
      requestAnimationFrame(() => {
        programme = false;
        afficher();
      });
    },
    { passive: true },
  );

  afficher();
  return { afficher };
}
```

```js
const clients = Array.from({ length: 100_000 }, (_, i) => ({ id: i, nom: `Client ${i}` }));

const conteneur = document.querySelector('#clients'); // role="list", height: 400px, overflow: auto
creerListeVirtuelle(conteneur, {
  elements: clients,
  hauteurLigne: 32,
  rendreLigne: (client) => {
    const ligne = document.createElement('div');
    ligne.setAttribute('role', 'listitem');
    ligne.textContent = client.nom;
    return ligne;
  },
});
```

Mesuré dans Chromium : afficher les 100 000 lignes d'un coup prend plus d'une seconde, pendant laquelle la page est
figée ; la liste virtuelle s'affiche en moins de 20 ms, avec 18 lignes dans le DOM. Après un défilement jusqu'au
client 50 000, elle en contient 23 : les 13 visibles et une marge de 5 de chaque côté.

## Comment ça fonctionne

**La réactivité se mesure : INP.** L'*Interaction to Next Paint* mesure le délai entre une action de l'utilisateur
et l'image qui en montre l'effet. C'est l'un des Core Web Vitals de Google ; il est jugé bon sous 200 ms. Ce délai
additionne l'attente que le fil principal se libère, la durée des gestionnaires d'événements, et le rendu qui suit.
D'où la règle : un gestionnaire fait le minimum visible — ouvrir le menu, désactiver le bouton, afficher un
indicateur —, puis **cède la main** au navigateur avant le travail lourd, pour que l'image s'affiche d'abord.

```js
function cederLaMain() {
  // scheduler.yield() existe dans les navigateurs Chromium ; setTimeout ailleurs.
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resoudre) => setTimeout(resoudre, 0));
}

bouton.addEventListener('click', async () => {
  bouton.disabled = true;
  indicateur.hidden = false; // la réaction visible
  await cederLaMain(); // le navigateur peut peindre ici
  const rapport = calculerRapport(donnees); // le travail lourd
  afficherRapport(rapport);
  indicateur.hidden = true;
  bouton.disabled = false;
});
```

Si le travail dure vraiment longtemps, céder une fois ne suffit pas : le chapitre sur les Web Workers montre comment
le découper ou le sortir du fil principal.

**Écouteurs passifs.** Pour `touchstart`, `touchmove` et `wheel`, le navigateur doit savoir si l'écouteur va appeler
`preventDefault()`, qui annulerait le défilement. Tant qu'il ne le sait pas, il attend la fin de l'écouteur avant de
faire défiler. `{ passive: true }` promet qu'on ne l'appellera pas : le défilement démarre immédiatement. Chrome
rend ces écouteurs passifs par défaut quand ils sont posés sur `window`, `document` ou `body`, mais pas sur un autre
élément, et tous les navigateurs n'appliquent pas cette règle aux trois événements : on le déclare explicitement.
L'événement `scroll`, lui, n'est pas annulable : il arrive après le défilement, et le coût à surveiller est celui de
ce qu'on y fait.

**Des observateurs plutôt que des mesures.** Tester la visibilité d'un élément dans un écouteur `scroll` lit
`getBoundingClientRect` des dizaines de fois par seconde. Un `IntersectionObserver` fait ce calcul dans le
navigateur, hors de votre code, et n'appelle votre callback que quand la visibilité change. C'est la bonne façon de
charger la suite d'une liste quand on approche du bas, ou une image quand elle va apparaître. De même, un
`ResizeObserver` signale les changements de taille d'un élément, même quand la fenêtre, elle, ne change pas.

**Délégation.** Vue dans la partie sur le navigateur : un seul écouteur sur le conteneur remplace des milliers
d'écouteurs, économise leur mémoire et leur installation, et fonctionne pour les lignes ajoutées plus tard. Elle
s'impose avec une liste virtuelle, dont les lignes sont sans cesse recréées.

**Pourquoi une grande liste est lente.** Chaque nœud coûte de la mémoire, le calcul de son style, sa mise en page et
sa peinture ; et une modification quelque part peut obliger à recalculer une grande partie de la liste. Au-delà de
quelques milliers de nœuds, ouvrir la page, défiler et mettre à jour deviennent sensiblement plus lents.

**Les stratégies, de la plus simple à la plus complexe.** D'abord, insérer en une fois : un `DocumentFragment` ou
`replaceChildren` évite de modifier le document ligne par ligne. Ensuite, afficher moins : pagination, ou bouton
« Charger plus », souvent le meilleur choix pour l'utilisateur. Puis `content-visibility: auto`, en CSS : le
navigateur saute le rendu des sections hors écran tout en gardant leur contenu dans le DOM, donc cherchable avec
Ctrl+F et lisible par les lecteurs d'écran ; `contain-intrinsic-size` lui donne une hauteur estimée.

```css
.section-liste {
  content-visibility: auto;
  contain-intrinsic-size: auto 800px;
}
```

Enfin, la virtualisation, quand la liste est vraiment énorme.

**Ce que coûte la virtualisation.** Elle est redoutablement efficace, mais les lignes hors écran n'existent plus :
Ctrl+F ne les trouve pas, un lecteur d'écran ne peut pas les compter, et l'état d'une ligne, comme le texte d'un
champ ou le focus, disparaît quand elle sort de l'écran. On compense avec `aria-setsize` et `aria-posinset`, qui
annoncent la position réelle, et on garde l'état dans les données, pas dans le DOM. Des hauteurs de ligne variables
compliquent beaucoup le calcul des positions : en production, on utilise une bibliothèque éprouvée, comme TanStack
Virtual, plutôt que de tout réécrire.

## Erreurs fréquentes

**Faire tout le travail dans le gestionnaire.** Affiche la réaction, cède la main, puis travaille.

**Oublier `{ passive: true }` sur un écouteur tactile ou de molette.** Le défilement attend l'écouteur.

**Tester la visibilité dans un écouteur `scroll`.** Utilise `IntersectionObserver`.

**Insérer les lignes une par une dans le document.** Construis un fragment, puis insère-le en une fois.

**Virtualiser une liste de 200 éléments.** La complexité et les pertes d'accessibilité ne se justifient pas : insère
tout, ou utilise `content-visibility`.

**Garder l'état d'une ligne virtualisée dans le DOM.** Il disparaît quand la ligne est recyclée ; il appartient aux
données.

## À retenir

- Un gestionnaire rapide fait la réaction visible, cède la main, puis travaille : c'est ce que mesure l'INP.
- `{ passive: true }` pour `touchstart`, `touchmove` et `wheel` ; la délégation pour les listes.
- `IntersectionObserver` et `ResizeObserver` remplacent les mesures dans `scroll` et `resize`.
- Chaque nœud du DOM coûte : insertion groupée, pagination, `content-visibility: auto`.
- La virtualisation n'affiche que les lignes visibles et une marge, dans un espaceur de la hauteur totale.
- Elle a un prix en accessibilité et en complexité : `aria-setsize`, `aria-posinset`, état dans les données.

## Exercices

1. Ce code affiche un bouton « Retour en haut » quand l'utilisateur a dépassé l'en-tête de la page. Réécris-le avec
   un `IntersectionObserver`.

   ```js
   window.addEventListener('scroll', () => {
     const basEnTete = entete.getBoundingClientRect().bottom;
     boutonHaut.hidden = basEnTete > 0;
   });
   ```

   :::indice
   Observe l'en-tête : le bouton doit être visible exactement quand l'en-tête ne l'est plus.
   :::

   :::solution
   ```js
   const observateur = new IntersectionObserver(([entree]) => {
     boutonHaut.hidden = entree.isIntersecting;
   });
   observateur.observe(entete);
   ```

   Le callback n'est appelé qu'au moment où l'en-tête entre ou sort de l'écran, et une fois au démarrage, au lieu de
   mesurer la géométrie à chaque événement de défilement. On appelle `observateur.disconnect()` quand le composant
   disparaît.
   :::

2. Écris `chargerAuBesoin(sentinelle, chargerPage)`, qui appelle `chargerPage()` chaque fois qu'un élément sentinelle,
   placé en bas de la liste, approche à moins de 300 px de l'écran. Un chargement ne doit jamais commencer tant que
   le précédent n'est pas terminé, et l'observation s'arrête quand `chargerPage` renvoie `false`.

   :::indice
   `rootMargin: '0px 0px 300px 0px'` agrandit la zone observée vers le bas. Un booléen `enCours` évite les
   chargements simultanés.
   :::

   :::solution
   ```js
   function chargerAuBesoin(sentinelle, chargerPage) {
     let enCours = false;
     const observateur = new IntersectionObserver(
       async ([entree]) => {
         if (!entree.isIntersecting || enCours) return;
         enCours = true;
         try {
           const encore = await chargerPage();
           if (encore === false) observateur.disconnect();
         } finally {
           enCours = false;
         }
       },
       { rootMargin: '0px 0px 300px 0px' },
     );
     observateur.observe(sentinelle);
     return () => observateur.disconnect();
   }
   ```

   Si, après un chargement, la sentinelle est toujours dans la zone, par exemple parce qu'une page ne remplit pas
   l'écran, l'observateur ne la signalera pas de nouveau tant qu'elle n'en sort pas. Une version robuste vérifie
   alors la position après chaque chargement, ou réobserve la sentinelle : `observateur.unobserve(sentinelle)` puis
   `observateur.observe(sentinelle)` déclenche un nouveau calcul.
   :::

3. Dans la liste virtuelle du chapitre, on veut qu'un clic sur une ligne affiche le nom du client. Ajoute ce
   comportement sans poser d'écouteur sur chaque ligne, et explique pourquoi un écouteur par ligne serait ici une
   mauvaise idée.

   :::indice
   Les lignes sont recréées à chaque défilement. Mets l'index de l'élément dans un attribut `data-`.
   :::

   :::solution
   Un écouteur par ligne devrait être reposé à chaque rendu, sur des lignes qui disparaissent aussitôt. Avec la
   délégation, un seul écouteur sur le conteneur retrouve la ligne cliquée et l'élément correspondant :

   ```js
   const rendreLigne = (client, index) => {
     const ligne = document.createElement('div');
     ligne.setAttribute('role', 'listitem');
     ligne.dataset.index = String(index);
     ligne.textContent = client.nom;
     return ligne;
   };

   conteneur.addEventListener('click', (evenement) => {
     const ligne = evenement.target.closest('[data-index]');
     if (!ligne || !conteneur.contains(ligne)) return;
     const client = clients[Number(ligne.dataset.index)];
     console.log(client.nom);
   });
   ```

   L'écouteur lit l'élément dans les données, pas dans le DOM : il fonctionne quelle que soit la ligne recyclée qui
   l'affiche. Pour un usage au clavier, chaque ligne serait un `button`, ou la liste gérerait le focus.
   :::

## Questions d'entretien

- Comment afficherais-tu une liste de 100 000 éléments ?

  :::indice
  Commence par le besoin de l'utilisateur, puis gradue les solutions.
  :::

  :::reponse
  D'abord, je me demande si l'utilisateur a besoin de tout voir : une recherche, des filtres et une pagination
  répondent souvent mieux au besoin, et sont plus simples. Si un défilement continu est nécessaire, je virtualise :
  seules les lignes visibles et une petite marge sont dans le DOM, positionnées dans un conteneur de la hauteur
  totale, et recalculées au défilement, une fois par image. J'utilise une bibliothèque éprouvée pour les hauteurs
  variables, la délégation pour les événements, `aria-setsize` et `aria-posinset` pour l'accessibilité, et je garde
  l'état dans les données. Pour quelques milliers d'éléments, `content-visibility: auto` peut suffire.
  :::

- Qu'est-ce qu'un écouteur passif, et quand l'utiliser ?

  :::indice
  Qu'attend le navigateur avant de faire défiler ?
  :::

  :::reponse
  C'est un écouteur déclaré avec `{ passive: true }`, qui promet de ne pas appeler `preventDefault()`. Pour
  `touchstart`, `touchmove` et `wheel`, le navigateur doit sinon attendre la fin de l'écouteur avant de savoir s'il
  peut faire défiler, ce qui rend le défilement saccadé si l'écouteur est lent. Je l'utilise pour tous les écouteurs
  de ces événements qui ne bloquent pas le défilement ; s'il faut l'empêcher, comme pour un carrousel tactile,
  l'écouteur doit rester actif et très court.
  :::

- Qu'est-ce que l'INP, et comment l'améliorer ?

  :::indice
  De quoi se compose le délai entre un clic et l'image qui en montre l'effet ?
  :::

  :::reponse
  L'Interaction to Next Paint mesure, pour les interactions de l'utilisateur, le délai jusqu'à l'image suivante :
  attente que le fil principal se libère, exécution des gestionnaires, puis rendu. Un bon INP est inférieur à 200 ms.
  Pour l'améliorer : raccourcir les tâches longues qui occupent le fil principal, faire le minimum visible dans le
  gestionnaire puis céder la main avant le travail lourd, découper les longs traitements ou les déplacer dans un Web
  Worker, et réduire le coût du rendu, par exemple en allégeant le DOM.
  :::
