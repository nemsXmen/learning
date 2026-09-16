---
id: javascript-composition
title: "Composition contre héritage"
slug: composition-vs-heritage
technology: javascript
level: intermediate
module: heritage
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-polymorphisme
skills:
  - composition-over-inheritance
tags:
  - javascript
  - classes
---

## Objectifs

- Distinguer une relation « est un » d'une relation « a un ».
- Reconnaître deux défauts typiques de l'héritage : la classe de base fragile et l'explosion
  des combinaisons.
- Reconstruire un comportement par composition d'objets plus petits.

## Introduction

« Préférer la composition à l'héritage » est l'un des conseils les plus répétés en conception
objet, et l'un des plus mal compris : il ne dit pas que l'héritage est interdit, mais qu'il
crée un couplage fort, rarement nécessaire. Ce chapitre montre concrètement où l'héritage
casse, et comment la composition résout les mêmes problèmes avec des pièces indépendantes.

## Concept

| | Héritage | Composition |
| --- | --- | --- |
| Relation | « est un » : un carré est une forme | « a un » : une voiture a un moteur |
| Liaison | fixée à la définition de la classe | choisie à la construction de l'objet |
| Couplage | l'enfant dépend des détails du parent | l'objet dépend de l'interface de ses parties |
| Réutilisation | tout le parent, ou rien | seulement les parties utiles |
| Changement de comportement | nouvelle sous-classe | nouvelle partie, ou remplacement à l'exécution |

Deux symptômes signalent un héritage mal choisi :

- **la classe de base fragile** : une modification interne du parent casse un enfant qui n'a
  pas changé ;
- **l'explosion des combinaisons** : `CanardVolant`, `CanardNageur`, `CanardVolantNageur`…
  une sous-classe par mélange de capacités.

## Exemple

```js
// Héritage : l'enfant dépend de la façon dont le parent est écrit.
class Ensemble {
  #elements = [];
  ajouter(element) {
    this.#elements.push(element);
  }
  ajouterTous(liste) {
    for (const element of liste) {
      this.ajouter(element); // détail interne : ajouterTous passe par ajouter
    }
  }
  get taille() {
    return this.#elements.length;
  }
}

class EnsembleCompteHerite extends Ensemble {
  ajouts = 0;
  ajouter(element) {
    this.ajouts += 1;
    super.ajouter(element);
  }
  ajouterTous(liste) {
    this.ajouts += liste.length;
    super.ajouterTous(liste);
  }
}

const herite = new EnsembleCompteHerite();
herite.ajouterTous(['a', 'b', 'c']);
console.log(herite.ajouts, herite.taille); // 6 3 : chaque ajout compté deux fois

// Composition : on enveloppe un ensemble, on ne dépend que de son interface.
class EnsembleCompte {
  #ensemble = new Ensemble();
  ajouts = 0;
  ajouter(element) {
    this.ajouts += 1;
    this.#ensemble.ajouter(element);
  }
  ajouterTous(liste) {
    for (const element of liste) {
      this.ajouter(element);
    }
  }
  get taille() {
    return this.#ensemble.taille;
  }
}

const compose = new EnsembleCompte();
compose.ajouterTous(['a', 'b', 'c']);
console.log(compose.ajouts, compose.taille); // 3 3
```

## Comment ça fonctionne

Le compteur hérité est faux sans qu'aucune de ses lignes le soit. `EnsembleCompteHerite`
compte trois ajouts dans `ajouterTous`, puis appelle `super.ajouterTous`, qui appelle
`this.ajouter` pour chaque élément — et `this.ajouter` désigne la version **redéfinie**, qui
compte à nouveau. Le bug vient d'un détail d'implémentation du parent, que l'enfant ne peut
pas voir : si l'auteur d'`Ensemble` réécrit un jour `ajouterTous` sans passer par `ajouter`,
le compteur redevient juste, puis casse autrement. C'est la **classe de base fragile** :
hériter, c'est dépendre du « comment » du parent, pas seulement de son « quoi ».

La version composée ne connaît qu'une chose d'`Ensemble` : ses méthodes publiques. Elle
**délègue** à l'objet qu'elle contient et ajoute son comportement autour. Les changements
internes d'`Ensemble` ne peuvent plus l'atteindre.

La composition règle aussi l'**explosion des combinaisons**. Plutôt qu'une sous-classe par
mélange de capacités, on construit l'objet à partir de pièces :

```js
const peutVoler = (etat) => ({ voler: () => `${etat.nom} vole` });
const peutNager = (etat) => ({ nager: () => `${etat.nom} nage` });

function creerCanard(nom) {
  const etat = { nom };
  return { ...peutVoler(etat), ...peutNager(etat) };
}
```

Deux capacités, trois combinaisons possibles, zéro sous-classe. Ajouter une capacité ajoute
une fonction, pas une rangée de classes.

L'héritage garde sa place quand la relation « est un » est **stable** et que le parent est
**conçu pour être étendu** : une sous-classe d'`Error`, un composant d'un framework qui
documente ses points d'extension, une hiérarchie courte de un ou deux niveaux. Le problème
n'est pas `extends`, mais l'héritage utilisé pour récupérer du code.

## Erreurs fréquentes

**Hériter pour réutiliser quelques méthodes.** Si la relation n'est pas « est un »,
compose.

**Redéfinir une méthode dont le parent se sert en interne.** Le comportement dépend alors de
détails que tu ne contrôles pas.

**Multiplier les sous-classes pour chaque combinaison.** Assemble des capacités.

**Composer ce qui est simple.** Pour un comportement unique et stable, une petite classe ou une
fonction suffit : la composition est un outil, pas un rituel.

## À retenir

- Héritage : « est un », couplage aux détails du parent. Composition : « a un », couplage à une
  interface.
- Classe de base fragile : une modification interne du parent casse l'enfant.
- La composition délègue à des objets contenus et ajoute son comportement autour.
- Des capacités assemblées évitent l'explosion des sous-classes.
- L'héritage convient à une relation stable, courte, et à un parent prévu pour être étendu.

## Exercices

1. Pour chaque paire, dis s'il s'agit d'une relation « est un » ou « a un », et donc
   d'héritage ou de composition.

   - a) `Voiture` et `Moteur`
   - b) `ErreurReseau` et `Error`
   - c) `Utilisateur` et `ListeDePermissions`
   - d) `Commande` et `ServiceDePaiement`

   :::indice
   Formule la phrase à voix haute : « une voiture est un moteur » a-t-il un sens ?
   :::

   :::solution
   - a) « Une voiture **a un** moteur » : composition.
   - b) « Une erreur réseau **est une** erreur » : héritage, et `Error` est conçue pour être
     étendue.
   - c) « Un utilisateur **a une** liste de permissions » : composition.
   - d) « Une commande **utilise** un service de paiement » : composition, ou même un simple
     paramètre passé à la méthode qui paie.
   :::

2. Cette `Pile` hérite de `Array` pour ne proposer qu'`empiler` et `depiler`, mais expose
   aussi `splice`, `sort` et toutes les autres méthodes de tableau. Réécris-la par composition.

   ```js
   class Pile extends Array {
     empiler(x) { this.push(x); }
     depiler() { return this.pop(); }
   }
   ```

   :::indice
   Garde un tableau dans un champ privé, et n'expose que les opérations d'une pile.
   :::

   :::solution
   ```js
   class Pile {
     #elements = [];

     empiler(element) {
       this.#elements.push(element);
     }

     depiler() {
       return this.#elements.pop();
     }

     get taille() {
       return this.#elements.length;
     }
   }

   const pile = new Pile();
   pile.empiler(1);
   pile.empiler(2);
   console.log(pile.depiler(), pile.taille, typeof pile.splice); // 2 1 'undefined'
   ```

   L'héritage faisait de la pile « un tableau », avec toutes ses opérations, y compris celles
   qui cassent l'ordre d'une pile. La composition n'expose que le contrat voulu.
   :::

3. On veut des personnages de jeu qui peuvent, selon les cas, attaquer, soigner, ou les deux.
   Écris une solution sans aucune sous-classe.

   :::indice
   Écris une fonction par capacité, qui reçoit l'état et renvoie les méthodes, puis assemble
   celles dont chaque personnage a besoin.
   :::

   :::solution
   ```js
   const peutAttaquer = (etat) => ({
     attaquer: (cible) => `${etat.nom} attaque ${cible}`,
   });

   const peutSoigner = (etat) => ({
     soigner: (cible) => `${etat.nom} soigne ${cible}`,
   });

   function creerPersonnage(nom, ...capacites) {
     const etat = { nom };
     return Object.assign({ nom }, ...capacites.map((capacite) => capacite(etat)));
   }

   const guerrier = creerPersonnage('Ada', peutAttaquer);
   const paladin = creerPersonnage('Grace', peutAttaquer, peutSoigner);

   console.log(guerrier.attaquer('le dragon')); // 'Ada attaque le dragon'
   console.log(paladin.soigner('Ada'), typeof guerrier.soigner); // 'Grace soigne Ada' 'undefined'
   ```

   Une troisième capacité s'ajoute par une nouvelle fonction, et toutes les combinaisons sont
   disponibles sans créer de classe.
   :::

## Questions d'entretien

- Que signifie « préférer la composition à l'héritage » ?

  :::indice
  Qu'est-ce que chacun des deux couple ?
  :::

  :::reponse
  Que pour réutiliser ou varier un comportement, il vaut mieux assembler des objets qui
  collaborent par leurs interfaces que créer une sous-classe. L'héritage couple l'enfant aux
  détails internes du parent et fige la combinaison au moment de la définition ; la composition
  ne dépend que des méthodes publiques et permet de choisir, voire de remplacer, les parties à
  la construction. Ce n'est pas une interdiction : l'héritage reste adapté à une relation « est
  un » stable et à un parent conçu pour être étendu.
  :::

- Qu'est-ce que le problème de la classe de base fragile ?

  :::indice
  Une sous-classe peut-elle casser sans avoir été modifiée ?
  :::

  :::reponse
  C'est le fait qu'une modification interne d'une classe parente, parfaitement valide de son
  point de vue, casse une sous-classe qui n'a pas changé. Cela arrive quand l'enfant redéfinit
  des méthodes que le parent utilise en interne, et dépend donc de l'ordre et de la manière
  dont le parent les appelle. La composition supprime ce risque, puisque l'objet englobant ne
  voit que l'interface publique de l'objet qu'il contient.
  :::

- Quand l'héritage reste-t-il le bon choix ?

  :::indice
  Pense à la stabilité de la relation, à la profondeur, et à l'intention de l'auteur du parent.
  :::

  :::reponse
  Quand la relation « est un » est vraie et stable, que la hiérarchie reste courte — un ou deux
  niveaux —, et que le parent est explicitement conçu pour être étendu, avec des points
  d'extension documentés. Les erreurs personnalisées qui étendent `Error`, ou les composants
  d'un framework qui prévoit l'héritage, en sont les exemples typiques. Hors de ces cas,
  hériter pour récupérer du code crée plus de couplage qu'il n'en économise.
  :::
