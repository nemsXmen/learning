---
id: javascript-builder-adapter-facade
title: "Builder, Adapter et Facade"
slug: builder-adapter-facade
technology: javascript
level: advanced
module: design-patterns
order: 1
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-fabrique-singleton
  - javascript-composition-et-inversion-des-dependances
skills:
  - js-structural-patterns
tags:
  - javascript
  - architecture
  - design-patterns
---

## Objectifs

- Construire un objet complexe étape par étape avec un *builder*, et savoir quand un objet d'options suffit.
- Adapter une bibliothèque ou un service externe au contrat de l'application avec un *adapter*.
- Offrir une interface simple sur un ensemble de modules avec une *facade*.
- Distinguer ces trois patterns, et reconnaître leurs formes idiomatiques en JavaScript.

## Introduction

Les patterns de conception sont des solutions nommées à des problèmes récurrents. Leur premier intérêt est le
vocabulaire : dire « on met un adaptateur devant l'API de paiement » transmet une intention précise en une phrase. La
partie sur les patterns objet a présenté la fabrique, le singleton, le dépôt, la stratégie et l'observateur. Ce module
complète le catalogue, en partant des besoins d'une vraie application.

Les trois patterns de ce chapitre répondent à des questions de **construction** et de **frontière** : comment créer un
objet qui a beaucoup de parties facultatives ? Comment brancher un service dont l'API ne ressemble pas à la nôtre ?
Comment rendre simple l'usage d'un ensemble de modules compliqué ?

## Concept

| Pattern | Problème | Solution | Forme idiomatique en JavaScript |
| --- | --- | --- | --- |
| *Builder* | un objet à beaucoup de parties facultatives, avec des règles entre elles | construire étape par étape, valider à la fin | méthodes chaînées et `construire()` ; souvent, un simple objet d'options |
| *Adapter* | une API externe qui ne correspond pas à notre contrat | un objet qui traduit notre contrat vers l'API | une fabrique qui renvoie un objet au bon format ; `util.promisify` |
| *Facade* | un ensemble de modules compliqué à orchestrer | une interface simple qui coordonne les modules | un module qui exporte quelques fonctions de haut niveau |

## Exemple

**Un builder** pour une recherche de produits, avec des parties facultatives et des règles de cohérence :

```js
class RechercheProduits {
  #criteres;

  constructor(criteres = {}) {
    this.#criteres = Object.freeze({ ...criteres });
  }

  // Chaque étape renvoie un nouveau builder : on peut partager une base sans effet de bord.
  #avec(ajout) {
    return new RechercheProduits({ ...this.#criteres, ...ajout });
  }

  texte(texte) {
    return this.#avec({ texte: texte.trim() });
  }
  categorie(categorie) {
    return this.#avec({ categorie });
  }
  prixEntre(min, max) {
    return this.#avec({ prixMin: min, prixMax: max });
  }
  trierPar(champ, ordre = 'asc') {
    return this.#avec({ tri: `${champ}:${ordre}` });
  }
  page(numero, taille = 20) {
    return this.#avec({ page: numero, taille });
  }

  construire() {
    const { prixMin, prixMax, page = 1, taille = 20 } = this.#criteres;
    if (prixMin !== undefined && prixMax !== undefined && prixMin > prixMax) {
      throw new RangeError('Le prix minimum dépasse le prix maximum');
    }
    if (taille > 100) throw new RangeError('100 résultats par page au maximum');
    const parametres = new URLSearchParams();
    for (const [cle, valeur] of Object.entries({ ...this.#criteres, page, taille })) {
      if (valeur !== undefined && valeur !== '') parametres.set(cle, String(valeur));
    }
    return `/produits?${parametres}`;
  }
}

const base = new RechercheProduits().categorie('luminaires');
console.log(base.texte('lampe laiton').prixEntre(20, 150).trierPar('prix').construire());
// /produits?categorie=luminaires&texte=lampe+laiton&prixMin=20&prixMax=150&tri=prix%3Aasc&page=1&taille=20
console.log(base.page(3).construire());
// /produits?categorie=luminaires&page=3&taille=20
```

**Un adapter** pour deux fournisseurs de SMS aux API différentes, derrière le contrat de l'application,
`{ envoyer(destinataire, message) }` :

```js
// Deux API externes, qu'on ne contrôle pas.
const fournisseurA = {
  async sendMessage({ to, body, sender }) {
    return { id: `A-${to}`, status: 'queued', sender, length: body.length };
  },
};
const fournisseurB = {
  async post(chemin, charge) {
    return { ok: true, chemin, numero: charge.numero };
  },
};

// Les adaptateurs traduisent notre contrat vers chaque API.
function adapterFournisseurA(client, { expediteur }) {
  return {
    async envoyer(destinataire, message) {
      const reponse = await client.sendMessage({ to: destinataire, body: message, sender: expediteur });
      return { idExterne: reponse.id };
    },
  };
}

function adapterFournisseurB(client) {
  return {
    async envoyer(destinataire, message) {
      const reponse = await client.post('/v2/sms', { numero: destinataire, texte: message });
      if (!reponse.ok) throw new Error('Envoi du SMS refusé');
      return { idExterne: `B-${reponse.numero}` };
    },
  };
}

for (const sms of [adapterFournisseurA(fournisseurA, { expediteur: 'ATELIER' }), adapterFournisseurB(fournisseurB)]) {
  console.log(await sms.envoyer('+33600000000', 'Votre commande est prête.'));
}
// { idExterne: 'A-+33600000000' }
// { idExterne: 'B-+33600000000' }
```

## Comment ça fonctionne

**Builder : construire, puis valider.** Un constructeur avec dix paramètres facultatifs est illisible, et les règles
qui relient plusieurs parties, comme « prix minimum inférieur au maximum », n'ont pas d'endroit naturel. Le builder
sépare la **description** de l'objet, étape par étape, de sa **construction**, qui vérifie les règles et produit un
résultat valide. Ici, chaque étape renvoie un nouveau builder immuable : `base` sert à construire deux recherches
différentes sans que l'une modifie l'autre. Beaucoup de bibliothèques utilisent ce pattern : les constructeurs de
requêtes SQL comme Knex ou Kysely, les schémas de validation comme zod, les clients HTTP.

**Mais souvent, un objet d'options suffit.** En JavaScript, un objet littéral nomme déjà chaque paramètre :
`rechercher({ categorie: 'luminaires', prixMax: 150 })`. Une fonction qui le valide joue le rôle de `construire()`. Le
builder se justifie quand la construction se fait **en plusieurs endroits**, par exemple des filtres ajoutés au fil
des choix de l'utilisateur, quand l'ordre des étapes compte, ou quand l'API chaînée rend le code appelant nettement
plus lisible.

**Adapter : protéger l'application des API externes.** Le reste de l'application ne connaît que le contrat
`envoyer(destinataire, message)`. Les noms de champs du fournisseur, `to`, `body`, `numero`, ses formats de réponse et
ses erreurs restent dans l'adaptateur. Changer de fournisseur, ou en utiliser deux, ne touche qu'un fichier. C'est la
mise en pratique de l'inversion des dépendances : l'adaptateur est le détail qui se conforme au contrat. Les SDK de
paiement, de cartographie ou d'e-mail, les anciennes API à callbacks, et même `util.promisify`, qui adapte une fonction
à callback en fonction à promesse, sont des cas d'adaptation.

**L'adaptateur traduit aussi les erreurs.** Une erreur propre au fournisseur, avec ses codes à lui, devient une erreur
de l'application : « envoi refusé », « destinataire invalide », « service indisponible ». Sans cela, la logique métier
finirait par tester les codes d'erreur d'un fournisseur précis.

**Facade : une porte d'entrée simple.** Publier un article peut demander d'optimiser les images, de les stocker, de
mettre à jour l'index de recherche et de purger un cache. Une facade expose une fonction, `publierArticle(article)`, qui
coordonne ces modules dans le bon ordre. Les appelants n'ont plus à connaître les sous-systèmes, ni l'ordre des appels.
La différence avec l'adaptateur : l'adaptateur **convertit** une interface existante vers une autre, un pour un ; la
facade **simplifie** l'accès à plusieurs modules. Un module ES bien conçu, qui n'exporte que quelques fonctions de
haut niveau, est déjà une facade.

**Le risque de la facade.** Une facade qui grossit sans cesse devient un module fourre-tout, que tout le monde
importe. On la garde centrée sur un domaine, et l'on n'y met pas de règles métier : elle orchestre.

## Erreurs fréquentes

**Un builder pour trois options.** Un objet d'options est plus simple ; réserve le builder aux constructions
complexes ou progressives.

**Un builder mutable partagé.** Modifier une base commune la change pour tous ceux qui l'utilisent ; renvoie un
nouveau builder à chaque étape.

**Laisser fuir l'API externe hors de l'adaptateur.** Si la logique métier lit `reponse.status === 'queued'`, changer de
fournisseur la casse.

**Laisser passer les erreurs brutes du fournisseur.** Traduis-les en erreurs de l'application.

**Mettre des règles métier dans une facade.** Elle coordonne ; les règles restent dans le domaine.

**Confondre adaptateur et facade.** L'un convertit une interface, l'autre simplifie plusieurs modules.

## À retenir

- Builder : décrire étape par étape, valider et produire dans `construire()` ; immuable pour pouvoir partager une base.
- En JavaScript, un objet d'options remplace souvent un builder.
- Adapter : traduit notre contrat vers une API externe, y compris ses erreurs ; changer de fournisseur ne touche qu'un
  fichier.
- Facade : une interface simple qui orchestre plusieurs modules, sans règles métier.
- Adapter convertit, facade simplifie.

## Exercices

1. Une ancienne bibliothèque de géolocalisation expose `geocode(adresse, callback)`, où le callback reçoit
   `(erreur, resultat)` et `resultat` vaut `{ lat, lng, precision: 'ROOFTOP' | 'APPROXIMATE' }`. Écris un adaptateur qui
   respecte le contrat de l'application : `localiser(adresse)` renvoie une promesse de
   `{ latitude, longitude, exacte }`, et rejette avec une `Error` au message en français si l'adresse est introuvable
   (l'ancienne API renvoie alors l'erreur `'ZERO_RESULTS'`).

   :::indice
   `util.promisify` adapte la forme callback ; l'adaptateur traduit ensuite les noms de champs et les erreurs.
   :::

   :::solution
   ```js
   import { promisify } from 'node:util';

   // L'ancienne bibliothèque, simulée
   const ancienneLib = {
     geocode(adresse, callback) {
       setTimeout(() => {
         if (adresse.includes('inconnue')) callback(new Error('ZERO_RESULTS'));
         else callback(null, { lat: 45.76, lng: 4.84, precision: 'ROOFTOP' });
       }, 5);
     },
   };

   function creerGeolocalisation(lib) {
     const geocode = promisify(lib.geocode.bind(lib));
     return {
       async localiser(adresse) {
         try {
           const { lat, lng, precision } = await geocode(adresse);
           return { latitude: lat, longitude: lng, exacte: precision === 'ROOFTOP' };
         } catch (erreur) {
           if (erreur.message === 'ZERO_RESULTS') {
             throw new Error(`Adresse introuvable : ${adresse}`, { cause: erreur });
           }
           throw new Error('Service de géolocalisation indisponible', { cause: erreur });
         }
       },
     };
   }

   const geo = creerGeolocalisation(ancienneLib);
   console.log(await geo.localiser('1 place Bellecour, Lyon'));
   // { latitude: 45.76, longitude: 4.84, exacte: true }
   await geo.localiser('rue inconnue').catch((erreur) => console.log(erreur.message));
   // Adresse introuvable : rue inconnue
   ```

   `bind(lib)` conserve le `this` de la bibliothèque. L'erreur d'origine reste accessible dans `cause`, pour les
   journaux, sans que la logique métier dépende de `'ZERO_RESULTS'`.
   :::

2. Écris une facade `creerPublication({ images, stockage, index, cache })` qui expose `publierArticle(article)` :
   optimiser chaque image, les stocker, enregistrer l'article avec les URL des images, l'indexer pour la recherche,
   puis purger le cache de la page d'accueil. Si l'indexation échoue, l'article reste publié, mais l'échec est
   signalé dans le résultat.

   :::indice
   La facade orchestre, dans l'ordre. `Promise.all` pour les images, un `try` autour de l'indexation seulement.
   :::

   :::solution
   ```js
   function creerPublication({ images, stockage, index, cache }) {
     return {
       async publierArticle(article) {
         const urls = await Promise.all(
           article.images.map(async (image) => stockage.stocker(await images.optimiser(image))),
         );
         const publie = await stockage.enregistrerArticle({ ...article, images: urls, publieLe: new Date() });

         let indexe = true;
         try {
           await index.indexer(publie);
         } catch {
           indexe = false; // la recherche sera rattrapée par une réindexation planifiée
         }
         await cache.purger('/');
         return { id: publie.id, indexe };
       },
     };
   }

   const journal = [];
   const publication = creerPublication({
     images: { optimiser: async (image) => `${image}.webp` },
     stockage: {
       stocker: async (fichier) => `https://cdn.exemple/${fichier}`,
       enregistrerArticle: async (article) => (journal.push('article'), { ...article, id: 'a1' }),
     },
     index: { indexer: async () => { throw new Error('index indisponible'); } },
     cache: { purger: async (chemin) => journal.push(`purge ${chemin}`) },
   });

   console.log(await publication.publierArticle({ titre: 'Relier un carnet', images: ['couverture', 'etape1'] }));
   console.log(journal);
   // { id: 'a1', indexe: false }
   // [ 'article', 'purge /' ]
   ```

   Les appelants, une route HTTP ou un script d'import, n'appellent plus qu'une fonction. Chaque sous-système reste
   remplaçable, et testable seul. La facade ne décide d'aucune règle éditoriale : elle enchaîne les étapes.
   :::

3. Pour chaque besoin, dis s'il appelle un builder, un adapter, une facade, ou simplement un objet d'options, et
   justifie en une phrase.
   - a) Créer un utilisateur avec un nom, un e-mail et un rôle facultatif.
   - b) Brancher un nouveau fournisseur de paiement dont l'API renvoie des montants en chaînes et des statuts en
     anglais.
   - c) Composer une requête de rapport à partir de filtres que l'utilisateur ajoute et retire au fil de sa navigation.
   - d) Offrir aux autres équipes une seule fonction pour « clôturer le mois » : bloquer les écritures, calculer les
     soldes, générer les PDF, les archiver et prévenir la comptabilité.

   :::indice
   Combien de parties, construites où ? Une API à convertir, ou plusieurs modules à orchestrer ?
   :::

   :::solution
   - a) Un objet d'options : trois champs, construits en une fois ; `creerUtilisateur({ nom, email, role })` est lisible
     et se valide dans la fonction.
   - b) Un adapter : il convertit notre contrat de paiement vers l'API du fournisseur, montants et statuts compris, et
     traduit ses erreurs.
   - c) Un builder, immuable : la requête se construit progressivement, en plusieurs endroits, et doit être validée
     quand on l'exécute.
   - d) Une facade : une interface simple qui orchestre plusieurs sous-systèmes dans le bon ordre, sans que les
     autres équipes aient à les connaître.
   :::

## Questions d'entretien

- Quelle différence entre un adapter et une facade ?

  :::indice
  Convertir, ou simplifier ?
  :::

  :::reponse
  L'adapter convertit une interface existante en une autre, attendue par le client : il se place devant un seul
  composant, par exemple une API de paiement externe, et le rend conforme au contrat de l'application, y compris pour
  les erreurs. La facade offre une interface simplifiée sur un ensemble de composants : elle orchestre plusieurs
  modules derrière quelques fonctions de haut niveau. Les deux protègent le reste du code des détails, mais pour des
  raisons différentes.
  :::

- Quand utiliser un builder en JavaScript, alors qu'on a les objets littéraux ?

  :::indice
  Pense à une construction progressive, et à des règles entre les parties.
  :::

  :::reponse
  Un objet d'options suffit dans la plupart des cas, car il nomme déjà chaque paramètre. Le builder devient utile
  quand l'objet se construit progressivement, en plusieurs endroits du code ; quand l'ordre ou la combinaison des
  étapes obéit à des règles qu'on veut vérifier au moment de construire ; ou quand une API chaînée rend l'intention
  plus lisible, comme pour un constructeur de requêtes SQL. Je le rends immuable, pour qu'une base partagée ne soit
  jamais modifiée par erreur.
  :::

- Pourquoi mettre un adapter devant un SDK externe, même si on n'a qu'un fournisseur ?

  :::indice
  Qui dépend de quoi, et comment teste-t-on ?
  :::

  :::reponse
  Pour que l'application dépende de son propre contrat, et pas des détails du fournisseur : noms de champs, formats,
  codes d'erreur, versions de l'API. Les changements du SDK, une migration vers un autre fournisseur ou un second
  fournisseur de secours ne touchent qu'un fichier. Les tests de la logique métier utilisent un faux qui respecte le
  contrat, sans réseau. Et l'adaptateur est l'endroit naturel pour traduire les erreurs, journaliser et mesurer les
  appels externes.
  :::
