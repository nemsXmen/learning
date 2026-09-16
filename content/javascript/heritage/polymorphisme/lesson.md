---
id: javascript-polymorphisme
title: "Redéfinition de méthode et polymorphisme"
slug: polymorphisme
technology: javascript
level: intermediate
module: heritage
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-extends-super
skills:
  - polymorphism
tags:
  - javascript
  - classes
---

## Objectifs

- Redéfinir une méthode héritée sans casser le contrat du parent.
- Remplacer un `switch` sur le type d'un objet par un appel polymorphe.
- Reconnaître le typage par comportement (*duck typing*), propre à JavaScript.

## Introduction

Un programme qui calcule des frais de livraison écrit souvent
`if (colis.type === 'express') … else if (colis.type === 'standard') …`, et ce test se
recopie dans chaque fonction qui dépend du type. Chaque nouveau mode de livraison oblige alors
à modifier tous ces endroits. Le **polymorphisme** inverse la logique : chaque objet sait
répondre au même message à sa façon, et le code appelant n'a plus besoin de connaître les
types.

## Concept

| Notion | Définition |
| --- | --- |
| Redéfinition | une sous-classe fournit sa propre version d'une méthode héritée |
| Polymorphisme | le même appel produit un comportement adapté à chaque objet |
| Contrat | ce qu'une méthode promet : paramètres acceptés, type renvoyé, erreurs possibles |
| Duck typing | un objet convient s'il possède les méthodes attendues, quel que soit son type |

La règle qui rend le polymorphisme sûr — le **principe de substitution** — tient en une
phrase : partout où le code attend le parent, une instance de la sous-classe doit pouvoir
être utilisée sans surprise.

## Exemple

```js
// Avant : le type est testé à chaque usage.
function fraisAvecSwitch(colis) {
  switch (colis.type) {
    case 'standard':
      return 5;
    case 'express':
      return 5 + colis.poids * 2;
    default:
      throw new Error(`Type inconnu : ${colis.type}`);
  }
}
console.log(fraisAvecSwitch({ type: 'express', poids: 3 })); // 11

// Après : chaque type porte sa propre règle.
class Livraison {
  constructor(poids) {
    this.poids = poids;
  }
  frais() {
    return 5;
  }
  resume() {
    return `${this.constructor.name} : ${this.frais()} €`;
  }
}

class LivraisonExpress extends Livraison {
  frais() {
    return super.frais() + this.poids * 2;
  }
}

class RetraitMagasin extends Livraison {
  frais() {
    return 0;
  }
}

const envois = [new Livraison(3), new LivraisonExpress(3), new RetraitMagasin(3)];
console.log(envois.map((envoi) => envoi.resume()));
// ['Livraison : 5 €', 'LivraisonExpress : 11 €', 'RetraitMagasin : 0 €']

// Duck typing : aucun héritage, mais le même comportement suffit.
const coursier = { poids: 1, frais: () => 12, resume() { return `Coursier : ${this.frais()} €`; } };
console.log([...envois, coursier].reduce((total, envoi) => total + envoi.frais(), 0)); // 28
```

## Comment ça fonctionne

Quand `resume()` appelle `this.frais()`, le moteur cherche `frais` en partant de l'**instance
réelle**, pas de la classe où `resume` est écrite. Pour une `LivraisonExpress`, la recherche
trouve d'abord `LivraisonExpress.prototype.frais` et s'arrête : c'est la **répartition
dynamique**, qui découle directement de la chaîne de prototypes. `resume` est écrite une
seule fois, dans le parent, et chaque sous-classe n'a qu'à fournir la partie qui varie. Ce
motif porte un nom : la *méthode patron* (*template method*).

Le gain apparaît quand on ajoute un cas. Avec le `switch`, un nouveau mode de livraison impose
de retrouver et de modifier chaque fonction qui teste le type. Avec le polymorphisme, on
ajoute une classe, et aucun code existant ne change.

JavaScript ne vérifie pas les types : un objet convient dès qu'il répond aux méthodes
appelées. Le coursier de l'exemple n'hérite de rien, et pourtant il s'intègre au calcul.
L'héritage n'est donc pas une condition du polymorphisme en JavaScript ; il sert à partager
du code, pas à « autoriser » un objet. TypeScript formalise ce comportement avec des
interfaces vérifiées à la compilation.

Le polymorphisme n'est sûr que si chaque redéfinition **respecte le contrat** du parent. Une
sous-classe qui lève une erreur là où le parent renvoyait un nombre, ou qui renvoie une chaîne
au lieu d'un nombre, casse tout code écrit pour le parent — même si chaque classe prise seule
semble correcte.

Un piège propre à JavaScript : appeler une méthode redéfinissable **depuis le constructeur du
parent**. Le constructeur parent s'exécute pendant `super()`, avant l'installation des champs
de l'enfant. La méthode redéfinie s'exécute donc avec des champs encore à `undefined`. On
évite d'appeler des méthodes redéfinissables dans un constructeur.

Enfin, `this.constructor.name` convient à un exemple, mais pas à une logique métier : un outil
de minification renomme les classes en production.

## Erreurs fréquentes

**Tester le type avec `switch` ou `instanceof` dans tout le code.** Déplace la règle dans une
méthode de chaque type.

**Changer le contrat dans une redéfinition.** Type de retour, erreurs levées et paramètres
doivent rester compatibles.

**Appeler une méthode redéfinissable dans le constructeur parent.** Les champs de l'enfant ne
sont pas encore initialisés.

**Créer une hiérarchie de classes pour un seul comportement variable.** Une fonction passée en
paramètre, ou un objet stratégie, suffit souvent.

## À retenir

- Redéfinir une méthode remplace la version parente pour les instances de la sous-classe.
- `this.methode()` part toujours de l'instance réelle : c'est la répartition dynamique.
- Le polymorphisme remplace les tests de type répétés, et rend l'ajout d'un cas local.
- En JavaScript, il suffit qu'un objet ait les bonnes méthodes : pas besoin d'héritage.
- Une redéfinition respecte le contrat du parent, et n'est pas appelée depuis son constructeur.

## Exercices

1. Remplace ce `switch` par des classes qui portent chacune leur règle de réduction.

   ```js
   function reduction(client, montant) {
     switch (client.statut) {
       case 'standard': return 0;
       case 'fidele': return montant * 0.05;
       case 'premium': return montant * 0.1;
     }
   }
   ```

   :::indice
   Une classe de base `Client` avec `reduction(montant)` qui renvoie `0`, puis une
   redéfinition par statut.
   :::

   :::solution
   ```js
   class Client {
     reduction(montant) {
       return 0;
     }
   }

   class ClientFidele extends Client {
     reduction(montant) {
       return montant * 0.05;
     }
   }

   class ClientPremium extends Client {
     reduction(montant) {
       return montant * 0.1;
     }
   }

   const clients = [new Client(), new ClientFidele(), new ClientPremium()];
   console.log(clients.map((client) => client.reduction(200))); // [0, 10, 20]
   ```

   Ajouter un statut revient maintenant à ajouter une classe : aucune fonction existante n'est
   modifiée.
   :::

2. Sans héritage, ajoute à la liste `clients` de l'exercice précédent un client partenaire
   dont la réduction est fixe, de 15 €, et vérifie que le calcul fonctionne toujours.

   :::indice
   Le code appelant n'utilise qu'une méthode : un objet littéral qui la possède suffit.
   :::

   :::solution
   ```js
   const partenaire = {
     reduction: () => 15,
   };

   console.log([...clients, partenaire].map((client) => client.reduction(200))); // [0, 10, 20, 15]
   ```

   C'est le typage par comportement : l'objet convient parce qu'il répond à `reduction`, pas
   parce qu'il descend de `Client`.
   :::

3. Ce code affiche `undefined` au lieu de `[journal] prêt`. Explique pourquoi et corrige.

   ```js
   class Composant {
     constructor() {
       this.afficher();
     }
     afficher() {}
   }

   class Journal extends Composant {
     prefixe = '[journal]';
     afficher() {
       console.log(this.prefixe && `${this.prefixe} prêt`);
     }
   }

   new Journal();
   ```

   :::indice
   À quel moment le champ `prefixe` est-il installé, par rapport à l'exécution du constructeur
   de `Composant` ?
   :::

   :::solution
   `new Journal()` exécute d'abord le constructeur de `Composant`, pendant `super()`. Celui-ci
   appelle `afficher`, qui est la version redéfinie de `Journal`. Or les champs de `Journal` ne
   sont installés qu'**après** le retour de `super()` : `this.prefixe` vaut encore `undefined`.

   ```js
   class Composant {
     demarrer() {
       this.afficher();
       return this;
     }
     afficher() {}
   }

   class Journal extends Composant {
     prefixe = '[journal]';
     afficher() {
       console.log(`${this.prefixe} prêt`);
     }
   }

   new Journal().demarrer(); // '[journal] prêt'
   ```

   Le constructeur se contente d'initialiser ; le comportement redéfinissable est déclenché
   ensuite, une fois l'objet complet.
   :::

## Questions d'entretien

- Qu'est-ce que le polymorphisme, et qu'apporte-t-il ?

  :::indice
  Pense à ce qui se passe quand on ajoute un nouveau type.
  :::

  :::reponse
  C'est la capacité d'objets différents à répondre au même appel, chacun à sa manière. Le code
  appelant écrit `envoi.frais()` sans connaître le type exact. Son intérêt principal est
  l'extension : ajouter un cas consiste à ajouter une classe ou un objet, sans modifier les
  fonctions existantes, là où un `switch` sur le type obligerait à retoucher chaque endroit
  qui teste ce type.
  :::

- Qu'est-ce que le duck typing en JavaScript ?

  :::indice
  « Si ça marche comme un canard et que ça cancane comme un canard… »
  :::

  :::reponse
  C'est le fait de juger un objet sur ce qu'il sait faire plutôt que sur son type déclaré : un
  objet convient s'il possède les méthodes appelées. JavaScript ne vérifie aucun type à
  l'exécution, donc un objet littéral peut remplacer une instance de classe dès qu'il expose la
  même interface. Cela rend l'héritage facultatif pour le polymorphisme. TypeScript en garde
  l'esprit avec un typage structurel, vérifié à la compilation.
  :::

- Pourquoi éviter d'appeler une méthode redéfinissable dans un constructeur ?

  :::indice
  Que vaut un champ de la sous-classe pendant l'exécution du constructeur parent ?
  :::

  :::reponse
  Parce que le constructeur parent s'exécute pendant `super()`, avant que les champs de la
  sous-classe soient installés. Si le parent appelle une méthode redéfinie, celle-ci travaille
  sur un objet incomplet, avec des champs à `undefined`, et produit des bugs difficiles à
  relier à leur cause. Un constructeur doit se limiter à initialiser l'état ; le comportement
  se déclenche ensuite, par une méthode appelée sur l'objet terminé.
  :::
