---
id: javascript-encapsulation
title: "Encapsulation, abstraction et conception d'objets"
slug: encapsulation-abstraction
technology: javascript
level: intermediate
module: heritage
order: 4
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-composition
skills:
  - encapsulation-abstraction
tags:
  - javascript
  - classes
---

## Objectifs

- Distinguer encapsulation — cacher l'état — et abstraction — cacher la manière de faire.
- Concevoir des objets qui reçoivent des ordres plutôt que d'exposer leurs données.
- Simuler une classe abstraite en JavaScript, qui n'a pas de mot-clé pour cela.

## Introduction

Un objet dont tout l'état est public et dont chaque décision est prise à l'extérieur n'est
qu'une structure de données déguisée. Les règles métier se retrouvent dispersées dans le code
appelant, recopiées, et finissent par diverger. L'encapsulation et l'abstraction rassemblent
ces règles là où sont les données, et laissent à l'extérieur une interface courte et stable.

## Concept

| Principe | Question | Moyen en JavaScript |
| --- | --- | --- |
| Encapsulation | Qui peut modifier l'état ? | champs privés, méthodes qui vérifient les règles |
| Abstraction | Que doit savoir l'appelant ? | une interface minimale, les détails cachés derrière |
| *Tell, don't ask* | Qui prend la décision ? | l'objet qui possède les données |
| Classe abstraite | Qu'est-ce qui doit être fourni par les sous-classes ? | erreur levée dans la méthode de base, contrôle de `new.target` |

« *Tell, don't ask* » — « ordonne, ne demande pas » — résume la conception d'objets : plutôt que
lire l'état d'un objet pour décider à sa place, on lui demande d'agir, et c'est lui qui applique
ses règles.

## Exemple

```js
// Demander : la règle est dans le code appelant, et peut être oubliée ailleurs.
const compteOuvert = { solde: 100 };
if (compteOuvert.solde >= 30) {
  compteOuvert.solde -= 30;
}

// Ordonner : la règle vit dans l'objet, et c'est le seul chemin possible.
class Compte {
  #solde;
  constructor(solde) {
    this.#solde = solde;
  }
  retirer(montant) {
    if (montant > this.#solde) {
      return false;
    }
    this.#solde -= montant;
    return true;
  }
  get solde() {
    return this.#solde;
  }
}
const compte = new Compte(100);
console.log(compte.retirer(30), compte.retirer(500), compte.solde); // true false 70

// Abstraction : l'appelant ne sait pas comment le message part.
class Notificateur {
  constructor() {
    if (new.target === Notificateur) {
      throw new TypeError('Notificateur est abstrait');
    }
  }
  notifier(destinataire, message) {
    return this.envoyer(destinataire, message.trim());
  }
  envoyer() {
    throw new Error('envoyer() doit être implémentée par la sous-classe');
  }
}

class NotificateurEmail extends Notificateur {
  envoyer(destinataire, message) {
    return `email à ${destinataire} : ${message}`;
  }
}

console.log(new NotificateurEmail().notifier('ada@exemple.fr', '  Bienvenue  '));
// 'email à ada@exemple.fr : Bienvenue'

try {
  new Notificateur();
} catch (erreur) {
  console.log(erreur.message); // 'Notificateur est abstrait'
}
```

## Comment ça fonctionne

L'**encapsulation** protège l'état : dans `Compte`, le solde est un champ privé, et la seule
façon de le modifier est `retirer`, qui applique la règle. Il n'existe plus de chemin où le
solde deviendrait négatif. L'objet ouvert du début, lui, dépend de la discipline de chaque
appelant : il suffit d'un endroit du code qui oublie le test.

L'**abstraction** protège l'appelant des détails. Celui qui appelle `notifier` ne sait pas si le
message part par courriel, SMS ou notification push ; il ne connaît qu'un verbe et deux
paramètres. Changer de canal revient à fournir une autre sous-classe, ou un autre objet qui
possède `envoyer` — sans toucher au code appelant.

JavaScript n'a ni mot-clé `abstract` ni interfaces. Deux conventions les remplacent. Une méthode
de base qui **lève une erreur** signale ce que les sous-classes doivent fournir : l'oubli se
manifeste au premier appel, avec un message explicite. Le test **`new.target === Classe`** dans
le constructeur empêche d'instancier la classe de base elle-même, tout en laissant les
sous-classes passer, puisque `new.target` vaut alors la sous-classe. TypeScript offre de vrais
mots-clés `abstract` et `interface`, vérifiés à la compilation.

Une interface minimale se protège aussi dans ce qu'elle **renvoie**. Un getter qui renvoie
directement un tableau privé rend l'encapsulation illusoire, puisque l'appelant peut le
modifier : on renvoie une copie, ou une valeur immuable.

Un signe fréquent d'encapsulation manquée est la **chaîne d'accès** :
`commande.client.adresse.ville`. Le code appelant connaît alors la structure interne de trois
objets. Une méthode comme `commande.villeDeLivraison()` cache cette structure, qui peut ensuite
changer sans casser l'appelant.

## Erreurs fréquentes

**Exposer l'état et décider à l'extérieur.** La règle métier se disperse et se contredit.

**Ajouter un getter et un setter pour chaque champ.** L'état est aussi ouvert qu'avec des
propriétés publiques.

**Renvoyer une référence vers une collection privée.** Renvoie une copie.

**Laisser une classe « abstraite » instanciable.** Vérifie `new.target` dans son constructeur.

**Enchaîner les accès à travers plusieurs objets.** Ajoute une méthode sur l'objet le plus proche.

## À retenir

- Encapsulation : l'état ne change que par des méthodes qui en garantissent les règles.
- Abstraction : l'appelant connaît le « quoi », jamais le « comment ».
- *Tell, don't ask* : demande à l'objet d'agir plutôt que de lire son état pour décider.
- Classe abstraite en JavaScript : méthode de base qui lève une erreur, et `new.target`.
- Méfie-toi des getters sur tout, des collections exposées et des chaînes d'accès.

## Exercices

1. Réécris ce code dans le style « ordonne, ne demande pas » : la règle doit vivre dans l'objet.

   ```js
   const ticket = { places: 2, reservees: 0 };
   if (ticket.reservees < ticket.places) {
     ticket.reservees += 1;
   }
   ```

   :::indice
   Crée une classe avec les compteurs en champs privés et une méthode `reserver()` qui
   renvoie si la réservation a réussi.
   :::

   :::solution
   ```js
   class Evenement {
     #places;
     #reservees = 0;

     constructor(places) {
       this.#places = places;
     }

     reserver() {
       if (this.#reservees >= this.#places) {
         return false;
       }
       this.#reservees += 1;
       return true;
     }

     get placesRestantes() {
       return this.#places - this.#reservees;
     }
   }

   const concert = new Evenement(2);
   console.log(concert.reserver(), concert.reserver(), concert.reserver()); // true true false
   console.log(concert.placesRestantes); // 0
   ```
   :::

2. Écris une classe abstraite `Exporteur` avec une méthode `exporter(donnees)` qui délègue à
   `formater`, à fournir par les sous-classes, puis une sous-classe `ExporteurCsv`. Instancier
   `Exporteur` directement doit échouer.

   :::indice
   Dans le constructeur, compare `new.target` à `Exporteur` ; dans la classe de base, `formater`
   lève une erreur.
   :::

   :::solution
   ```js
   class Exporteur {
     constructor() {
       if (new.target === Exporteur) {
         throw new TypeError('Exporteur est abstrait');
       }
     }

     exporter(donnees) {
       return this.formater(donnees);
     }

     formater() {
       throw new Error('formater() doit être implémentée');
     }
   }

   class ExporteurCsv extends Exporteur {
     formater(lignes) {
       return lignes.map((ligne) => ligne.join(';')).join('\n');
     }
   }

   console.log(new ExporteurCsv().exporter([['nom', 'age'], ['Ada', 36]]));
   // 'nom;age\nAda;36'
   try {
     new Exporteur();
   } catch (erreur) {
     console.log(erreur.name); // 'TypeError'
   }
   ```
   :::

3. Cache la chaîne d'accès `commande.client.adresse.ville` derrière une méthode, de façon que
   l'appelant n'ait plus besoin de connaître la structure du client.

   :::indice
   Ajoute la méthode sur l'objet que l'appelant manipule déjà : la commande.
   :::

   :::solution
   ```js
   class Commande {
     #client;

     constructor(client) {
       this.#client = client;
     }

     villeDeLivraison() {
       return this.#client.adresse?.ville ?? 'Adresse inconnue';
     }
   }

   const commande = new Commande({ nom: 'Ada', adresse: { ville: 'Lyon' } });
   console.log(commande.villeDeLivraison()); // 'Lyon'
   console.log(new Commande({ nom: 'Grace' }).villeDeLivraison()); // 'Adresse inconnue'
   ```

   Si l'adresse change de structure, seule `villeDeLivraison` est à modifier, et le cas de
   l'adresse absente est traité à un seul endroit.
   :::

## Questions d'entretien

- Quelle différence entre encapsulation et abstraction ?

  :::indice
  L'une cache des données, l'autre cache une manière de faire.
  :::

  :::reponse
  L'encapsulation contrôle l'accès à l'état : les données sont cachées et ne changent que par
  des méthodes qui garantissent les règles. L'abstraction réduit ce que l'appelant doit savoir :
  il utilise une opération — `notifier`, `exporter` — sans connaître son implémentation. Les deux
  vont souvent ensemble, mais on peut encapsuler sans abstraire, en exposant toutes les
  opérations internes, ou abstraire sans encapsuler, avec une interface simple sur un état
  public.
  :::

- Que signifie *Tell, don't ask* ?

  :::indice
  Où se trouve la décision dans chacun des deux styles ?
  :::

  :::reponse
  C'est le principe selon lequel on demande à un objet d'accomplir une action plutôt que de lire
  son état pour décider à sa place. `compte.retirer(30)` laisse le compte appliquer sa règle ;
  `if (compte.solde >= 30) compte.solde -= 30` recopie la règle chez l'appelant. Le style
  « ordonner » garde les règles à côté des données, évite leur duplication, et permet de changer
  l'implémentation sans toucher aux appelants.
  :::

- Comment simuler une classe abstraite en JavaScript ?

  :::indice
  Deux besoins : empêcher l'instanciation directe, et imposer des méthodes aux sous-classes.
  :::

  :::reponse
  Dans le constructeur, `if (new.target === ClasseDeBase) throw new TypeError(…)` empêche
  d'instancier la base tout en autorisant les sous-classes, pour lesquelles `new.target` vaut la
  sous-classe. Les méthodes à fournir sont définies dans la base et lèvent une erreur explicite,
  ce qui signale l'oubli dès le premier appel. Ce contrôle a lieu à l'exécution ; TypeScript
  fournit `abstract` et `interface` pour le vérifier dès la compilation.
  :::
