---
id: javascript-evenements-flux-et-buffers
title: "Événements, flux et buffers"
slug: evenements-flux-et-buffers
technology: javascript
level: advanced
module: api-nodejs
order: 3
estimatedMinutes: 50
difficulty: 4
xp: 100
prerequisites:
  - javascript-fichiers-et-chemins
  - javascript-iterateurs-asynchrones
skills:
  - js-node-events-streams
tags:
  - javascript
  - nodejs
  - streams
---

## Objectifs

- Émettre et écouter des événements avec `EventEmitter`, et traiter l'événement `error`.
- Manipuler des octets avec `Buffer` : encodages, taille en octets, caractères coupés en deux.
- Traiter de gros volumes avec les flux : lisibles, inscriptibles, de transformation.
- Assembler des flux avec `pipeline`, qui gère les erreurs, la fermeture et la contre-pression.
- Lire un fichier ligne par ligne avec une mémoire constante.

## Introduction

Beaucoup d'objets de Node **émettent des événements** : un serveur émet `request`, un fichier en cours de lecture émet
`data` puis `end`, un processus émet `exit`. Tous héritent d'une même classe, `EventEmitter`.

Et beaucoup de données arrivent **par morceaux** : un fichier de journal de plusieurs gigaoctets, le corps d'une
requête HTTP, la sortie d'une commande. Les charger en entier en mémoire est lent, parfois impossible. Les **flux**,
les *streams*, les traitent morceau par morceau, avec une mémoire constante. Ces morceaux sont des **buffers**, des
suites d'octets. Ces trois notions forment le socle des entrées-sorties de Node.

## Concept

| `EventEmitter` | Rôle |
| --- | --- |
| `on(nom, f)`, `once(nom, f)`, `off(nom, f)` | ajouter, ajouter pour une fois, retirer un écouteur |
| `emit(nom, ...args)` | appeler les écouteurs, **synchronement**, dans l'ordre d'ajout |
| événement `error` | sans écouteur, `emit('error', e)` lève l'erreur |
| `once(emetteur, nom)` de `node:events` | une promesse du prochain événement |

| Flux | Exemples | On… |
| --- | --- | --- |
| lisible, `Readable` | `fs.createReadStream`, requête HTTP côté serveur, `process.stdin` | lit : `for await`, `pipeline` |
| inscriptible, `Writable` | `fs.createWriteStream`, réponse HTTP, `process.stdout` | écrit : `write`, `end` |
| transformation, `Transform` | `zlib.createGzip()`, un filtre de lignes | lit d'un côté, écrit de l'autre |
| duplex | un socket TCP | lit et écrit, indépendamment |

| `Buffer` | |
| --- | --- |
| créer | `Buffer.from('café', 'utf8')`, `Buffer.alloc(16)` |
| convertir | `buffer.toString('utf8' \| 'hex' \| 'base64')` |
| taille | `buffer.length` en octets ; `Buffer.byteLength(texte)` |
| assembler, découper | `Buffer.concat([a, b])`, `buffer.subarray(debut, fin)` |

## Exemple

Un journal d'accès de 97 Mo, deux millions de lignes. On compte les réponses en erreur 500, d'abord en lisant tout le
fichier, puis ligne par ligne :

```js
import { readFile } from 'node:fs/promises';

const texte = await readFile('acces.log', 'utf8');
let erreurs = 0;
for (const ligne of texte.split('\n')) {
  if (ligne.split(' ')[3] === '500') erreurs += 1;
}
console.log(erreurs);
```

```js
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const lignes = createInterface({ input: createReadStream('acces.log'), crlfDelay: Infinity });
let erreurs = 0;
for await (const ligne of lignes) {
  if (ligne.split(' ')[3] === '500') erreurs += 1;
}
console.log(erreurs);
```

Mêmes résultats, 117 648 erreurs. Mais la première version a occupé jusqu'à 258 Mo de mémoire : le fichier entier,
en chaîne, plus le tableau de deux millions de lignes. La seconde n'a jamais dépassé 78 Mo, dont l'essentiel est la
mémoire de base de Node : elle ne garde qu'un morceau de 64 Ko et la ligne en cours. Sur un fichier de 10 Go, la
première échouerait ; la seconde consommerait toujours la même mémoire.

## Comment ça fonctionne

**`EventEmitter`.** C'est le motif observateur de Node. `emit` appelle les écouteurs **immédiatement et dans
l'ordre**, pas plus tard : un écouteur lent retarde celui qui émet. Une classe l'étend pour émettre ses propres
événements :

```js
import { EventEmitter, once } from 'node:events';

class Telechargement extends EventEmitter {
  demarrer(tailles) {
    let recu = 0;
    for (const taille of tailles) {
      recu += taille;
      this.emit('progression', recu);
    }
    this.emit('fin', recu);
  }
}

const telechargement = new Telechargement();
telechargement.on('progression', (octets) => console.log(`${octets} octets`));
const fin = once(telechargement, 'fin'); // une promesse du prochain 'fin'
telechargement.demarrer([100, 250, 50]);
const [total] = await fin;
console.log('terminé :', total);
// 100 octets
// 350 octets
// 400 octets
// terminé : 400
```

L'événement `error` est spécial : émis sans écouteur, il **lève** l'erreur, et arrête le processus si personne ne
l'attrape. Tout flux ou serveur doit donc avoir un gestionnaire d'erreur, directement ou via `pipeline`. Enfin, au
onzième écouteur ajouté au même événement, Node affiche `MaxListenersExceededWarning` : c'est presque toujours une
fuite, un écouteur ajouté à chaque requête et jamais retiré.

**Les buffers sont des octets.** Un `Buffer` est un `Uint8Array` avec des méthodes en plus. La chaîne `'café'` a
quatre caractères, mais cinq octets en UTF-8, car `é` en occupe deux : `c3 a9`. Pour une limite de taille, un en-tête
`Content-Length` ou un quota, on compte des octets avec `Buffer.byteLength`, pas des caractères. `subarray` ne copie
pas : il partage la mémoire du buffer d'origine, et modifier l'un modifie l'autre.

**Un caractère coupé en deux.** Les morceaux d'un flux sont découpés par taille, sans égard aux caractères : un `é`
peut avoir son premier octet à la fin d'un morceau et le second au début du suivant. Convertir chaque morceau en
chaîne séparément produit alors `caf��`. `stream.setEncoding('utf8')`, `readline`, ou un `TextDecoder` utilisé avec
`{ stream: true }` gardent les octets incomplets pour le morceau suivant.

**Assembler des flux : `pipeline`.** Pour compresser un fichier, on relie un flux lisible, une transformation et un
flux inscriptible. `pipeline`, de `node:stream/promises`, fait passer les données, renvoie une promesse, et surtout
gère les cas difficiles : si une étape échoue, les autres sont détruites et les fichiers fermés.

```js
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

await pipeline(createReadStream('acces.log'), createGzip(), createWriteStream('acces.log.gz'));
console.log('archive créée');
```

L'ancienne méthode `lisible.pipe(inscriptible)` ne propage pas les erreurs et ne ferme pas les autres flux en cas
d'échec : on préfère `pipeline`.

**La contre-pression.** Si le flux lisible produit plus vite que l'inscriptible ne consomme, par exemple un disque
rapide vers un réseau lent, les données s'accumulent en mémoire. Pour l'éviter, `write` renvoie `false` quand le
tampon interne est plein ; il faut alors attendre l'événement `drain` avant d'écrire de nouveau. `pipeline` et
`for await` le font pour vous. Quand on écrit soi-même dans une boucle, on respecte ce signal :

```js
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';

const sortie = createWriteStream('nombres.txt');
for (let i = 0; i < 1_000_000; i++) {
  if (!sortie.write(`${i}\n`)) {
    await once(sortie, 'drain'); // le tampon est plein : on attend qu'il se vide
  }
}
sortie.end();
await once(sortie, 'finish');
console.log('écrit');
```

**Écrire ses propres flux.** Un générateur, synchrone ou asynchrone, peut servir de flux lisible avec
`Readable.from`, et une fonction génératrice asynchrone peut servir d'étape de transformation dans `pipeline` : elle
reçoit le flux précédent, qu'elle parcourt avec `for await`, et produit ses morceaux avec `yield`. C'est souvent plus
simple que d'étendre la classe `Transform`.

## Erreurs fréquentes

**Lire entièrement un fichier potentiellement gros.** `readFile` sur un journal de plusieurs gigaoctets épuise la
mémoire ; lis-le en flux.

**Oublier l'écouteur `error`.** Une erreur de flux ou de serveur non écoutée arrête le processus.

**Utiliser `pipe` au lieu de `pipeline`.** Les erreurs ne sont pas propagées, et les fichiers restent ouverts.

**Ignorer la valeur de retour de `write`.** Les données s'accumulent en mémoire ; attends `drain`.

**Convertir chaque morceau en chaîne séparément.** Un caractère multi-octets coupé en deux devient illisible.

**Compter des caractères au lieu d'octets.** `'café'.length` vaut 4, mais le texte occupe 5 octets.

**Ajouter un écouteur à chaque requête sans le retirer.** C'est une fuite mémoire, signalée par
`MaxListenersExceededWarning`.

## À retenir

- `EventEmitter` : `on`, `once`, `off`, `emit` synchrone ; `error` sans écouteur lève l'erreur.
- `once(emetteur, nom)` transforme un événement en promesse.
- Un `Buffer` contient des octets : `Buffer.byteLength` pour les tailles, `setEncoding` ou `TextDecoder` pour décoder
  des morceaux.
- Les flux traitent des données de taille quelconque avec une mémoire constante.
- `pipeline` relie les flux, propage les erreurs, ferme tout et gère la contre-pression.
- `write` qui renvoie `false` : attendre `drain` ; `readline` pour lire ligne par ligne.

## Exercices

1. Écris une classe `Minuteur`, qui étend `EventEmitter` : `demarrer(secondes)` émet `tic` chaque seconde avec le
   nombre de secondes restantes, puis `fin`. `arreter()` stoppe le minuteur et émet `annule`. Écris aussi une
   fonction `attendreFin(minuteur)` qui renvoie une promesse résolue à `fin` et rejetée à `annule`.

   :::indice
   `setInterval` et `clearInterval`. Pour la promesse, deux écouteurs `once`, dont chacun retire l'autre.
   :::

   :::solution
   ```js
   import { EventEmitter } from 'node:events';

   class Minuteur extends EventEmitter {
     #intervalle = null;

     demarrer(secondes) {
       let restantes = secondes;
       this.#intervalle = setInterval(() => {
         restantes -= 1;
         this.emit('tic', restantes);
         if (restantes === 0) {
           this.#stopper();
           this.emit('fin');
         }
       }, 1000);
     }

     arreter() {
       if (this.#intervalle === null) return;
       this.#stopper();
       this.emit('annule');
     }

     #stopper() {
       clearInterval(this.#intervalle);
       this.#intervalle = null;
     }
   }

   function attendreFin(minuteur) {
     return new Promise((resoudre, rejeter) => {
       const surFin = () => {
         minuteur.off('annule', surAnnule);
         resoudre();
       };
       const surAnnule = () => {
         minuteur.off('fin', surFin);
         rejeter(new Error('Minuteur annulé'));
       };
       minuteur.once('fin', surFin);
       minuteur.once('annule', surAnnule);
     });
   }

   const minuteur = new Minuteur();
   minuteur.on('tic', (restantes) => console.log(`${restantes} s`));
   minuteur.demarrer(3);
   await attendreFin(minuteur);
   console.log('terminé');
   // 2 s
   // 1 s
   // 0 s
   // terminé
   ```

   Chaque écouteur retire l'autre : sans cela, l'écouteur inutilisé resterait attaché et s'accumulerait à chaque
   appel d'`attendreFin`.
   :::

2. Écris un script qui extrait d'un journal d'accès les lignes en erreur 500, et les écrit dans un fichier compressé
   `erreurs.log.gz`, sans jamais charger le fichier entier. Utilise `pipeline` avec une étape de filtrage écrite
   comme une fonction génératrice asynchrone.

   :::indice
   L'étape reçoit un flux de `Buffer` : il faut reconstituer les lignes, en gardant la fin incomplète d'un morceau
   pour le suivant. `setEncoding` n'est pas disponible sur la source dans `pipeline` : décode avec un `TextDecoder`.
   :::

   :::solution
   ```js
   import { createReadStream, createWriteStream } from 'node:fs';
   import { pipeline } from 'node:stream/promises';
   import { createGzip } from 'node:zlib';

   async function* lignesEnErreur(source) {
     const decodeur = new TextDecoder();
     let reste = '';
     for await (const morceau of source) {
       const texte = reste + decodeur.decode(morceau, { stream: true });
       const lignes = texte.split('\n');
       reste = lignes.pop(); // la dernière ligne est peut-être incomplète
       for (const ligne of lignes) {
         if (ligne.split(' ')[3] === '500') yield `${ligne}\n`;
       }
     }
     reste += decodeur.decode();
     if (reste.split(' ')[3] === '500') yield `${reste}\n`;
   }

   await pipeline(
     createReadStream('acces.log'),
     lignesEnErreur,
     createGzip(),
     createWriteStream('erreurs.log.gz'),
   );
   console.log('erreurs extraites');
   ```

   La mémoire reste constante : un morceau, une ligne incomplète et les tampons de compression. Si le fichier source
   n'existe pas, `pipeline` rejette avec `ENOENT` et détruit le fichier de sortie en cours d'écriture.
   :::

3. Explique pourquoi ce code affiche parfois des caractères illisibles sur un fichier en français, et corrige-le de
   deux façons.

   ```js
   import { createReadStream } from 'node:fs';

   let texte = '';
   for await (const morceau of createReadStream('roman.txt')) {
     texte += morceau.toString();
   }
   console.log(texte.length);
   ```

   :::indice
   Que se passe-t-il quand la frontière entre deux morceaux tombe au milieu d'un `é` ?
   :::

   :::solution
   Les morceaux sont découpés tous les 64 Ko, sans tenir compte des caractères. Quand un caractère de deux octets,
   comme `é`, est coupé entre deux morceaux, chaque moitié est décodée seule et devient le caractère de remplacement
   `�`. Première correction : demander au flux de décoder lui-même, en gardant les octets incomplets.

   ```js
   import { createReadStream } from 'node:fs';

   let texte = '';
   for await (const morceau of createReadStream('roman.txt', { encoding: 'utf8' })) {
     texte += morceau; // des chaînes, correctement découpées
   }
   console.log(texte.length);
   ```

   Seconde correction : un `TextDecoder` en mode flux, utile quand on ne contrôle pas la création du flux.

   ```js
   import { createReadStream } from 'node:fs';

   const decodeur = new TextDecoder();
   let texte = '';
   for await (const morceau of createReadStream('roman.txt')) {
     texte += decodeur.decode(morceau, { stream: true });
   }
   texte += decodeur.decode(); // vide le reste
   console.log(texte.length);
   ```

   Si l'on veut tout le texte en mémoire de toute façon, `readFile(chemin, 'utf8')` est plus simple ; les flux
   servent quand on peut traiter les données au fil de l'eau.
   :::

## Questions d'entretien

- Qu'est-ce qu'un flux en Node.js, et pourquoi l'utiliser ?

  :::indice
  Mémoire, temps de première réponse, composition.
  :::

  :::reponse
  Un flux traite des données morceau par morceau au lieu de les charger en entier : un fichier, une requête HTTP,
  la sortie d'une commande. La mémoire reste constante, quelle que soit la taille des données, et le traitement
  commence dès le premier morceau : un serveur peut renvoyer un fichier compressé pendant qu'il le lit. Les flux se
  composent : lecture, transformation, écriture, reliées par `pipeline`, qui propage les erreurs, ferme les ressources
  et gère la contre-pression. Il y en a quatre sortes : lisible, inscriptible, duplex et transformation.
  :::

- Qu'est-ce que la contre-pression ?

  :::indice
  Que se passe-t-il si on lit un disque rapide pour écrire sur un réseau lent ?
  :::

  :::reponse
  C'est le mécanisme qui ralentit un producteur quand le consommateur ne suit pas. Sans elle, les données produites
  s'accumulent en mémoire jusqu'à l'épuiser. En Node, `write` renvoie `false` quand le tampon interne d'un flux
  inscriptible dépasse son seuil ; le producteur doit alors attendre l'événement `drain`. `pipeline` et `pipe` mettent
  en pause le flux lisible automatiquement ; quand on écrit soi-même dans une boucle, on doit respecter ce signal.
  :::

- Que se passe-t-il quand un `EventEmitter` émet `error` sans écouteur ?

  :::indice
  C'est le seul événement qui a ce comportement.
  :::

  :::reponse
  `emit('error', erreur)` lève l'erreur de façon synchrone. Si personne ne l'attrape, c'est une exception non gérée,
  et le processus s'arrête. C'est voulu : une erreur ignorée en silence serait pire. Chaque flux, serveur ou socket
  doit donc avoir un écouteur `error`, ou être utilisé à travers `pipeline` ou une API à promesses qui transforme
  l'erreur en rejet.
  :::
