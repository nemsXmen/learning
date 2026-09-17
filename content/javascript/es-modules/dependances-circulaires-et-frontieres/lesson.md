---
id: javascript-modules-cycles
title: "Dépendances circulaires et frontières de modules"
slug: dependances-circulaires-et-frontieres
technology: javascript
level: advanced
module: es-modules
order: 3
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-reexport
  - javascript-hoisting
skills:
  - module-boundaries
tags:
  - javascript
  - modules
---

## Objectifs

- Expliquer pourquoi une dépendance circulaire peut lever `Cannot access … before initialization`.
- Casser un cycle en déplaçant le code partagé ou en inversant une dépendance.
- Définir la frontière publique d'un module et protéger ses détails internes.

## Introduction

Deux modules qui s'importent mutuellement fonctionnent parfois très bien, et parfois lèvent une erreur
incompréhensible au démarrage — ou pire, seulement après une réorganisation anodine des imports. Ces
**dépendances circulaires** sont un symptôme : deux modules qui ont besoin l'un de l'autre ne sont pas
vraiment séparés. Ce chapitre explique le mécanisme, puis la conception qui évite le problème.

## Concept

| Situation | Résultat |
| --- | --- |
| A importe B, B importe A, et B utilise une `const` de A **pendant son évaluation** | `ReferenceError` : zone morte |
| Même cycle, mais B n'utilise A **que dans des fonctions appelées plus tard** | fonctionne |
| Même cycle, B utilise une **déclaration de fonction** de A pendant son évaluation | fonctionne : elle est hoistée |

Trois façons de casser un cycle :

1. **extraire** ce que les deux modules partagent dans un troisième module ;
2. **inverser** la dépendance : passer la fonction en paramètre plutôt que l'importer ;
3. **fusionner** les deux modules s'ils forment en réalité une seule responsabilité.

La **frontière** d'un module est l'ensemble de ce qu'il exporte. Tout le reste est interne et peut changer
sans prévenir personne.

## Exemple

```js
// commande.js
import { calculerRemise } from './client.js';
export const TVA = 0.2;
export function total(commande) {
  return commande.montant * (1 + TVA) - calculerRemise(commande.client);
}

// client.js
import { TVA } from './commande.js';
export function calculerRemise(client) {
  return client.fidele ? 5 : 0;
}
console.log(TVA); // ReferenceError si commande.js est chargé en premier :
// client.js est évalué avant la fin de commande.js, et TVA est encore en zone morte.

// Correction : extraire la constante partagée.
// taxes.js
export const TVA = 0.2;

// commande.js
import { TVA } from './taxes.js';
import { calculerRemise } from './client.js';

// client.js ne dépend plus de commande.js.
import { TVA } from './taxes.js';
```

## Comment ça fonctionne

Le moteur évalue les modules en profondeur, en suivant les imports. Quand `commande.js` est le point
d'entrée, il rencontre `import … from './client.js'` et évalue **d'abord** `client.js`. Celui-ci importe
`commande.js`, déjà en cours de chargement : le moteur ne recommence pas, et relie simplement les liaisons.
Mais `commande.js` n'a pas encore exécuté `export const TVA = 0.2` : la liaison existe, en **zone morte**.
Lire `TVA` pendant l'évaluation de `client.js` lève donc
`ReferenceError: Cannot access 'TVA' before initialization`.

Les deux cas qui fonctionnent découlent du même mécanisme. Si `client.js` n'utilise `TVA` que **dans une
fonction** appelée plus tard, la lecture a lieu une fois les deux modules évalués. Et une **déclaration de
fonction** exportée est hoistée avec son corps : elle est utilisable même avant l'exécution du module qui
la déclare. C'est ce qui rend les cycles si trompeurs : un code fonctionne, puis une constante ajoutée ou
un ordre d'import modifié le casse, sans rapport apparent avec la modification.

Plutôt que de jouer avec l'ordre, on supprime le cycle. **Extraire** la partie commune — ici la constante —
dans un module dont les deux dépendent est la solution la plus fréquente. **Inverser** la dépendance
consiste à passer une fonction en paramètre, ou à émettre un événement, pour qu'un module n'ait plus besoin
d'importer l'autre. Si deux modules s'appellent sans cesse, ils forment peut-être une seule responsabilité,
et les **fusionner** est plus honnête. Des outils comme `madge` ou la règle `import/no-cycle` d'ESLint
détectent les cycles automatiquement.

Une **frontière** bien définie limite ces problèmes à la source. Un dossier comme `paiement/` expose une
petite interface publique dans son `index.js` — les fonctions et les erreurs que le reste de l'application
peut utiliser — et garde ses fichiers internes privés. Les autres modules n'importent jamais un fichier
interne directement. Dans un paquet, le champ `"exports"` du `package.json` rend cette règle obligatoire :
les chemins non listés ne peuvent tout simplement pas être importés.

## Erreurs fréquentes

**Corriger un cycle en réordonnant les imports.** Le problème revient à la prochaine modification.

**Lire une constante d'un module du cycle au niveau supérieur.** Elle peut être en zone morte.

**Importer les fichiers internes d'un autre dossier.** Passe par sa frontière publique.

**Faire dépendre les modules de bas niveau des modules de haut niveau.** Les dépendances doivent aller
dans un seul sens.

**Ignorer un cycle parce que « ça marche ».** Détecte-les automatiquement dans l'intégration continue.

## À retenir

- Dans un cycle, un module peut être évalué avant la fin de celui qu'il importe.
- Lire une `const` pas encore initialisée lève `Cannot access … before initialization`.
- On casse un cycle en extrayant, en inversant la dépendance ou en fusionnant.
- La frontière d'un module, c'est ce qu'il exporte ; le reste est interne.
- Les outils et le champ `"exports"` font respecter les frontières automatiquement.

## Exercices

1. Au démarrage, on obtient `ReferenceError: Cannot access 'ROLES' before initialization`. Explique la cause et
   corrige sans changer l'ordre des imports.

   ```js
   // utilisateur.js
   import { peut } from './droits.js';
   export const ROLES = ['lecteur', 'editeur', 'admin'];
   export function creerUtilisateur(nom, role) { return { nom, role, peutEditer: peut(role, 'editer') }; }

   // droits.js
   import { ROLES } from './utilisateur.js';
   const niveau = Object.fromEntries(ROLES.map((role, i) => [role, i]));
   export function peut(role, action) { return action === 'editer' ? niveau[role] >= 1 : true; }
   ```

   :::indice
   `droits.js` lit `ROLES` au niveau supérieur, pendant son évaluation. Qui a vraiment besoin de `ROLES` ?
   :::

   :::solution
   `utilisateur.js` importe `droits.js`, qui est évalué en premier et lit `ROLES` pour construire `niveau`. À
   ce moment, `utilisateur.js` n'a pas encore exécuté sa déclaration : `ROLES` est en zone morte. On extrait la
   donnée partagée.

   ```js
   // roles.js
   export const ROLES = ['lecteur', 'editeur', 'admin'];

   // droits.js
   import { ROLES } from './roles.js';
   const niveau = Object.fromEntries(ROLES.map((role, i) => [role, i]));
   export function peut(role, action) { return action === 'editer' ? niveau[role] >= 1 : true; }

   // utilisateur.js
   import { peut } from './droits.js';
   export { ROLES } from './roles.js';
   export function creerUtilisateur(nom, role) { return { nom, role, peutEditer: peut(role, 'editer') }; }
   ```

   `droits.js` ne dépend plus de `utilisateur.js` : le cycle a disparu, et `utilisateur.js` peut continuer à
   exposer `ROLES` pour ses importateurs.
   :::

2. `journal.js` importe `alerter` depuis `alertes.js`, qui importe `journaliser` depuis `journal.js`. Casse le
   cycle en **inversant** la dépendance, sans créer de troisième module.

   ```js
   // journal.js
   import { alerter } from './alertes.js';
   export function journaliser(message) {
     if (message.startsWith('CRITIQUE')) alerter(message);
     return `[journal] ${message}`;
   }

   // alertes.js
   import { journaliser } from './journal.js';
   export function alerter(message) {
     journaliser(`alerte envoyée pour : ${message}`);
   }
   ```

   :::indice
   `journal.js` n'a pas besoin de connaître `alertes.js` : il peut recevoir la fonction d'alerte.
   :::

   :::solution
   ```js
   // journal.js : ne dépend plus de personne
   export function creerJournal({ surCritique = () => {} } = {}) {
     const lignes = [];
     function journaliser(message) {
       if (message.startsWith('CRITIQUE')) surCritique(message);
       lignes.push(`[journal] ${message}`);
     }
     return { journaliser, lignes };
   }

   // alertes.js : dépend de journal.js, jamais l'inverse
   import { creerJournal } from './journal.js';
   const journal = creerJournal({
     surCritique: (message) => journal.journaliser(`alerte envoyée pour : ${message}`),
   });

   journal.journaliser('CRITIQUE disque plein');
   console.log(journal.lignes);
   // ['[journal] alerte envoyée pour : CRITIQUE disque plein', '[journal] CRITIQUE disque plein']
   ```

   Les dépendances vont maintenant dans un seul sens : le journal ignore l'existence des alertes.
   :::

3. Le dossier `paiement/` contient `stripe.js`, `montants.js` et `erreurs.js`. Le reste de l'application ne doit
   utiliser que `payer` et `ErreurPaiement`. Écris la frontière publique, et indique comment la faire respecter.

   :::indice
   Un `index.js` qui ne réexporte que l'interface publique, et une règle qui interdit d'importer les autres
   fichiers.
   :::

   :::solution
   ```js
   // paiement/index.js : la seule porte d'entrée
   export { payer } from './stripe.js';
   export { ErreurPaiement } from './erreurs.js';
   // montants.js reste interne : il n'est pas réexporté.

   // commande.js
   import { payer, ErreurPaiement } from './paiement/index.js';
   ```

   Pour la faire respecter : dans un paquet, le champ `"exports"` du `package.json` n'autorise que les chemins
   listés, comme `{ "exports": { ".": "./index.js" } }`. Dans une application, une règle de lint comme
   `no-restricted-imports` interdit les chemins `paiement/*` autres que `index.js`. Le dossier peut alors
   renommer ou découper ses fichiers internes sans casser personne.
   :::

## Questions d'entretien

- Pourquoi une dépendance circulaire peut-elle lever `Cannot access … before initialization` ?

  :::indice
  Dans quel ordre les modules du cycle sont-ils évalués ?
  :::

  :::reponse
  Parce que le moteur évalue les modules en profondeur : si A importe B et que B importe A, B est évalué avant la
  fin de l'évaluation de A. Les liaisons de A existent déjà, mais ses `const` et `let` ne sont pas encore
  initialisées. Si B les lit pendant sa propre évaluation, il tombe dans leur zone morte. Les lectures faites
  plus tard, dans des fonctions, fonctionnent, ce qui rend le problème intermittent et sensible à l'ordre des
  imports.
  :::

- Comment casser une dépendance circulaire ?

  :::indice
  Trois approches, selon la nature de ce qui est partagé.
  :::

  :::reponse
  En extrayant ce que les deux modules partagent dans un troisième module dont ils dépendent tous deux ; en
  inversant une dépendance, par exemple en passant une fonction en paramètre ou en émettant un événement plutôt
  qu'en important directement ; ou en fusionnant les deux modules s'ils forment en réalité une seule
  responsabilité. Réordonner les imports ne fait que masquer le problème jusqu'à la prochaine modification.
  :::

- Qu'est-ce qu'une frontière de module, et pourquoi la protéger ?

  :::indice
  Qu'est-ce qui peut changer librement, et qu'est-ce qui engage les autres modules ?
  :::

  :::reponse
  C'est l'ensemble de ce qu'un module ou un dossier expose aux autres, en général par un `index.js` qui ne
  réexporte que l'interface publique. Tout le reste est interne et peut être renommé, découpé ou réécrit sans
  impact. Si d'autres parties importent directement des fichiers internes, chaque réorganisation casse du code
  ailleurs. On la protège avec le champ `"exports"` d'un paquet ou des règles de lint qui interdisent ces
  imports.
  :::
