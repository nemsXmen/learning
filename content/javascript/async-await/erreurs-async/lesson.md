---
id: javascript-async-erreurs
title: "Gérer les erreurs avec try, catch et finally"
slug: erreurs-async
technology: javascript
level: intermediate
module: async-await
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-async-await
  - javascript-promesses-erreurs
skills:
  - async-errors
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Rattraper une promesse rompue avec `try` / `catch` autour d'un `await`.
- Éviter les deux pièges classiques : l'`await` oublié et le `return` sans `await` dans un `try`.
- Décider à quel niveau une erreur asynchrone doit être traitée.

## Introduction

Avec `await`, une promesse rompue **lève une exception** à l'endroit de l'attente. On retrouve donc
l'outil le plus familier pour gérer les erreurs : `try`, `catch`, `finally`. Mais la ressemblance
avec le code synchrone a ses limites. Une promesse qu'on n'attend pas échappe au `try` qui
l'entoure, et ces erreurs silencieuses sont parmi les plus difficiles à diagnostiquer.

## Concept

| Écriture | Ce qui est rattrapé |
| --- | --- |
| `try { await p; } catch (e) {}` | la rupture de `p` |
| `try { p; } catch (e) {}` sans `await` | rien : la rupture arrive après la fin du `try` |
| `try { return await p; } catch (e) {}` | la rupture de `p` |
| `try { return p; } catch (e) {}` | rien : la promesse sort de la fonction avant d'être réglée |
| `finally { … }` | s'exécute après le succès ou l'échec de l'`await` |

Une fonction `async` qui ne rattrape pas une erreur la **transmet** : la promesse qu'elle renvoie
est rompue, et c'est à son appelant de la gérer.

## Exemple

```js
const charger = (nom, echoue) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (echoue ? reject(new Error(`${nom} indisponible`)) : resolve(`${nom} chargé`)), 10),
  );

async function afficherProfil(echoue) {
  const etat = { chargement: true };
  try {
    const profil = await charger('profil', echoue);
    return profil;
  } catch (erreur) {
    return `affichage de secours (${erreur.message})`;
  } finally {
    etat.chargement = false; // exécuté dans les deux cas
    console.log('chargement terminé :', !etat.chargement);
  }
}

console.log(await afficherProfil(false)); // 'profil chargé'
console.log(await afficherProfil(true)); // 'affichage de secours (profil indisponible)'

async function sansAwait() {
  try {
    return charger('stock', true); // la promesse sort du try avant d'être rompue
  } catch {
    return 'rattrapé';
  }
}

async function avecAwait() {
  try {
    return await charger('stock', true); // la rupture est levée ici, dans le try
  } catch {
    return 'rattrapé';
  }
}

console.log(await avecAwait()); // 'rattrapé'
console.log(await sansAwait().catch((erreur) => `échappé : ${erreur.message}`)); // 'échappé : stock indisponible'
```

## Comment ça fonctionne

`await p` sur une promesse rompue **lève** la raison du rejet à cet endroit précis, comme un `throw`.
Le `try` englobant la rattrape, et le `finally` s'exécute ensuite, que l'attente ait réussi ou non.
Un seul bloc peut ainsi couvrir plusieurs `await` successifs.

Un `try` ne protège que ce qui échoue **pendant** son exécution. Sans `await`, une promesse rompue
ne lève rien dans le bloc : elle se règle plus tard, après la sortie du `try`. C'est le cas de
`return charger(...)` dans `sansAwait` : la fonction renvoie la promesse immédiatement, le `try` se
termine, et la rupture remonte à l'appelant sans passer par le `catch`. Écrire `return await` dans un
`try` corrige ce comportement. Hors d'un `try`, `return p` et `return await p` sont équivalents.

L'**`await` oublié** produit une promesse **flottante** : personne ne l'attend et personne ne gère son
échec. Le code suivant s'exécute trop tôt, et si la promesse est rompue, elle devient un rejet non
géré — qui arrête un processus Node.js. Les outils de lint signalent ce cas, avec des règles comme
`no-floating-promises` de TypeScript ESLint.

La question la plus importante reste **où** gérer une erreur. Un `catch` n'a sa place que là où l'on
peut faire quelque chose d'utile : afficher une solution de repli, réessayer, relever l'erreur avec
un contexte. Rattraper une erreur pour l'afficher dans la console puis continuer comme si de rien
n'était produit un état incohérent. Dans les autres cas, on laisse l'erreur remonter jusqu'à la
couche qui sait la traiter — le gestionnaire de requêtes d'un serveur, le composant qui affiche un
message à l'utilisateur.

Enfin, les méthodes de tableau comme `forEach` n'attendent pas un callback `async` : les promesses
qu'il renvoie sont ignorées, et leurs erreurs ne remontent nulle part. Le chapitre suivant montre les
bonnes écritures.

## Erreurs fréquentes

**Oublier `await` dans un `try`.** L'erreur n'est pas rattrapée et devient un rejet non géré.

**Écrire `return promesse` dans un `try`.** Utilise `return await promesse` pour que le `catch` la voie.

**Rattraper une erreur sans rien en faire.** Soit tu la traites, soit tu la laisses remonter.

**Passer un callback `async` à `forEach`.** Rien n'est attendu, et les erreurs sont perdues.

**Envelopper chaque `await` dans son propre `try`.** Un bloc par opération logique suffit.

## À retenir

- `await` sur une promesse rompue lève l'erreur, rattrapable par `try` / `catch`.
- Un `try` ne voit que ce qui échoue pendant son exécution : il faut `await`.
- Dans un `try`, `return await p`, et non `return p`.
- Une promesse flottante, jamais attendue, perd son erreur.
- On gère une erreur là où l'on peut agir ; sinon on la laisse remonter.

## Exercices

1. Écris une fonction `async` `chargerParametres(obtenirTexte)` qui attend le texte renvoyé par
   `obtenirTexte()`, l'analyse en JSON, et renvoie `{ theme: 'clair' }` par défaut si le JSON est
   invalide ou si `obtenirTexte` échoue.

   :::indice
   Un seul `try` peut couvrir l'attente et l'analyse : `JSON.parse` lève une `SyntaxError`, une
   promesse rompue lève sa raison.
   :::

   :::solution
   ```js
   const PAR_DEFAUT = { theme: 'clair' };

   async function chargerParametres(obtenirTexte) {
     try {
       const texte = await obtenirTexte();
       return JSON.parse(texte);
     } catch {
       return PAR_DEFAUT;
     }
   }

   console.log(await chargerParametres(async () => '{"theme":"sombre"}')); // { theme: 'sombre' }
   console.log(await chargerParametres(async () => '{invalide')); // { theme: 'clair' }
   console.log(await chargerParametres(async () => { throw new Error('réseau'); })); // { theme: 'clair' }
   ```
   :::

2. Ce code affiche `Commande enregistrée` même quand l'enregistrement échoue, puis le processus
   s'arrête sur un rejet non géré. Trouve le défaut et corrige.

   ```js
   async function valider(commande) {
     try {
       enregistrer(commande);
       console.log('Commande enregistrée');
     } catch (erreur) {
       console.log('Échec :', erreur.message);
     }
   }
   ```

   :::indice
   `enregistrer` renvoie une promesse. Le `try` peut-il voir une rupture qui arrive après sa fin ?
   :::

   :::solution
   Il manque `await` : `enregistrer` renvoie une promesse flottante, le message de succès s'affiche
   immédiatement, et la rupture arrive après la sortie du `try`, sans gestionnaire.

   ```js
   const enregistrer = async (commande) => {
     if (!commande.articles.length) throw new Error('commande vide');
   };

   async function valider(commande) {
     try {
       await enregistrer(commande);
       console.log('Commande enregistrée');
     } catch (erreur) {
       console.log('Échec :', erreur.message);
     }
   }

   await valider({ articles: [] }); // 'Échec : commande vide'
   await valider({ articles: ['clavier'] }); // 'Commande enregistrée'
   ```
   :::

3. `chargerTout` doit relever une erreur explicite qui garde la cause d'origine, et toujours fermer la
   connexion, en cas de succès comme d'échec.

   ```js
   async function chargerTout(connexion) {
     const donnees = await connexion.lire();
     connexion.fermer();
     return donnees;
   }
   ```

   :::indice
   `finally` pour la fermeture, et `throw new Error(message, { cause })` dans le `catch`.
   :::

   :::solution
   ```js
   async function chargerTout(connexion) {
     try {
       return await connexion.lire();
     } catch (erreur) {
       throw new Error('Chargement des données impossible', { cause: erreur });
     } finally {
       connexion.fermer();
     }
   }

   const journal = [];
   const connexion = (echoue) => ({
     lire: async () => { if (echoue) throw new Error('délai dépassé'); return ['a']; },
     fermer: () => journal.push('fermée'),
   });

   console.log(await chargerTout(connexion(false))); // ['a']
   await chargerTout(connexion(true)).catch((e) => console.log(e.message, '|', e.cause.message));
   // 'Chargement des données impossible | délai dépassé'
   console.log(journal); // ['fermée', 'fermée']
   ```

   Sans `return await`, le `catch` ne verrait pas l'échec de `lire`, et la fermeture aurait lieu avant
   la fin de la lecture.
   :::

## Questions d'entretien

- Pourquoi `return promesse` dans un `try` est-il différent de `return await promesse` ?

  :::indice
  À quel moment la promesse se règle-t-elle, par rapport à la sortie du `try` ?
  :::

  :::reponse
  Avec `return promesse`, la fonction renvoie la promesse encore en attente et quitte le `try`
  immédiatement ; si la promesse est rompue ensuite, le `catch` et le `finally` de la fonction ne le
  voient pas, et la rupture remonte à l'appelant. Avec `return await promesse`, la fonction attend le
  règlement à l'intérieur du `try` : une rupture y est levée et rattrapée, et le `finally` s'exécute
  après la fin réelle de l'opération.
  :::

- Qu'est-ce qu'une promesse flottante, et pourquoi est-ce dangereux ?

  :::indice
  Qui attend cette promesse, et qui gère son échec ?
  :::

  :::reponse
  C'est une promesse créée sans être attendue ni renvoyée, souvent à cause d'un `await` oublié. Le
  code suivant s'exécute avant la fin de l'opération, et si elle échoue, personne ne gère l'erreur :
  elle devient un rejet non géré, qui arrête un processus Node.js. Les linters la détectent avec des
  règles comme `no-floating-promises`. Quand on lance volontairement une tâche sans l'attendre, on y
  attache au moins un `catch`.
  :::

- À quel niveau faut-il gérer une erreur asynchrone ?

  :::indice
  Qui peut réellement faire quelque chose d'utile avec l'erreur ?
  :::

  :::reponse
  Au niveau qui peut agir : proposer une solution de repli, réessayer, informer l'utilisateur, ou
  répondre avec le bon code HTTP. Les couches intermédiaires laissent l'erreur remonter, en la
  relevant éventuellement avec un contexte et sa cause. Rattraper une erreur pour la journaliser puis
  continuer comme si tout allait bien laisse le programme dans un état incohérent, et masque la vraie
  cause au moment du diagnostic.
  :::
