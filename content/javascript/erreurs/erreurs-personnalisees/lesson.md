---
id: javascript-erreurs-personnalisees
title: "Erreurs personnalisées, propagation et frontières d'erreur"
slug: erreurs-personnalisees
technology: javascript
level: advanced
module: erreurs
order: 4
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-try-catch
  - javascript-extends-super
skills:
  - custom-errors
tags:
  - javascript
  - erreurs
---

## Objectifs

- Construire une petite hiérarchie d'erreurs métier, avec un code et des données exploitables.
- Décider, couche par couche, s'il faut laisser passer une erreur ou la relever avec un contexte.
- Centraliser la conversion des erreurs en réponses dans une frontière d'erreur.

## Introduction

Dans une application réelle, une même erreur traverse plusieurs couches : l'accès aux données
constate qu'une commande n'existe pas, le service métier l'appelle, le contrôleur HTTP doit répondre
404, l'interface doit afficher un message compréhensible. Si chaque couche invente son propre
traitement, on obtient des `try` partout et des réponses incohérentes. Une hiérarchie d'erreurs et
une **frontière** unique mettent de l'ordre dans ce trajet.

## Concept

| Élément | Rôle |
| --- | --- |
| Classe de base `ErreurApplication` | toutes les erreurs **prévues** par l'application en héritent |
| Sous-classes métier | `ErreurIntrouvable`, `ErreurValidation`, `ErreurAcces`… avec leurs données |
| `code` | un identifiant stable, lisible par un programme : `'INTROUVABLE'` |
| Couches intermédiaires | laissent passer, ou relèvent avec un contexte et `cause` |
| Frontière d'erreur | l'endroit unique qui transforme une erreur en réponse ou en affichage |
| Gestionnaires globaux | dernier filet pour journaliser ce qui a échappé à tout le reste |

La distinction essentielle se fait à la frontière : une `ErreurApplication` est un cas **prévu**, dont
le message peut être montré ; toute autre erreur est un **bug**, qui produit une réponse générique et
une entrée dans le journal.

## Exemple

```js
class ErreurApplication extends Error {
  constructor(message, { code, statut = 500, cause } = {}) {
    super(message, { cause });
    this.name = new.target.name; // le nom de la sous-classe réellement instanciée
    this.code = code;
    this.statut = statut;
  }
}

class ErreurIntrouvable extends ErreurApplication {
  constructor(ressource, id) {
    super(`${ressource} ${id} introuvable`, { code: 'INTROUVABLE', statut: 404 });
  }
}

class ErreurValidation extends ErreurApplication {
  constructor(champs) {
    super(`Champs invalides : ${champs.join(', ')}`, { code: 'VALIDATION', statut: 400 });
    this.champs = champs;
  }
}

const commandes = new Map([[1, { id: 1, total: 30 }]]);
function trouverCommande(id) {
  const commande = commandes.get(id);
  if (!commande) throw new ErreurIntrouvable('Commande', id);
  return commande;
}

const journal = [];
function repondre(action) {
  try {
    return { statut: 200, corps: action() };
  } catch (erreur) {
    if (erreur instanceof ErreurApplication) {
      return { statut: erreur.statut, corps: { code: erreur.code, message: erreur.message } };
    }
    journal.push(erreur); // un bug : on le garde pour les développeurs
    return { statut: 500, corps: { code: 'INTERNE', message: 'Une erreur est survenue' } };
  }
}

console.log(repondre(() => trouverCommande(1)).statut); // 200
console.log(repondre(() => trouverCommande(9)));
// { statut: 404, corps: { code: 'INTROUVABLE', message: 'Commande 9 introuvable' } }
console.log(repondre(() => { throw new ErreurValidation(['email']); }).corps.code); // 'VALIDATION'
console.log(repondre(() => trouverCommande(1).client.nom).statut, journal[0].name); // 500 'TypeError'
```

## Comment ça fonctionne

La classe de base porte ce que toutes les erreurs prévues partagent : un `code` stable et un `statut`.
`this.name = new.target.name` donne automatiquement à chaque instance le nom de sa classe réelle, sans
le répéter dans chaque sous-classe. Chaque sous-classe ne fait qu'une chose : construire un message
précis et attacher les données utiles, comme la liste des `champs` invalides. Le code appelant peut
alors tester `instanceof` pour la famille, ou lire `code` pour un cas précis — ce qui reste fiable même
après une minification, qui renomme les classes.

Le trajet d'une erreur suit une règle simple : **chaque couche ne rattrape que ce qu'elle peut
enrichir ou traiter**. L'accès aux données lève `ErreurIntrouvable` ; le service métier la laisse
passer, car il n'a rien à ajouter ; s'il appelle un service externe qui échoue, il peut relever une
`ErreurApplication` explicite en gardant l'échec technique en `cause`. Aucune couche intermédiaire ne
décide de la réponse finale.

La **frontière d'erreur** est l'endroit unique où ce choix est fait. Dans une API, c'est le gestionnaire
d'erreurs du routeur — l'équivalent de `repondre` dans l'exemple ; dans une interface, c'est un
composant qui affiche un écran d'erreur à la place d'une zone en panne, comme les *error boundaries* de
React. Elle traduit les erreurs prévues en réponses adaptées, et traite toutes les autres comme des
bugs : réponse générique, **aucun détail interne** renvoyé à l'utilisateur — ni pile, ni requête SQL —,
et journalisation complète pour les développeurs.

Les **gestionnaires globaux** sont le dernier filet : `window.addEventListener('error')` et
`'unhandledrejection'` dans un navigateur, `process.on('uncaughtException')` et
`'unhandledRejection'` dans Node.js. Ils servent à journaliser ce qui a échappé à toutes les frontières,
jamais à piloter la logique. Après une `uncaughtException`, l'état d'un processus Node.js n'est plus
fiable : on journalise, puis on laisse le processus redémarrer.

Une hiérarchie d'erreurs reste courte. Quelques classes correspondant à des réponses différentes
suffisent : une classe par fonction du code produit une taxonomie que personne ne consulte.

## Erreurs fréquentes

**Renvoyer le message d'un bug à l'utilisateur.** Il peut contenir des détails internes : réponse
générique et journal.

**Rattraper l'erreur dans chaque couche.** Seule la frontière décide de la réponse.

**Tester le type d'erreur par son message.** Un message change ; un `code` ou `instanceof` est stable.

**Créer une classe d'erreur par situation.** Garde quelques familles utiles.

**Utiliser les gestionnaires globaux comme logique normale.** Ils journalisent les oublis, c'est tout.

## À retenir

- Une classe de base pour les erreurs prévues, quelques sous-classes avec `code` et données.
- `this.name = new.target.name` nomme chaque sous-classe automatiquement.
- Les couches intermédiaires laissent passer, ou relèvent avec un contexte et `cause`.
- La frontière d'erreur traduit les erreurs prévues et traite les autres comme des bugs.
- Les gestionnaires globaux sont un dernier filet de journalisation.

## Exercices

1. Ajoute `ErreurAcces` à la hiérarchie de l'exemple : code `'ACCES_REFUSE'`, statut 403, et une
   propriété `permission` qui indique la permission manquante.

   :::indice
   La sous-classe appelle `super` avec un message et les options, puis stocke sa donnée propre.
   :::

   :::solution
   ```js
   class ErreurAcces extends ErreurApplication {
     constructor(permission) {
       super(`Permission requise : ${permission}`, { code: 'ACCES_REFUSE', statut: 403 });
       this.permission = permission;
     }
   }

   const erreur = new ErreurAcces('commandes:supprimer');
   console.log(erreur.name, erreur.statut, erreur.permission); // 'ErreurAcces' 403 'commandes:supprimer'
   console.log(repondre(() => { throw erreur; }).corps.code); // 'ACCES_REFUSE'
   ```
   :::

2. `payer` appelle un prestataire externe qui échoue avec une erreur technique. Relève une
   `ErreurApplication` de code `'PAIEMENT_IMPOSSIBLE'` et de statut 502, en gardant l'erreur d'origine.

   ```js
   async function payer(commande, prestataire) {
     return prestataire.debiter(commande.total);
   }
   ```

   :::indice
   `try` autour de l'appel attendu, puis `throw new ErreurApplication(…, { code, statut, cause })`.
   :::

   :::solution
   ```js
   async function payer(commande, prestataire) {
     try {
       return await prestataire.debiter(commande.total);
     } catch (erreur) {
       throw new ErreurApplication(`Paiement de la commande ${commande.id} impossible`, {
         code: 'PAIEMENT_IMPOSSIBLE',
         statut: 502,
         cause: erreur,
       });
     }
   }

   const prestataire = { debiter: async () => { throw new Error('ECONNRESET'); } };
   await payer({ id: 7, total: 30 }, prestataire).catch((erreur) => {
     console.log(erreur.code, erreur.statut, erreur.cause.message); // 'PAIEMENT_IMPOSSIBLE' 502 'ECONNRESET'
   });
   ```

   L'utilisateur verra un message sur le paiement ; les développeurs retrouveront `ECONNRESET` dans la
   cause.
   :::

3. Écris `versReponse(erreur)` pour une API : les `ErreurValidation` renvoient aussi la liste des champs,
   les autres `ErreurApplication` leur code et leur message, et toute autre erreur une réponse 500
   générique qui ne contient **aucun** détail de l'erreur.

   :::indice
   Teste du plus précis au plus général : `ErreurValidation`, puis `ErreurApplication`, puis le reste.
   :::

   :::solution
   ```js
   function versReponse(erreur) {
     if (erreur instanceof ErreurValidation) {
       return { statut: 400, corps: { code: erreur.code, message: erreur.message, champs: erreur.champs } };
     }
     if (erreur instanceof ErreurApplication) {
       return { statut: erreur.statut, corps: { code: erreur.code, message: erreur.message } };
     }
     return { statut: 500, corps: { code: 'INTERNE', message: 'Une erreur est survenue' } };
   }

   console.log(versReponse(new ErreurValidation(['email'])).corps.champs); // ['email']
   const bug = versReponse(new TypeError("Cannot read properties of undefined (reading 'id')"));
   console.log(bug.statut, JSON.stringify(bug.corps).includes('undefined')); // 500 false
   ```

   L'ordre des tests compte : `ErreurValidation` est aussi une `ErreurApplication`, elle doit donc être
   testée en premier.
   :::

## Questions d'entretien

- Pourquoi créer ses propres classes d'erreurs ?

  :::indice
  Que permet `instanceof` ou un `code`, face à un simple message ?
  :::

  :::reponse
  Pour distinguer de façon fiable les cas prévus — ressource introuvable, validation, droits — des bugs,
  et pour attacher des données exploitables : statut HTTP, champs invalides, permission manquante. Le code
  appelant teste `instanceof` ou un `code` stable plutôt que le texte du message, qui peut changer. Une
  classe de base commune permet en plus de traiter toute la famille d'un seul test à la frontière.
  :::

- Qu'est-ce qu'une frontière d'erreur ?

  :::indice
  Où décide-t-on de la réponse faite à l'utilisateur ?
  :::

  :::reponse
  C'est l'endroit unique où les erreurs sont transformées en réponse : le gestionnaire d'erreurs d'une
  API, un composant d'interface qui remplace une zone en panne par un message. Elle traduit les erreurs
  prévues en réponses adaptées, traite toutes les autres comme des bugs avec une réponse générique, et
  journalise les détails. Les couches situées en dessous n'ont plus à décider quoi afficher : elles lèvent
  ou relèvent avec un contexte.
  :::

- Que faire dans un gestionnaire `uncaughtException` de Node.js ?

  :::indice
  L'état du processus est-il encore fiable après une exception que personne n'a prévue ?
  :::

  :::reponse
  Journaliser l'erreur avec le plus de contexte possible, puis laisser le processus s'arrêter, pour qu'un
  superviseur — un orchestrateur de conteneurs, un gestionnaire de processus — le redémarre. Une exception
  non rattrapée peut avoir laissé des ressources ou des données dans un état incohérent : continuer à
  servir des requêtes est plus dangereux que redémarrer. Ce gestionnaire est un filet de dernier recours,
  pas un mécanisme de récupération.
  :::
