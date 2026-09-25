---
id: javascript-runtime-node
title: "Le runtime Node.js, et ce qui le distingue du navigateur"
slug: runtime-node
technology: javascript
level: intermediate
module: introduction-nodejs
order: 1
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-introduction
  - javascript-event-loop
  - javascript-es-modules
skills:
  - js-node-runtime
tags:
  - javascript
  - nodejs
---

## Objectifs

- Décrire ce qui compose Node.js : le moteur V8, la bibliothèque libuv et les modules intégrés.
- Comprendre comment Node traite les entrées-sorties sans bloquer, avec un seul fil pour le JavaScript.
- Connaître les phases de la boucle d'événements de Node, `process.nextTick` et `setImmediate`.
- Savoir ce qui change entre Node et le navigateur : API disponibles, modules, sécurité.
- Lancer un script, surveiller ses modifications et choisir une version de Node.

## Introduction

Le premier module du cours présentait Node.js en une phrase : un environnement qui exécute JavaScript en dehors du
navigateur. Il est temps d'y regarder de plus près, car Node fait tourner une grande partie du JavaScript
professionnel : serveurs d'API, outils en ligne de commande, scripts de build, et même les outils de ce cours, Vite,
Vitest ou ESLint.

Le langage est le même. Ce qui change, c'est l'environnement : pas de DOM ni de fenêtre, mais un accès aux fichiers,
au réseau, aux processus et aux variables d'environnement. Et un modèle d'exécution pensé pour servir des milliers
de connexions avec un seul fil de JavaScript.

## Concept

| Composant | Rôle |
| --- | --- |
| **V8** | le moteur JavaScript de Chrome : il compile et exécute le code |
| **libuv** | une bibliothèque en C qui fournit la boucle d'événements et les entrées-sorties asynchrones |
| **modules intégrés** | `node:fs`, `node:path`, `node:http`, `node:events`, `node:stream`… écrits en JavaScript et en C++ |
| **npm** | le gestionnaire de paquets livré avec Node, et le registre public associé |

| | Navigateur | Node.js |
| --- | --- | --- |
| objet global | `window` (et `globalThis`) | `globalThis` ; pas de `window` |
| API propres | DOM, `localStorage`, `IndexedDB` | fichiers, processus, réseau bas niveau, flux |
| API communes | `fetch`, `URL`, `AbortController`, `structuredClone`, `setTimeout`, `TextEncoder`, `crypto.randomUUID` | les mêmes |
| modules | ES modules | ES modules et CommonJS (`require`) |
| sécurité | bac à sable : aucun accès au disque | accès complet, avec les droits de l'utilisateur qui lance le processus |
| version du moteur | celle du navigateur de chaque visiteur | celle que vous installez et choisissez |

## Exemple

Ce script, `ordre.mjs`, montre l'ordre dans lequel Node exécute les différentes sortes de callbacks :

```js
import { readFile } from 'node:fs';

console.log('1. synchrone');
setTimeout(() => console.log('5. setTimeout 0'), 0);
setImmediate(() => console.log('6. setImmediate'));
process.nextTick(() => console.log('4. process.nextTick'));
Promise.resolve().then(() => console.log('3. promesse'));
console.log('2. synchrone, fin du script');

readFile(import.meta.filename, () => {
  // Depuis un callback d'entrée-sortie, setImmediate passe toujours avant setTimeout 0.
  setTimeout(() => console.log('8. setTimeout depuis une E/S'), 0);
  setImmediate(() => console.log('7. setImmediate depuis une E/S'));
});
```

```text
$ node ordre.mjs
1. synchrone
2. synchrone, fin du script
3. promesse
4. process.nextTick
5. setTimeout 0
6. setImmediate
7. setImmediate depuis une E/S
8. setTimeout depuis une E/S
```

Le code synchrone s'exécute d'abord, puis les microtâches, puis les phases de la boucle d'événements. Deux
subtilités se cachent dans cette sortie, expliquées ci-dessous : la promesse avant `nextTick`, et `setImmediate`
avant `setTimeout`.

## Comment ça fonctionne

**Un fil pour le JavaScript, beaucoup de travail en parallèle.** Votre code s'exécute sur un seul fil, comme dans
le navigateur. Mais lire un fichier, attendre une requête réseau ou interroger une base de données ne bloque pas ce
fil : Node confie l'opération au système d'exploitation, qui sait attendre des milliers de connexions réseau à la
fois, ou à un petit groupe de fils internes de libuv, quatre par défaut, pour les opérations que le système ne sait
pas faire de façon asynchrone : fichiers, résolution DNS avec `dns.lookup`, certaines fonctions de `crypto` et de
`zlib`. Quand l'opération se termine, son callback est placé dans la file de la boucle d'événements. C'est ce qui
permet à un serveur Node de servir beaucoup de clients : il passe son temps à attendre, et l'attente ne coûte rien.

Le revers est le même que dans le navigateur : un calcul long bloque tout. Une boucle de deux secondes dans un
serveur fait attendre deux secondes **tous** les clients.

**Les phases de la boucle.** La boucle de Node tourne en phases, chacune avec sa file :

1. **timers** : les callbacks de `setTimeout` et `setInterval` dont le délai est écoulé ;
2. **pending callbacks** : quelques callbacks système reportés ;
3. **poll** : les callbacks d'entrées-sorties terminées ; la boucle y attend quand il n'y a rien d'autre à faire ;
4. **check** : les callbacks de `setImmediate` ;
5. **close callbacks** : les événements `close`, comme la fermeture d'une connexion.

Entre deux callbacks, Node vide deux files prioritaires : celle de `process.nextTick`, puis celle des
microtâches, les promesses. Un callback d'entrée-sortie s'exécute dans la phase *poll* ; la phase suivante est
*check* : c'est pourquoi `setImmediate` passe **toujours** avant `setTimeout(…, 0)` quand on les programme depuis une
entrée-sortie. Depuis le script principal, en revanche, leur ordre n'est pas garanti : il dépend du temps écoulé
avant le premier tour de boucle.

**`nextTick` et les promesses.** Dans un fichier CommonJS, la file `nextTick` passe avant les promesses. Dans un
module ES, comme ici, le code du module s'exécute lui-même dans une microtâche : les promesses déjà programmées
passent donc avant `nextTick`. Cette différence surprend, et c'est une raison de ne pas écrire de code qui dépend de
cet ordre. `process.nextTick` sert surtout, dans les bibliothèques, à appeler un callback de façon asynchrone mais
avant toute entrée-sortie ; dans votre code, préférez `queueMicrotask` ou une promesse.

**Modules : ESM et CommonJS.** Node comprend les deux systèmes. Un fichier `.mjs`, ou un `.js` dans un paquet dont
le `package.json` contient `"type": "module"`, est un module ES : `import`, `export`, `await` au niveau supérieur,
`import.meta.dirname` et `import.meta.filename` pour connaître son emplacement. Un fichier `.cjs`, ou un `.js` sans
ce champ, est un module CommonJS : `require`, `module.exports`, `__dirname`. Le préfixe `node:` désigne sans
ambiguïté un module intégré : `import { readFile } from 'node:fs/promises'`. Pour du nouveau code, on écrit des
modules ES.

**Un environnement sans bac à sable.** Le navigateur exécute le code de n'importe quel site : il l'isole. Node exécute
le vôtre et celui de vos dépendances avec tous les droits de l'utilisateur : lire vos clés SSH, supprimer des
fichiers, ouvrir des connexions. C'est pourquoi le choix des dépendances est une question de sécurité, qu'on
retrouvera dans la partie consacrée. Node propose un modèle de permissions, `--permission`, qui restreint l'accès au
disque ou aux processus enfants ; il reste peu utilisé.

**Lancer et choisir sa version.** `node script.mjs` exécute un fichier ; `node` seul ouvre une console interactive,
le REPL ; `node --watch script.mjs` relance le script à chaque modification ; `node --env-file=.env script.mjs`
charge des variables d'environnement. Les versions paires de Node, 20, 22, 24, deviennent des versions **LTS**,
maintenues environ trois ans : c'est ce qu'on utilise en production. On fixe la version du projet dans un
fichier `.nvmrc` ou dans le champ `engines` du `package.json`, et on l'installe avec un gestionnaire de versions
comme nvm, fnm ou Volta.

## Erreurs fréquentes

**Chercher `window` ou `document` dans Node.** Ils n'existent pas ; `globalThis` existe partout.

**Bloquer le fil dans un serveur.** `readFileSync` dans un gestionnaire de requêtes, un calcul lourd, une boucle
sans fin : tous les clients attendent.

**Mélanger `require` et `import` au hasard.** Choisis ESM pour le nouveau code, avec `"type": "module"`.

**Utiliser `__dirname` dans un module ES.** Il n'existe qu'en CommonJS : utilise `import.meta.dirname`.

**Dépendre de l'ordre entre `setTimeout(…, 0)` et `setImmediate` depuis le script principal.** Il n'est pas garanti.

**Utiliser une version impaire de Node en production.** Elles ne sont maintenues que quelques mois ; choisis une LTS.

## À retenir

- Node.js = V8, qui exécute le JavaScript, + libuv, qui fournit la boucle et les entrées-sorties asynchrones.
- Un seul fil pour le JavaScript ; les entrées-sorties attendent ailleurs et ne bloquent pas.
- Phases de la boucle : timers, poll (entrées-sorties), check (`setImmediate`), close ; `nextTick` et promesses
  entre chaque callback.
- Pas de DOM ni de bac à sable ; des API de fichiers, de processus et de réseau ; `fetch` et `URL` comme le navigateur.
- ESM avec `"type": "module"` ou `.mjs`, `node:` pour les modules intégrés, `import.meta.dirname`.
- En production, une version LTS paire, fixée par `.nvmrc` ou `engines`.

## Exercices

1. Sans exécuter ce module ES, écris l'ordre des affichages, puis vérifie avec Node.

   ```js
   setTimeout(() => console.log('A'), 0);
   queueMicrotask(() => console.log('B'));
   console.log('C');
   Promise.resolve().then(() => {
     console.log('D');
     process.nextTick(() => console.log('E'));
   });
   ```

   :::indice
   Synchrone d'abord, puis microtâches dans l'ordre de programmation. Un `nextTick` programmé depuis une microtâche
   s'exécute quand la file des microtâches est vide, avant les timers.
   :::

   :::solution
   ```text
   C
   B
   D
   E
   A
   ```

   `C` est synchrone. `B` et `D` sont des microtâches, exécutées dans l'ordre où elles ont été programmées. `D`
   programme un `nextTick` : il passe dès que les microtâches en cours sont terminées, avant de revenir à la boucle
   d'événements. `A`, un timer, vient en dernier.
   :::

2. Écris un module ES `infos.mjs` qui affiche la version de Node, le système d'exploitation, le dossier du script et
   le dossier courant, et qui s'arrête avec un message d'erreur et le code de sortie 1 si la version majeure de Node
   est inférieure à 20.

   :::indice
   `process.version` vaut par exemple `'v22.18.0'` ; `process.platform`, `import.meta.dirname` et `process.cwd()`
   donnent le reste. `process.exitCode = 1` fixe le code de sortie.
   :::

   :::solution
   ```js
   const majeure = Number(process.versions.node.split('.')[0]);

   if (majeure < 20) {
     console.error(`Node ${process.version} est trop ancien : il faut Node 20 ou plus.`);
     process.exitCode = 1;
   } else {
     console.log(`Node ${process.version} sur ${process.platform}`);
     console.log(`Script : ${import.meta.dirname}`);
     console.log(`Dossier courant : ${process.cwd()}`);
   }
   ```

   `process.versions.node` donne la version sans le `v`. Le dossier du script et le dossier courant diffèrent dès
   qu'on lance le script depuis un autre endroit : `node outils/infos.mjs` depuis la racine du projet. On préfère
   `process.exitCode` à `process.exit(1)`, qui couperait net d'éventuelles écritures en cours.
   :::

3. Ce serveur répond lentement à tous les clients dès que l'un d'eux demande `/rapport`. Explique pourquoi, et
   propose deux corrections.

   ```js
   import { createServer } from 'node:http';
   import { readFileSync } from 'node:fs';

   createServer((requete, reponse) => {
     if (requete.url === '/rapport') {
       const lignes = readFileSync('ventes.csv', 'utf8').split('\n');
       let total = 0;
       for (const ligne of lignes) total += Number(ligne.split(';')[2] ?? 0);
       reponse.end(String(total));
     } else {
       reponse.end('ok');
     }
   }).listen(3000);
   ```

   :::indice
   Qu'est-ce qui occupe le fil unique du JavaScript pendant ce traitement ? Quelle partie peut attendre ailleurs,
   quelle partie calcule ?
   :::

   :::solution
   Le JavaScript de Node tourne sur un seul fil. `readFileSync` bloque ce fil pendant toute la lecture, puis la
   boucle calcule sur tout le fichier : pendant ce temps, aucune autre requête n'est traitée, même `/` qui ne fait
   rien. Deux corrections, complémentaires :

   - lire le fichier de façon asynchrone, avec `await readFile('ventes.csv', 'utf8')` de `node:fs/promises`, ou
     mieux en flux ligne par ligne : l'attente du disque ne bloque plus le fil ;
   - ne pas refaire le calcul à chaque requête : le mettre en cache et le recalculer quand le fichier change, ou,
     s'il est vraiment lourd, le confier à un *worker thread*, vu dans le module suivant.

   ```js
   import { createServer } from 'node:http';
   import { readFile } from 'node:fs/promises';

   createServer(async (requete, reponse) => {
     if (requete.url === '/rapport') {
       const contenu = await readFile('ventes.csv', 'utf8'); // le fil reste libre pendant la lecture
       let total = 0;
       for (const ligne of contenu.split('\n')) total += Number(ligne.split(';')[2] ?? 0);
       reponse.end(String(total));
     } else {
       reponse.end('ok');
     }
   }).listen(3000);
   ```
   :::

## Questions d'entretien

- Node.js est-il monothread ?

  :::indice
  Distingue le fil qui exécute votre JavaScript de ce qui fait les entrées-sorties.
  :::

  :::reponse
  Le JavaScript de l'application s'exécute sur un seul fil, avec une boucle d'événements : deux callbacks ne
  s'exécutent jamais en même temps. Mais Node lui-même n'est pas monothread : les entrées-sorties réseau sont
  déléguées au système d'exploitation, et libuv utilise un groupe de fils, quatre par défaut, pour les fichiers, la
  résolution DNS et certaines opérations de `crypto` et `zlib`. On peut aussi créer des *worker threads* pour du
  calcul. D'où la règle : les entrées-sorties ne bloquent pas, le calcul si.
  :::

- Quelle différence entre `process.nextTick`, `setImmediate` et `setTimeout(fn, 0)` ?

  :::indice
  Pense aux files prioritaires et aux phases de la boucle.
  :::

  :::reponse
  `process.nextTick` place le callback dans une file prioritaire, vidée entre deux callbacks, avant de revenir à la
  boucle ; comme les microtâches, un abus peut affamer les entrées-sorties. `setImmediate` exécute le callback dans
  la phase *check*, juste après la phase *poll* des entrées-sorties. `setTimeout(fn, 0)` l'exécute dans la phase
  *timers* d'un prochain tour, après au moins 1 ms. Depuis un callback d'entrée-sortie, `setImmediate` passe
  toujours avant `setTimeout(fn, 0)` ; depuis le script principal, leur ordre n'est pas garanti.
  :::

- Qu'est-ce qui change quand on écrit du JavaScript pour Node plutôt que pour le navigateur ?

  :::indice
  API, modules, sécurité, version du moteur.
  :::

  :::reponse
  Le langage est le même, et beaucoup d'API sont communes : `fetch`, `URL`, `AbortController`, les minuteurs. Mais
  il n'y a ni DOM ni `window` ; on a en revanche accès aux fichiers, aux processus, aux variables d'environnement et
  au réseau bas niveau. Node accepte deux systèmes de modules, ESM et CommonJS. Il n'y a pas de bac à sable : le
  code, et celui des dépendances, a tous les droits de l'utilisateur. Enfin, on choisit la version du moteur, alors
  que dans le navigateur on doit composer avec celle de chaque visiteur.
  :::
