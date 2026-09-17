---
id: javascript-transparence-referentielle
title: "Transparence référentielle, immutabilité et style déclaratif"
slug: transparence-et-style-declaratif
technology: javascript
level: advanced
module: programmation-fonctionnelle
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 90
prerequisites:
  - javascript-fonctions-pures
  - javascript-tableaux-immutabilite
skills:
  - referential-transparency
tags:
  - javascript
  - fonctionnel
---

## Objectifs

- Reconnaître une expression référentiellement transparente, et ce qu'elle permet : substituer, mémoriser, tester.
- Mettre à jour une structure imbriquée sans la modifier, en partageant les parties inchangées.
- Passer d'un code impératif à un code déclaratif, et savoir quand la boucle reste le meilleur choix.

## Introduction

Une fonction pure renvoie toujours le même résultat pour les mêmes arguments, sans effet de bord. La **transparence
référentielle** en est la conséquence pratique : on peut remplacer un appel par son résultat sans changer le
programme. Cette propriété, qui a l'air théorique, est ce qui rend un code facile à lire, à tester, à mettre en cache et
à réorganiser. Elle ne tient que si les données ne changent pas sous nos pieds : d'où l'**immutabilité**, et un style
**déclaratif** qui décrit le résultat voulu plutôt que les étapes pour l'obtenir.

## Concept

| Notion | Définition | Ce qu'elle apporte |
| --- | --- | --- |
| Transparence référentielle | un appel peut être remplacé par sa valeur | raisonner par substitution, mémoriser sans risque |
| Immutabilité | on crée une nouvelle version au lieu de modifier | pas de modification à distance, comparaison par référence |
| Partage structurel | la nouvelle version réutilise les parties inchangées | des copies peu coûteuses |
| Style déclaratif | décrire le quoi : `filter`, `map`, `groupBy` | une intention lisible |
| Style impératif | décrire le comment : boucles, compteurs, mutations | un contrôle fin, des sorties anticipées |

## Exemple

```js
// Transparente : toTTC(100) peut être remplacé par 120 partout.
const toTTC = (prixHT) => Math.round(prixHT * 1.2 * 100) / 100;

// Opaque : le résultat dépend d'un état extérieur qui change.
let remise = 0;
const prixRemise = (prix) => prix - remise;
console.log(prixRemise(100)); // 100
remise = 10;
console.log(prixRemise(100)); // 90 : même appel, autre valeur

// Mise à jour immuable d'un chemin, avec partage structurel.
function mettreAJour(objet, [cle, ...reste], transformer) {
  if (cle === undefined) return transformer(objet);
  const copie = Array.isArray(objet) ? [...objet] : { ...objet };
  copie[cle] = mettreAJour(objet[cle], reste, transformer);
  return copie;
}

const etat = {
  utilisateur: { nom: 'Ada', preferences: { theme: 'clair' } },
  panier: { articles: [{ id: 1, quantite: 1 }] },
};
const suivant = mettreAJour(etat, ['panier', 'articles', 0, 'quantite'], (q) => q + 1);

console.log(etat.panier.articles[0].quantite, suivant.panier.articles[0].quantite); // 1 2
console.log(suivant.utilisateur === etat.utilisateur); // true : partie inchangée partagée
console.log(suivant.panier === etat.panier); // false : chemin recopié

// Impératif puis déclaratif : le même calcul.
const commandes = [
  { client: 'ada', total: 120, payee: true },
  { client: 'alan', total: 80, payee: false },
  { client: 'ada', total: 40, payee: true },
];

let chiffreImperatif = 0;
for (const commande of commandes) {
  if (commande.payee) chiffreImperatif += toTTC(commande.total);
}

const chiffreDeclaratif = commandes
  .filter((commande) => commande.payee)
  .map((commande) => toTTC(commande.total))
  .reduce((somme, montant) => somme + montant, 0);

console.log(chiffreImperatif, chiffreDeclaratif); // 192 192
```

## Comment ça fonctionne

Une expression est **référentiellement transparente** quand la remplacer par sa valeur ne change rien au programme.
`toTTC(100)` l'est : on peut écrire `120` à la place, mettre le résultat en cache, calculer l'appel plus tôt ou plus
tard, ou ne pas le calculer si le résultat n'est pas utilisé. `prixRemise(100)` ne l'est pas : sa valeur dépend du
moment de l'appel, parce que la fonction lit une variable modifiable. Pour raisonner dessus, il faut connaître tout
l'historique du programme. La transparence est donc ce qui permet de comprendre une fonction **en la lisant seule**.

L'**immutabilité** protège cette propriété. Si une fonction reçoit un objet que quelqu'un d'autre modifie ensuite, le
même appel ne donne plus le même résultat. En créant une nouvelle version à chaque changement, chaque valeur reste
valable pour toujours : on peut la garder, la comparer, revenir en arrière.

Copier toute la structure à chaque changement serait coûteux. `mettreAJour` ne recopie que le **chemin** qui mène à la
modification — l'état, le panier, le tableau d'articles, l'article — et réutilise tel quel tout le reste. C'est le
**partage structurel** : `suivant.utilisateur` est le même objet que `etat.utilisateur`. Cette propriété a un intérêt
pratique majeur : pour savoir si une partie a changé, il suffit de comparer les références, sans parcourir le contenu.
Les bibliothèques d'interface et de gestion d'état reposent sur cette comparaison.

Le style **déclaratif** découle naturellement de ces deux idées : `filter`, `map` et `reduce` ne modifient pas le
tableau d'origine et nomment l'intention de chaque étape. La boucle impérative calcule la même chose, mais le lecteur
doit reconstituer l'intention à partir des mutations de `chiffreImperatif`.

Le déclaratif n'est pas une fin en soi. Une boucle reste préférable quand on veut s'arrêter tôt, quand plusieurs
résultats se calculent en une seule passe sur un très grand tableau, ou quand un `reduce` devient illisible. La
mutation **locale** — un tableau créé dans la fonction, modifié puis renvoyé — ne casse pas la transparence : vue de
l'extérieur, la fonction reste pure.

## Erreurs fréquentes

**Lire un état global dans une fonction « utilitaire ».** Passe la valeur en argument.

**Copier superficiellement puis modifier un niveau imbriqué.** Recopie chaque niveau du chemin modifié.

**Copier profondément toute la structure à chaque changement.** Tu perds le partage structurel et la comparaison par
référence.

**Écrire un `reduce` pour tout.** Un `map`, un `filter` ou une boucle est souvent plus clair.

**Croire qu'une mutation locale rend la fonction impure.** Seules les mutations visibles de l'extérieur comptent.

## À retenir

- Transparente : un appel peut être remplacé par sa valeur.
- Une fonction qui lit un état modifiable perd cette propriété.
- Mise à jour immuable : recopier le chemin modifié, partager le reste.
- Le partage structurel permet de détecter un changement par comparaison de références.
- Déclaratif pour exprimer l'intention ; boucle quand le contrôle ou la performance l'exigent.

## Exercices

1. Dis si chaque appel est référentiellement transparent, et justifie.

   ```js
   const carre = (n) => n * n;
   const maintenant = () => Date.now();
   const ajouter = (liste, element) => [...liste, element];
   const empiler = (liste, element) => liste.push(element);
   const aleatoire = (max) => Math.floor(Math.random() * max);
   ```

   :::indice
   Pour chaque fonction : deux appels identiques donnent-ils toujours la même valeur, et l'appel change-t-il quelque
   chose ailleurs ?
   :::

   :::solution
   - `carre(3)` est transparent : il vaut toujours `9`.
   - `maintenant()` ne l'est pas : la valeur dépend de l'instant de l'appel.
   - `ajouter(liste, 4)` est transparent : il renvoie un nouveau tableau sans toucher à `liste`.
   - `empiler(liste, 4)` ne l'est pas : il modifie `liste`, et renvoie une longueur qui change d'un appel à l'autre.
   - `aleatoire(10)` ne l'est pas : deux appels identiques donnent des valeurs différentes.
   :::

2. Écris `supprimerArticle(etat, id)` qui renvoie un nouvel état sans l'article d'identifiant `id`, en partageant tout
   ce qui n'a pas changé. Si l'article n'existe pas, renvoie `etat` lui-même.

   :::indice
   Renvoyer l'objet d'origine quand rien ne change permet à l'appelant de détecter l'absence de changement par
   `===`.
   :::

   :::solution
   ```js
   function supprimerArticle(etat, id) {
     const articles = etat.panier.articles;
     if (!articles.some((article) => article.id === id)) return etat;
     return {
       ...etat,
       panier: { ...etat.panier, articles: articles.filter((article) => article.id !== id) },
     };
   }

   const etat = {
     utilisateur: { nom: 'Ada' },
     panier: { devise: 'EUR', articles: [{ id: 1 }, { id: 2 }] },
   };

   const apres = supprimerArticle(etat, 1);
   console.log(apres.panier.articles, etat.panier.articles.length); // [ { id: 2 } ] 2
   console.log(apres.utilisateur === etat.utilisateur); // true
   console.log(supprimerArticle(etat, 99) === etat); // true : aucun changement
   ```
   :::

3. Réécris cette fonction de façon déclarative. Puis, si l'on voulait seulement savoir s'il existe au moins un produit
   en rupture, comment éviter de parcourir tout le tableau ?

   ```js
   function nomsEnRupture(produits) {
     const resultat = [];
     for (let i = 0; i < produits.length; i += 1) {
       if (produits[i].stock === 0) resultat.push(produits[i].nom.toUpperCase());
     }
     resultat.sort();
     return resultat;
   }
   ```

   :::indice
   `toSorted` trie sans modifier le tableau. Pour la seconde question, pense à la sortie anticipée.
   :::

   :::solution
   ```js
   const nomsEnRupture = (produits) =>
     produits
       .filter((produit) => produit.stock === 0)
       .map((produit) => produit.nom.toUpperCase())
       .toSorted();

   const produits = [
     { nom: 'stylo', stock: 0 },
     { nom: 'agenda', stock: 4 },
     { nom: 'cahier', stock: 0 },
   ];
   console.log(nomsEnRupture(produits)); // [ 'CAHIER', 'STYLO' ]
   console.log(produits.some((produit) => produit.stock === 0)); // true
   ```

   Pour une simple existence, ni `filter` ni une boucle complète ne conviennent : `some` s'arrête au premier produit
   trouvé, exactement comme une boucle avec `return true`, tout en restant déclaratif. La version `filter(...).length > 0`
   parcourrait tout le tableau et créerait un tableau intermédiaire pour rien.
   :::

## Questions d'entretien

- Qu'est-ce que la transparence référentielle, et à quoi sert-elle concrètement ?

  :::indice
  Pense à la substitution, au cache et aux tests.
  :::

  :::reponse
  Une expression est référentiellement transparente si on peut la remplacer par sa valeur sans changer le programme.
  Concrètement, cela permet de comprendre une fonction sans connaître l'historique du programme, de la mémoriser sans
  risque, de la tester avec de simples entrées et sorties, et de réorganiser ou paralléliser les calculs. Elle suppose
  des fonctions pures et des données qui ne changent pas pendant qu'on les utilise.
  :::

- Qu'est-ce que le partage structurel, et pourquoi est-il important ?

  :::indice
  Que se passe-t-il pour les parties d'un état qui ne changent pas ?
  :::

  :::reponse
  Lors d'une mise à jour immuable, on ne recopie que le chemin menant à la modification et on réutilise les autres
  parties telles quelles. Les copies restent peu coûteuses, et surtout, une partie inchangée garde la même référence :
  on détecte un changement avec `===`, sans comparer le contenu. C'est ce qui rend efficaces la mémorisation des
  sélecteurs et le rendu conditionnel des bibliothèques d'interface.
  :::

- Le code déclaratif est-il toujours meilleur que le code impératif ?

  :::indice
  Pense à la lisibilité, à la sortie anticipée et au nombre de passes.
  :::

  :::reponse
  Non. Le déclaratif exprime mieux l'intention et évite les mutations partagées, ce qui en fait un bon choix par défaut.
  Mais une boucle est plus claire pour une logique à plusieurs états, et peut être plus efficace quand on veut
  plusieurs résultats en une passe sur de gros volumes. Beaucoup de méthodes déclaratives savent d'ailleurs s'arrêter
  tôt : `some`, `every`, `find`. Une mutation locale, invisible de l'extérieur, reste compatible avec une fonction pure.
  :::
