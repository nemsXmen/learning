---
id: javascript-debug-reseau
title: "Déboguer le réseau, les performances et la mémoire"
slug: reseau-performances-memoire
technology: javascript
level: intermediate
module: debugging
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-points-arret
skills:
  - network-performance-debugging
tags:
  - javascript
  - debogage
---

## Objectifs

- Lire une requête dans l'onglet Réseau : statut, en-têtes, corps et chronologie.
- Mesurer avant d'optimiser, avec `performance.now`, `performance.mark` et le profileur.
- Repérer une fuite mémoire en comparant des instantanés du tas.

## Introduction

Beaucoup de bugs ne sont pas dans la logique, mais entre les programmes : une requête qui part sans
en-tête d'authentification, une réponse 200 dont le corps est vide, une page qui ralentit au bout de
dix minutes. Les DevTools ont un onglet pour chacun de ces problèmes. La règle qui les relie tient en
une phrase : **on observe et on mesure avant de modifier quoi que ce soit**.

## Concept

**Onglet Réseau** :

| À regarder | Ce qu'on y apprend |
| --- | --- |
| Statut | 2xx succès, 4xx erreur de la requête, 5xx erreur du serveur |
| En-têtes | ce qui a vraiment été envoyé : `Authorization`, `Content-Type`, cookies |
| Charge utile et réponse | le corps envoyé et reçu, tel quel |
| Chronologie | attente du serveur, téléchargement, file d'attente du navigateur |
| Options | conserver le journal entre deux pages, désactiver le cache, simuler un réseau lent |

**Performances** : `performance.now()` pour une durée précise, `performance.mark` et
`performance.measure` pour nommer des étapes, l'onglet **Performance** pour enregistrer une interaction
et voir quelles fonctions occupent le fil principal. Une tâche de plus de 50 ms bloque l'interface de
façon perceptible.

**Mémoire** : l'onglet **Memory** prend des instantanés du tas. Une mémoire qui grandit à chaque
répétition d'une même action, sans redescendre, signale une fuite.

## Exemple

```js
const n = 20_000;
const identifiants = Array.from({ length: n }, (_, i) => i);
const recherches = Array.from({ length: n }, (_, i) => i * 2);

function avecIncludes() {
  let trouves = 0;
  for (const id of recherches) if (identifiants.includes(id)) trouves++;
  return trouves;
}

function avecSet() {
  const ensemble = new Set(identifiants);
  let trouves = 0;
  for (const id of recherches) if (ensemble.has(id)) trouves++;
  return trouves;
}

performance.mark('debut');
const resultatIncludes = avecIncludes();
performance.mark('fin');
const dureeIncludes = performance.measure('includes', 'debut', 'fin').duration;

const debutSet = performance.now();
const resultatSet = avecSet();
const dureeSet = performance.now() - debutSet;

console.log(resultatIncludes === resultatSet); // true : même résultat
console.log(dureeIncludes > dureeSet * 10); // true : Set est plusieurs dizaines de fois plus rapide ici
```

## Comment ça fonctionne

L'onglet **Réseau** montre ce qui est réellement échangé, et non ce que le code est censé envoyer. C'est
là qu'on vérifie qu'un en-tête `Authorization` est présent, que le corps est bien du JSON avec le
`Content-Type` correspondant, ou qu'une requête part deux fois. Le **statut** oriente la recherche : un
4xx désigne en général la requête — données, droits, adresse —, un 5xx le serveur. Une erreur **CORS**
apparaît dans la console avec une requête rouge : le navigateur a reçu une réponse mais refuse de la
transmettre au code, faute d'en-têtes autorisant l'origine. La **chronologie** distingue une attente du
serveur, longue avant le premier octet, d'un téléchargement lent. Les options « conserver le journal »,
« désactiver le cache » et la simulation d'un réseau lent permettent de reproduire des situations
qu'on ne voit jamais sur sa machine.

Pour les **performances**, la première règle est de mesurer. L'intuition sur ce qui est lent se trompe
souvent : l'exemple montre une boucle anodine, dont le coût réel vient de `includes`, qui parcourt tout le
tableau à chaque recherche. `performance.now()` donne une durée en millisecondes avec décimales, plus
précise que `Date.now()`. `performance.mark` et `performance.measure` nomment des étapes, visibles aussi
dans l'onglet Performance. Cet onglet enregistre une interaction et affiche un graphique en flammes : les
barres les plus larges sont les fonctions qui occupent le plus le fil principal, et les tâches longues sont
signalées. On optimise ce qui apparaît en haut du profil, puis on **mesure à nouveau**.

Pour la **mémoire**, la démarche est comparative. On prend un instantané du tas, on répète plusieurs fois
une action qui devrait tout remettre à zéro — ouvrir puis fermer une fenêtre —, on force le ramasse-miettes
et on prend un second instantané. Des objets qui s'accumulent d'un instantané à l'autre sont retenus par
quelqu'un : l'outil montre la chaîne de références qui les garde en vie. Les coupables habituels sont
connus : écouteurs non retirés, intervalles oubliés, caches sans limite, éléments du DOM détachés mais
encore référencés. Dans Node.js, `process.memoryUsage()` suit l'évolution du tas, et `--inspect` donne
accès aux mêmes instantanés.

## Erreurs fréquentes

**Optimiser sans mesurer.** On améliore du code qui n'était pas lent.

**Conclure sur une seule mesure.** Répète, et compare dans les mêmes conditions.

**Tester le réseau uniquement sur une connexion rapide.** Simule un réseau lent.

**Chercher un bug CORS dans le code du client.** La correction se fait dans les en-têtes du serveur.

**Prendre un seul instantané mémoire.** Une fuite se voit par comparaison.

## À retenir

- L'onglet Réseau montre ce qui a vraiment été envoyé et reçu : statut, en-têtes, corps, chronologie.
- 4xx : la requête ; 5xx : le serveur ; CORS : les en-têtes de réponse.
- Mesurer d'abord : `performance.now`, `mark`, `measure`, puis le profileur.
- Une tâche de plus de 50 ms gêne l'interface.
- Une fuite mémoire se repère en comparant des instantanés après des actions répétées.

## Exercices

1. Un utilisateur signale que son profil ne s'enregistre pas. La console n'affiche rien, et l'onglet Réseau
   montre une requête `PUT /api/profil` avec le statut 415. Que vérifier en priorité, et que corriger dans ce
   code ?

   ```js
   fetch('/api/profil', { method: 'PUT', body: JSON.stringify({ nom: 'Ada' }) });
   ```

   :::indice
   Le statut 415 signifie « type de média non pris en charge ». Quel en-tête indique le type du corps ?
   :::

   :::solution
   Dans l'onglet Réseau, les en-têtes de la requête montrent un `Content-Type` à `text/plain` : c'est la
   valeur par défaut quand `body` est une chaîne. Le serveur attend du JSON et refuse la requête. Le code
   doit déclarer le type du corps, et traiter les statuts d'erreur pour que l'échec ne reste pas silencieux.

   ```js
   const reponse = await fetch('/api/profil', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ nom: 'Ada' }),
   });
   if (!reponse.ok) {
     throw new Error(`Enregistrement du profil impossible : ${reponse.status}`);
   }
   ```

   `fetch` ne rompt pas sa promesse pour un 4xx ou un 5xx : sans ce test, l'erreur passe inaperçue.
   :::

2. `preparerRapport` est lente. Mesure séparément ses deux étapes avec `performance.mark` et
   `performance.measure`, puis corrige l'étape fautive.

   ```js
   function preparerRapport(ventes) {
     const triees = ventes.toSorted((a, b) => a - b);
     const uniques = triees.filter((v, i) => triees.indexOf(v) === i);
     return uniques;
   }
   ```

   :::indice
   Pose une marque avant et après chaque étape. Que coûte `indexOf` appelé pour chaque élément ?
   :::

   :::solution
   ```js
   const ventes = Array.from({ length: 20_000 }, (_, i) => i % 5_000);

   performance.mark('tri-debut');
   const triees = ventes.toSorted((a, b) => a - b);
   performance.mark('tri-fin');
   const uniquesLentes = triees.filter((v, i) => triees.indexOf(v) === i);
   performance.mark('doublons-fin');

   const tri = performance.measure('tri', 'tri-debut', 'tri-fin').duration;
   const doublons = performance.measure('doublons', 'tri-fin', 'doublons-fin').duration;
   console.log(doublons > tri); // true : le dédoublonnage domine

   const uniques = [...new Set(triees)];
   console.log(uniques.length === uniquesLentes.length); // true : même résultat, en un seul parcours
   ```

   `indexOf` parcourt le tableau pour chaque élément : le coût croît avec le carré de la taille. Le `Set`
   ne parcourt qu'une fois.
   :::

3. Chaque ouverture de la vue « détails » augmente la mémoire, qui ne redescend jamais. Explique la fuite et
   corrige-la.

   ```js
   const abonnes = [];
   function ouvrirVue(donnees) {
     const surMiseAJour = () => donnees.length;
     abonnes.push(surMiseAJour);
   }
   function fermerVue() {}
   ```

   :::indice
   Qui garde une référence vers `surMiseAJour`, et donc vers `donnees`, après la fermeture ?
   :::

   :::solution
   Le tableau global `abonnes` garde chaque fonction, et chaque fonction capture `donnees` : rien n'est
   jamais libéré. Un instantané du tas montrerait ces tableaux retenus par `abonnes`. L'ouverture doit
   renvoyer de quoi se désabonner, et la fermeture l'appeler.

   ```js
   const abonnes = new Set();

   function ouvrirVue(donnees) {
     const surMiseAJour = () => donnees.length;
     abonnes.add(surMiseAJour);
     return function fermerVue() {
       abonnes.delete(surMiseAJour);
     };
   }

   for (let i = 0; i < 3; i++) {
     const fermer = ouvrirVue(new Array(100_000).fill(i));
     fermer();
   }
   console.log(abonnes.size); // 0 : plus rien ne retient les données
   ```
   :::

## Questions d'entretien

- Que regarder en premier dans l'onglet Réseau quand une requête « ne marche pas » ?

  :::indice
  Pense au statut, puis à ce qui a réellement été envoyé.
  :::

  :::reponse
  Le statut d'abord : un 4xx oriente vers la requête elle-même — données, authentification, type de
  contenu —, un 5xx vers le serveur, une erreur CORS vers les en-têtes de réponse. Puis les en-têtes et le
  corps réellement envoyés, qui diffèrent souvent de ce que le code croit envoyer, et la réponse brute. La
  chronologie sert ensuite pour les problèmes de lenteur.
  :::

- Pourquoi faut-il mesurer avant d'optimiser ?

  :::indice
  L'intuition sur ce qui est lent est-elle fiable ?
  :::

  :::reponse
  Parce que l'intuition se trompe souvent : le coût réel se cache dans une ligne anodine, comme un
  `includes` ou un `indexOf` dans une boucle, alors qu'on soupçonne le code le plus complexe. Mesurer avec
  `performance.now`, des marques ou le profileur désigne précisément la partie qui domine, et une seconde
  mesure prouve que l'optimisation a réellement servi. Optimiser à l'aveugle complique le code sans gain.
  :::

- Comment repérer une fuite mémoire dans une application web ?

  :::indice
  Une seule mesure suffit-elle ?
  :::

  :::reponse
  Par comparaison : prendre un instantané du tas, répéter plusieurs fois une action qui devrait tout
  libérer, forcer le ramasse-miettes, puis prendre un second instantané. Les objets qui s'accumulent sont
  retenus, et l'outil montre la chaîne de références qui les garde en vie. Les causes habituelles sont les
  écouteurs non retirés, les minuteurs oubliés, les caches sans limite et les éléments du DOM détachés mais
  encore référencés.
  :::
