---
id: javascript-process-et-environnement
title: "Le processus : arguments, variables d'environnement, signaux et codes de sortie"
slug: process-et-environnement
technology: javascript
level: intermediate
module: api-nodejs
order: 2
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-runtime-node
  - javascript-async-erreurs
skills:
  - js-node-process-env
tags:
  - javascript
  - nodejs
  - configuration
---

## Objectifs

- Lire les arguments d'une commande avec `process.argv` et `util.parseArgs`.
- Configurer une application par variables d'environnement, les valider au démarrage, et garder les secrets hors du
  dépôt.
- Communiquer avec le terminal : sortie standard, sortie d'erreur, codes de sortie.
- Arrêter proprement un serveur sur `SIGINT` et `SIGTERM`, et savoir quoi faire d'une erreur non gérée.

## Introduction

Un programme Node ne vit pas seul : quelqu'un le lance, avec des arguments, dans un environnement, et attend un
résultat. Un outil en ligne de commande lit ses options, écrit sur la sortie standard et signale son succès ou son
échec par un code de sortie. Un serveur lit sa configuration dans des variables d'environnement, et doit s'arrêter
proprement quand la plateforme qui l'héberge le lui demande.

Tout cela passe par l'objet global `process`, qui représente le processus en cours.

## Concept

| Besoin | Outil |
| --- | --- |
| arguments de la commande | `process.argv`, et `parseArgs` de `node:util` |
| variables d'environnement | `process.env`, fichier `.env` avec `node --env-file=.env` |
| écrire un résultat, une erreur | `console.log` ou `process.stdout` ; `console.error` ou `process.stderr` |
| lire l'entrée standard | `process.stdin`, un flux lisible |
| signaler le résultat | `process.exitCode = 1` ; 0 signifie succès |
| dossier courant, identifiant | `process.cwd()`, `process.pid` |
| être prévenu d'un arrêt | `process.on('SIGINT', …)`, `process.on('SIGTERM', …)` |

| Signal | Envoyé par | Réaction attendue |
| --- | --- | --- |
| `SIGINT` | Ctrl+C dans le terminal | s'arrêter proprement |
| `SIGTERM` | Docker, Kubernetes, un gestionnaire de processus, avant un redéploiement | s'arrêter proprement, dans un délai limité |
| `SIGKILL` | le système, après le délai | aucune : le processus est tué, sans pouvoir l'intercepter |

## Exemple

Un serveur lit sa configuration dans l'environnement, la valide avant de démarrer, et s'arrête proprement :

```js
// serveur.mjs
import { createServer } from 'node:http';

function lireConfiguration(env) {
  const erreurs = [];
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) erreurs.push(`PORT invalide : « ${env.PORT} »`);
  if (!env.DATABASE_URL) erreurs.push('DATABASE_URL manquante');
  const debug = env.DEBUG === 'true';
  if (erreurs.length > 0) {
    throw new Error(`Configuration invalide :\n- ${erreurs.join('\n- ')}`);
  }
  return Object.freeze({ port, databaseUrl: env.DATABASE_URL, debug });
}

let configuration;
try {
  configuration = lireConfiguration(process.env);
} catch (erreur) {
  console.error(erreur.message);
  process.exit(1); // rien n'a démarré : on peut sortir immédiatement
}

const serveur = createServer((requete, reponse) => {
  reponse.end('ok');
});
serveur.listen(configuration.port, () => {
  console.log(`Serveur à l'écoute sur le port ${configuration.port}`);
});

function arreter(signal) {
  console.log(`${signal} reçu : arrêt en cours…`);
  serveur.close(() => {
    console.log('Toutes les connexions sont fermées.');
    process.exitCode = 0;
  });
  // Si des connexions traînent, on force l'arrêt au bout de 10 secondes.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once('SIGINT', arreter);
process.once('SIGTERM', arreter);
```

```text
$ node serveur.mjs
Configuration invalide :
- DATABASE_URL manquante

$ echo $?
1

$ node --env-file=.env serveur.mjs
Serveur à l'écoute sur le port 4000
^CSIGINT reçu : arrêt en cours…
Toutes les connexions sont fermées.
```

## Comment ça fonctionne

**Les arguments.** `process.argv` est un tableau : le chemin de Node, celui du script, puis les arguments. Les
analyser à la main devient vite fragile : options courtes et longues, valeurs par défaut, `--sortie=x` et
`--sortie x`. `parseArgs`, intégré à Node, s'en charge :

```js
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  args: ['ventes.csv', '-v', '--sortie=rapport.csv'], // par défaut : process.argv.slice(2)
  options: {
    sortie: { type: 'string', short: 'o', default: 'resultat.csv' },
    verbeux: { type: 'boolean', short: 'v', default: false },
  },
  allowPositionals: true,
});

console.log(values.sortie, values.verbeux, positionals); // rapport.csv true [ 'ventes.csv' ]
```

Une option inconnue lève une erreur `ERR_PARSE_ARGS_UNKNOWN_OPTION` : on l'attrape pour afficher l'aide.

**Les variables d'environnement sont des chaînes.** `process.env.PORT` vaut `'4000'`, pas `4000`, et une variable
absente vaut `undefined`. Le piège classique : `Boolean(process.env.DEBUG)` vaut `true` pour `'false'`, car toute
chaîne non vide est vraie. On convertit explicitement, `env.DEBUG === 'true'`, et on valide **au démarrage**, en une
fois, dans un objet de configuration figé. Une application qui démarre avec une configuration invalide échoue plus
tard, au pire moment, avec une erreur qui ne dit rien de la cause. Dans un vrai projet, un schéma zod fait ce
travail. Le reste du code reçoit l'objet de configuration, et ne lit plus jamais `process.env` directement : il est
plus facile à tester.

**Les fichiers `.env`.** En développement, on met les variables dans un fichier `.env`, chargé par
`node --env-file=.env`, ou `process.loadEnvFile()` dans le code. Une variable déjà définie dans l'environnement n'est
pas remplacée par le fichier : `PORT=5000 node --env-file=.env serveur.mjs` utilise 5000. Un fichier absent fait
échouer le lancement, sauf avec `--env-file-if-exists`. En production, la plateforme fournit les variables ; il n'y
a pas de fichier.

**Les secrets.** Mots de passe, clés d'API, chaînes de connexion : ils vont dans l'environnement, jamais dans le
code. Le fichier `.env` est dans `.gitignore` ; on commite à la place un `.env.example` qui liste les variables
attendues, avec des valeurs factices. On ne journalise jamais la configuration complète : elle contient les secrets.

**Sortie standard, sortie d'erreur, code de sortie.** Un outil en ligne de commande écrit ses **résultats** sur la
sortie standard, et ses **messages d'erreur** et de diagnostic sur la sortie d'erreur : ainsi,
`node outil.mjs > resultat.txt` n'écrit que le résultat dans le fichier. Le code de sortie dit s'il a réussi : 0 pour
un succès, autre chose pour un échec. `process.exitCode = 1` fixe ce code et laisse Node se terminer normalement,
quand plus rien n'est en attente : les écritures en cours se terminent. `process.exit(1)` arrête tout,
immédiatement, et peut couper une sortie en cours d'écriture : on le réserve aux cas où rien d'important n'est en
vol, comme ci-dessus avant le démarrage, ou au délai de sécurité d'un arrêt.

**L'arrêt propre.** Pour redéployer, une plateforme envoie `SIGTERM`, attend un délai, souvent 10 à 30 secondes, puis
envoie `SIGKILL`, qui tue le processus. Pendant ce délai, le serveur doit arrêter d'accepter de nouvelles
connexions, terminer les requêtes en cours, fermer ses connexions à la base de données, puis se terminer.
`serveur.close` fait la première partie et appelle son callback quand toutes les connexions sont fermées. Le minuteur
de sécurité, avec `unref()` pour qu'il n'empêche pas une sortie normale, force l'arrêt si une connexion traîne.
Sous Windows, `SIGINT` fonctionne avec Ctrl+C, mais `SIGTERM` n'est pas envoyé par le système : ce code sert surtout
sur les serveurs Linux et dans les conteneurs.

**Les erreurs non gérées.** Une exception jamais attrapée, ou une promesse rejetée sans `catch`, arrête le processus
avec un code d'erreur : c'est le comportement par défaut depuis Node 15, et c'est le bon. L'état du programme est
peut-être incohérent. On peut écouter `uncaughtException` et `unhandledRejection` pour **journaliser** l'erreur, mais on
laisse ensuite le processus s'arrêter, et le gestionnaire de processus le redémarre. Continuer comme si de rien
n'était cache des bugs et corrompt des données.

## Erreurs fréquentes

**Traiter une variable d'environnement comme un nombre ou un booléen.** Ce sont des chaînes : convertis et valide.

**Lire `process.env` partout dans le code.** Lis-le une fois au démarrage, valide, et passe un objet de configuration.

**Commiter le fichier `.env`.** Les secrets finissent dans l'historique Git, pour toujours ; commite un `.env.example`.

**Écrire les erreurs sur la sortie standard.** Elles se mélangent aux résultats redirigés ; utilise `console.error`.

**Appeler `process.exit()` à la fin d'un script.** Il peut couper des écritures en cours ; fixe `process.exitCode`.

**Ignorer `SIGTERM`.** Les requêtes en cours sont coupées à chaque déploiement.

**Continuer après une `uncaughtException`.** Journalise, puis laisse le processus redémarrer.

## À retenir

- `process.argv` et `parseArgs` pour les arguments ; une option inconnue lève une erreur.
- `process.env` ne contient que des chaînes ou `undefined` : on convertit, on valide au démarrage, on fige.
- `.env` pour le développement, dans `.gitignore` ; `.env.example` commité ; les variables existantes gagnent.
- Résultats sur la sortie standard, erreurs sur la sortie d'erreur ; `process.exitCode` pour le code de sortie.
- `SIGTERM` et `SIGINT` : arrêter d'accepter, terminer l'en-cours, fermer les ressources, avec un délai de sécurité.
- Une erreur non gérée arrête le processus : on la journalise, on ne la masque pas.

## Exercices

1. Écris `lireOptions(args)` pour un outil `exporter` qui accepte un fichier source en argument, `--format`
   (`csv` ou `json`, `csv` par défaut), `--limite` (un entier positif, facultatif) et `-h`/`--aide`. Elle renvoie
   `{ source, format, limite, aide }`, et lève une erreur au message clair pour une option inconnue, une source
   manquante, un format ou une limite invalides.

   :::indice
   `parseArgs` avec `strict: true` (par défaut) et `allowPositionals: true`. `parseArgs` renvoie des chaînes pour les
   options de type `string` : convertis la limite.
   :::

   :::solution
   ```js
   import { parseArgs } from 'node:util';

   function lireOptions(args) {
     let resultat;
     try {
       resultat = parseArgs({
         args,
         options: {
           format: { type: 'string', default: 'csv' },
           limite: { type: 'string' },
           aide: { type: 'boolean', short: 'h', default: false },
         },
         allowPositionals: true,
       });
     } catch (erreur) {
       throw new Error(`Option invalide : ${erreur.message}`);
     }
     const { values, positionals } = resultat;
     if (values.aide) return { aide: true };

     const [source] = positionals;
     if (!source) throw new Error('Fichier source manquant. Usage : exporter <source> [--format csv|json]');
     if (!['csv', 'json'].includes(values.format)) throw new Error(`Format inconnu : ${values.format}`);

     let limite;
     if (values.limite !== undefined) {
       limite = Number(values.limite);
       if (!Number.isInteger(limite) || limite <= 0) throw new Error(`Limite invalide : ${values.limite}`);
     }
     return { source, format: values.format, limite, aide: false };
   }

   console.log(lireOptions(['ventes.db', '--format', 'json', '--limite', '50']));
   // { source: 'ventes.db', format: 'json', limite: 50, aide: false }
   for (const args of [['--xml'], [], ['a.db', '--format=xml'], ['a.db', '--limite=-3']]) {
     try {
       lireOptions(args);
     } catch (erreur) {
       console.log(erreur.message.split('.')[0]);
     }
   }
   // Option invalide : Unknown option '--xml'
   // Fichier source manquant
   // Format inconnu : xml
   // Limite invalide : -3
   ```

   Le script principal appelle `lireOptions(process.argv.slice(2))`, affiche le message sur la sortie d'erreur et
   fixe `process.exitCode = 2`, le code conventionnel d'une mauvaise utilisation.
   :::

2. Voici le module de configuration d'une application. Trouve ses quatre problèmes et réécris-le.

   ```js
   export const config = {
     port: process.env.PORT || 3000,
     debug: Boolean(process.env.DEBUG),
     stripeKey: process.env.STRIPE_KEY || 'sk_live_51Hx…',
     timeout: parseInt(process.env.TIMEOUT_MS),
   };
   console.log('Configuration chargée', config);
   ```

   :::indice
   Types, valeurs de repli, secrets, journalisation. Que vaut `parseInt(undefined)` ?
   :::

   :::solution
   - `port` peut être la chaîne `'4000'` ou le nombre `3000` : type incohérent, et aucune validation.
   - `Boolean(process.env.DEBUG)` vaut `true` pour `DEBUG=false`.
   - Une vraie clé Stripe est écrite dans le code, donc dans l'historique Git ; et si la variable manque, l'application
     l'utilise en silence.
   - `parseInt(undefined)` vaut `NaN` : un délai invalide, sans erreur. Et `console.log` affiche la clé secrète dans
     les journaux.

   ```js
   function entier(nom, valeur, parDefaut) {
     if (valeur === undefined || valeur === '') return parDefaut;
     const nombre = Number(valeur);
     if (!Number.isInteger(nombre) || nombre <= 0) throw new Error(`${nom} doit être un entier positif`);
     return nombre;
   }

   function obligatoire(nom, valeur) {
     if (!valeur) throw new Error(`${nom} est obligatoire`);
     return valeur;
   }

   export function lireConfiguration(env) {
     return Object.freeze({
       port: entier('PORT', env.PORT, 3000),
       debug: env.DEBUG === 'true',
       stripeKey: obligatoire('STRIPE_KEY', env.STRIPE_KEY),
       timeoutMs: entier('TIMEOUT_MS', env.TIMEOUT_MS, 5000),
     });
   }

   const config = lireConfiguration({ PORT: '4000', DEBUG: 'false', STRIPE_KEY: 'sk_test_x' });
   console.log('Configuration chargée', { ...config, stripeKey: '***' });
   // Configuration chargée { port: 4000, debug: false, stripeKey: '***', timeoutMs: 5000 }
   ```

   La fonction reçoit `env` en paramètre : on la teste avec des objets simples, sans toucher à `process.env`. La clé
   compromise doit être révoquée chez Stripe : la retirer du code ne la retire pas de l'historique.
   :::

3. Écris un filtre `majuscules.mjs` qui lit tout le texte reçu sur l'entrée standard, l'écrit en majuscules sur la
   sortie standard, et sort avec le code 1 et un message sur la sortie d'erreur si l'entrée est vide. Exemple :
   `echo bonjour | node majuscules.mjs`.

   :::indice
   `process.stdin` est un flux lisible et asynchrone : `for await (const morceau of process.stdin)` reçoit des
   `Buffer`. `setEncoding('utf8')` donne des chaînes.
   :::

   :::solution
   ```js
   process.stdin.setEncoding('utf8');

   let texte = '';
   for await (const morceau of process.stdin) {
     texte += morceau;
   }

   if (texte.trim() === '') {
     console.error("Rien à convertir : l'entrée est vide.");
     process.exitCode = 1;
   } else {
     process.stdout.write(texte.toUpperCase());
   }
   ```

   ```text
   $ echo bonjour | node majuscules.mjs
   BONJOUR
   $ node majuscules.mjs < /dev/null
   Rien à convertir : l'entrée est vide.
   ```

   `process.stdout.write` n'ajoute pas de saut de ligne, contrairement à `console.log` : la sortie est exactement
   l'entrée convertie, ce qu'attend un filtre qu'on enchaîne dans un pipeline de commandes.
   :::

## Questions d'entretien

- Comment gérer la configuration d'une application Node ?

  :::indice
  Environnement, validation, secrets.
  :::

  :::reponse
  Par des variables d'environnement, conformément aux principes des applications *twelve-factor* : le même code
  tourne dans tous les environnements, seule la configuration change. Je les lis une seule fois au démarrage, je
  les convertis et les valide, par exemple avec un schéma zod, et j'échoue immédiatement avec un message clair si
  quelque chose manque. Le reste du code reçoit un objet de configuration figé. En développement, un fichier `.env`
  hors du dépôt, et un `.env.example` commité ; en production, les variables viennent de la plateforme ou d'un
  gestionnaire de secrets. Je ne journalise jamais les secrets.
  :::

- Que doit faire un serveur Node quand il reçoit `SIGTERM` ?

  :::indice
  Pense à ce qui se passe pendant un déploiement.
  :::

  :::reponse
  S'arrêter proprement : cesser d'accepter de nouvelles connexions avec `server.close`, laisser les requêtes en
  cours se terminer, fermer les connexions aux bases de données et aux files de messages, puis se terminer avec le
  code 0. Comme la plateforme enverra `SIGKILL` après un délai, je prévois un minuteur de sécurité qui force l'arrêt
  si une connexion traîne. Sans cela, chaque déploiement coupe des requêtes en plein milieu.
  :::

- Quelle différence entre `process.exit(1)` et `process.exitCode = 1` ?

  :::indice
  Que devient une écriture en cours sur la sortie standard ?
  :::

  :::reponse
  `process.exit(1)` termine le processus immédiatement : les callbacks en attente ne s'exécutent pas, et une écriture
  asynchrone sur un tube ou un fichier peut être tronquée. `process.exitCode = 1` fixe seulement le code de sortie :
  Node se termine normalement quand il n'a plus rien à faire, et utilise ce code. On préfère `exitCode` ; on garde
  `exit` pour les situations où rien d'important n'est en cours, ou pour forcer un arrêt après un délai.
  :::
