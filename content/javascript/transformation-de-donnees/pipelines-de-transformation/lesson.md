---
id: javascript-pipelines-donnees
title: "Pipelines de transformation de données"
slug: pipelines-de-transformation
technology: javascript
level: advanced
module: transformation-de-donnees
order: 2
estimatedMinutes: 35
difficulty: 4
xp: 90
prerequisites:
  - javascript-regrouper-indexer
  - javascript-tableaux-trier
skills:
  - data-pipelines
tags:
  - javascript
  - donnees
---

## Objectifs

- Découper une transformation en étapes nommées : nettoyer, aplatir, enrichir, agréger, présenter.
- Utiliser `flatMap` pour les relations « un vers plusieurs » et pour filtrer en transformant.
- Normaliser des données imbriquées en entités indexées par identifiant.
- Tester chaque étape séparément, et placer la validation à l'entrée du pipeline.

## Introduction

Entre la réponse brute d'une API et ce qu'affiche un tableau de bord, il y a souvent une dizaine d'opérations : écarter
les lignes invalides, convertir des chaînes en nombres, aplatir des commandes en lignes, joindre le catalogue, regrouper
par catégorie, arrondir, trier. Écrites dans une seule fonction de quatre-vingts lignes, elles deviennent vite
impossibles à relire et à tester. Organisées en **pipeline** d'étapes pures et nommées, chacune fait une chose, se lit en
une phrase et se teste avec trois lignes de données.

## Concept

| Étape | Rôle | Outils |
| --- | --- | --- |
| Valider et nettoyer | écarter ou corriger les entrées invalides, convertir les types | `flatMap`, `Number`, `trim` |
| Aplatir | passer d'une commande à ses lignes | `flatMap` |
| Enrichir | joindre des données d'une autre source | index `Map` |
| Agréger | regrouper et calculer | `Map.groupBy`, `reduce` |
| Présenter | arrondir, formater, trier pour l'affichage | `toSorted`, `Intl.NumberFormat` |
| Normaliser | ranger des entités imbriquées par identifiant | `Object.fromEntries`, `Map` |

## Exemple

```js
const reponseApi = [
  { id: 'A1', client: ' Ada ', lignes: [{ sku: 'LIV-1', qte: '2', prix: '12.50' }, { sku: 'JEU-7', qte: '1', prix: '30' }] },
  { id: 'A2', client: 'Alan', lignes: [{ sku: 'LIV-1', qte: '1', prix: '12.50' }, { sku: 'XXX', qte: 'abc', prix: '5' }] },
  { id: 'A3', client: '', lignes: [] },
];
const catalogue = [
  { sku: 'LIV-1', categorie: 'livres' },
  { sku: 'JEU-7', categorie: 'jeux' },
];

// 1. Aplatir et nettoyer : une commande devient ses lignes valides.
const versLignes = (commandes) =>
  commandes.flatMap((commande) =>
    commande.lignes.flatMap((ligne) => {
      const quantite = Number(ligne.qte);
      const centimes = Math.round(Number(ligne.prix) * 100);
      if (!Number.isInteger(quantite) || quantite <= 0 || !Number.isFinite(centimes)) return [];
      return [{ commande: commande.id, client: commande.client.trim(), sku: ligne.sku, quantite, centimes }];
    }),
  );

// 2. Enrichir avec le catalogue indexé.
const enrichir = (catalogue) => {
  const parSku = new Map(catalogue.map((produit) => [produit.sku, produit]));
  return (lignes) =>
    lignes.map((ligne) => ({ ...ligne, categorie: parSku.get(ligne.sku)?.categorie ?? 'inconnue' }));
};

// 3. Agréger par catégorie.
const totalParCategorie = (lignes) =>
  [...Map.groupBy(lignes, (ligne) => ligne.categorie)].map(([categorie, groupe]) => ({
    categorie,
    centimes: groupe.reduce((somme, ligne) => somme + ligne.quantite * ligne.centimes, 0),
  }));

// 4. Présenter.
const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const presenter = (totaux) =>
  totaux
    .toSorted((a, b) => b.centimes - a.centimes)
    .map(({ categorie, centimes }) => `${categorie} : ${euros.format(centimes / 100)}`);

const pipe = (...etapes) => (entree) => etapes.reduce((valeur, etape) => etape(valeur), entree);
const rapport = pipe(versLignes, enrichir(catalogue), totalParCategorie, presenter);

console.log(rapport(reponseApi)); // [ 'livres : 37,50 €', 'jeux : 30,00 €' ]
console.log(versLignes(reponseApi).length); // 3 : la ligne 'abc' est écartée
```

## Comment ça fonctionne

Chaque étape du pipeline est une fonction pure qui prend un tableau et en renvoie un nouveau. Le pipeline se lit alors
comme une phrase : aplatir en lignes, enrichir avec le catalogue, totaliser par catégorie, présenter. Une étape qui a
besoin d'une donnée extérieure, comme `enrichir`, la reçoit par application partielle : `enrichir(catalogue)` construit
l'index une seule fois et renvoie l'étape proprement dite.

`flatMap` fait deux choses utiles. Il exprime les relations **un vers plusieurs** : une commande devient autant
d'éléments qu'elle a de lignes. Et il permet de **filtrer en transformant** : renvoyer `[]` écarte l'élément,
renvoyer `[valeur]` le garde transformé. On évite ainsi un `map` qui produirait des `null` suivi d'un `filter` pour les
retirer, et on ne calcule la conversion qu'une fois.

La **validation** est placée tout au début, à la frontière. Les données d'une API sont du texte non fiable : `qte`
peut valoir `'abc'`, `prix` une chaîne avec virgule, `client` des espaces. Une fois passées par `versLignes`, les
lignes respectent un format connu — quantité entière positive, montant en centimes entiers — et les étapes suivantes
n'ont plus à se méfier. Travailler en **centimes entiers** évite que `0.1 + 0.2` fausse les totaux ; la conversion en
euros n'arrive qu'à l'affichage. Dans un vrai projet, les lignes écartées sont aussi comptées ou journalisées : une
donnée perdue en silence est une donnée qu'on ne corrigera jamais.

L'étape de **présentation** est séparée de l'agrégation. Les totaux restent des nombres qu'on peut tester, comparer,
exporter ; seule la dernière étape fabrique du texte. `Intl.NumberFormat` gère le séparateur décimal, le symbole et
l'espace insécable propres à chaque langue.

Quand des données imbriquées doivent être **mises à jour** ou référencées depuis plusieurs endroits, on les
**normalise** : on range chaque type d'entité dans un objet indexé par identifiant, et les relations deviennent des
listes d'identifiants. Modifier un client se fait alors à un seul endroit. C'est la forme qu'utilisent les caches de
données côté client et les gestionnaires d'état.

Enfin, chaque étape se teste seule : trois lignes en entrée, le résultat attendu en sortie. Quand le rapport final est
faux, on vérifie les étapes une à une, ou on insère un `tap(console.log)` entre deux étapes, au lieu de déboguer une
fonction monolithique.

## Erreurs fréquentes

**Valider au milieu du pipeline.** Chaque étape se remet à vérifier les types : valide une fois, à l'entrée.

**Calculer des montants en décimal.** Additionne des centimes entiers, formate à la fin.

**Mélanger agrégation et formatage.** Un total devenu `'37,50 €'` ne se compare plus.

**Comparer une sortie de `Intl.NumberFormat` à une chaîne tapée à la main.** L'espace avant `€` est insécable :
compare les nombres, ou formate aussi la valeur attendue.

**Écarter des données invalides en silence.** Compte-les ou journalise-les.

## À retenir

- Un pipeline = des étapes pures et nommées, enchaînées avec `pipe`.
- `flatMap` aplatit les relations « un vers plusieurs » et filtre en transformant.
- Valider et convertir à l'entrée ; les étapes suivantes font confiance au format.
- Calculer en entiers, formater à la dernière étape.
- Normaliser par identifiant les entités partagées ou modifiées.

## Exercices

1. Transforme un export texte en objets `{ nom, email }`. Chaque ligne a la forme `nom;email` ; écarte les lignes vides,
   celles sans `@`, et retire les espaces superflus. Utilise un seul `flatMap`.

   :::indice
   Dans le `flatMap`, découpe la ligne avec `split(';')`, puis renvoie `[]` pour écarter ou `[objet]` pour garder.
   :::

   :::solution
   ```js
   const importer = (texte) =>
     texte.split('\n').flatMap((ligne) => {
       const [nom = '', email = ''] = ligne.split(';').map((champ) => champ.trim());
       return nom !== '' && email.includes('@') ? [{ nom, email: email.toLowerCase() }] : [];
     });

   const texte = ' Ada ; ADA@exemple.fr\n\nAlan;alan-sans-arobase\nGrace;grace@exemple.fr ';
   console.log(importer(texte));
   // [ { nom: 'Ada', email: 'ada@exemple.fr' }, { nom: 'Grace', email: 'grace@exemple.fr' } ]
   ```
   :::

2. Normalise une liste d'articles dont chaque élément contient son auteur complet : produis
   `{ articles: { [id]: { id, titre, auteur: idAuteur } }, auteurs: { [id]: auteur } }`.

   :::indice
   Parcours les articles une fois : range l'auteur par son identifiant, et remplace-le dans l'article par cet
   identifiant.
   :::

   :::solution
   ```js
   function normaliser(liste) {
     const articles = {};
     const auteurs = {};
     for (const { auteur, ...article } of liste) {
       auteurs[auteur.id] = auteur;
       articles[article.id] = { ...article, auteur: auteur.id };
     }
     return { articles, auteurs };
   }

   const donnees = normaliser([
     { id: 'a1', titre: 'Closures', auteur: { id: 'u1', nom: 'Ada' } },
     { id: 'a2', titre: 'Promesses', auteur: { id: 'u1', nom: 'Ada' } },
   ]);
   console.log(donnees.articles.a2); // { id: 'a2', titre: 'Promesses', auteur: 'u1' }
   console.log(Object.keys(donnees.auteurs)); // [ 'u1' ] : l'auteur n'est stocké qu'une fois
   ```
   :::

3. Écris une étape `separerValides(lignes)` qui renvoie `{ valides, rejets }`, où chaque rejet garde la ligne et la
   raison, puis teste-la avec `node:assert`.

   :::indice
   Une fonction `verifier(ligne)` qui renvoie la raison du rejet, ou `null`, garde la boucle lisible.
   :::

   :::solution
   ```js
   import assert from 'node:assert/strict';

   function verifier(ligne) {
     if (!Number.isInteger(ligne.quantite) || ligne.quantite <= 0) return 'quantité invalide';
     if (!Number.isInteger(ligne.centimes) || ligne.centimes < 0) return 'prix invalide';
     return null;
   }

   function separerValides(lignes) {
     const valides = [];
     const rejets = [];
     for (const ligne of lignes) {
       const raison = verifier(ligne);
       if (raison === null) valides.push(ligne);
       else rejets.push({ ligne, raison });
     }
     return { valides, rejets };
   }

   const { valides, rejets } = separerValides([
     { sku: 'A', quantite: 2, centimes: 1250 },
     { sku: 'B', quantite: 0, centimes: 500 },
     { sku: 'C', quantite: 1, centimes: 12.5 },
   ]);

   assert.deepEqual(valides.map((ligne) => ligne.sku), ['A']);
   assert.deepEqual(rejets.map((rejet) => rejet.raison), ['quantité invalide', 'prix invalide']);
   console.log('tests réussis');
   ```

   La boucle avec deux tableaux locaux reste une fonction pure : les mutations ne sont pas visibles de l'extérieur.
   :::

## Questions d'entretien

- Comment structures-tu la transformation des données brutes d'une API en données d'affichage ?

  :::indice
  Pense aux frontières : où valider, où calculer, où formater.
  :::

  :::reponse
  En étapes pures et nommées. D'abord valider et convertir à l'entrée — types, champs manquants, valeurs aberrantes —
  en comptant les rejets. Ensuite les transformations métier sur des données fiables : aplatir, enrichir par index,
  agréger, en gardant des nombres. Enfin une étape de présentation qui formate et trie pour l'affichage. Chaque étape
  se teste seule, et le pipeline se lit comme la description du traitement.
  :::

- Pourquoi normaliser des données côté client ?

  :::indice
  Que se passe-t-il quand le même auteur apparaît dans cinquante articles et qu'il change de nom ?
  :::

  :::reponse
  Dans des données imbriquées, une même entité est dupliquée partout où elle apparaît : la mettre à jour oblige à
  retrouver toutes ses copies, et on finit avec des versions incohérentes. Normaliser range chaque entité une seule
  fois par identifiant, et les relations ne portent que des identifiants : une mise à jour se fait à un endroit, et les
  recherches par identifiant sont directes. On dénormalise au moment d'afficher, avec un sélecteur.
  :::

- Quand utilises-tu `flatMap` plutôt que `map` suivi de `filter` ?

  :::indice
  Pense à ce que `flatMap` fait d'un tableau vide renvoyé par la fonction.
  :::

  :::reponse
  Quand un élément peut produire zéro, un ou plusieurs résultats : une commande et ses lignes, une ligne de texte qui
  peut être invalide. Renvoyer `[]` l'écarte, `[valeur]` le garde transformé, et plusieurs valeurs l'éclatent. C'est
  plus direct qu'un `map` qui produit des `null` suivi d'un `filter`, et la conversion n'est calculée qu'une fois. Pour
  une transformation un pour un, `map` reste plus lisible.
  :::
