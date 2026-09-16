---
id: javascript-strategie-observateur
title: "Stratégie, observateur et injection de dépendances"
slug: strategie-observateur-injection
technology: javascript
level: advanced
module: patterns-objet
order: 3
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-fabrique-singleton
  - javascript-callbacks
skills:
  - behavioral-patterns
tags:
  - javascript
  - patterns
---

## Objectifs

- Rendre un algorithme interchangeable avec une stratégie, souvent une simple fonction.
- Écrire un observateur qui prévient ses abonnés et permet de se désabonner.
- Passer à un objet les collaborateurs dont il a besoin, pour pouvoir le tester.

## Introduction

Ces trois patterns partagent une idée : **ne pas figer une décision dans le code qui
l'utilise**. La stratégie laisse varier un calcul, l'observateur laisse varier les réactions à
un événement, l'injection laisse varier les collaborateurs. En JavaScript, où les fonctions
sont des valeurs, ils s'écrivent souvent en quelques lignes — et savoir quand une fonction
suffit fait partie du pattern.

## Concept

| Pattern | Ce qui varie | Forme idiomatique en JavaScript |
| --- | --- | --- |
| Stratégie | l'algorithme | une fonction passée en paramètre, ou un objet de fonctions |
| Observateur | qui réagit à un événement | `abonner(evenement, rappel)` qui renvoie une fonction de désabonnement |
| Injection de dépendances | les collaborateurs | les recevoir dans le constructeur au lieu de les créer |

L'injection de dépendances ne demande aucun outil : c'est simplement **passer en paramètre**
ce qu'on créait auparavant avec `new` à l'intérieur de la classe. Les objets sont assemblés en
un seul endroit, au démarrage de l'application.

## Exemple

```js
// Stratégie : des fonctions interchangeables.
const livraison = {
  standard: (commande) => (commande.total >= 50 ? 0 : 5),
  express: () => 12,
};

function fraisDeLivraison(commande, strategie = livraison.standard) {
  return strategie(commande);
}
console.log(fraisDeLivraison({ total: 30 }), fraisDeLivraison({ total: 30 }, livraison.express)); // 5 12

// Observateur : s'abonner, être prévenu, se désabonner.
class Emetteur {
  #abonnes = new Map();

  abonner(evenement, rappel) {
    if (!this.#abonnes.has(evenement)) {
      this.#abonnes.set(evenement, new Set());
    }
    this.#abonnes.get(evenement).add(rappel);
    return () => this.#abonnes.get(evenement).delete(rappel);
  }

  emettre(evenement, donnees) {
    for (const rappel of this.#abonnes.get(evenement) ?? []) {
      rappel(donnees);
    }
  }
}

const panier = new Emetteur();
const journal = [];
const seDesabonner = panier.abonner('ajout', (article) => journal.push(`ajouté : ${article}`));
panier.emettre('ajout', 'clavier');
seDesabonner();
panier.emettre('ajout', 'souris');
console.log(journal); // ['ajouté : clavier']

// Injection : le service reçoit ses collaborateurs au lieu de les fabriquer.
class ServiceInscription {
  #depot;
  #notifier;

  constructor(depot, notifier) {
    this.#depot = depot;
    this.#notifier = notifier;
  }

  inscrire(email) {
    if (this.#depot.existe(email)) {
      return false;
    }
    this.#depot.ajouter(email);
    this.#notifier(`Bienvenue ${email}`);
    return true;
  }
}

// En test : des collaborateurs factices, sans base de données ni envoi réel.
const emails = new Set();
const messages = [];
const service = new ServiceInscription(
  { existe: (email) => emails.has(email), ajouter: (email) => emails.add(email) },
  (message) => messages.push(message),
);
console.log(service.inscrire('ada@exemple.fr'), service.inscrire('ada@exemple.fr')); // true false
console.log(messages); // ['Bienvenue ada@exemple.fr']
```

## Comment ça fonctionne

Dans les livres de patterns, une **stratégie** est une interface et une classe par
algorithme. En JavaScript, une fonction est déjà une valeur : l'interface se réduit à « une
fonction qui reçoit une commande et renvoie un montant ». Un objet de fonctions sert de
registre, et ajouter un mode de livraison revient à ajouter une propriété. Une classe ne se
justifie que si la stratégie a un état ou plusieurs méthodes liées.

L'**observateur** découple l'émetteur des réactions : le panier ne sait pas qui l'écoute, et
de nouvelles réactions s'ajoutent sans le modifier. Trois détails font la différence entre une
version jouet et une version fiable. Un `Set` évite d'enregistrer deux fois le même rappel. La
**fonction de désabonnement** renvoyée par `abonner` permet de nettoyer, sans quoi un abonné
reste référencé pour toujours — la fuite mémoire vue avec les closures. Enfin, un rappel qui
**lève une erreur** interrompt la boucle, et les abonnés suivants ne sont pas prévenus : un
émetteur robuste entoure chaque appel d'un `try` / `catch`. L'environnement fournit déjà ce
pattern : `EventTarget` dans les navigateurs et dans Node, `EventEmitter` dans Node.

L'**injection de dépendances** rend visibles les collaborateurs d'un objet. Un service qui
écrit `new DepotPostgres()` dans son constructeur ne peut pas être testé sans base de données,
et son couplage ne se voit qu'en lisant son code. En recevant `depot` et `notifier`, il
annonce ses besoins dans sa signature, et le test lui passe des versions factices. Les objets
réels sont créés et reliés en un seul endroit, souvent le fichier de démarrage, appelé
**racine de composition**. Un conteneur d'injection, comme celui de NestJS, automatise ce
câblage dans les grosses applications ; il n'est pas nécessaire pour appliquer le principe.

Ces patterns sont des outils, pas des objectifs. Si un calcul ne varie jamais, une stratégie
est une indirection inutile ; si un seul composant réagit à un événement, un appel direct est
plus lisible qu'un émetteur. Et une transformation de données s'écrit mieux comme une suite de
fonctions que comme une hiérarchie d'objets.

## Erreurs fréquentes

**Créer une classe par stratégie quand une fonction suffit.** L'interface est la signature.

**Oublier de se désabonner.** L'abonné et tout ce qu'il retient restent en mémoire.

**Laisser un abonné en erreur bloquer les autres.** Protège chaque appel dans l'émetteur.

**Instancier ses dépendances dans le constructeur.** Reçois-les, pour pouvoir les remplacer.

**Introduire un conteneur d'injection dans une petite application.** Passer les objets en
paramètre suffit.

## À retenir

- Stratégie : un algorithme interchangeable, en JavaScript souvent une fonction.
- Observateur : `abonner` renvoie de quoi se désabonner ; protège la boucle d'émission.
- Injection : un objet reçoit ses collaborateurs au lieu de les créer.
- Les objets réels sont assemblés à un seul endroit, au démarrage.
- Un pattern se justifie par une variation réelle : sinon, un appel direct suffit.

## Exercices

1. Remplace cette cascade de conditions par des stratégies, sélectionnées par le nom de
   l'abonnement.

   ```js
   function prixMensuel(abonnement, utilisateurs) {
     if (abonnement === 'gratuit') return 0;
     if (abonnement === 'equipe') return utilisateurs * 8;
     if (abonnement === 'entreprise') return Math.max(200, utilisateurs * 6);
   }
   ```

   :::indice
   Un objet dont chaque propriété est une fonction de calcul, puis une fonction qui choisit et
   signale un abonnement inconnu.
   :::

   :::solution
   ```js
   const tarifs = {
     gratuit: () => 0,
     equipe: (utilisateurs) => utilisateurs * 8,
     entreprise: (utilisateurs) => Math.max(200, utilisateurs * 6),
   };

   function prixMensuel(abonnement, utilisateurs) {
     const tarif = tarifs[abonnement];
     if (!tarif) {
       throw new Error(`Abonnement inconnu : ${abonnement}`);
     }
     return tarif(utilisateurs);
   }

   console.log(prixMensuel('equipe', 5), prixMensuel('entreprise', 10)); // 40 200
   ```

   La version d'origine renvoyait silencieusement `undefined` pour un abonnement inconnu ; le
   registre rend ce cas explicite.
   :::

2. Ajoute à `Emetteur` une méthode `abonnerUneFois(evenement, rappel)` : le rappel ne doit être
   exécuté qu'à la première émission.

   :::indice
   Abonne une fonction intermédiaire qui se désabonne elle-même avant d'appeler le rappel.
   :::

   :::solution
   ```js
   class EmetteurUneFois extends Emetteur {
     abonnerUneFois(evenement, rappel) {
       const seDesabonner = this.abonner(evenement, (donnees) => {
         seDesabonner();
         rappel(donnees);
       });
       return seDesabonner;
     }
   }

   const emetteur = new EmetteurUneFois();
   const recus = [];
   emetteur.abonnerUneFois('pret', (valeur) => recus.push(valeur));
   emetteur.emettre('pret', 1);
   emetteur.emettre('pret', 2);
   console.log(recus); // [1]
   ```

   Retirer l'élément courant d'un `Set` pendant qu'on le parcourt est sûr : l'itération continue
   normalement avec les éléments suivants.
   :::

3. Ce service est impossible à tester sans envoyer de vrais courriels. Rends ses dépendances
   injectables, puis écris un test avec un envoi factice.

   ```js
   class Relance {
     constructor() {
       this.mailer = new MailerSmtp();
     }
     relancer(factures) {
       for (const facture of factures.filter((f) => !f.payee)) {
         this.mailer.envoyer(facture.email, 'Facture en attente');
       }
     }
   }
   ```

   :::indice
   Le constructeur reçoit le `mailer` au lieu de le créer ; le test lui passe un objet qui
   enregistre les appels.
   :::

   :::solution
   ```js
   class Relance {
     #mailer;

     constructor(mailer) {
       this.#mailer = mailer;
     }

     relancer(factures) {
       const impayees = factures.filter((facture) => !facture.payee);
       for (const facture of impayees) {
         this.#mailer.envoyer(facture.email, 'Facture en attente');
       }
       return impayees.length;
     }
   }

   const envois = [];
   const mailerFactice = { envoyer: (destinataire) => envois.push(destinataire) };

   const relance = new Relance(mailerFactice);
   const nombre = relance.relancer([
     { email: 'ada@exemple.fr', payee: false },
     { email: 'grace@exemple.fr', payee: true },
   ]);
   console.log(nombre, envois); // 1 ['ada@exemple.fr']
   ```

   En production, le fichier de démarrage écrit `new Relance(new MailerSmtp(configuration))` :
   c'est le seul endroit qui connaît la classe réelle.
   :::

## Questions d'entretien

- Comment s'écrit le pattern Stratégie en JavaScript ?

  :::indice
  Qu'est-ce qu'une fonction, dans ce langage ?
  :::

  :::reponse
  Le plus souvent, avec des fonctions : puisqu'une fonction est une valeur, l'algorithme
  interchangeable se passe en paramètre ou se range dans un objet qui sert de registre. Il n'est
  pas nécessaire de créer une interface et une classe par variante, comme en Java. On passe à
  des objets ou des classes seulement quand une stratégie a besoin d'un état ou de plusieurs
  opérations liées.
  :::

- Quels sont les pièges d'un observateur fait maison ?

  :::indice
  Pense à la mémoire, aux erreurs et aux doublons.
  :::

  :::reponse
  Les abonnés jamais retirés, qui restent référencés et provoquent des fuites mémoire — d'où une
  fonction de désabonnement renvoyée par `abonner`. Un abonné qui lève une erreur et empêche les
  suivants d'être prévenus, si la boucle d'émission n'est pas protégée. Les doublons, si le même
  rappel est enregistré deux fois dans un tableau. Et une notification synchrone qui surprend
  quand un abonné modifie l'émetteur pendant l'émission. `EventTarget` et `EventEmitter`
  règlent déjà une partie de ces questions.
  :::

- Qu'est-ce que l'injection de dépendances, et faut-il un conteneur ?

  :::indice
  Qui crée les collaborateurs d'un objet, et où ?
  :::

  :::reponse
  C'est le fait qu'un objet reçoive ses collaborateurs — dépôt, service d'envoi, horloge — au
  lieu de les créer lui-même. Ses dépendances deviennent visibles dans sa signature, et on peut
  les remplacer par des versions factices en test. Les objets réels sont assemblés à un seul
  endroit, la racine de composition. Un conteneur, comme celui de NestJS, automatise ce câblage
  dans les grosses applications, mais le principe s'applique très bien à la main, en passant des
  paramètres.
  :::
