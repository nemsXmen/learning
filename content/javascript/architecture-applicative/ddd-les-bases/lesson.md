---
id: javascript-ddd-les-bases
title: "Les bases du Domain-Driven Design"
slug: ddd-les-bases
technology: javascript
level: advanced
module: architecture-applicative
order: 3
estimatedMinutes: 50
difficulty: 5
xp: 120
prerequisites:
  - javascript-architecture-hexagonale-et-clean
skills:
  - js-ddd-basics
tags:
  - javascript
  - architecture
  - ddd
---

## Objectifs

- Construire un langage commun avec le métier, et l'utiliser dans le code.
- Découper un grand domaine en contextes délimités, où chaque mot a un sens précis.
- Distinguer entités et objets valeur, et écrire des objets valeur immuables qui se valident eux-mêmes.
- Protéger des invariants avec un agrégat et sa racine.
- Reconnaître un modèle anémique, et savoir quand le DDD vaut son investissement.

## Introduction

Le **Domain-Driven Design**, formalisé par Eric Evans, part d'un constat : dans les logiciels complexes, la difficulté
n'est pas technique, elle est dans le métier. Les règles d'une assurance, d'une logistique ou d'une banque sont
subtiles, changeantes, et souvent mal comprises par ceux qui les codent. Le DDD propose de placer le **modèle du
domaine** au centre : un code qui reflète fidèlement la façon dont les experts du métier pensent et parlent.

Le DDD a deux volets. Le volet **stratégique** découpe le problème : langage commun, contextes délimités. Le volet
**tactique** fournit des briques pour écrire le modèle : entités, objets valeur, agrégats, événements, dépôts. Ce
chapitre présente les bases des deux.

## Concept

| Stratégique | |
| --- | --- |
| langage omniprésent (*ubiquitous language*) | un vocabulaire partagé par le métier et les développeurs, utilisé tel quel dans le code |
| contexte délimité (*bounded context*) | une frontière à l'intérieur de laquelle chaque terme a un sens unique |
| carte des contextes | comment les contextes communiquent et traduisent leurs concepts |

| Tactique | Définition | Exemple |
| --- | --- | --- |
| entité | un objet défini par son **identité**, qui traverse le temps | une commande `c-42`, même si son contenu change |
| objet valeur | un objet défini par ses **valeurs**, immuable, sans identité | un montant de 12,50 €, une adresse, une période |
| agrégat | un groupe d'objets modifié comme un tout, qui garantit ses invariants | une commande et ses lignes |
| racine d'agrégat | la seule entrée de l'agrégat pour l'extérieur | l'objet `Commande` |
| événement de domaine | un fait métier passé | `CommandeValidee` |
| dépôt | charge et enregistre des agrégats entiers | `commandes.parId(id)`, `commandes.enregistrer(commande)` |

## Exemple

Un **objet valeur** `Montant`, en centimes entiers pour éviter les erreurs d'arrondi des nombres à virgule :

```js
export class Montant {
  #centimes;
  #devise;

  constructor(centimes, devise = 'EUR') {
    if (!Number.isInteger(centimes)) throw new TypeError('Un montant se compte en centimes entiers');
    this.#centimes = centimes;
    this.#devise = devise;
    Object.freeze(this);
  }

  static depuisEuros(euros, devise = 'EUR') {
    return new Montant(Math.round(euros * 100), devise);
  }

  get centimes() {
    return this.#centimes;
  }
  get devise() {
    return this.#devise;
  }

  ajouter(autre) {
    if (autre.devise !== this.#devise) throw new Error(`Devises différentes : ${this.#devise} et ${autre.devise}`);
    return new Montant(this.#centimes + autre.centimes, this.#devise);
  }

  multiplier(facteur) {
    return new Montant(Math.round(this.#centimes * facteur), this.#devise);
  }

  egale(autre) {
    return autre instanceof Montant && autre.centimes === this.#centimes && autre.devise === this.#devise;
  }

  toString() {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: this.#devise }).format(this.#centimes / 100);
  }
}

console.log(0.1 + 0.2); // 0.30000000000000004
console.log(Montant.depuisEuros(0.1).ajouter(Montant.depuisEuros(0.2)).centimes); // 30
console.log(Montant.depuisEuros(12.5).egale(new Montant(1250))); // true : même valeur, donc égaux
```

Un **agrégat** `Commande`, dont la racine protège les invariants :

```js
const LIGNES_MAX = 20;

export class Commande {
  #id;
  #lignes = [];
  #statut = 'brouillon';
  #evenements = [];

  constructor(id) {
    this.#id = id;
  }

  get id() {
    return this.#id;
  }
  get statut() {
    return this.#statut;
  }
  get lignes() {
    return this.#lignes.map((ligne) => ({ ...ligne })); // des copies : l'extérieur ne modifie rien
  }

  get total() {
    return this.#lignes.reduce(
      (total, { prixUnitaire, quantite }) => total.ajouter(prixUnitaire.multiplier(quantite)),
      new Montant(0),
    );
  }

  ajouterLigne(sku, prixUnitaire, quantite) {
    if (this.#statut !== 'brouillon') throw new Error('Une commande validée ne peut plus être modifiée');
    if (!Number.isInteger(quantite) || quantite <= 0) throw new Error('Quantité invalide');
    const existante = this.#lignes.find((ligne) => ligne.sku === sku);
    if (existante) {
      existante.quantite += quantite;
      return;
    }
    if (this.#lignes.length >= LIGNES_MAX) throw new Error(`${LIGNES_MAX} lignes au maximum`);
    this.#lignes.push({ sku, prixUnitaire, quantite });
  }

  valider() {
    if (this.#lignes.length === 0) throw new Error('Une commande vide ne peut pas être validée');
    if (this.#statut !== 'brouillon') throw new Error('Commande déjà validée');
    this.#statut = 'validee';
    this.#evenements.push({ type: 'CommandeValidee', commandeId: this.#id, total: this.total.centimes });
  }

  retirerEvenements() {
    const evenements = this.#evenements;
    this.#evenements = [];
    return evenements;
  }
}

const commande = new Commande('c-42');
commande.ajouterLigne('lampe', Montant.depuisEuros(49.9), 2);
commande.ajouterLigne('ampoule', Montant.depuisEuros(4.5), 3);
commande.ajouterLigne('lampe', Montant.depuisEuros(49.9), 1);
commande.valider();

console.log(String(commande.total), commande.lignes.length); // 163,20 € 2
console.log(commande.retirerEvenements()); // [ { type: 'CommandeValidee', commandeId: 'c-42', total: 16320 } ]
try {
  commande.ajouterLigne('abat-jour', Montant.depuisEuros(19), 1);
} catch (erreur) {
  console.log(erreur.message); // Une commande validée ne peut plus être modifiée
}
```

## Comment ça fonctionne

**Le langage omniprésent.** Si les experts parlent de « commande validée », d'« avoir » et de « remise fidélité », le code
parle de `valider()`, de `Avoir` et de `remiseFidelite`, pas de `setStatus(2)`, `CreditNote` ou `discount3`. Les
conversations, les tests et le code utilisent les mêmes mots, et un expert peut presque relire une règle. Quand le
métier affine un concept, on renomme le code : le modèle suit la compréhension.

**Les contextes délimités.** Un même mot change de sens selon l'endroit. Pour le catalogue, un « produit » a une
description, des photos, des variantes ; pour le stock, un emplacement et une quantité ; pour la facturation, un taux
de TVA. Un modèle unique « Produit » qui satisferait tout le monde devient énorme et contradictoire. Le DDD découpe le
domaine en contextes, chacun avec son propre modèle et son propre langage, et des traductions explicites entre eux.
Dans le code, un contexte délimité correspond souvent à un module métier, vu au chapitre sur les couches, ou à un
service.

**Entités et objets valeur.** Deux commandes aux contenus identiques restent deux commandes : leur identité les
distingue, ce sont des entités. Deux montants de 12,50 € sont interchangeables : ce sont des objets valeur, comparés par
leurs valeurs. Les objets valeur sont **immuables** : `ajouter` renvoie un nouveau montant. Et ils se **valident
eux-mêmes** : un `Montant` en centimes non entiers ne peut pas exister, une adresse e-mail invalide non plus. Le reste du
code n'a plus à revérifier, et les primitifs nus, comme `12.5` ou `'ana@'`, disparaissent des signatures : c'est le
remède à l'obsession des primitifs vue au chapitre sur le refactoring.

**Les agrégats protègent les invariants.** Une commande a des règles qui portent sur l'ensemble : pas plus de vingt
lignes, pas de modification après validation, un total cohérent avec ses lignes. Pour les garantir, on ne modifie
l'agrégat que par sa **racine**, `Commande`, dont les méthodes vérifient les règles. Les lignes sont privées, et le
getter renvoie des copies : impossible de les modifier en contournant `ajouterLigne`. Un agrégat se charge et
s'enregistre en entier, par son dépôt, et une transaction ne modifie qu'un agrégat. Les autres agrégats sont référencés
par leur identifiant, `clientId`, pas par l'objet lui-même.

**Des agrégats petits.** Un agrégat trop grand, par exemple un client avec toutes ses commandes, est lent à charger et
provoque des conflits quand plusieurs personnes le modifient. On le limite à ce qui doit être cohérent
**immédiatement**. Ce qui peut l'être un peu plus tard, comme les points de fidélité après une commande, passe par un
événement de domaine : l'agrégat enregistre `CommandeValidee`, le cas d'utilisation le publie après l'enregistrement,
et un autre agrégat réagit.

**Modèle riche ou anémique.** Un modèle **anémique** n'a que des données, avec des propriétés publiques, et toutes les
règles vivent dans des services qui les manipulent : rien n'empêche un code distrait de modifier le statut directement.
Un modèle **riche** place les règles dans les objets qui portent les données, comme `Commande.valider()`. Le DDD vise un
modèle riche là où le domaine est complexe.

**Quand faire du DDD.** Le volet stratégique, langage commun et contextes, est utile presque partout. Le volet
tactique complet a un coût d'apprentissage et d'écriture : il paie dans le **cœur de métier**, là où l'entreprise se
distingue et où les règles sont riches. Pour un sous-domaine générique, l'authentification, l'envoi d'e-mails, on
achète ou on utilise une bibliothèque ; pour un sous-domaine simple, un CRUD suffit.

## Erreurs fréquentes

**Un vocabulaire technique à la place du vocabulaire métier.** `status = 2` au lieu de `valider()` : le métier ne peut
plus relire le code.

**Un modèle unique pour tout le système.** Le « Produit » universel devient incohérent ; découpe en contextes.

**Des objets valeur modifiables.** Un montant partagé modifié en place change toutes les commandes qui le référencent.

**Des montants en nombres à virgule.** `0.1 + 0.2` n'est pas `0.3` ; compte en centimes entiers.

**Exposer les collections internes d'un agrégat.** L'extérieur contourne les invariants ; renvoie des copies.

**Des agrégats géants.** Garde-les petits, référence les autres par identifiant, relie-les par des événements.

**Le DDD tactique partout.** Réserve-le au cœur de métier complexe.

## À retenir

- Langage omniprésent : les mots du métier, partout, jusque dans le code.
- Contextes délimités : un modèle et un langage par contexte, avec des traductions explicites.
- Entité : une identité ; objet valeur : des valeurs, immuable, qui se valide lui-même.
- Agrégat : une frontière de cohérence, modifiée seulement par sa racine, chargée et enregistrée en entier.
- Petits agrégats, références par identifiant, cohérence différée par des événements de domaine.
- Le DDD tactique paie dans le cœur de métier ; ailleurs, plus simple suffit.

## Exercices

1. Écris un objet valeur `Email` : il normalise l'adresse en minuscules et sans espaces autour, refuse une adresse sans
   `@` ou sans domaine, est immuable, et se compare par valeur. Montre que deux écritures différentes de la même
   adresse sont égales.

   :::indice
   Un constructeur qui valide et normalise, un champ privé, `Object.freeze`, une méthode `egale`.
   :::

   :::solution
   ```js
   class Email {
     #valeur;

     constructor(brut) {
       const valeur = String(brut).trim().toLowerCase();
       const [local, domaine, ...reste] = valeur.split('@');
       if (!local || !domaine || reste.length > 0 || !domaine.includes('.')) {
         throw new Error(`Adresse e-mail invalide : « ${brut} »`);
       }
       this.#valeur = valeur;
       Object.freeze(this);
     }

     get domaine() {
       return this.#valeur.split('@')[1];
     }

     egale(autre) {
       return autre instanceof Email && autre.toString() === this.#valeur;
     }

     toString() {
       return this.#valeur;
     }
   }

   console.log(new Email('  Ana@Exemple.FR ').egale(new Email('ana@exemple.fr'))); // true
   console.log(new Email('ana@exemple.fr').domaine); // exemple.fr
   for (const invalide of ['ana', 'ana@', 'ana@exemple', 'a@b@c.fr']) {
     try {
       new Email(invalide);
     } catch (erreur) {
       console.log(erreur.message);
     }
   }
   ```

   Une fois l'objet construit, l'adresse est valide et normalisée : un `Email` passé en paramètre n'a plus besoin
   d'être revérifié. La validation reste volontairement simple ; la seule preuve qu'une adresse existe est un e-mail de
   confirmation.
   :::

2. Voici un modèle anémique et le service qui l'utilise. Transforme-le en agrégat riche, `CompteFidelite`, qui garantit :
   le solde ne devient jamais négatif ; on ne crédite que des nombres entiers positifs ; un compte clos refuse toute
   opération.

   ```js
   const compte = { id: 'f1', solde: 0, clos: false };

   function crediter(compte, points) {
     compte.solde += points;
   }
   function debiter(compte, points) {
     if (compte.solde >= points) compte.solde -= points;
   }
   // ailleurs : compte.solde = -50; rien ne l'empêche
   ```

   :::indice
   Des champs privés, un getter pour le solde, des méthodes qui vérifient avant de modifier, et des erreurs explicites
   plutôt qu'un échec silencieux.
   :::

   :::solution
   ```js
   class CompteFidelite {
     #id;
     #solde = 0;
     #clos = false;

     constructor(id) {
       this.#id = id;
     }

     get solde() {
       return this.#solde;
     }

     crediter(points) {
       this.#verifierOuvert();
       this.#verifierPoints(points);
       this.#solde += points;
     }

     debiter(points) {
       this.#verifierOuvert();
       this.#verifierPoints(points);
       if (points > this.#solde) throw new Error(`Solde insuffisant : ${this.#solde} points`);
       this.#solde -= points;
     }

     clore() {
       this.#clos = true;
     }

     #verifierOuvert() {
       if (this.#clos) throw new Error('Compte clos');
     }

     #verifierPoints(points) {
       if (!Number.isInteger(points) || points <= 0) throw new Error('Nombre de points invalide');
     }
   }

   const compte = new CompteFidelite('f1');
   compte.crediter(120);
   compte.debiter(50);
   console.log(compte.solde); // 70
   for (const action of [() => compte.debiter(100), () => compte.crediter(2.5), () => (compte.solde = -50)]) {
     try {
       action();
     } catch (erreur) {
       console.log(erreur.constructor.name, erreur.message);
     }
   }
   compte.clore();
   try {
     compte.crediter(10);
   } catch (erreur) {
     console.log(erreur.message); // Compte clos
   }
   ```

   Le `debiter` d'origine échouait en silence quand le solde était insuffisant : l'appelant croyait avoir débité. Ici,
   l'échec est explicite. Et `compte.solde = -50` lève une `TypeError` en mode strict, car `solde` n'a qu'un getter :
   aucun code ne peut plus contourner les règles.
   :::

3. Une application de e-commerce utilise le mot « client » dans trois équipes : le marketing (préférences, segments,
   consentements), le support (tickets, historique des échanges) et la facturation (raison sociale, adresse de
   facturation, numéro de TVA). Faut-il un seul modèle `Client` ? Propose un découpage en contextes délimités et la façon
   dont ils partagent l'identité du client.

   :::indice
   Qu'est-ce qui est réellement commun aux trois ? Le reste appartient à chaque contexte.
   :::

   :::solution
   Un seul modèle `Client` réunirait des dizaines de champs sans rapport, modifiés par trois équipes pour des raisons
   différentes : une faible cohésion, et des conflits permanents. On définit trois contextes délimités, chacun avec son
   propre modèle :

   - **Marketing** : `Prospect` ou `ClientMarketing`, avec préférences, segments, consentements ;
   - **Support** : `Demandeur`, avec ses tickets et l'historique des échanges ;
   - **Facturation** : `ClientFacture`, avec raison sociale, adresse de facturation et numéro de TVA.

   Le seul élément commun est l'**identité** : un identifiant client, attribué par le contexte qui gère les comptes.
   Chaque contexte stocke les informations dont il a besoin, référencées par cet identifiant. Quand un client change
   d'adresse de facturation, seul le contexte facturation est concerné ; quand un événement doit traverser les contextes,
   comme `CompteCree`, chaque contexte le traduit dans son propre modèle.
   :::

## Questions d'entretien

- Quelle différence entre une entité et un objet valeur ?

  :::indice
  Identité, ou valeurs ?
  :::

  :::reponse
  Une entité est définie par son identité, qui reste la même quand ses attributs changent : une commande, un client, un
  compte. Deux entités aux attributs identiques restent distinctes. Un objet valeur est défini par ses valeurs, sans
  identité : un montant, une adresse, une période. Deux objets valeur aux mêmes valeurs sont interchangeables. On les
  rend immuables, on les compare par valeur, et ils se valident à la construction, ce qui supprime beaucoup de
  vérifications dispersées dans le code.
  :::

- Qu'est-ce qu'un agrégat, et pourquoi le garder petit ?

  :::indice
  Frontière de cohérence, racine, transaction.
  :::

  :::reponse
  C'est un groupe d'objets du domaine traité comme une unité de cohérence : ses invariants sont garantis à chaque
  modification, qui passe obligatoirement par sa racine. Il se charge et s'enregistre en entier, et une transaction ne
  modifie qu'un agrégat. On le garde petit parce qu'un gros agrégat est lent à charger, génère des conflits quand plusieurs
  utilisateurs le modifient, et regroupe des règles qui n'ont pas besoin d'être cohérentes au même instant. Les autres
  agrégats sont référencés par identifiant, et la cohérence entre agrégats passe par des événements de domaine.
  :::

- Qu'est-ce qu'un contexte délimité ?

  :::indice
  Pense au mot « produit » dans différentes équipes.
  :::

  :::reponse
  C'est une frontière explicite à l'intérieur de laquelle un modèle et son langage ont un sens unique et cohérent. Dans
  une grande organisation, un même mot, comme « produit » ou « client », désigne des choses différentes selon les
  équipes. Plutôt qu'un modèle universel incohérent, chaque contexte a son propre modèle, et les échanges entre contextes
  passent par des traductions explicites, par une interface ou des événements. En pratique, un contexte délimité
  correspond souvent à un module métier ou à un service, et à une équipe.
  :::
