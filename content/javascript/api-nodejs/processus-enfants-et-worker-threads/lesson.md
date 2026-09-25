---
id: javascript-processus-enfants-et-worker-threads
title: "Processus enfants et worker threads"
slug: processus-enfants-et-worker-threads
technology: javascript
level: advanced
module: api-nodejs
order: 5
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-evenements-flux-et-buffers
  - javascript-process-et-environnement
skills:
  - js-node-processes-threads
tags:
  - javascript
  - nodejs
  - processus
---

## Objectifs

- Lancer une commande externe avec `execFile` ou `spawn`, lire sa sortie et son code de sortie.
- Comprendre pourquoi `exec` et `shell: true` exposent à l'injection de commandes.
- Gérer les délais, les erreurs et les différences entre Windows et Unix.
- Déplacer un calcul lourd dans un *worker thread* pour garder un serveur réactif.
- Choisir entre processus enfant, worker thread et plusieurs instances du serveur.

## Introduction

Un programme Node a parfois besoin d'un autre programme : lire l'historique Git, convertir une vidéo avec
`ffmpeg`, générer un PDF, lancer les tests d'un sous-projet. Le module `node:child_process` lance ces commandes
comme des **processus enfants**, qui s'exécutent à côté de Node, avec leur propre mémoire.

Et parfois, le programme a besoin de calculer longtemps : générer une miniature, hacher des mots de passe en série,
analyser un gros fichier. Sur le fil principal, ce calcul bloquerait tout. Les **worker threads**, de
`node:worker_threads`, exécutent du JavaScript sur d'autres fils, comme les Web Workers du navigateur.

## Concept

| Fonction de `node:child_process` | Shell | Sortie | Usage |
| --- | --- | --- | --- |
| `execFile(commande, args)` | non | tamponnée, en fin d'exécution | une commande courte, avec des arguments |
| `spawn(commande, args)` | non | en flux, au fil de l'eau | une commande longue ou bavarde |
| `exec('chaîne de commande')` | oui | tamponnée | à éviter avec toute donnée extérieure |
| `fork('module.js')` | non | messages entre deux processus Node | un sous-programme Node isolé |

| Besoin | Outil |
| --- | --- |
| exécuter un autre programme | processus enfant |
| calcul JavaScript lourd, sans bloquer le fil principal | worker thread |
| utiliser tous les cœurs pour servir plus de requêtes | plusieurs instances : `node:cluster`, un gestionnaire de processus, des conteneurs |

## Exemple

Lire les derniers commits d'un dépôt avec `git`, sans shell, avec un délai maximal :

```js
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const executer = promisify(execFile);

async function derniersCommits(depot, nombre = 5) {
  const { stdout } = await executer('git', ['log', `-${nombre}`, '--format=%h%x1f%an%x1f%s'], {
    cwd: depot,
    timeout: 5000,
    maxBuffer: 1024 * 1024,
  });
  return stdout
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((ligne) => {
      const [hash, auteur, sujet] = ligne.split('\x1f');
      return { hash, auteur, sujet };
    });
}

try {
  const commits = await derniersCommits('.', 3);
  for (const { hash, sujet } of commits) console.log(hash, sujet);
} catch (erreur) {
  // erreur.code : le code de sortie (nombre) ou une erreur système ('ENOENT' si git est absent)
  console.error(`git a échoué (${erreur.code}) : ${erreur.stderr?.trim() || erreur.message}`);
  process.exitCode = 1;
}
```

Le séparateur `%x1f`, un caractère de contrôle, ne peut pas apparaître dans un nom ou un sujet de commit, contrairement
à une virgule ou une barre verticale.

## Comment ça fonctionne

**Sans shell, pas d'injection.** `execFile` et `spawn` lancent le programme directement, et lui passent chaque
argument tel quel, sans interprétation. `exec`, lui, confie une chaîne de caractères au shell, qui interprète `;`,
`&`, `|`, `$( )` et les guillemets. Si une donnée extérieure entre dans cette chaîne, elle peut ajouter une commande :

```js
import { exec, execFile } from 'node:child_process';
import { promisify } from 'node:util';

const nomFichier = 'rapport.txt & echo INJECTE'; // fourni par un utilisateur

const avecShell = await promisify(exec)(`echo ${nomFichier}`);
console.log(avecShell.stdout.includes('INJECTE') && !avecShell.stdout.includes('& echo')); // true : la commande a été exécutée

const sansShell = await promisify(execFile)(process.execPath, ['-e', 'console.log(process.argv[1])', nomFichier]);
console.log(sansShell.stdout.trim()); // rapport.txt & echo INJECTE : un simple argument
```

À la place de `echo INJECTE`, un attaquant écrirait une commande qui lit des secrets ou supprime des données. La règle :
`execFile` ou `spawn` avec un tableau d'arguments, jamais une chaîne construite par concaténation. Un argument qui
commence par `-` peut encore être pris pour une option par le programme appelé : `--` avant les arguments libres,
quand le programme le permet, l'en empêche.

**Tamponné ou en flux.** `execFile` attend la fin du processus et renvoie toute la sortie ; au-delà de `maxBuffer`,
1 Mo par défaut, le processus est tué. `spawn` renvoie un objet `ChildProcess` dont `stdout` et `stderr` sont des flux
lisibles : on les lit au fil de l'eau, ou on les relie à ceux du parent avec `stdio: 'inherit'`, pour afficher la
progression d'une longue commande. L'événement `close` donne le code de sortie.

**Échecs, délais et codes.** Avec la version à promesses d'`execFile`, un code de sortie non nul rejette la promesse :
`erreur.code` vaut ce code, un nombre, et `erreur.stdout` et `erreur.stderr` contiennent les sorties. Si le
programme n'existe pas, `erreur.code` vaut `'ENOENT'`, une chaîne. L'option `timeout` tue le processus au-delà d'un
délai : `erreur.killed` vaut alors `true` et `erreur.signal` `'SIGTERM'`. On fixe toujours un délai pour une commande
externe : un programme bloqué bloquerait sinon la requête qui l'attend.

**Windows.** Beaucoup de commandes Node, comme `npm` ou `npx`, sont sous Windows des fichiers `npm.cmd`. `execFile('npm')`
échoue avec `ENOENT`, et `execFile('npm.cmd')` avec `EINVAL` : depuis 2024, Node refuse de lancer un `.cmd` ou un
`.bat` sans shell, car `cmd.exe` interpréterait les arguments. Pour lancer un script de `node_modules`, le plus sûr
est de lancer Node lui-même, `process.execPath`, avec le chemin du fichier JavaScript. Sinon, `shell: true` devient
nécessaire, et les arguments ne doivent alors contenir aucune donnée extérieure.

**Les worker threads.** Un `Worker` exécute un fichier JavaScript sur un autre fil, avec sa propre boucle
d'événements et sa propre mémoire JavaScript, dans le même processus. On communique par messages, clonés comme dans le
navigateur : `postMessage` d'un côté, événement `message` de l'autre. `workerData` transmet des données de départ, et
les `ArrayBuffer` peuvent être transférés sans copie.

```js
// hachage.worker.mjs
import { parentPort } from 'node:worker_threads';
import { scryptSync } from 'node:crypto';

parentPort.on('message', ({ id, motDePasse, sel }) => {
  const hache = scryptSync(motDePasse, sel, 64, { N: 2 ** 16, maxmem: 128 * 1024 * 1024 });
  parentPort.postMessage({ id, hache: hache.toString('hex') });
});
```

```js
// principal.mjs
import { Worker } from 'node:worker_threads';

const worker = new Worker(new URL('./hachage.worker.mjs', import.meta.url));
let prochainId = 0;
const enAttente = new Map();

worker.on('message', ({ id, hache }) => {
  enAttente.get(id)(hache);
  enAttente.delete(id);
});

function hacher(motDePasse, sel) {
  const id = prochainId++;
  return new Promise((resoudre) => {
    enAttente.set(id, resoudre);
    worker.postMessage({ id, motDePasse, sel });
  });
}

const debut = performance.now();
const tic = setInterval(() => console.log(`fil principal libre à ${Math.round(performance.now() - debut)} ms`), 50);
const hache = await hacher('correct horse battery staple', 'sel-aleatoire');
clearInterval(tic);
console.log(hache.slice(0, 16));
await worker.terminate();
```

Pendant le hachage, volontairement coûteux, le fil principal continue d'afficher ses messages toutes les 50 ms : un
serveur continuerait de répondre. Pour de nombreuses tâches, on utilise un groupe de workers, avec une bibliothèque
comme Piscina, plutôt que de créer un worker par tâche.

**Choisir.** Un processus enfant exécute **un autre programme**, isolé : s'il plante, Node survit. Un worker thread
exécute **du JavaScript** en parallèle, plus léger et avec des échanges plus rapides, mais partage le processus. Pour
qu'un serveur utilise plusieurs cœurs, on lance plutôt plusieurs instances du serveur, derrière un répartiteur de
charge : c'est ce que font `node:cluster`, un gestionnaire comme PM2, ou plusieurs conteneurs.

## Erreurs fréquentes

**Construire une commande avec une donnée extérieure dans `exec`.** C'est une injection de commande ; utilise
`execFile` avec un tableau d'arguments.

**Oublier le délai.** Une commande bloquée bloque la requête qui l'attend ; fixe `timeout`.

**Lire une sortie volumineuse avec `execFile`.** Au-delà de `maxBuffer`, le processus est tué ; utilise `spawn`.

**Confondre `erreur.code` numérique et `'ENOENT'`.** Le premier est le code de sortie du programme, le second signale
qu'il n'a pas pu être lancé.

**Appeler `npm` avec `execFile` sous Windows.** C'est un `.cmd` : lance plutôt Node avec le script voulu.

**Créer un worker par requête.** Le démarrage coûte des dizaines de millisecondes ; garde un groupe de workers.

**Utiliser un worker pour attendre des entrées-sorties.** Les entrées-sorties ne bloquent déjà pas ; les workers
servent au calcul.

## À retenir

- `execFile` et `spawn` : pas de shell, arguments en tableau, pas d'injection.
- `exec` et `shell: true` interprètent la chaîne : jamais avec une donnée extérieure.
- `execFile` tamponne la sortie, `spawn` la diffuse en flux ; toujours un `timeout`.
- `erreur.code` : code de sortie numérique, ou erreur système comme `'ENOENT'`.
- Les worker threads exécutent du JavaScript en parallèle, par messages ; un groupe plutôt qu'un worker par tâche.
- Processus enfant : un autre programme ; worker : du calcul ; plusieurs instances : tous les cœurs pour le serveur.

## Exercices

1. Écris `executer(commande, args, { cwd, delai })` avec `spawn`, qui renvoie une promesse de
   `{ code, stdout, stderr }`, résolue quel que soit le code de sortie, rejetée seulement si la commande ne peut pas
   démarrer ou dépasse le délai. Teste-la avec `process.execPath` et un petit script qui écrit sur les deux sorties
   et sort avec le code 2.

   :::indice
   Accumule les morceaux de `stdout` et `stderr`, écoute `error` (commande introuvable) et `close` (code de sortie).
   Pour le délai, `setTimeout` puis `enfant.kill()`.
   :::

   :::solution
   ```js
   import { spawn } from 'node:child_process';

   function executer(commande, args, { cwd, delai = 10_000 } = {}) {
     return new Promise((resoudre, rejeter) => {
       const enfant = spawn(commande, args, { cwd });
       const sorties = { stdout: [], stderr: [] };
       enfant.stdout.on('data', (morceau) => sorties.stdout.push(morceau));
       enfant.stderr.on('data', (morceau) => sorties.stderr.push(morceau));

       const minuteur = setTimeout(() => {
         enfant.kill();
         rejeter(new Error(`${commande} a dépassé ${delai} ms`));
       }, delai);

       enfant.on('error', (erreur) => {
         clearTimeout(minuteur);
         rejeter(erreur); // par exemple ENOENT
       });
       enfant.on('close', (code) => {
         clearTimeout(minuteur);
         resoudre({
           code,
           stdout: Buffer.concat(sorties.stdout).toString('utf8'),
           stderr: Buffer.concat(sorties.stderr).toString('utf8'),
         });
       });
     });
   }

   const resultat = await executer(process.execPath, [
     '-e',
     'console.log("ok"); console.error("attention"); process.exitCode = 2',
   ]);
   console.log(resultat); // { code: 2, stdout: 'ok\n', stderr: 'attention\n' }

   await executer('commande-inexistante', []).catch((erreur) => console.log(erreur.code)); // ENOENT
   await executer(process.execPath, ['-e', 'setTimeout(() => {}, 5000)'], { delai: 100 })
     .catch((erreur) => console.log(erreur.message.endsWith('100 ms'))); // true
   ```

   Si le délai tue l'enfant, `close` arrive ensuite et tente de résoudre une promesse déjà rejetée : c'est sans
   effet, une promesse ne change d'état qu'une fois. Les buffers sont assemblés avant d'être décodés, pour ne pas
   couper un caractère.
   :::

2. Un développeur a écrit cette route pour générer une miniature d'image. Explique la faille, puis corrige-la.

   ```js
   import { exec } from 'node:child_process';

   app.post('/miniatures', (requete, reponse) => {
     const { fichier } = requete.body;
     exec(`magick uploads/${fichier} -resize 200x200 miniatures/${fichier}`, (erreur) => {
       reponse.status(erreur ? 500 : 201).end();
     });
   });
   ```

   :::indice
   Que se passe-t-il avec `fichier` égal à `a.png; rm -rf ~` ? Et avec `../../.env` ?
   :::

   :::solution
   Deux failles. L'**injection de commande** : `exec` passe la chaîne au shell, et `a.png; rm -rf ~` exécute une
   seconde commande avec les droits du serveur. La **traversée de chemin** : `../../.env` sort du dossier `uploads`.
   On valide le nom contre une liste de caractères autorisés, on construit les chemins avec `path`, et on lance le
   programme sans shell, avec un délai :

   ```js
   import { execFile } from 'node:child_process';
   import { promisify } from 'node:util';
   import path from 'node:path';

   const executer = promisify(execFile);
   const NOM_VALIDE = /^[a-z0-9_-]{1,64}\.(png|jpe?g|webp)$/i;

   async function creerMiniature(fichier) {
     if (!NOM_VALIDE.test(fichier)) {
       throw Object.assign(new Error('Nom de fichier invalide'), { statut: 400 });
     }
     const source = path.join('uploads', fichier);
     const cible = path.join('miniatures', fichier);
     await executer('magick', [source, '-resize', '200x200', cible], { timeout: 15_000 });
   }

   for (const nom of ['photo-1.png', 'a.png; rm -rf ~', '../../.env']) {
     try {
       NOM_VALIDE.test(nom) ? console.log(nom, '→ accepté') : await creerMiniature(nom);
     } catch (erreur) {
       console.log(nom, '→', erreur.statut, erreur.message);
     }
   }
   // photo-1.png → accepté
   // a.png; rm -rf ~ → 400 Nom de fichier invalide
   // ../../.env → 400 Nom de fichier invalide
   ```

   La liste blanche est plus sûre que de chercher les caractères dangereux : elle n'accepte que ce qu'on a prévu.
   Mieux encore, le serveur choisit lui-même le nom des fichiers déposés, par exemple un identifiant aléatoire, et
   n'utilise jamais le nom fourni par le client.
   :::

3. Dans un serveur, une route calcule un rapport statistique qui prend 800 ms de calcul pur. Compare trois
   solutions : laisser le calcul dans le gestionnaire, le lancer dans un processus enfant avec `fork`, le lancer dans
   un worker thread. Laquelle choisis-tu, et comment éviter de créer un worker par requête ?

   :::indice
   Pense au blocage du fil principal, au coût de démarrage, à l'isolation et au coût des échanges.
   :::

   :::solution
   - **Dans le gestionnaire** : 800 ms pendant lesquelles le fil principal ne traite aucune autre requête. Avec
     plusieurs demandes simultanées, les temps de réponse de tout le serveur explosent. À exclure.
   - **Processus enfant avec `fork`** : le calcul ne bloque plus le serveur, et un plantage de l'enfant ne tue pas le
     serveur. Mais démarrer un processus Node coûte des dizaines de millisecondes et beaucoup de mémoire, et les
     échanges passent par une sérialisation entre processus.
   - **Worker thread** : même bénéfice pour la réactivité, démarrage plus léger, échanges plus rapides, transfert
     possible de buffers sans copie. C'est le bon outil pour du calcul JavaScript.

   Je choisis un **groupe de workers** de taille fixe, par exemple le nombre de cœurs moins un, créé au démarrage.
   Les demandes attendent dans une file quand tous les workers sont occupés, ce qui borne aussi la charge. Piscina
   fournit ce groupe prêt à l'emploi. Si le rapport ne change pas à chaque requête, un cache évite même de le
   recalculer : le travail le plus rapide reste celui qu'on ne fait pas.
   :::

## Questions d'entretien

- Quelle différence entre `exec`, `execFile` et `spawn` ?

  :::indice
  Shell, tampon, flux.
  :::

  :::reponse
  `exec` exécute une chaîne dans un shell et renvoie toute la sortie à la fin : pratique pour une commande fixe, mais
  dangereux dès qu'une donnée extérieure entre dans la chaîne, car le shell interprète ses caractères spéciaux.
  `execFile` lance directement un programme avec un tableau d'arguments, sans shell, et tamponne aussi la sortie,
  limitée par `maxBuffer`. `spawn` lance le programme sans shell et expose sa sortie en flux, pour les commandes
  longues ou volumineuses. Par défaut, j'utilise `execFile`, ou `spawn` pour de gros volumes, toujours avec un délai.
  :::

- Worker thread, processus enfant ou cluster : lequel choisir ?

  :::indice
  Que veut-on paralléliser : un calcul, un autre programme, ou le traitement des requêtes ?
  :::

  :::reponse
  Pour un calcul JavaScript lourd qui bloquerait la boucle d'événements, un worker thread, idéalement dans un groupe
  de workers. Pour exécuter un autre programme, comme `git` ou `ffmpeg`, ou isoler un code peu fiable, un processus
  enfant. Pour utiliser tous les cœurs afin de servir davantage de requêtes, plusieurs instances du serveur derrière
  un répartiteur de charge : `node:cluster`, un gestionnaire de processus, ou plusieurs conteneurs orchestrés.
  :::

- Qu'est-ce qu'une injection de commande, et comment l'éviter en Node ?

  :::indice
  Qui interprète `;` et `&` dans une commande ?
  :::

  :::reponse
  C'est l'exécution d'une commande choisie par un attaquant, quand une donnée qu'il contrôle est insérée dans une
  chaîne interprétée par un shell. `exec('convert ' + nom)` avec `nom = 'a.png; curl …'` exécute sa commande. Pour
  l'éviter : ne jamais passer de données extérieures à `exec` ou à `shell: true` ; utiliser `execFile` ou `spawn` avec
  un tableau d'arguments ; valider les entrées par liste blanche ; et, quand c'est possible, ne pas utiliser du tout
  les valeurs du client, en générant soi-même les noms de fichiers.
  :::
