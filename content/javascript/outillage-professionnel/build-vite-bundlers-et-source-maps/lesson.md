---
id: javascript-build-vite-bundlers-et-source-maps
title: "Outils de build : Vite, bundlers, configuration d'environnement et source maps"
slug: build-vite-bundlers-et-source-maps
technology: javascript
level: intermediate
module: outillage-professionnel
order: 2
estimatedMinutes: 45
difficulty: 3
xp: 100
prerequisites:
  - javascript-eslint-prettier-et-verification-des-types
  - javascript-code-splitting-et-lazy-loading
skills:
  - js-build-tools
tags:
  - javascript
  - outillage
  - build
---

## Objectifs

- Expliquer ce que fait un bundler : graphe de modules, suppression du code mort, minification, noms hachés, découpage.
- Utiliser Vite : serveur de développement, build de production, prévisualisation.
- Configurer l'application par environnement avec les modes et les fichiers `.env`, sans exposer de secret.
- Produire et utiliser des source maps pour déboguer un code minifié, en production comprise.

## Introduction

Le code qu'on écrit n'est pas celui qu'on envoie aux navigateurs. On écrit des dizaines de modules, avec des noms
lisibles, des commentaires, des dépendances de `node_modules`, parfois du TypeScript ou du JSX. Le navigateur, lui,
gagne à recevoir peu de fichiers, compacts, mis en cache longtemps, et chargés seulement quand il en a besoin.

Entre les deux, un **outil de build** transforme le premier en second. Vite est aujourd'hui l'outil le plus utilisé pour
les nouveaux projets JavaScript ; il repose sur un **bundler**, Rolldown depuis Vite 8. Comprendre ce qu'il fait permet
de configurer un projet sereinement, et de déboguer le code qui tourne vraiment en production.

## Concept

| Étape du build | Effet |
| --- | --- |
| résolution du graphe | à partir du point d'entrée, suivre chaque `import` jusqu'aux feuilles, `node_modules` compris |
| transformation | TypeScript, JSX, CSS, images : tout devient du JavaScript, du CSS et des fichiers statiques |
| suppression du code mort (*tree shaking*) | les exports jamais importés disparaissent |
| découpage (*code splitting*) | chaque `import()` devient un fichier séparé, chargé à la demande |
| minification | noms raccourcis, espaces et commentaires retirés |
| noms hachés | `index-C-1IWzFg.js` : le nom change quand le contenu change, le cache peut durer un an |
| source maps | un fichier `.map` qui relie le code produit au code source |

| Commande Vite | Rôle |
| --- | --- |
| `vite` | serveur de développement, rechargement à chaud |
| `vite build` | build de production dans `dist/` |
| `vite preview` | sert `dist/` localement, pour vérifier le build |
| `vite build --mode staging` | build avec les variables du mode `staging` |

| Variable d'environnement | Visible dans le code client ? |
| --- | --- |
| `VITE_API_URL` dans `.env` | oui : `import.meta.env.VITE_API_URL`, écrite en clair dans le bundle |
| `CLE_SECRETE` dans `.env` | non : sans le préfixe `VITE_`, elle vaut `undefined` côté client |
| `import.meta.env.MODE`, `.DEV`, `.PROD` | oui : le mode courant |

## Exemple

Une petite application : une page, un module de prix dont un export n'est jamais utilisé, et un module de graphiques
chargé à la demande.

```js
// src/prix.js
export const formaterPrix = (centimes) => `${(centimes / 100).toFixed(2).replace('.', ',')} €`;
export const fonctionJamaisUtilisee = () => 'CETTE_CHAINE_NE_DOIT_PAS_ETRE_DANS_LE_BUNDLE';
```

```js
// src/main.js
import { formaterPrix } from './prix.js';

document.querySelector('#prix').textContent = `${formaterPrix(4990)} — API : ${import.meta.env.VITE_API_URL}`;
console.log('mode', import.meta.env.MODE, 'secret visible ?', import.meta.env.CLE_SECRETE);

document.querySelector('#graphiques').addEventListener('click', async () => {
  const { dessiner } = await import('./graphiques.js');
  dessiner(document.querySelector('#prix'));
});
```

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: { sourcemap: true },
});
```

Avec `.env` qui contient `VITE_API_URL=http://localhost:3000` et `CLE_SECRETE=sk_ne_doit_pas_fuiter`, et
`.env.production` qui contient `VITE_API_URL=https://api.boutique.exemple` :

```text
$ npx vite build
✓ 7 modules transformed.
dist/index.html                     0.28 kB │ gzip: 0.21 kB
dist/assets/graphiques-CDUuu0RZ.js  0.12 kB │ gzip: 0.13 kB │ map: 0.27 kB
dist/assets/index-C-1IWzFg.js       2.35 kB │ gzip: 1.20 kB │ map: 1.15 kB
✓ built in 144ms
```

La fin du fichier produit, minifié :

```text
document.querySelector(`#prix`).textContent=`${e(4990)} — API : https://api.boutique.exemple`,
console.log(`mode`,`production`,`secret visible ?`,void 0), … await import(`./graphiques-CDUuu0RZ.js`) …
//# sourceMappingURL=index-C-1IWzFg.js.map
```

Tout ce qu'on attendait s'y lit : l'URL de production a été **écrite en dur**, le mode aussi ; la clé secrète, sans
préfixe `VITE_`, est devenue `void 0` ; `fonctionJamaisUtilisee` a disparu ; le module de graphiques est un fichier
séparé, au nom haché ; et une source map accompagne chaque fichier.

## Comment ça fonctionne

**Pourquoi assembler.** Le navigateur sait charger des modules ES un par un, mais une application réelle en compte des
centaines, avec les dépendances : autant de requêtes en cascade. Le bundler les regroupe en quelques fichiers, retire ce
qui ne sert pas, compresse les noms, et découpe aux frontières `import()` pour que chaque page ne charge que son code.
Les noms hachés permettent de dire au navigateur de garder ces fichiers en cache indéfiniment : une nouvelle version
porte un nouveau nom, et seul `index.html`, qui les référence, doit être revalidé à chaque visite.

**Le tree shaking.** Les modules ES déclarent statiquement ce qu'ils importent et exportent : le bundler sait, sans
exécuter le code, que `fonctionJamaisUtilisee` n'est importée nulle part, et la retire. Il ne peut le faire que si le
module n'a pas d'**effets de bord** à l'import : un module qui modifie une variable globale en étant importé doit être
gardé. Le champ `"sideEffects": false` du `package.json` d'une bibliothèque lui garantit qu'il peut retirer tout module
non utilisé. Et l'on préfère importer une fonction précise plutôt qu'un objet entier par défaut, que le bundler ne peut
pas découper.

**Vite en développement.** En développement, Vite ne regroupe pas l'application : il sert chaque module séparément au
navigateur, qui les charge nativement, et ne transforme que les fichiers demandés. Le démarrage est quasi instantané,
même sur un gros projet. Quand on enregistre un fichier, le rechargement à chaud (*HMR*) remplace ce module dans la page
sans la recharger. En production, `vite build` produit au contraire des fichiers optimisés avec le bundler. On vérifie
toujours le build avec `vite preview` : certains problèmes n'apparaissent qu'en production.

**Configurer par environnement.** Une même application tourne en développement, en préproduction et en production, avec
des URL d'API et des options différentes. Vite charge `.env`, puis `.env.[mode]`, puis leurs variantes `.local`
ignorées par Git ; le mode vaut `development` pour `vite`, `production` pour `vite build`, ou celui qu'on passe avec
`--mode`. Seules les variables préfixées par `VITE_` sont exposées au code client, et elles sont **remplacées par leur
valeur au moment du build**, en clair dans le fichier produit. Deux conséquences : il ne faut jamais y mettre de
secret, et une valeur change seulement en reconstruisant l'application. Pour déployer le même build dans plusieurs
environnements, on lit plutôt la configuration au démarrage, depuis un fichier `config.json` servi à côté, ou depuis
le serveur.

**Les source maps.** Une erreur en production signalée à `index-C-1IWzFg.js:1:1843` est illisible : tout le code tient
sur une ligne aux noms raccourcis. La source map associe chaque position du code produit à un fichier, une ligne et une
colonne du code source, et souvent au code source lui-même. Les outils de développement du navigateur l'utilisent
automatiquement : on pose des points d'arrêt dans `main.js` et l'on voit des noms de variables lisibles. Les services
de suivi d'erreurs, comme Sentry, l'utilisent pour afficher des piles d'appels lisibles.

**Source maps en production.** Publiées avec l'application, elles permettent à n'importe qui de lire le code source,
commentaires compris. Ce n'est pas une faille en soi, le code client est de toute façon public, mais on peut préférer
`sourcemap: 'hidden'` : les fichiers `.map` sont produits sans le commentaire qui les référence, et on les envoie
seulement au service de suivi d'erreurs, sans les déployer.

**Les autres outils.** Webpack a longtemps dominé et reste très répandu ; esbuild et Rolldown, écrits en Go et en Rust,
sont extrêmement rapides ; Rollup reste une référence pour construire des bibliothèques ; les frameworks comme Next.js
intègrent leur propre chaîne de build. Les concepts sont les mêmes partout : graphe, transformation, tree shaking,
découpage, hachage, source maps.

## Erreurs fréquentes

**Mettre un secret dans une variable `VITE_`.** Elle est écrite en clair dans le bundle.

**S'attendre à changer une variable `VITE_` sans reconstruire.** Elle est figée au moment du build.

**Tester seulement avec le serveur de développement.** Vérifie le build avec `vite preview`.

**Des modules avec effets de bord à l'import.** Ils empêchent le tree shaking ; déclare les effets, ou évite-les.

**Mettre en cache `index.html` longtemps.** Les utilisateurs gardent une page qui référence d'anciens fichiers ; cache
long pour les fichiers hachés seulement.

**Désactiver les source maps pour « cacher » le code.** Le code client est public ; produis-les au moins pour le suivi
d'erreurs.

## À retenir

- Un bundler suit le graphe des imports, transforme, supprime le code mort, découpe aux `import()`, minifie et hache les
  noms.
- Vite : modules natifs et rechargement à chaud en développement, build optimisé en production, `preview` pour
  vérifier.
- Modes et fichiers `.env` ; seules les variables `VITE_` sont exposées, en clair et figées au build.
- Noms hachés : cache long pour les fichiers, revalidation d'`index.html`.
- Source maps pour déboguer le code minifié ; `hidden` pour les réserver au suivi d'erreurs.

## Exercices

1. Pour chaque variable, dis où la définir, si elle peut apparaître dans le bundle, et comment le code y accède : l'URL
   de l'API publique, la clé publique d'un service de cartes prévue pour le navigateur, la clé secrète du prestataire de
   paiement, et un indicateur qui active un bandeau « préproduction ».

   :::indice
   Qu'est-ce qui peut être lu par n'importe quel visiteur sans risque ?
   :::

   :::solution
   - URL de l'API : `VITE_API_URL` dans `.env.production` et `.env.staging` ; publique, dans le bundle ;
     `import.meta.env.VITE_API_URL`.
   - Clé publique de cartes : `VITE_CARTES_CLE_PUBLIQUE` ; elle est conçue pour être visible, et on la restreint chez
     le fournisseur aux domaines de l'application.
   - Clé secrète de paiement : jamais côté client. Elle vit dans l'environnement du **serveur**, `process.env`, et le
     client appelle une route du serveur qui utilise la clé.
   - Indicateur de préproduction : `VITE_BANDEAU_PREPROD=true` dans `.env.staging`, lu comme
     `import.meta.env.VITE_BANDEAU_PREPROD === 'true'`, puisque c'est une chaîne ; on construit avec
     `vite build --mode staging`.
   :::

2. Une application affiche en production l'erreur `TypeError: Cannot read properties of undefined (reading 'nom') at
   index-C-1IWzFg.js:1:1843`. Explique comment retrouver la ligne du code source, avec et sans service de suivi d'erreurs.

   :::indice
   Le fichier `.map` relie une position du code produit à une position du code source.
   :::

   :::solution
   Avec un service de suivi d'erreurs comme Sentry, on envoie les source maps au service à chaque déploiement ; il
   traduit automatiquement la pile d'appels, et l'on lit directement `src/panier.js:42`. Sans service, on ouvre les
   outils de développement sur la page de production : si les source maps sont servies, l'onglet Sources affiche les
   fichiers d'origine et la console traduit la pile. Si elles sont produites en mode `hidden`, on peut les charger
   manuellement dans les outils de développement, ou traduire la position avec une bibliothèque comme `source-map` :

   ```js
   // Traduction d'une position avec la bibliothèque source-map (npm install source-map)
   import { readFile } from 'node:fs/promises';
   import { SourceMapConsumer } from 'source-map';

   const carte = JSON.parse(await readFile('dist/assets/index-C-1IWzFg.js.map', 'utf8'));
   const consommateur = await new SourceMapConsumer(carte);
   console.log(consommateur.originalPositionFor({ line: 1, column: 1843 }));
   // par exemple : { source: '../../src/panier.js', line: 42, column: 18, name: 'nom' }
   ```

   Dans tous les cas, il faut conserver les source maps de **chaque** version déployée : la carte d'une autre version ne
   correspond pas.
   :::

3. Après un déploiement, certains utilisateurs voient une page blanche avec `Failed to fetch dynamically imported
   module: /assets/graphiques-Ab12Cd.js`. Le serveur sert `index.html` avec `Cache-Control: max-age=31536000`. Explique
   l'enchaînement, et donne la bonne politique de cache.

   :::indice
   Qui référence les noms hachés, et depuis quand l'utilisateur garde-t-il ce fichier ?
   :::

   :::solution
   `index.html` est mis en cache un an : l'utilisateur garde l'ancienne page, qui référence les anciens fichiers hachés.
   Le déploiement a remplacé ces fichiers par de nouveaux noms, et supprimé les anciens : le chargement échoue. La bonne
   politique :

   - `index.html` : `Cache-Control: no-cache`, pour qu'il soit revalidé à chaque visite ;
   - fichiers hachés de `/assets/` : `Cache-Control: public, max-age=31536000, immutable`, car leur nom change avec leur
     contenu ;
   - conserver les fichiers de la version précédente pendant un moment, pour les onglets restés ouverts, et intercepter
     l'échec de chargement pour proposer de recharger la page, comme on l'a vu au chapitre sur le lazy loading.
   :::

## Questions d'entretien

- Que fait un bundler, et pourquoi en a-t-on encore besoin avec les modules ES natifs ?

  :::indice
  Nombre de requêtes, code mort, cache, transformations.
  :::

  :::reponse
  Il part du point d'entrée, suit le graphe des imports, transforme ce que le navigateur ne comprend pas, comme
  TypeScript ou JSX, retire le code non utilisé, regroupe les modules en quelques fichiers, découpe aux `import()`,
  minifie et donne aux fichiers des noms hachés pour un cache long. Les modules natifs fonctionnent, mais une application
  réelle en compte des centaines, avec les dépendances : charger chacun séparément créerait des cascades de requêtes, sans
  suppression du code mort ni minification. En développement, Vite s'en passe justement, pour démarrer instantanément.
  :::

- Comment gères-tu la configuration par environnement d'une application front-end ?

  :::indice
  Variables exposées, figées au build, et jamais secrètes.
  :::

  :::reponse
  Avec les modes et les fichiers `.env` de l'outil de build : seules les variables préfixées, `VITE_` avec Vite, sont
  exposées au client, remplacées par leur valeur au build et donc visibles de tous ; je n'y mets aucun secret, et les
  secrets restent sur le serveur. Si je veux déployer le même build dans plusieurs environnements, je charge la
  configuration au démarrage, depuis un fichier servi par l'environnement ou une route du serveur, plutôt que de
  reconstruire pour chacun.
  :::

- À quoi servent les source maps, et faut-il les publier en production ?

  :::indice
  Débogage, suivi d'erreurs, visibilité du code.
  :::

  :::reponse
  Elles relient chaque position du code produit, minifié, à la position correspondante dans le code source. Les outils
  de développement et les services de suivi d'erreurs s'en servent pour afficher des piles d'appels et des variables
  lisibles. En production, les publier rend le code source lisible par tous, ce qui n'est pas une faille car le code
  client est public, mais peut exposer des commentaires. Un bon compromis est de les produire en mode caché, et de les
  envoyer seulement au service de suivi d'erreurs, en conservant celles de chaque version déployée.
  :::
