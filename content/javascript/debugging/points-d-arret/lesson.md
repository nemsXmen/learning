---
id: javascript-points-arret
title: "Points d'arrêt : exécuter pas à pas dans les DevTools"
slug: points-d-arret
technology: javascript
level: intermediate
module: debugging
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-debug-console
skills:
  - breakpoints
tags:
  - javascript
  - debogage
---

## Objectifs

- Suspendre l'exécution à un endroit précis, et inspecter les variables, la portée et la pile.
- Avancer pas à pas, entrer dans une fonction ou en sortir.
- Utiliser les points d'arrêt conditionnels, les points de journalisation et l'arrêt sur exception,
  dans le navigateur comme dans Node.js.

## Introduction

Ajouter un `console.log`, recharger, lire, en ajouter un autre, recharger encore : cette boucle
fonctionne, mais elle oblige à deviner à l'avance ce qu'il faudra afficher. Un **point d'arrêt**
renverse la démarche : le programme s'arrête à la ligne choisie, et **toutes** les variables sont
consultables, la pile d'appels aussi, et l'on peut avancer instruction par instruction. Pour un bug
qu'on ne comprend pas encore, c'est presque toujours plus rapide.

## Concept

| Outil | Effet |
| --- | --- |
| Point d'arrêt | un clic sur le numéro de ligne dans l'onglet *Sources* : l'exécution s'arrête avant cette ligne |
| Instruction `debugger;` | le même arrêt, écrit dans le code, actif seulement si les outils sont ouverts |
| Point d'arrêt conditionnel | ne s'arrête que si une expression est vraie, par exemple `article.prix < 0` |
| Point de journalisation (*logpoint*) | affiche un message sans s'arrêter, sans modifier le code |
| Arrêt sur exception | s'arrête à l'endroit où une erreur est levée, rattrapée ou non |

Une fois arrêté, les commandes des DevTools de Chrome :

| Action | Raccourci | Effet |
| --- | --- | --- |
| Reprendre | `F8` | continue jusqu'au prochain point d'arrêt |
| Pas à pas principal | `F10` | exécute la ligne, sans entrer dans les fonctions appelées |
| Entrer | `F11` | entre dans la fonction appelée sur la ligne |
| Sortir | `Maj+F11` | termine la fonction courante et revient à l'appelant |

Les panneaux à consulter : **Scope** pour les variables de chaque portée, **Call Stack** pour la chaîne
d'appels, **Watch** pour suivre des expressions choisies.

## Exemple

```js
// Le total affiché est faux pour certains paniers. Où poser les points d'arrêt ?
function totalPanier(articles, codePromo) {
  let total = 0;
  for (const article of articles) {
    total += article.prix * article.quantite; // point d'arrêt conditionnel : article.quantite === undefined
  }
  return appliquerPromo(total, codePromo); // F11 ici pour entrer dans appliquerPromo
}

function appliquerPromo(total, code) {
  const remises = { BIENVENUE: 0.1, FIDELE: 0.2 };
  const taux = remises[code]; // Watch : code, taux
  return total * (1 - taux); // taux vaut undefined pour un code inconnu → NaN
}

console.log(totalPanier([{ prix: 20, quantite: 2 }], 'BIENVENUE')); // 36
console.log(totalPanier([{ prix: 20, quantite: 2 }], 'INCONNU')); // NaN : le bug
console.log(totalPanier([{ prix: 20 }], 'FIDELE')); // NaN : un second bug, quantité absente
```

## Comment ça fonctionne

Quand l'exécution atteint un point d'arrêt, le moteur suspend le fil JavaScript **avant** la ligne
marquée. Rien d'autre ne s'exécute pendant la pause : ni minuteur, ni événement, ni rendu. Les DevTools
affichent alors l'état exact du programme. Le panneau **Scope** liste les variables de chaque portée —
locale, closure, module, globale —, et l'on peut survoler une variable dans le code pour lire sa valeur.
Le panneau **Call Stack** montre la chaîne d'appels : cliquer sur un cadre plus bas affiche les
variables de la fonction appelante, telles qu'elles étaient au moment de l'appel.

Avancer pas à pas demande de choisir à chaque ligne : **passer** l'appel de fonction quand on lui fait
confiance, **entrer** dedans quand le problème peut s'y trouver, **sortir** quand on a vu ce qu'il fallait.
Dans l'exemple, un point d'arrêt sur le `return` de `totalPanier`, puis `F11` pour entrer dans
`appliquerPromo`, montre en deux étapes que `taux` vaut `undefined` pour un code inconnu.

Le **point d'arrêt conditionnel** évite de s'arrêter mille fois dans une boucle : on n'interrompt que
l'itération suspecte. Le **point de journalisation** affiche un message à chaque passage sans s'arrêter
et sans toucher au code source — un `console.log` qu'on n'oublie pas de retirer. L'**arrêt sur exception**
suspend l'exécution là où l'erreur est levée, et non là où elle est finalement rattrapée : c'est le moyen
le plus direct de trouver l'origine d'une erreur qu'un `catch` avale.

Le code livré est souvent minifié et regroupé : les **source maps** permettent aux DevTools d'afficher et
d'arrêter le code d'origine. Sans elles, les points d'arrêt se posent sur un fichier illisible.

Pour **Node.js**, `node --inspect fichier.js` ouvre un port de débogage, et `node --inspect-brk` s'arrête
dès la première ligne. On s'y connecte depuis `chrome://inspect` dans Chrome, ou directement depuis
l'éditeur : VS Code lance et attache le débogueur avec une simple configuration, et les points d'arrêt se
posent dans la marge du code.

## Erreurs fréquentes

**Poser un point d'arrêt dans une boucle de mille tours.** Rends-le conditionnel.

**Entrer dans chaque fonction.** Passe par-dessus celles qui ne sont pas suspectes.

**Oublier une instruction `debugger`.** Elle arrête l'application de quiconque ouvre les outils : retire-la.

**Déboguer du code minifié.** Active les source maps.

**Ne regarder que la fonction courante.** La valeur fautive vient souvent d'un appelant : remonte la pile.

## À retenir

- Un point d'arrêt suspend l'exécution avant la ligne et rend tout l'état consultable.
- `F8` reprendre, `F10` passer, `F11` entrer, `Maj+F11` sortir.
- Conditionnel pour cibler une itération, journalisation pour observer sans s'arrêter.
- L'arrêt sur exception montre où une erreur naît, pas où elle est rattrapée.
- Node.js se débogue avec `--inspect`, depuis Chrome ou l'éditeur.

## Exercices

1. En t'appuyant sur l'exemple, décris la séquence de débogage — points d'arrêt, pas à pas, panneaux à
   lire — qui mène à la cause du `NaN` pour le code `'INCONNU'`, puis corrige `appliquerPromo`.

   :::indice
   Pars du résultat faux et remonte : quelle valeur produit `NaN` dans la multiplication ?
   :::

   :::solution
   1. Point d'arrêt sur `return appliquerPromo(total, codePromo)` : le panneau Scope montre `total` à 40,
      une valeur correcte.
   2. `F11` pour entrer dans `appliquerPromo`, puis `F10` jusqu'au `return`.
   3. Le survol, ou une expression Watch, montre `taux` à `undefined` : `remises['INCONNU']` n'existe pas,
      et `1 - undefined` vaut `NaN`.

   ```js
   function appliquerPromo(total, code) {
     const remises = { BIENVENUE: 0.1, FIDELE: 0.2 };
     const taux = remises[code] ?? 0;
     return total * (1 - taux);
   }

   console.log(appliquerPromo(40, 'INCONNU'), appliquerPromo(40, 'BIENVENUE')); // 40 36
   ```
   :::

2. Le troisième appel de l'exemple renvoie aussi `NaN`, pour une autre raison. Donne l'expression d'un point
   d'arrêt conditionnel qui ne s'arrête que sur l'article fautif, puis corrige `totalPanier`.

   :::indice
   Dans la boucle, quelle propriété d'article peut être absente ?
   :::

   :::solution
   Le point d'arrêt conditionnel sur la ligne `total += …` avec l'expression
   `article.quantite === undefined` s'arrête uniquement sur l'article sans quantité : `20 * undefined`
   vaut `NaN`, qui contamine tout le total. Selon la règle métier, on applique une quantité par défaut ou
   l'on refuse la donnée ; ici, un article sans quantité compte pour un.

   ```js
   function totalPanier(articles, codePromo) {
     let total = 0;
     for (const { prix, quantite = 1 } of articles) {
       total += prix * quantite;
     }
     return appliquerPromo(total, codePromo);
   }

   function appliquerPromo(total, code) {
     const taux = { BIENVENUE: 0.1, FIDELE: 0.2 }[code] ?? 0;
     return total * (1 - taux);
   }

   console.log(totalPanier([{ prix: 20 }], 'FIDELE')); // 16
   ```
   :::

3. `lireReglages` renvoie `null` pour un texte qui semble valide, et le `catch` masque la raison. Décris
   comment l'arrêt sur exception retrouve l'origine, puis modifie la fonction pour ne plus masquer les
   erreurs inattendues.

   ```js
   function lireReglages(texte) {
     try {
       const reglages = JSON.parse(texte);
       return reglages.affichage.theme;
     } catch {
       return null;
     }
   }
   lireReglages('{"theme": "sombre"}'); // null
   ```

   :::indice
   Active « Pause on caught exceptions » : où l'exécution s'arrête-t-elle, et avec quelle erreur ?
   :::

   :::solution
   Avec l'arrêt sur les exceptions **rattrapées**, l'exécution s'arrête sur `reglages.affichage.theme` avec
   une `TypeError` : `affichage` n'existe pas, le JSON est valide mais n'a pas la forme attendue. Le `catch`
   transformait ce problème de données en `null` silencieux.

   ```js
   function lireReglages(texte) {
     let reglages;
     try {
       reglages = JSON.parse(texte);
     } catch {
       return null; // seul cas prévu : un texte qui n'est pas du JSON
     }
     return reglages.affichage?.theme ?? reglages.theme ?? null;
   }

   console.log(lireReglages('{"theme": "sombre"}')); // 'sombre'
   console.log(lireReglages('pas du json')); // null
   ```

   Le `try` ne couvre plus que `JSON.parse`, et la forme des données est traitée explicitement.
   :::

## Questions d'entretien

- Quand un point d'arrêt est-il plus efficace qu'un `console.log` ?

  :::indice
  Sait-on déjà ce qu'il faut afficher ?
  :::

  :::reponse
  Quand on ne sait pas encore où chercher. Un `console.log` oblige à deviner à l'avance quelles valeurs
  afficher, puis à relancer pour chaque nouvelle hypothèse. Un point d'arrêt montre en une fois toutes les
  variables de toutes les portées et la pile d'appels, et permet d'avancer pas à pas. `console.log` reste
  pratique pour observer un comportement dans la durée, par exemple sur de nombreuses itérations ou dans
  un flux d'événements rapides.
  :::

- Quelle différence entre « passer », « entrer » et « sortir » ?

  :::indice
  Que se passe-t-il quand la ligne courante appelle une fonction ?
  :::

  :::reponse
  « Passer » (`F10`) exécute la ligne entière, fonctions appelées comprises, et s'arrête à la ligne
  suivante. « Entrer » (`F11`) s'arrête à la première ligne de la fonction appelée sur la ligne courante.
  « Sortir » (`Maj+F11`) termine la fonction en cours et s'arrête dans l'appelant, juste après l'appel.
  On passe par-dessus ce qui est sûr et on entre dans ce qui est suspect.
  :::

- À quoi sert l'arrêt sur exception rattrapée ?

  :::indice
  Pense à une erreur qu'un `catch` transforme en valeur par défaut.
  :::

  :::reponse
  À trouver l'endroit où une erreur est levée, même quand un `catch` la rattrape et la masque ensuite.
  Sans lui, on ne voit que le symptôme — une valeur `null`, un message générique —, loin de la cause.
  L'exécution s'arrête sur la ligne fautive, avec la pile et les variables du moment. On l'active
  ponctuellement, car les bibliothèques lèvent et rattrapent souvent des erreurs de façon normale.
  :::
