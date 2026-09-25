---
id: javascript-nommage-et-petites-unites
title: "Code propre : nommer, et découper en petites unités"
slug: nommage-et-petites-unites
technology: javascript
level: intermediate
module: code-propre
order: 1
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-fonctions-pures
  - javascript-modules-cycles
skills:
  - js-clean-naming
tags:
  - javascript
  - architecture
  - clean-code
---

## Objectifs

- Définir ce qu'est un code propre : un code facile à lire, à vérifier et à modifier.
- Choisir des noms qui révèlent l'intention, dans le vocabulaire du métier.
- Écrire des fonctions courtes, à un seul niveau d'abstraction, avec des clauses de garde.
- Remplacer les valeurs magiques et les longues listes de paramètres.
- Savoir quand un commentaire est utile, et quand il masque un mauvais nom.

## Introduction

Un code est lu bien plus souvent qu'il n'est écrit : par vous dans six mois, par un collègue qui corrige un bug, par
la personne qui fera la revue de votre pull request. Chaque minute passée à deviner ce que fait une variable `d` ou
une fonction de 200 lignes se paie à chaque lecture.

Le **code propre** n'est pas une question d'esthétique, ni un ensemble de règles à appliquer aveuglément. C'est un
code dont l'intention est évidente, où chaque partie fait une chose, et qu'on peut modifier sans crainte. Ce chapitre
commence par les deux outils les plus simples et les plus puissants : bien nommer, et découper.

## Concept

| Élément | Un bon nom… | À éviter |
| --- | --- | --- |
| variable | dit ce que contient la valeur : `commandesEnRetard` | `data`, `tmp`, `liste2`, `d` |
| booléen | se lit comme une question : `estPaye`, `aDesArticles`, `peutAnnuler` | `statut`, `flag`, `check` |
| fonction | commence par un verbe et dit ce qu'elle fait : `calculerTotal`, `envoyerFacture` | `gerer`, `traiter`, `doStuff` |
| fonction qui renvoie un booléen | une question : `estMajeur(personne)` | `verifierAge(personne)`, ambigu |
| constante | nomme la règle métier : `DELAI_RETRACTATION_JOURS = 14` | le nombre `14` perdu dans le code |
| module | nomme un domaine ou une responsabilité : `facturation.js` | `utils.js`, `helpers.js`, `divers.js` |

| Une fonction propre | |
| --- | --- |
| fait une chose | on la décrit en une phrase, sans « et » |
| reste à un niveau d'abstraction | elle orchestre des étapes, ou elle fait un détail, pas les deux |
| sort tôt des cas particuliers | clauses de garde au début, cas nominal sans imbrication |
| a peu de paramètres | au-delà de deux ou trois, un objet avec des noms |
| n'a pas d'effet caché | son nom annonce ce qu'elle modifie |

## Exemple

Cette fonction fonctionne, mais il faut la lire trois fois pour comprendre ce qu'elle fait :

```js
function calc(c, t) {
  let r = 0;
  if (c) {
    if (c.items && c.items.length > 0) {
      for (let i = 0; i < c.items.length; i++) {
        r += c.items[i].p * c.items[i].q;
      }
      if (t === 1) {
        r = r * 0.9;
      }
      if (r < 50) {
        r += 4.9;
      }
    }
  }
  return Math.round(r * 100) / 100;
}
```

La même logique, nommée et découpée :

```js
const REMISE_MEMBRE = 0.1;
const SEUIL_LIVRAISON_OFFERTE = 50;
const FRAIS_DE_LIVRAISON = 4.9;
const TYPE_CLIENT = Object.freeze({ STANDARD: 0, MEMBRE: 1 });

const arrondirAuCentime = (montant) => Math.round(montant * 100) / 100;

function sousTotal(articles) {
  return articles.reduce((total, article) => total + article.prix * article.quantite, 0);
}

function appliquerRemise(montant, typeClient) {
  return typeClient === TYPE_CLIENT.MEMBRE ? montant * (1 - REMISE_MEMBRE) : montant;
}

function ajouterLivraison(montant) {
  return montant < SEUIL_LIVRAISON_OFFERTE ? montant + FRAIS_DE_LIVRAISON : montant;
}

function totalCommande(panier, typeClient) {
  if (!panier?.articles?.length) return 0;

  const montant = ajouterLivraison(appliquerRemise(sousTotal(panier.articles), typeClient));
  return arrondirAuCentime(montant);
}

const panier = { articles: [{ prix: 12.5, quantite: 2 }, { prix: 8, quantite: 1 }] };
console.log(totalCommande(panier, TYPE_CLIENT.STANDARD)); // 37.9
console.log(totalCommande(panier, TYPE_CLIENT.MEMBRE)); // 34.6
console.log(totalCommande({ articles: [] }, TYPE_CLIENT.MEMBRE)); // 0
```

Les deux versions renvoient les mêmes résultats. Mais la seconde se lit comme la règle métier : on additionne les
articles, on applique la remise des membres, on ajoute la livraison sous 50 €, on arrondit. Un changement de règle,
par exemple une remise de 15 %, se fait en un endroit, au nom évident. Et chaque étape se teste seule.

## Comment ça fonctionne

**Un nom est une documentation qu'on ne peut pas oublier de mettre à jour.** `c`, `t` et `r` obligent le lecteur à
reconstruire leur sens à partir de leur usage ; `panier`, `typeClient` et `montant` le lui donnent. On nomme avec le
**vocabulaire du métier**, celui qu'emploient les personnes qui définissent les règles : si le service commercial
parle de « remise membre », le code aussi. On garde un vocabulaire **cohérent** : pas `client` ici, `acheteur` là et
`utilisateur` ailleurs pour la même chose. La longueur d'un nom suit sa portée : `i` convient pour l'index d'une
boucle de trois lignes, pas pour une variable qui traverse un module.

**Les valeurs magiques.** `0.9`, `50`, `4.9` et `1` n'expliquent rien, et la même valeur répétée à plusieurs endroits
finit par diverger. Une constante nommée donne le sens, et centralise la règle. `TYPE_CLIENT.MEMBRE` remplace un `1`
dont personne ne se souvient de la signification.

**Un niveau d'abstraction par fonction.** `totalCommande` raconte l'histoire : sous-total, remise, livraison, arrondi.
Les détails, comme la multiplication `prix * quantite`, sont dans des fonctions de niveau inférieur. Quand une
fonction mélange les deux, le lecteur doit sans cesse changer de focale. Chaque fonction extraite porte un nom qui
remplace un commentaire.

**Les clauses de garde.** La version d'origine imbrique trois `if` pour arriver au cas normal. Une clause de garde
traite le cas particulier au début et sort : `if (!panier?.articles?.length) return 0;`. Le cas nominal se lit
ensuite sans indentation. On peut appliquer la même idée aux erreurs : vérifier et lever tôt, puis travailler.

**Les paramètres.** `creerCompte('Ana', 'ana@exemple.fr', true, false, 30)` est illisible à l'appel : que signifient
`true`, `false` et `30` ? Au-delà de deux ou trois paramètres, ou dès qu'un booléen apparaît, on passe un objet :
`creerCompte({ nom, email, newsletter: true, admin: false, essaiJours: 30 })`. Le nom de chaque option se lit à l'appel,
et l'ordre ne compte plus. Un paramètre booléen signale souvent une fonction qui fait deux choses : deux fonctions
nommées valent mieux.

**Les petits modules.** La même logique s'applique aux fichiers. Un fichier `utils.js` attire tout ce qu'on ne sait pas
où ranger, et devient une dépendance de tout le projet. Un module porte un nom de domaine, `facturation.js`,
`prix.js`, et n'exporte que ce que les autres doivent utiliser : le reste est un détail interne.

**Les commentaires.** Un commentaire qui répète le code, `// incrémente i`, n'apporte rien et finit par mentir quand
le code change. Un commentaire qui compense un mauvais nom se remplace par un meilleur nom. Les commentaires utiles
disent **pourquoi** : une contrainte externe, un choix non évident, un piège. « La banque refuse les montants avec
plus de deux décimales : on arrondit avant l'envoi. »

**Propre ne veut pas dire dogmatique.** Découper une fonction de dix lignes claires en cinq fonctions d'une ligne peut
nuire à la lecture. Le critère reste le lecteur : comprend-il vite, et peut-il modifier sans crainte ?

## Erreurs fréquentes

**Des noms génériques.** `data`, `info`, `manager`, `handle` : ils disent seulement qu'il y a quelque chose.

**Des abréviations privées.** `cmdLvr`, `usrPrf` : le lecteur doit apprendre un dialecte.

**Des nombres magiques.** Donne un nom à chaque règle métier.

**Une fonction qui fait plusieurs choses.** Si sa description contient « et », découpe-la.

**Des paramètres booléens.** `envoyer(message, true)` : utilise un objet d'options, ou deux fonctions.

**Des commentaires qui paraphrasent le code.** Écris le pourquoi, et mets le quoi dans les noms.

**Un fichier `utils.js` fourre-tout.** Range chaque fonction dans le module de son domaine.

## À retenir

- Le code propre se lit vite, se vérifie facilement et se modifie sans crainte.
- Des noms qui révèlent l'intention, dans le vocabulaire du métier, cohérents dans tout le projet.
- Booléens en question, fonctions en verbe, constantes nommées pour les règles.
- Une fonction fait une chose, à un seul niveau d'abstraction, avec des clauses de garde.
- Plus de deux ou trois paramètres, ou un booléen : un objet d'options.
- Les commentaires disent pourquoi ; les noms disent quoi.

## Exercices

1. Renomme les éléments de ce code pour qu'il se lise sans commentaire, sans changer son comportement.

   ```js
   const x = 18;
   function chk(u) {
     // vérifie si l'utilisateur peut commander de l'alcool
     return u.a >= x && u.p === 'FR' && !u.b;
   }
   ```

   :::indice
   Que représentent `x`, `u.a`, `u.p` et `u.b` ? Un booléen doit se lire comme une question.
   :::

   :::solution
   ```js
   const AGE_LEGAL_ALCOOL_FRANCE = 18;

   function peutCommanderDeLAlcool(client) {
     return client.age >= AGE_LEGAL_ALCOOL_FRANCE && client.pays === 'FR' && !client.estBloque;
   }

   console.log(peutCommanderDeLAlcool({ age: 19, pays: 'FR', estBloque: false })); // true
   console.log(peutCommanderDeLAlcool({ age: 17, pays: 'FR', estBloque: false })); // false
   ```

   Le commentaire devient inutile : le nom de la fonction dit la même chose. Renommer les propriétés de l'objet
   suppose de modifier aussi le code qui le crée ; si elles viennent d'une API qu'on ne contrôle pas, on les convertit
   à l'entrée, en un seul endroit.
   :::

2. Réécris cette fonction avec des clauses de garde, pour que le cas nominal ne soit plus imbriqué.

   ```js
   function inscrire(utilisateur, atelier) {
     if (utilisateur) {
       if (utilisateur.emailVerifie) {
         if (atelier.places > atelier.inscrits.length) {
           if (!atelier.inscrits.includes(utilisateur.id)) {
             atelier.inscrits.push(utilisateur.id);
             return { ok: true };
           } else {
             return { ok: false, raison: 'déjà inscrit' };
           }
         } else {
           return { ok: false, raison: 'complet' };
         }
       } else {
         return { ok: false, raison: 'email non vérifié' };
       }
     }
     return { ok: false, raison: 'non connecté' };
   }
   ```

   :::indice
   Inverse chaque condition, et sors immédiatement avec la raison correspondante.
   :::

   :::solution
   ```js
   function inscrire(utilisateur, atelier) {
     if (!utilisateur) return { ok: false, raison: 'non connecté' };
     if (!utilisateur.emailVerifie) return { ok: false, raison: 'email non vérifié' };
     if (atelier.inscrits.length >= atelier.places) return { ok: false, raison: 'complet' };
     if (atelier.inscrits.includes(utilisateur.id)) return { ok: false, raison: 'déjà inscrit' };

     atelier.inscrits.push(utilisateur.id);
     return { ok: true };
   }

   const atelier = { places: 1, inscrits: [] };
   console.log(inscrire({ id: 'u1', emailVerifie: true }, atelier)); // { ok: true }
   console.log(inscrire({ id: 'u1', emailVerifie: true }, atelier)); // { ok: false, raison: 'complet' }
   console.log(inscrire(null, atelier)); // { ok: false, raison: 'non connecté' }
   ```

   Chaque règle tient sur une ligne, dans l'ordre où on la vérifie, et le cas nominal est à la fin, sans
   imbrication. Attention à l'ordre des deux dernières gardes : avec une place et un utilisateur déjà inscrit, la
   version d'origine répondait « complet » avant « déjà inscrit » ; on a gardé cet ordre pour ne pas changer le
   comportement.
   :::

3. Cette fonction est appelée ainsi : `exporter(commandes, 'csv', true, false, ';')`. Propose une nouvelle signature
   lisible à l'appel, avec des valeurs par défaut, et montre deux appels.

   ```js
   function exporter(commandes, format, avecEntete, compresser, separateur) {
     // …
   }
   ```

   :::indice
   Un objet d'options déstructuré avec des valeurs par défaut. Les données principales restent un paramètre
   positionnel.
   :::

   :::solution
   ```js
   function exporter(commandes, { format = 'csv', avecEntete = true, compresser = false, separateur = ',' } = {}) {
     return { lignes: commandes.length, format, avecEntete, compresser, separateur };
   }

   console.log(exporter([{ id: 1 }], { separateur: ';' }));
   // { lignes: 1, format: 'csv', avecEntete: true, compresser: false, separateur: ';' }
   console.log(exporter([{ id: 1 }, { id: 2 }], { format: 'json', compresser: true }));
   // { lignes: 2, format: 'json', avecEntete: true, compresser: true, separateur: ',' }
   ```

   Chaque option se lit à l'appel ; on ne précise que ce qui diffère des valeurs par défaut ; ajouter une option ne
   casse aucun appel existant. Si `format` change profondément le comportement, deux fonctions, `exporterCsv` et
   `exporterJson`, seraient encore plus claires.
   :::

## Questions d'entretien

- Qu'est-ce qu'un code propre, selon toi ?

  :::indice
  Pense au lecteur, et au prochain changement.
  :::

  :::reponse
  Un code dont l'intention est évidente pour quelqu'un qui ne l'a pas écrit, et qu'on peut modifier sans crainte.
  Concrètement : des noms qui révèlent l'intention dans le vocabulaire du métier, des fonctions courtes qui font une
  chose à un seul niveau d'abstraction, des règles métier nommées plutôt que des valeurs magiques, des modules
  cohérents avec une petite interface publique, et des tests qui protègent le comportement. Ce n'est pas une liste de
  règles absolues : le critère est le temps qu'il faut pour comprendre et changer le code.
  :::

- Quand un commentaire est-il utile ?

  :::indice
  Quoi, ou pourquoi ?
  :::

  :::reponse
  Quand il explique ce que le code ne peut pas dire : pourquoi on fait un choix non évident, une contrainte externe,
  une limitation connue, un lien vers une décision ou un ticket. Un commentaire qui décrit ce que fait le code est
  souvent le signe d'un nom insuffisant : je renomme ou j'extrais une fonction au nom explicite. Les commentaires qui
  paraphrasent vieillissent mal, car on oublie de les mettre à jour, et finissent par mentir.
  :::

- Comment reconnais-tu qu'une fonction doit être découpée ?

  :::indice
  Description, niveaux d'abstraction, imbrication, tests.
  :::

  :::reponse
  Quand je ne peux pas la décrire en une phrase sans « et » ; quand elle mélange orchestration et détails ; quand
  l'imbrication dépasse deux niveaux ; quand un bloc aurait besoin d'un commentaire pour être compris ; ou quand il est
  difficile de la tester parce qu'elle fait trop de choses. J'extrais alors des fonctions nommées d'après ce qu'elles
  font. Je ne découpe pas une fonction courte et claire en fragments d'une ligne : la lisibilité reste le critère.
  :::
