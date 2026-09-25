---
id: javascript-debounce-et-throttle
title: "Debouncing et throttling"
slug: debounce-et-throttle
technology: javascript
level: advanced
module: performance-javascript
order: 4
estimatedMinutes: 40
difficulty: 4
xp: 100
prerequisites:
  - javascript-memoization
  - javascript-event-loop
  - javascript-evenements
skills:
  - debounce-throttle
tags:
  - javascript
  - performance
  - evenements
---

## Objectifs

- Distinguer le *debouncing*, qui attend le calme, du *throttling*, qui limite la cadence.
- Écrire `debounce` et `throttle` complets : arguments et `this` conservés, annulation, exécution forcée.
- Caler une mise à jour visuelle sur l'affichage avec `requestAnimationFrame`.
- Choisir la bonne technique pour une recherche, une sauvegarde automatique, un défilement ou un bouton.
- Tester ces fonctions de façon déterministe avec les faux minuteurs de Vitest.

## Introduction

Certains événements arrivent en rafale. Une frappe au clavier déclenche un `input` par caractère ; un défilement
envoie des dizaines d'événements `scroll` par seconde ; un mouvement de souris, plus encore. Si chaque événement
lance une requête réseau ou un recalcul de mise en page, l'application sature : requêtes inutiles, réponses dans le
désordre, interface qui saccade.

Les deux techniques de ce chapitre ne rendent pas le travail plus rapide : elles **réduisent le nombre de fois** où
on le fait. Ce sont deux closures qui retiennent un minuteur, dans la famille des motifs vus avec la mémoïsation.

## Concept

```text
événements   x x x x x       x x x x x x x x x x x
debounce               ↓                           ↓     (une fois, après 300 ms de calme)
throttle     ↓     ↓     ↓   ↓     ↓     ↓     ↓   ↓     (au plus une fois toutes les 100 ms)
```

| Technique | Règle | Cas typiques |
| --- | --- | --- |
| *debounce* | exécuter une fois, quand les appels ont cessé depuis `delai` ms | recherche pendant la frappe, validation d'un champ, sauvegarde automatique, redimensionnement terminé |
| *debounce* immédiat (*leading*) | exécuter au premier appel, ignorer la rafale qui suit | double clic sur un bouton d'envoi |
| *throttle* | exécuter au plus une fois toutes les `intervalle` ms, dernier appel compris | position de défilement, suivi de la souris, envoi de statistiques |
| `requestAnimationFrame` | exécuter au plus une fois par image affichée | toute mise à jour visuelle liée à un événement fréquent |

## Exemple

Un champ de recherche interroge une API. Sans précaution, taper « javascript » envoie dix requêtes. Avec
`debounce`, on attend que l'utilisateur marque une pause :

```js
export function debounce(fonction, delai) {
  let minuteur = null;
  let derniersArguments = [];
  let dernierThis;

  function executer() {
    minuteur = null;
    return fonction.apply(dernierThis, derniersArguments);
  }

  function debounced(...arguments_) {
    derniersArguments = arguments_;
    dernierThis = this;
    clearTimeout(minuteur);
    minuteur = setTimeout(executer, delai);
  }

  debounced.cancel = () => {
    clearTimeout(minuteur);
    minuteur = null;
  };

  // Exécute tout de suite l'appel en attente, s'il y en a un.
  debounced.flush = () => {
    if (minuteur === null) return undefined;
    clearTimeout(minuteur);
    return executer();
  };

  return debounced;
}
```

Dans la page, on l'utilise ainsi :

```js
const rechercher = debounce((texte) => {
  console.log('requête pour', texte);
}, 300);

champ.addEventListener('input', (evenement) => rechercher(evenement.target.value));
```

Et on le teste sans attendre de vraies secondes, avec les faux minuteurs de Vitest :

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce.js';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("n'exécute qu'une fois, avec les derniers arguments, après le calme", () => {
    const espion = vi.fn();
    const rechercher = debounce(espion, 300);

    for (const texte of ['j', 'ja', 'jav', 'java']) {
      rechercher(texte);
      vi.advanceTimersByTime(100); // l'utilisateur tape toutes les 100 ms
    }
    expect(espion).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200); // 300 ms depuis la dernière frappe
    expect(espion).toHaveBeenCalledTimes(1);
    expect(espion).toHaveBeenCalledWith('java');
  });

  it('peut être annulé ou forcé', () => {
    const espion = vi.fn((x) => x * 2);
    const calcul = debounce(espion, 300);

    calcul(1);
    calcul.cancel();
    vi.advanceTimersByTime(1000);
    expect(espion).not.toHaveBeenCalled();

    calcul(21);
    expect(calcul.flush()).toBe(42);
    expect(calcul.flush()).toBeUndefined(); // plus rien en attente
  });

  it('conserve this', () => {
    const compteur = {
      valeur: 0,
      incrementer: debounce(function () {
        this.valeur += 1;
      }, 50),
    };
    compteur.incrementer();
    vi.advanceTimersByTime(50);
    expect(compteur.valeur).toBe(1);
  });
});
```

## Comment ça fonctionne

**Le debounce.** Chaque appel annule le minuteur précédent et en programme un nouveau : tant que les appels se
suivent à moins de `delai` ms, le minuteur n'arrive jamais à son terme. Quand la rafale cesse, il se déclenche une
fois, avec les **derniers** arguments. La closure retient le minuteur, les arguments et `this` ; on utilise une
`function`, et non une fonction fléchée, pour que `debounced` reçoive le `this` de son appelant et le transmette.
`debounced` ne renvoie rien : le résultat n'existe pas encore au moment de l'appel. `cancel` sert au démontage d'un
composant, pour qu'un appel en attente ne s'exécute pas sur une page qu'on a quittée ; `flush` sert à ne rien perdre,
par exemple pour sauvegarder immédiatement un brouillon quand la page passe en arrière-plan.

**Le choix du délai.** Pour une recherche pendant la frappe, 200 à 400 ms : assez pour qu'une frappe continue ne
déclenche rien, assez court pour que le résultat paraisse immédiat. Un délai trop long donne une impression de
lenteur, que le debounce devait justement éviter.

**Le throttle.** Il garantit une exécution régulière pendant la rafale, au lieu d'attendre qu'elle cesse. La version
utile exécute le premier appel tout de suite (*leading*), puis au plus une fois par intervalle, et n'oublie pas le
dernier appel (*trailing*) : sans lui, la position finale d'un défilement ne serait jamais prise en compte.

```js
export function throttle(fonction, intervalle) {
  let dernierAppel = -Infinity;
  let minuteur = null;
  let argumentsEnAttente;
  let thisEnAttente;

  return function throttled(...arguments_) {
    const reste = intervalle - (Date.now() - dernierAppel);
    if (reste <= 0) {
      clearTimeout(minuteur);
      minuteur = null;
      dernierAppel = Date.now();
      fonction.apply(this, arguments_);
      return;
    }
    // Trop tôt : on retient le dernier appel et on le programme à la fin de l'intervalle.
    argumentsEnAttente = arguments_;
    thisEnAttente = this;
    minuteur ??= setTimeout(() => {
      minuteur = null;
      dernierAppel = Date.now();
      fonction.apply(thisEnAttente, argumentsEnAttente);
    }, reste);
  };
}
```

```js
import { it, expect, vi } from 'vitest';
import { throttle } from './throttle.js';

it('exécute au plus une fois par intervalle, dernier appel compris', () => {
  vi.useFakeTimers();
  const espion = vi.fn();
  const suivre = throttle(espion, 100);

  for (let t = 0; t <= 250; t += 10) {
    suivre(t); // un événement toutes les 10 ms, de 0 à 250
    vi.advanceTimersByTime(10);
  }
  vi.advanceTimersByTime(100);

  expect(espion.mock.calls.map(([t]) => t)).toEqual([0, 90, 190, 250]);
  vi.useRealTimers();
});
```

26 événements produisent 4 exécutions : le premier, tout de suite ; puis, à 100 et à 200 ms, le dernier appel reçu
pendant l'intervalle, 90 et 190 ; enfin le dernier événement, 250, qui porte la position finale. Les appels
intermédiaires sont ignorés : seul le plus récent compte.

**Caler sur l'affichage.** Pour une mise à jour visuelle, l'intervalle idéal n'est pas un nombre de millisecondes,
c'est l'image suivante. `requestAnimationFrame` exécute un callback juste avant que le navigateur dessine, environ
60 fois par seconde, et pas du tout si l'onglet est masqué. Une barre de progression de lecture n'a pas besoin de
plus :

```js
function parImage(fonction) {
  let programme = false;
  let derniersArguments;
  return (...arguments_) => {
    derniersArguments = arguments_;
    if (programme) return;
    programme = true;
    requestAnimationFrame(() => {
      programme = false;
      fonction(...derniersArguments);
    });
  };
}

const majProgression = parImage(() => {
  const parcouru = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  barre.style.transform = `scaleX(${parcouru})`;
});
window.addEventListener('scroll', majProgression, { passive: true });
```

**Et les requêtes asynchrones ?** Le debounce réduit le nombre de requêtes, mais ne règle pas leur ordre : si
l'utilisateur fait une pause, reprend, puis s'arrête, deux requêtes partent, et la plus ancienne peut répondre en
dernier et afficher des résultats périmés. On annule la précédente avec un `AbortController`, comme dans la partie
sur Fetch, ou l'on ignore toute réponse qui ne correspond plus au dernier texte tapé.

## Erreurs fréquentes

**Créer la fonction debouncée à chaque événement.**
`champ.addEventListener('input', () => debounce(rechercher, 300)())` crée un nouveau minuteur à chaque frappe : rien
n'est jamais annulé. On crée la version debouncée **une fois**, puis on l'appelle.

**Confondre les deux.** Un debounce sur `scroll` ne met rien à jour tant que l'utilisateur défile ; un throttle sur
une recherche envoie des requêtes pendant la frappe. Demande-toi : faut-il réagir pendant la rafale, ou après ?

**Oublier le dernier appel d'un throttle.** Sans exécution finale, l'état affiché ne correspond pas à la dernière
position.

**Laisser un appel en attente après le démontage.** Appelle `cancel`, ou `flush` s'il ne faut rien perdre.

**Perdre `this` avec une fonction fléchée dans l'implémentation.** Le `this` de l'appelant n'est alors pas transmis.

**Tester avec de vrais délais.** Les tests deviennent lents et instables ; utilise `vi.useFakeTimers()`.

## À retenir

- *Debounce* : une exécution, après `delai` ms sans appel, avec les derniers arguments.
- *Throttle* : au plus une exécution par intervalle, pendant la rafale, dernier appel compris.
- Mise à jour visuelle : une fois par image, avec `requestAnimationFrame`.
- On crée la version limitée une fois, et on prévoit `cancel` et `flush`.
- Le debounce ne règle pas l'ordre des réponses : annule les requêtes périmées.
- Les faux minuteurs rendent ces fonctions testables en quelques millisecondes.

## Exercices

1. Pour chaque situation, choisis entre debounce, debounce immédiat, throttle et `requestAnimationFrame`, et
   justifie.
   - a) Valider un nom d'utilisateur auprès du serveur pendant la saisie.
   - b) Empêcher qu'un double clic sur « Payer » n'envoie deux paiements.
   - c) Envoyer au serveur la position de lecture d'une vidéo pendant qu'elle défile.
   - d) Déplacer un élément sous le pointeur pendant un glisser-déposer.

   :::indice
   Pour chaque cas : faut-il réagir pendant la rafale ou après ? Est-ce une mise à jour visuelle ?
   :::

   :::solution
   - a) Debounce, 300 à 500 ms : on valide quand la saisie marque une pause, pas à chaque caractère.
   - b) Debounce immédiat : le premier clic agit, les suivants sont ignorés. En complément, on désactive le bouton
     pendant l'envoi, et le serveur refuse un paiement en double grâce à une clé d'idempotence : l'interface ne
     suffit jamais à garantir l'unicité.
   - c) Throttle, par exemple toutes les 5 secondes, avec le dernier appel : on veut des mises à jour régulières
     pendant la lecture, et la position finale.
   - d) `requestAnimationFrame` : c'est une mise à jour visuelle ; la faire plus souvent qu'une fois par image est
     inutile, moins souvent la rend saccadée.
   :::

2. Écris `debounceImmediat(fonction, delai)` : le premier appel d'une rafale s'exécute tout de suite, les appels
   suivants sont ignorés tant qu'ils se suivent à moins de `delai` ms. Teste-le avec des faux minuteurs.

   :::indice
   Si aucun minuteur n'est actif, on exécute. Dans tous les cas, on (re)programme un minuteur qui, à son terme,
   remet l'état à zéro.
   :::

   :::solution
   ```js
   import { it, expect, vi } from 'vitest';

   function debounceImmediat(fonction, delai) {
     let minuteur = null;
     return function (...arguments_) {
       const premier = minuteur === null;
       clearTimeout(minuteur);
       minuteur = setTimeout(() => {
         minuteur = null;
       }, delai);
       if (premier) fonction.apply(this, arguments_);
     };
   }

   it('exécute le premier appel de chaque rafale', () => {
     vi.useFakeTimers();
     const payer = vi.fn();
     const clic = debounceImmediat(payer, 500);

     clic('a');
     vi.advanceTimersByTime(100);
     clic('b');
     vi.advanceTimersByTime(100);
     clic('c');
     expect(payer.mock.calls).toEqual([['a']]);

     vi.advanceTimersByTime(500); // calme
     clic('d');
     expect(payer.mock.calls).toEqual([['a'], ['d']]);
     vi.useRealTimers();
   });
   ```

   Chaque appel repousse la fin de la rafale : `c`, 200 ms après `a`, est encore ignoré. Il faut 500 ms de calme
   pour qu'un nouveau clic compte.
   :::

3. Ce champ de recherche est debouncé, mais les résultats affichés ne correspondent parfois pas au texte tapé.
   Explique pourquoi, puis corrige `rechercher` pour qu'une réponse périmée ne soit jamais affichée. Teste-le avec un
   faux `chercher` dont la première réponse arrive après la seconde.

   ```js
   const rechercher = debounce(async (texte) => {
     afficher(await chercher(texte));
   }, 300);
   ```

   :::indice
   Deux pauses pendant la frappe déclenchent deux requêtes. Garde un `AbortController` pour la requête en cours.
   :::

   :::solution
   Le debounce réduit le nombre de requêtes, mais si l'utilisateur fait deux pauses, deux requêtes partent, et la
   première peut répondre après la seconde : ses résultats, périmés, écrasent les bons. On annule la requête
   précédente avant d'en lancer une nouvelle, et on ignore toute réponse d'une requête annulée.

   ```js
   import { it, expect, vi } from 'vitest';

   function creerRecherche(chercher, afficher) {
     let controleur = null;
     return async (texte) => {
       controleur?.abort();
       controleur = new AbortController();
       const { signal } = controleur;
       try {
         const resultats = await chercher(texte, { signal });
         if (!signal.aborted) afficher(resultats);
       } catch (erreur) {
         if (erreur.name !== 'AbortError') throw erreur;
       }
     };
   }

   it("n'affiche jamais une réponse périmée", async () => {
     vi.useFakeTimers();
     const delais = { java: 500, javascript: 100 }; // la première requête est la plus lente
     const chercher = (texte, { signal }) =>
       new Promise((resoudre, rejeter) => {
         const minuteur = setTimeout(() => resoudre([`résultat pour ${texte}`]), delais[texte]);
         signal.addEventListener('abort', () => {
           clearTimeout(minuteur);
           rejeter(new DOMException('annulée', 'AbortError'));
         });
       });
     const afficher = vi.fn();
     const rechercher = creerRecherche(chercher, afficher);

     const premiere = rechercher('java');
     const seconde = rechercher('javascript');
     await vi.advanceTimersByTimeAsync(600);
     await Promise.all([premiere, seconde]);

     expect(afficher.mock.calls).toEqual([[['résultat pour javascript']]]);
     vi.useRealTimers();
   });
   ```

   Dans la page, on combine les deux : `const rechercherDebounce = debounce(creerRecherche(chercher, afficher), 300)`.
   Le debounce limite le nombre de requêtes, l'annulation garantit l'ordre. Avec `fetch`, on passe simplement
   `{ signal }` en option.
   :::

## Questions d'entretien

- Quelle différence entre debounce et throttle ? Donne un cas d'usage pour chacun.

  :::indice
  L'un attend la fin de la rafale, l'autre agit pendant.
  :::

  :::reponse
  Le debounce exécute la fonction une seule fois, quand les appels ont cessé depuis un certain délai : c'est adapté
  à une recherche pendant la frappe ou à une sauvegarde automatique, où seul le dernier état compte. Le throttle
  exécute la fonction au plus une fois par intervalle pendant la rafale, en gardant le dernier appel : c'est adapté
  au défilement, au suivi de la souris ou à l'envoi périodique d'une position, où l'on veut des mises à jour
  régulières. Pour les mises à jour visuelles, on préfère `requestAnimationFrame`, qui cale le travail sur les images.
  :::

- Implémente `debounce` au tableau. Qu'est-ce que la closure retient ?

  :::indice
  Un minuteur qu'on annule et reprogramme à chaque appel.
  :::

  :::reponse
  ```js
  function debounce(fonction, delai) {
    let minuteur;
    return function (...arguments_) {
      clearTimeout(minuteur);
      minuteur = setTimeout(() => fonction.apply(this, arguments_), delai);
    };
  }
  ```
  La closure retient l'identifiant du minuteur, partagé par tous les appels. Chaque appel annule le précédent et en
  reprogramme un ; la fonction ne s'exécute que si aucun appel ne survient pendant `delai`. J'utilise une `function`
  pour recevoir le `this` de l'appelant, et une fonction fléchée dans le `setTimeout` pour le conserver. En
  production, j'ajoute `cancel` et `flush`.
  :::

- Pourquoi `requestAnimationFrame` est-il souvent préférable à un throttle de 16 ms pour une animation liée au
  défilement ?

  :::indice
  Qui décide du moment où l'image est dessinée ?
  :::

  :::reponse
  Un minuteur de 16 ms n'est pas synchronisé avec l'affichage : il peut s'exécuter juste après une image, et sa mise
  à jour attend la suivante, ou deux fois entre deux images, dont une pour rien. `requestAnimationFrame` exécute le
  callback juste avant le dessin, une fois par image, en suivant la fréquence réelle de l'écran, 60, 120 Hz ou plus.
  Il est aussi suspendu quand l'onglet est masqué, ce qui économise le processeur et la batterie.
  :::
