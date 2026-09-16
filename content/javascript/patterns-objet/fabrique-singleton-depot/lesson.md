---
id: javascript-fabrique-singleton
title: "Fabrique, singleton et dépôt"
slug: fabrique-singleton-depot
technology: javascript
level: advanced
module: patterns-objet
order: 2
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-encapsulation
  - javascript-quand-classe
skills:
  - creational-patterns
tags:
  - javascript
  - patterns
---

## Objectifs

- Centraliser le choix d'un type concret dans une fabrique extensible.
- Reconnaître le coût d'un singleton, et savoir qu'un module ES en tient souvent lieu.
- Isoler l'accès aux données derrière un dépôt, remplaçable en test.

## Introduction

Ces trois patterns répondent à la même question : **qui crée les objets, et qui sait où ils
sont stockés ?** Mal réglée, cette question disperse des `new` et des requêtes dans tout le
code, et rend impossible de changer de canal de notification ou de base de données sans tout
reprendre. Chacun a une version idiomatique en JavaScript, souvent plus légère que celle des
livres écrits pour Java.

## Concept

| Pattern | Problème | Idée | Version idiomatique en JavaScript |
| --- | --- | --- | --- |
| Fabrique | le type à créer dépend d'une donnée | une fonction choisit et crée | une fonction et un registre `{ type: constructeur }` |
| Singleton | une seule instance doit exister | un point d'accès unique | l'export d'un module, évalué une fois |
| Dépôt (*repository*) | le code métier connaît le stockage | une interface de collection | une classe `trouver`, `enregistrer`, `supprimer` |

Un dépôt parle le langage du domaine — `trouverParEmail` — et jamais celui du stockage — SQL,
clés Redis, requêtes HTTP. C'est ce qui permet d'en fournir une version en mémoire pour les
tests, et une version base de données en production.

## Exemple

```js
// Fabrique : un registre plutôt qu'un switch qui grossit.
class NotificationEmail {
  envoyer(message) { return `email : ${message}`; }
}
class NotificationSms {
  envoyer(message) { return `sms : ${message.slice(0, 18)}`; }
}

const canaux = { email: NotificationEmail, sms: NotificationSms };

function creerNotification(canal) {
  const Canal = canaux[canal];
  if (!Canal) {
    throw new Error(`Canal inconnu : ${canal}`);
  }
  return new Canal();
}
console.log(creerNotification('sms').envoyer('Votre colis arrive demain matin')); // 'sms : Votre colis arrive'

// Singleton : un module est évalué une seule fois, son export est unique.
// config.js
export const configuration = Object.freeze({ langue: 'fr', devise: 'EUR' });

// Dépôt : une collection en mémoire, qui ne laisse sortir que des copies.
class DepotUtilisateurs {
  #utilisateurs = new Map();

  enregistrer(utilisateur) {
    this.#utilisateurs.set(utilisateur.id, { ...utilisateur });
  }

  trouverParId(id) {
    const utilisateur = this.#utilisateurs.get(id);
    return utilisateur ? { ...utilisateur } : null;
  }

  trouverParEmail(email) {
    for (const utilisateur of this.#utilisateurs.values()) {
      if (utilisateur.email === email) return { ...utilisateur };
    }
    return null;
  }
}

const depot = new DepotUtilisateurs();
depot.enregistrer({ id: 1, email: 'ada@exemple.fr', nom: 'Ada' });
const trouve = depot.trouverParEmail('ada@exemple.fr');
trouve.nom = 'Modifié';
console.log(depot.trouverParId(1).nom); // 'Ada' : le dépôt n'est pas altéré
```

## Comment ça fonctionne

La **fabrique** sépare deux décisions : quoi créer, et quand l'utiliser. Le code appelant
écrit `creerNotification(preference)` sans connaître aucune classe concrète. Le registre
`canaux` remplace un `switch` : ajouter un canal consiste à ajouter une entrée, et le cas
inconnu est traité à un seul endroit, avec un message explicite. Une fabrique peut aussi
choisir selon l'environnement — une implémentation factice en test, réelle en production.

Le **singleton** garantit une instance unique et un accès global. En JavaScript, un module ES
le fournit sans effort : il n'est évalué qu'une fois, et tous les imports reçoivent le même
objet. Écrire une classe avec un champ statique `#instance` et une méthode `obtenir()` reproduit
ce comportement avec plus de code. Surtout, un singleton est un **état global** : tout le code
qui l'importe en dépend sans que cela se voie dans les signatures, et les tests s'influencent
mutuellement s'ils le modifient. Pour une configuration figée, c'est acceptable ; pour un état
modifiable ou une connexion, il vaut mieux créer l'instance une fois au démarrage et la
**passer** à ceux qui en ont besoin — c'est l'injection de dépendances du chapitre suivant.

Le **dépôt** est une frontière. Du côté du domaine, il expose des opérations de collection
formulées avec le vocabulaire métier ; de l'autre, il sait parler à PostgreSQL, à une API ou à
une `Map`. Le code métier ne dépend que de l'interface : on peut écrire les tests avec la
version en mémoire, rapide et sans infrastructure, et brancher la vraie base en production.
Dans une application réelle, les méthodes d'un dépôt sont **asynchrones** et renvoient des
promesses, puisque le stockage l'est — la partie Asynchronous y revient.

Le dépôt de l'exemple renvoie des **copies** : un appelant qui modifie l'objet obtenu ne change
pas les données stockées sans passer par `enregistrer`. C'est l'encapsulation appliquée à une
collection.

## Erreurs fréquentes

**Laisser grossir un `switch` dans la fabrique.** Un registre rend l'ajout local.

**Faire de chaque service un singleton.** Les dépendances deviennent invisibles et les tests
couplés : crée une instance et passe-la.

**Écrire une classe singleton là où un export de module suffit.** Le module est déjà unique.

**Laisser fuir le stockage hors du dépôt.** Un dépôt qui renvoie un constructeur de requêtes ou
un objet de l'ORM n'isole plus rien.

**Renvoyer les objets stockés eux-mêmes.** L'appelant peut les modifier en contournant le dépôt.

## À retenir

- Fabrique : une fonction choisit le type concret ; un registre remplace le `switch`.
- Singleton : un module ES l'offre déjà ; c'est un état global, à réserver à l'immuable.
- Dépôt : une interface de collection en vocabulaire métier, qui cache le stockage.
- Un dépôt en mémoire rend les tests rapides ; la version réelle est asynchrone.
- Les données sortent du dépôt en copies.

## Exercices

1. Écris une fabrique `creerExport(format)` qui renvoie un exporteur `csv` ou `json`, lève une
   erreur claire pour un format inconnu, et permet d'enregistrer un nouveau format sans modifier
   la fabrique.

   :::indice
   Un registre dans un objet ou une `Map`, et une fonction `enregistrerFormat(nom, fabrique)`
   qui l'enrichit.
   :::

   :::solution
   ```js
   const formats = new Map([
     ['csv', () => ({ exporter: (lignes) => lignes.map((l) => l.join(';')).join('\n') })],
     ['json', () => ({ exporter: (lignes) => JSON.stringify(lignes) })],
   ]);

   function enregistrerFormat(nom, fabrique) {
     formats.set(nom, fabrique);
   }

   function creerExport(format) {
     const fabrique = formats.get(format);
     if (!fabrique) {
       throw new Error(`Format inconnu : ${format}`);
     }
     return fabrique();
   }

   enregistrerFormat('tsv', () => ({ exporter: (lignes) => lignes.map((l) => l.join('\t')).join('\n') }));
   console.log(creerExport('json').exporter([[1, 2]])); // '[[1,2]]'
   console.log(creerExport('tsv').exporter([['a', 'b']]) === 'a\tb'); // true
   ```
   :::

2. Cette classe singleton rend les tests dépendants les uns des autres. Explique pourquoi, puis
   propose une conception qui garde une instance unique en production sans ce défaut.

   ```js
   class Panier {
     static #instance;
     static obtenir() {
       return (Panier.#instance ??= new Panier());
     }
     articles = [];
   }
   ```

   :::indice
   Que contient `Panier.obtenir().articles` au début du deuxième test, si le premier y a ajouté
   un article ?
   :::

   :::solution
   L'instance est globale et survit d'un test à l'autre : ce qu'un test ajoute, le suivant le
   retrouve. L'ordre d'exécution change les résultats. La correction consiste à ne plus cacher
   la création : on construit l'instance au démarrage et on la passe à ceux qui en ont besoin.

   ```js
   class Panier {
     articles = [];
     ajouter(article) {
       this.articles.push(article);
     }
   }

   function creerApplication(panier = new Panier()) {
     return { ajouterAuPanier: (article) => panier.ajouter(article), panier };
   }

   const test1 = creerApplication();
   test1.ajouterAuPanier('clavier');
   const test2 = creerApplication();
   console.log(test1.panier.articles.length, test2.panier.articles.length); // 1 0
   ```

   En production, `creerApplication` est appelée une seule fois : l'instance reste unique, mais
   ce n'est plus une contrainte du code.
   :::

3. Écris un dépôt en mémoire `DepotProduits` avec `enregistrer`, `trouverParId` et
   `listerDisponibles()`, qui ne renvoie jamais de référence vers ses données internes.

   :::indice
   Stocke dans une `Map` indexée par `id`, et renvoie des copies avec le spread.
   :::

   :::solution
   ```js
   class DepotProduits {
     #produits = new Map();

     enregistrer(produit) {
       this.#produits.set(produit.id, { ...produit });
     }

     trouverParId(id) {
       const produit = this.#produits.get(id);
       return produit ? { ...produit } : null;
     }

     listerDisponibles() {
       return [...this.#produits.values()]
         .filter((produit) => produit.stock > 0)
         .map((produit) => ({ ...produit }));
     }
   }

   const depot = new DepotProduits();
   depot.enregistrer({ id: 1, nom: 'Clavier', stock: 3 });
   depot.enregistrer({ id: 2, nom: 'Souris', stock: 0 });

   const disponibles = depot.listerDisponibles();
   disponibles[0].stock = 0;
   console.log(disponibles.length, depot.trouverParId(1).stock); // 1 3
   ```
   :::

## Questions d'entretien

- À quoi sert une fabrique ?

  :::indice
  Qui décide du type concret, et combien d'endroits faut-il modifier pour en ajouter un ?
  :::

  :::reponse
  Elle centralise le choix du type concret à créer à partir d'une donnée — préférence de
  l'utilisateur, format, environnement. Le code appelant ne dépend plus d'aucune classe
  concrète, et l'ajout d'un type se fait à un seul endroit, idéalement en enrichissant un
  registre plutôt qu'en allongeant un `switch`. En JavaScript, une simple fonction suffit ; il
  n'est pas nécessaire d'écrire une classe « Factory ».
  :::

- Pourquoi le singleton est-il souvent considéré comme un anti-pattern ?

  :::indice
  Pense aux dépendances cachées et aux tests.
  :::

  :::reponse
  Parce qu'un singleton est un état global déguisé : le code qui l'utilise en dépend sans que
  cela apparaisse dans ses paramètres, ce qui cache les dépendances et couple les modules. Les
  tests partagent la même instance et s'influencent selon leur ordre. Il reste acceptable pour
  une valeur immuable, comme une configuration figée. Sinon, on crée l'instance une fois au
  démarrage et on la passe explicitement — l'unicité devient une décision de câblage, pas une
  contrainte du code. En JavaScript, un export de module couvre déjà le cas légitime.
  :::

- Quel est l'intérêt d'un dépôt ?

  :::indice
  De quoi le code métier cesse-t-il de dépendre ?
  :::

  :::reponse
  Il isole le code métier du mécanisme de stockage derrière une interface de collection exprimée
  en vocabulaire du domaine. Le métier appelle `trouverParEmail` sans savoir s'il y a derrière du
  SQL, une API ou une `Map`. On peut ainsi tester le métier avec un dépôt en mémoire, changer de
  base sans toucher aux règles, et regrouper les requêtes au même endroit. Il ne tient cette
  promesse que s'il ne laisse fuir aucun objet propre au stockage.
  :::
