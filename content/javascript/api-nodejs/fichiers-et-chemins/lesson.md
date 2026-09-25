---
id: javascript-fichiers-et-chemins
title: "Fichiers et chemins : node:fs et node:path"
slug: fichiers-et-chemins
technology: javascript
level: intermediate
module: api-nodejs
order: 1
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-runtime-node
  - javascript-async-erreurs
skills:
  - js-node-fs-path
tags:
  - javascript
  - nodejs
  - fichiers
---

## Objectifs

- Lire, écrire, lister et supprimer des fichiers et des dossiers avec `node:fs/promises`.
- Choisir entre les API à promesses, à callbacks et synchrones.
- Traiter les erreurs du système de fichiers par leur code : `ENOENT`, `EEXIST`, `EACCES`.
- Construire des chemins portables avec `node:path`, relatifs au script et non au dossier courant.
- Écrire un fichier de façon atomique, et refuser un chemin qui sort d'un dossier autorisé.

## Introduction

Lire un fichier de configuration, écrire un rapport, parcourir un dossier d'images, nettoyer des fichiers
temporaires : c'est le quotidien des scripts et des serveurs Node. Le module `node:fs` donne accès au système de
fichiers, et `node:path` construit des chemins qui fonctionnent aussi bien sous Windows que sous Linux.

Deux pièges guettent : bloquer le fil avec les versions synchrones, et construire des chemins à la main, avec des
`/` et des concaténations, qui cassent sur un autre système ou ouvrent une faille de sécurité.

## Concept

| API | Style | Usage |
| --- | --- | --- |
| `node:fs/promises` | `await readFile(…)` | par défaut, dans les serveurs et les scripts |
| `node:fs`, callbacks | `readFile(…, (erreur, donnees) => …)` | ancien code |
| `node:fs`, synchrone | `readFileSync(…)` | démarrage d'un script ou d'un outil en ligne de commande, jamais dans un serveur qui traite des requêtes |

| Opération | Fonction de `node:fs/promises` |
| --- | --- |
| lire, écrire, ajouter | `readFile(chemin, 'utf8')`, `writeFile(chemin, texte)`, `appendFile` |
| créer un dossier et ses parents | `mkdir(chemin, { recursive: true })` |
| lister | `readdir(dossier, { withFileTypes: true, recursive: true })` |
| informations | `stat(chemin)` : taille, dates, `isFile()`, `isDirectory()` |
| renommer, déplacer, copier | `rename`, `copyFile`, `cp(source, cible, { recursive: true })` |
| supprimer | `rm(chemin, { recursive: true, force: true })` |

| Fonction de `node:path` | Exemple | Résultat sous Linux |
| --- | --- | --- |
| `join` | `join('data', 'notes', '../a.md')` | `data/a.md` |
| `resolve` | `resolve('data', 'a.md')` | `/dossier/courant/data/a.md` : un chemin absolu |
| `dirname`, `basename`, `extname` | `basename('/n/a.md', '.md')` | `a` |
| `relative` | `relative('/n', '/n/x/a.md')` | `x/a.md` |
| `parse` | `parse('/n/a.md')` | `{ root: '/', dir: '/n', base: 'a.md', ext: '.md', name: 'a' }` |

## Exemple

Un script construit l'index d'un dossier de notes Markdown : pour chaque fichier `.md`, son chemin relatif, son
titre et sa taille. Il écrit le résultat dans `index.json`, à côté du script.

```js
// indexer.mjs
import { readdir, readFile, stat, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const dossierNotes = path.join(import.meta.dirname, 'notes');
const fichierIndex = path.join(import.meta.dirname, 'index.json');

async function indexer(dossier) {
  const entrees = await readdir(dossier, { withFileTypes: true, recursive: true });
  const notes = [];
  for (const entree of entrees) {
    if (!entree.isFile() || path.extname(entree.name) !== '.md') continue;
    const chemin = path.join(entree.parentPath, entree.name);
    const [contenu, infos] = await Promise.all([readFile(chemin, 'utf8'), stat(chemin)]);
    const titre = contenu.match(/^# (.+)$/m)?.[1] ?? path.basename(chemin, '.md');
    notes.push({
      chemin: path.relative(dossier, chemin).split(path.sep).join('/'),
      titre,
      octets: infos.size,
    });
  }
  return notes.sort((a, b) => a.chemin.localeCompare(b.chemin));
}

// Écriture atomique : on écrit un fichier temporaire, puis on le renomme.
async function ecrireAtomique(chemin, texte) {
  const temporaire = `${chemin}.${process.pid}.tmp`;
  await writeFile(temporaire, texte);
  await rename(temporaire, chemin);
}

try {
  const notes = await indexer(dossierNotes);
  await ecrireAtomique(fichierIndex, `${JSON.stringify(notes, null, 2)}\n`);
  console.log(`${notes.length} notes indexées`);
} catch (erreur) {
  if (erreur.code === 'ENOENT') {
    console.error(`Dossier introuvable : ${dossierNotes}`);
  } else {
    console.error(erreur);
  }
  process.exitCode = 1;
}
```

Avec `notes/bienvenue.md`, qui commence par `# Bienvenue`, et `notes/projets/atelier.md`, sans titre :

```text
$ node indexer.mjs
2 notes indexées
$ cat index.json
[
  {
    "chemin": "bienvenue.md",
    "titre": "Bienvenue",
    "octets": 32
  },
  {
    "chemin": "projets/atelier.md",
    "titre": "atelier",
    "octets": 24
  }
]
```

## Comment ça fonctionne

**Promesses d'abord.** Les fonctions de `node:fs/promises` délèguent le travail au groupe de fils de libuv : le fil
du JavaScript reste libre pendant que le disque travaille. `readFileSync` fait la même chose en bloquant le fil
jusqu'à la fin : acceptable dans un script qui ne fait rien d'autre, désastreux dans un serveur, où tous les clients
attendent. `Promise.all` lance ici la lecture et le `stat` en parallèle.

**Texte ou octets.** Sans encodage, `readFile` renvoie un `Buffer`, une suite d'octets, vue au chapitre sur les flux.
Avec `'utf8'`, il renvoie une chaîne. `writeFile` accepte l'un ou l'autre, et encode les chaînes en UTF-8 par défaut.

**Les erreurs ont un code.** Une opération qui échoue rejette avec une erreur dont la propriété `code` décrit la
cause, indépendamment de la langue du système : `ENOENT`, le fichier ou le dossier n'existe pas ; `EEXIST`, il
existe déjà ; `EACCES` ou `EPERM`, droits insuffisants ; `EISDIR`, c'est un dossier ; `ENOTEMPTY`, dossier non vide.
On teste `erreur.code`, jamais le texte du message. Pour savoir si un fichier existe, on n'appelle pas `access`
avant de lire : le fichier peut disparaître entre les deux. On tente la lecture et on traite `ENOENT`.

**Des options qui évitent du code.** `mkdir` avec `recursive: true` crée les dossiers parents, et ne rejette pas
si le dossier existe. `rm` avec `recursive: true, force: true` supprime un dossier entier, et ne rejette pas s'il
n'existe pas : c'est le `rm -rf` portable. `readdir` avec `withFileTypes: true` renvoie des objets `Dirent`, qui
disent s'il s'agit d'un fichier ou d'un dossier sans appel supplémentaire ; avec `recursive: true`, il parcourt aussi
les sous-dossiers, et `parentPath` donne le dossier de chaque entrée.

**Écrire de façon atomique.** Si le processus s'arrête au milieu d'un `writeFile`, le fichier reste à moitié écrit, et
le prochain lecteur trouve un JSON invalide. On écrit donc dans un fichier temporaire du même dossier, puis on le
renomme : sur un même système de fichiers, `rename` remplace la cible en une seule opération. Les lecteurs voient
l'ancien contenu ou le nouveau, jamais un mélange.

**Des chemins portables.** Windows sépare les dossiers par `\`, Linux et macOS par `/`. `path.join` utilise le bon
séparateur et normalise les `..` ; `path.sep` le donne. Dans les données qu'on écrit, comme notre index, on normalise
vers `/` pour que le fichier soit identique sur tous les systèmes. `path.resolve` produit toujours un chemin absolu,
en partant du dossier courant.

**Relatif au script, pas au dossier courant.** Un chemin relatif comme `'notes'` est résolu depuis `process.cwd()`,
le dossier d'où l'on **lance** le script. `node outils/indexer.mjs` depuis la racine du projet chercherait `notes` à la
racine. `import.meta.dirname`, le dossier du fichier courant, rend le script indépendant de l'endroit où on le
lance. En CommonJS, c'est `__dirname`.

**La traversée de chemin.** Quand un chemin vient d'un utilisateur, par exemple un nom de fichier dans une URL, une
valeur comme `../../.env` peut sortir du dossier autorisé. On résout le chemin, puis on vérifie qu'il reste dedans :

```js
import path from 'node:path';

function cheminSur(racine, demande) {
  const racineAbsolue = path.resolve(racine);
  const cible = path.resolve(racineAbsolue, demande);
  const relatif = path.relative(racineAbsolue, cible);
  if (relatif.startsWith('..') || path.isAbsolute(relatif)) {
    throw new Error(`Chemin interdit : ${demande}`);
  }
  return cible;
}

console.log(path.basename(cheminSur('publics', 'images/logo.png'))); // logo.png
try {
  cheminSur('publics', '../../.env');
} catch (erreur) {
  console.log(erreur.message); // Chemin interdit : ../../.env
}
```

`path.isAbsolute(relatif)` couvre le cas Windows où la cible est sur un autre disque : `path.relative` renvoie alors
un chemin absolu.

## Erreurs fréquentes

**Utiliser `readFileSync` dans un serveur.** Chaque lecture bloque tous les clients ; utilise `node:fs/promises`.

**Vérifier l'existence avant d'agir.** Entre `access` et `readFile`, le fichier peut changer ; agis, puis traite
`ENOENT`.

**Tester le message d'erreur.** Il dépend du système ; teste `erreur.code`.

**Concaténer des chemins avec `/`.** Utilise `path.join`, qui choisit le séparateur et normalise.

**Résoudre depuis le dossier courant sans le vouloir.** Pars de `import.meta.dirname`.

**Ouvrir un chemin fourni par un utilisateur sans contrôle.** Résous-le et vérifie qu'il reste dans le dossier prévu.

**Écrire directement un fichier que d'autres lisent.** Écris un temporaire, puis renomme-le.

## À retenir

- `node:fs/promises` par défaut ; les versions synchrones seulement hors de tout serveur.
- `'utf8'` pour du texte ; sans encodage, un `Buffer`.
- Les erreurs se reconnaissent à `erreur.code` : `ENOENT`, `EEXIST`, `EACCES`, `EISDIR`.
- `mkdir` et `rm` récursifs, `readdir` avec `withFileTypes` et `recursive`.
- `path.join`, `resolve`, `relative`, `basename`, `extname` ; `import.meta.dirname` pour partir du script.
- Écriture atomique par renommage ; contrôle de traversée pour les chemins venus de l'extérieur.

## Exercices

1. Écris `lireConfiguration(chemin, parDefaut)` qui lit un fichier JSON et le fusionne avec des valeurs par défaut.
   Si le fichier n'existe pas, elle renvoie les valeurs par défaut ; s'il existe mais contient du JSON invalide, elle
   lève une erreur qui cite le fichier. Toute autre erreur est relancée.

   :::indice
   Tente la lecture, et distingue dans le `catch` l'erreur `ENOENT` d'une `SyntaxError` de `JSON.parse`. L'option
   `cause` conserve l'erreur d'origine.
   :::

   :::solution
   ```js
   import { readFile } from 'node:fs/promises';

   async function lireConfiguration(chemin, parDefaut) {
     let texte;
     try {
       texte = await readFile(chemin, 'utf8');
     } catch (erreur) {
       if (erreur.code === 'ENOENT') return { ...parDefaut };
       throw erreur;
     }
     try {
       return { ...parDefaut, ...JSON.parse(texte) };
     } catch (erreur) {
       throw new Error(`Configuration invalide dans ${chemin}`, { cause: erreur });
     }
   }

   console.log(await lireConfiguration('absente.json', { port: 8080, debug: false }));
   // { port: 8080, debug: false }
   ```

   Deux `try` séparés : le premier ne traite que la lecture, le second que l'analyse. Un seul `try` autour des deux
   risquerait de confondre un fichier absent et un JSON cassé.
   :::

2. Écris `nettoyer(dossier, ageMaxJours)`, qui supprime les fichiers d'un dossier, sous-dossiers compris, dont la
   dernière modification date de plus de `ageMaxJours` jours, et renvoie la liste des chemins supprimés, relatifs au
   dossier. Les dossiers eux-mêmes ne sont pas supprimés.

   :::indice
   `readdir` récursif avec `withFileTypes`, `stat(…).mtimeMs`, et `rm`. Calcule la limite une seule fois.
   :::

   :::solution
   ```js
   import { readdir, stat, rm } from 'node:fs/promises';
   import path from 'node:path';

   async function nettoyer(dossier, ageMaxJours) {
     const limite = Date.now() - ageMaxJours * 24 * 60 * 60 * 1000;
     const entrees = await readdir(dossier, { withFileTypes: true, recursive: true });
     const supprimes = [];
     for (const entree of entrees) {
       if (!entree.isFile()) continue;
       const chemin = path.join(entree.parentPath, entree.name);
       const { mtimeMs } = await stat(chemin);
       if (mtimeMs < limite) {
         await rm(chemin, { force: true });
         supprimes.push(path.relative(dossier, chemin).split(path.sep).join('/'));
       }
     }
     return supprimes.sort();
   }
   ```

   `force: true` évite une erreur si un autre processus a supprimé le fichier entre-temps. Pour un très grand
   dossier, on traiterait les fichiers par lots avec `Promise.all`, sans tout lancer d'un coup.
   :::

3. Un serveur de fichiers statiques reçoit un chemin dans l'URL et renvoie le fichier correspondant du dossier
   `publics`. Écris `lireFichierPublic(demande)` qui renvoie le contenu en `Buffer`, lève une erreur `403` pour un
   chemin qui sort du dossier, et `404` pour un fichier absent ou un dossier. Vérifie-la avec `../package.json` et
   `images/%2E%2E/%2E%2E/secret.txt`.

   :::indice
   Décode l'URL avec `decodeURIComponent` **avant** de contrôler le chemin. Une erreur peut porter un `statut`.
   :::

   :::solution
   ```js
   import { readFile } from 'node:fs/promises';
   import path from 'node:path';

   const RACINE = path.resolve('publics');

   function erreurHttp(statut, message) {
     return Object.assign(new Error(message), { statut });
   }

   async function lireFichierPublic(demande) {
     const decode = decodeURIComponent(demande);
     const cible = path.resolve(RACINE, `.${path.posix.sep}${decode}`);
     const relatif = path.relative(RACINE, cible);
     if (relatif.startsWith('..') || path.isAbsolute(relatif)) {
       throw erreurHttp(403, 'Accès interdit');
     }
     try {
       return await readFile(cible);
     } catch (erreur) {
       if (erreur.code === 'ENOENT' || erreur.code === 'EISDIR') throw erreurHttp(404, 'Introuvable');
       throw erreur;
     }
   }

   for (const demande of ['index.html', '../package.json', 'images/%2E%2E/%2E%2E/secret.txt', 'absent.txt']) {
     try {
       const contenu = await lireFichierPublic(demande);
       console.log(demande, '→', contenu.length, 'octets');
     } catch (erreur) {
       console.log(demande, '→', erreur.statut ?? erreur.message);
     }
   }
   ```

   Si l'on contrôlait le chemin avant de le décoder, `%2E%2E` passerait le contrôle puis deviendrait `..`. Le
   préfixe `./` empêche un chemin absolu fourni par le client, comme `/etc/passwd`, de remplacer la racine dans
   `path.resolve`. Dans une vraie application, on utilise un serveur éprouvé, comme `express.static`, qui applique ces
   contrôles.
   :::

## Questions d'entretien

- Pourquoi éviter `fs.readFileSync` dans un serveur HTTP ?

  :::indice
  Combien de fils exécutent le JavaScript de Node ?
  :::

  :::reponse
  Parce que le JavaScript de Node s'exécute sur un seul fil. Pendant une lecture synchrone, ce fil attend le disque
  et ne traite aucune autre requête : un fichier lent ou volumineux fait attendre tous les clients. La version à
  promesses confie la lecture au groupe de fils de libuv et libère le fil principal. Les versions synchrones restent
  acceptables au démarrage d'un programme, par exemple pour lire une configuration avant d'écouter, ou dans un script
  en ligne de commande.
  :::

- Comment savoir si un fichier existe avant de le lire ?

  :::indice
  Pense à ce qui peut se passer entre la vérification et la lecture.
  :::

  :::reponse
  On ne vérifie pas : on tente la lecture et on traite l'erreur `ENOENT`. Une vérification préalable avec `access` ou
  `stat` crée une situation de concurrence : le fichier peut être supprimé ou créé entre la vérification et
  l'opération, et le code doit de toute façon gérer l'échec de la lecture. Tenter puis traiter le code d'erreur est
  plus simple et correct. `stat` reste utile quand on a besoin des informations elles-mêmes : taille, dates, type.
  :::

- Qu'est-ce qu'une attaque par traversée de chemin, et comment s'en protéger ?

  :::indice
  Que devient `path.join('publics', '../../.env')` ?
  :::

  :::reponse
  C'est l'utilisation de `..`, éventuellement encodé en `%2E%2E`, dans un chemin fourni par l'utilisateur pour lire
  ou écrire en dehors du dossier prévu : fichiers de configuration, secrets, code source. Pour s'en protéger, on
  décode d'abord l'entrée, on résout le chemin complet avec `path.resolve` à partir de la racine autorisée, puis on
  vérifie avec `path.relative` que le résultat reste à l'intérieur, sinon on refuse. Mieux encore, on n'accepte que
  des identifiants connus, ou on s'appuie sur un serveur statique éprouvé.
  :::
