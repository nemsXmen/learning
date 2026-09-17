---
id: javascript-motifs-fonctionnels
title: "Motifs fonctionnels professionnels"
slug: motifs-fonctionnels
technology: javascript
level: advanced
module: programmation-fonctionnelle
order: 2
estimatedMinutes: 35
difficulty: 4
xp: 100
prerequisites:
  - javascript-transparence-referentielle
  - javascript-currying
  - javascript-async-await
skills:
  - functional-patterns
tags:
  - javascript
  - fonctionnel
---

## Objectifs

- Représenter un échec prévisible par une valeur de résultat plutôt que par une exception.
- Construire un pipeline synchrone ou asynchrone, et l'observer avec `tap` sans le modifier.
- Injecter les dépendances d'une fonction en paramètre pour la rendre testable.
- Enrichir une fonction avec un décorateur (`once`, journalisation), et reconnaître la sur-abstraction.

## Introduction

Le chapitre sur le currying et la composition a posé les outils : fonctions qui renvoient des fonctions, application
partielle, `pipe`. Dans un vrai projet, ces outils servent à résoudre des problèmes précis : enchaîner des étapes qui
peuvent échouer, isoler les effets pour tester le reste, ajouter un comportement transversal sans toucher au code
métier. Ce chapitre présente les motifs qu'on retrouve dans les bases de code professionnelles, et les limites
au-delà desquelles ils rendent le code plus obscur au lieu de le clarifier.

## Concept

| Motif | Forme | Usage |
| --- | --- | --- |
| Résultat explicite | `{ ok: true, valeur }` ou `{ ok: false, erreur }` | échecs attendus : validation, règle métier |
| Chaînage de résultats | `chainer(f)` n'appelle `f` que sur un succès | enchaîner des étapes faillibles |
| Pipeline asynchrone | `pipeAsync(f, g)` enchaîne des promesses | étapes qui lisent ou écrivent |
| `tap` | exécute un effet et renvoie la valeur intacte | journaliser au milieu d'un pipeline |
| Injection par paramètre | `creerService({ horloge, depot })` | remplacer les effets dans les tests |
| Décorateur de fonction | `once(f)`, `avecJournal(f)` | comportement transversal réutilisable |

## Exemple

```js
const ok = (valeur) => ({ ok: true, valeur });
const echec = (erreur) => ({ ok: false, erreur });
const chainer = (etape) => (resultat) => (resultat.ok ? etape(resultat.valeur) : resultat);
const pipe = (...etapes) => (entree) => etapes.reduce((valeur, etape) => etape(valeur), entree);
const pipeAsync = (...etapes) => (entree) =>
  etapes.reduce((promesse, etape) => promesse.then(etape), Promise.resolve(entree));
const tap = (effet) => (valeur) => {
  effet(valeur);
  return valeur;
};

const verifierArticles = (commande) =>
  commande.articles.length > 0 ? ok(commande) : echec('Le panier est vide');
const verifierTotal = (commande) =>
  commande.total <= 1000 ? ok(commande) : echec('Le total dépasse le plafond');

const valider = pipe(ok, chainer(verifierArticles), chainer(verifierTotal));

console.log(valider({ articles: [], total: 0 })); // { ok: false, erreur: 'Le panier est vide' }
console.log(valider({ articles: ['stylo'], total: 5000 }).erreur); // 'Le total dépasse le plafond'

// Les effets arrivent en paramètre : en test, on passe des versions factices.
function creerServiceCommande({ depot, horloge, journal }) {
  return async (commande) => {
    const resultat = valider(commande);
    if (!resultat.ok) return resultat;
    const enregistrer = pipeAsync(
      (valide) => ({ ...valide, creeeLe: horloge() }),
      tap((datee) => journal(`commande du ${datee.creeeLe}`)),
      depot.enregistrer,
    );
    return ok(await enregistrer(resultat.valeur));
  };
}

const lignes = [];
const passerCommande = creerServiceCommande({
  depot: { enregistrer: async (commande) => ({ id: 42, ...commande }) },
  horloge: () => '2026-09-17',
  journal: (message) => lignes.push(message),
});

console.log(await passerCommande({ articles: ['stylo'], total: 12 }));
// { ok: true, valeur: { id: 42, articles: [ 'stylo' ], total: 12, creeeLe: '2026-09-17' } }
console.log(lignes); // [ 'commande du 2026-09-17' ]
```

## Comment ça fonctionne

Une exception interrompt le flux et remonte jusqu'au premier `catch`, où qu'il soit. C'est adapté aux situations
**imprévues** : réseau coupé, bug, donnée corrompue. Pour un échec **attendu** — un panier vide, un plafond dépassé —
le **résultat explicite** est souvent plus clair : la fonction renvoie une valeur qui dit si elle a réussi, et
l'appelant est obligé de regarder `ok` avant d'utiliser `valeur`. La signature de la fonction décrit alors tous ses
cas de sortie, et le test n'a pas besoin de `try`.

`chainer` évite de répéter `if (!resultat.ok) return resultat` à chaque étape : il transforme une étape qui attend une
valeur en une étape qui accepte un résultat, et qui laisse passer un échec sans rien faire. Dans `valider`, la
première vérification ratée court-circuite les suivantes, et son message traverse le pipeline jusqu'à la sortie.

`pipeAsync` applique la même idée aux promesses : chaque étape reçoit la valeur résolue par la précédente, qu'elle
renvoie une valeur ou une promesse, puisque `then` aplatit les deux. Une étape qui rejette arrête la chaîne, et le
rejet remonte jusqu'à l'`await` du service. `tap` sert à observer une valeur au milieu d'un pipeline — journaliser,
mesurer, déboguer — sans avoir à casser la chaîne en variables intermédiaires.

L'**injection par paramètre** est la version fonctionnelle de l'injection de dépendances. `creerServiceCommande`
n'importe ni base de données, ni horloge système, ni journal : elle les reçoit. En production, on lui passe les vraies
implémentations ; en test, des fonctions factices dont on contrôle la sortie. La logique métier reste pure, les effets
sont repoussés à la frontière, et aucune bibliothèque de simulation n'est nécessaire.

Un **décorateur de fonction** prend une fonction et en renvoie une version enrichie avec la même signature :
exécuter une seule fois, journaliser les appels, mesurer la durée, réessayer. Le comportement transversal est écrit
une fois et appliqué partout, sans toucher au code décoré.

Ces motifs ont un coût : chaque couche d'indirection doit être comprise par le lecteur. Un pipeline de trois étapes
nommées est plus lisible qu'une suite d'appels imbriqués ; un pipeline de quinze fonctions anonymes écrites sans
jamais nommer leurs arguments (le style « point-free ») ne l'est plus. On adopte un motif quand il supprime une
répétition réelle ou rend un effet testable, pas pour la beauté du geste.

## Erreurs fréquentes

**Utiliser des résultats explicites pour les erreurs imprévues.** Un bug ou une panne réseau restent des exceptions.

**Oublier de tester `ok` avant de lire `valeur`.** Le résultat ne protège que si l'appelant le vérifie.

**Passer une méthode qui utilise `this` comme étape.** `depot.enregistrer` détaché perd son `this` : passe
`(commande) => depot.enregistrer(commande)` ou une méthode liée.

**Importer les effets directement dans la logique métier.** Tu devras simuler des modules entiers pour tester.

**Empiler les abstractions.** Nomme les étapes, et reviens à du code direct quand le motif n'apporte plus rien.

## À retenir

- Échec attendu : résultat `{ ok, valeur | erreur }` ; situation imprévue : exception.
- `chainer` court-circuite un pipeline dès le premier échec.
- `pipeAsync` enchaîne des étapes synchrones ou asynchrones avec `then`.
- `tap` observe sans modifier.
- Injecter les effets en paramètre rend la logique testable sans bibliothèque de simulation.

## Exercices

1. Écris le décorateur `once(fonction)` : la fonction renvoyée n'exécute `fonction` qu'au premier appel, puis renvoie
   toujours le même résultat, en transmettant les arguments et `this`.

   :::indice
   Une closure garde un drapeau et le résultat. Utilise une fonction classique, pas une flèche, pour recevoir `this`.
   :::

   :::solution
   ```js
   function once(fonction) {
     let appelee = false;
     let resultat;
     return function (...args) {
       if (!appelee) {
         appelee = true;
         resultat = fonction.apply(this, args);
       }
       return resultat;
     };
   }

   let connexions = 0;
   const client = {
     url: 'postgres://local',
     connecter: once(function (delai) {
       connexions += 1;
       return `${this.url} (${delai} ms)`;
     }),
   };

   console.log(client.connecter(100)); // 'postgres://local (100 ms)'
   console.log(client.connecter(500)); // 'postgres://local (100 ms)'
   console.log(connexions); // 1
   ```
   :::

2. `chainer` s'arrête au premier échec. Pour un formulaire, on veut au contraire **toutes** les erreurs. Écris
   `validerTout(valeur, validations)` qui renvoie `ok(valeur)` ou `echec(listeDesMessages)`.

   :::indice
   Applique chaque validation, garde les résultats en échec avec `filter`, puis extrais leurs messages.
   :::

   :::solution
   ```js
   const ok = (valeur) => ({ ok: true, valeur });
   const echec = (erreur) => ({ ok: false, erreur });

   function validerTout(valeur, validations) {
     const erreurs = validations
       .map((valider) => valider(valeur))
       .filter((resultat) => !resultat.ok)
       .map((resultat) => resultat.erreur);
     return erreurs.length === 0 ? ok(valeur) : echec(erreurs);
   }

   const regles = [
     (u) => (u.email.includes('@') ? ok(u) : echec('Email invalide')),
     (u) => (u.motDePasse.length >= 12 ? ok(u) : echec('Mot de passe trop court')),
     (u) => (u.nom.trim() !== '' ? ok(u) : echec('Nom obligatoire')),
   ];

   console.log(validerTout({ email: 'ada', motDePasse: 'court', nom: 'Ada' }, regles));
   // { ok: false, erreur: [ 'Email invalide', 'Mot de passe trop court' ] }
   console.log(validerTout({ email: 'ada@exemple.fr', motDePasse: 'une phrase longue', nom: 'Ada' }, regles).ok); // true
   ```
   :::

3. Écris `creerRelance({ envoyer, horloge })` qui renvoie une fonction asynchrone `relancer(factures)` : elle envoie un
   message pour chaque facture impayée dont l'échéance est passée, et renvoie le nombre de relances. Teste-la avec
   `node:assert` et des dépendances factices.

   :::indice
   Compare les dates au format `AAAA-MM-JJ` comme des chaînes : l'ordre alphabétique est l'ordre chronologique.
   :::

   :::solution
   ```js
   import assert from 'node:assert/strict';

   function creerRelance({ envoyer, horloge }) {
     return async (factures) => {
       const aujourdhui = horloge();
       const enRetard = factures.filter((facture) => !facture.payee && facture.echeance < aujourdhui);
       for (const facture of enRetard) {
         await envoyer(facture.client, `Facture ${facture.id} en retard`);
       }
       return enRetard.length;
     };
   }

   const envoyes = [];
   const relancer = creerRelance({
     envoyer: async (client, message) => envoyes.push([client, message]),
     horloge: () => '2026-09-17',
   });

   const nombre = await relancer([
     { id: 1, client: 'ada', echeance: '2026-09-01', payee: false },
     { id: 2, client: 'alan', echeance: '2026-09-01', payee: true },
     { id: 3, client: 'grace', echeance: '2026-10-01', payee: false },
   ]);

   assert.equal(nombre, 1);
   assert.deepEqual(envoyes, [['ada', 'Facture 1 en retard']]);
   console.log('tests réussis');
   ```
   :::

## Questions d'entretien

- Quand renvoyer un objet résultat plutôt que lever une exception ?

  :::indice
  Distingue les échecs qui font partie du fonctionnement normal et ceux qui ne devraient pas arriver.
  :::

  :::reponse
  Un résultat explicite convient aux échecs attendus, qui font partie du métier : validation, stock insuffisant, règle
  non respectée. L'appelant voit tous les cas dans la valeur de retour et doit les traiter. Les exceptions restent
  adaptées aux situations imprévues — bug, panne réseau, invariant violé — qui doivent remonter jusqu'à un gestionnaire
  général. Mélanger les deux sans règle rend le code difficile à suivre : on choisit une convention par couche.
  :::

- Comment rendre testable une fonction qui dépend de la date du jour et d'une base de données ?

  :::indice
  D'où viennent ces dépendances aujourd'hui, et d'où pourraient-elles venir ?
  :::

  :::reponse
  On les passe en paramètre au lieu de les importer ou de les appeler directement : une fabrique reçoit `horloge` et
  `depot`, et renvoie la fonction métier. En production, on lui fournit `() => new Date()` et le vrai dépôt ; en test,
  une horloge fixe et un dépôt en mémoire. Le test devient déterministe, rapide, et n'a besoin d'aucune bibliothèque de
  simulation de modules.
  :::

- Qu'est-ce qui rend un code fonctionnel difficile à maintenir ?

  :::indice
  Pense à l'indirection et aux noms.
  :::

  :::reponse
  L'excès d'abstraction : de longs pipelines de fonctions anonymes, un style point-free où plus aucun argument n'est
  nommé, des utilitaires génériques maison que l'équipe ne connaît pas, et des piles d'appels de débogage remplies de
  fonctions intermédiaires. Un bon code fonctionnel nomme ses étapes, reste proche du langage et des méthodes standard,
  et n'introduit un motif que lorsqu'il supprime une répétition réelle ou isole un effet.
  :::
