---
id: javascript-fetch
title: "fetch : lire et envoyer des données"
slug: fetch-get-et-post
technology: javascript
level: intermediate
module: fetch
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-http-codes
skills:
  - fetch-basics
tags:
  - javascript
  - http
---

## Objectifs

- Envoyer des requêtes `GET` et `POST` avec `fetch`, et lire la réponse selon son format.
- Traiter correctement les statuts d'erreur, que `fetch` ne signale pas par un rejet.
- Écrire une petite fonction d'accès à une API qui centralise ces règles.

## Introduction

`fetch` est l'API standard pour faire des requêtes HTTP, dans les navigateurs comme dans Node.js. Son interface est
simple, mais deux de ses choix surprennent presque tous les débutants : une réponse `404` ou `500` **n'est pas une
erreur** pour `fetch`, et le corps de la réponse doit être **lu à part**, de façon asynchrone. Ce chapitre montre
comment les apprivoiser, puis comment rassembler ces règles dans une fonction réutilisable.

## Concept

```js
const reponse = await fetch(adresse, { method, headers, body, signal, credentials });
```

| Propriété ou méthode de la réponse | Rôle |
| --- | --- |
| `reponse.ok` | `true` pour un statut de 200 à 299 |
| `reponse.status` | le code de statut |
| `reponse.headers.get(nom)` | lire un en-tête |
| `await reponse.json()` | analyser le corps en JSON |
| `await reponse.text()` | lire le corps en texte |
| `await reponse.blob()` | lire le corps en données binaires, pour une image |

Le corps à envoyer :

| Données | `body` | `Content-Type` |
| --- | --- | --- |
| Objet JSON | `JSON.stringify(objet)` | à indiquer : `application/json` |
| Formulaire, avec fichiers | `new FormData(formulaire)` | ajouté automatiquement |
| Paires clé-valeur | `new URLSearchParams(objet)` | ajouté automatiquement |

La promesse de `fetch` n'est **rompue** qu'en cas d'échec réseau ou d'annulation. Un statut d'erreur donne une
réponse **tenue**, avec `ok` à `false`.

## Exemple

```js
const API = 'https://api.boutique.exemple';

async function requete(chemin, { corps, ...options } = {}) {
  const reponse = await fetch(`${API}${chemin}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(corps !== undefined && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });

  if (!reponse.ok) {
    const details = await reponse.json().catch(() => null);
    throw new Error(details?.erreur ?? `Erreur HTTP ${reponse.status}`);
  }
  return reponse.status === 204 ? null : reponse.json();
}

const produits = await requete('/produits');
console.log(produits.map((p) => p.nom)); // ['Clavier', 'Souris']

const cree = await requete('/produits', { method: 'POST', corps: { nom: 'Écran', prix: 199 } });
console.log(cree.id, cree.nom); // 3 'Écran'

console.log(await requete('/produits/3', { method: 'DELETE' })); // null : réponse 204 sans corps

try {
  await requete('/produits/99');
} catch (erreur) {
  console.log(erreur.message); // 'produit 99 introuvable'
}
```

## Comment ça fonctionne

`fetch` renvoie une promesse tenue **dès que les en-têtes de la réponse sont reçus**, avant que le corps soit téléchargé.
À ce moment, `status`, `ok` et `headers` sont disponibles, mais le contenu ne l'est pas encore : `json()`, `text()` et
`blob()` renvoient une nouvelle promesse, tenue quand le corps a été reçu et analysé. D'où les deux `await`
successifs, et une règle souvent oubliée : le corps est un **flux** qui ne se lit **qu'une fois**. Un second appel à
`json()` sur la même réponse lève une `TypeError`.

La promesse n'est rompue que si la requête n'a pas pu aboutir : réseau coupé, nom de domaine introuvable, requête
bloquée, ou annulation. Une réponse `404` ou `500` est une réponse valide du point de vue du protocole : `fetch` la
renvoie normalement, avec `ok` à `false`. Le code doit donc **tester `ok` ou `status` après chaque requête** ; c'est
la raison principale d'écrire une fonction d'accès commune, comme `requete` dans l'exemple, qui transforme les statuts
d'erreur en exceptions et laisse le reste du code travailler avec des données.

`json()` suppose un corps JSON valide. Une réponse `204` n'a pas de corps, et une erreur renvoyée par un serveur
intermédiaire est souvent une page HTML : dans les deux cas, `json()` lève une `SyntaxError`. On vérifie donc le
statut avant de lire, et l'on protège la lecture du corps d'erreur, qui peut ne pas être du JSON.

Pour envoyer du JSON, deux choses sont nécessaires : sérialiser avec `JSON.stringify`, et déclarer
`Content-Type: application/json`. Sans cet en-tête, la chaîne part en `text/plain`, et beaucoup de serveurs refusent
ou ignorent le corps. Avec `FormData` ou `URLSearchParams`, au contraire, il ne faut **pas** fixer `Content-Type` à la
main : le navigateur l'ajoute, et pour `FormData` il y inclut la délimitation des parties, sans laquelle le serveur ne
peut pas lire les fichiers.

Enfin, les options par défaut comptent : sans `method`, la requête est un `GET` ; `credentials` vaut `same-origin`,
ce qui envoie les cookies à la même origine seulement ; et une réponse de redirection est suivie automatiquement.

## Erreurs fréquentes

**Supposer qu'un statut d'erreur rompt la promesse.** Teste `response.ok`.

**Lire le corps deux fois.** Stocke le résultat de `json()` dans une variable.

**Appeler `json()` sur une réponse `204` ou une page d'erreur HTML.** Vérifie le statut et le type d'abord.

**Oublier `Content-Type: application/json`.** Le serveur reçoit du texte brut.

**Fixer `Content-Type` avec `FormData`.** La délimitation manque, et le serveur ne lit plus rien.

## À retenir

- `fetch` est tenue dès les en-têtes ; le corps se lit ensuite, une seule fois, avec `json()` ou `text()`.
- Un statut d'erreur ne rompt pas la promesse : teste `ok` après chaque requête.
- JSON : `JSON.stringify` et `Content-Type: application/json` ; `FormData` : pas de `Content-Type` manuel.
- Une réponse `204` n'a pas de corps.
- Une fonction d'accès commune centralise en-têtes, erreurs et lecture du corps.

## Exercices

1. Ce code affiche une liste vide au lieu d'un message d'erreur quand l'API renvoie `500`, puis plante sur `map`.
   Explique pourquoi, et corrige.

   ```js
   async function afficherCommandes() {
     const reponse = await fetch('/api/commandes');
     const commandes = await reponse.json();
     return commandes.map((c) => c.numero);
   }
   ```

   :::indice
   Que fait `fetch` d'un statut `500` ? Et que contient alors le corps ?
   :::

   :::solution
   `fetch` ne rompt pas sa promesse pour un `500` : le code lit le corps d'erreur, par exemple `{ "erreur": "…" }`, puis
   appelle `map` sur un objet, ce qui lève une `TypeError` sans rapport avec la vraie cause.

   ```js
   async function afficherCommandes(adresse) {
     const reponse = await fetch(adresse);
     if (!reponse.ok) {
       throw new Error(`Chargement des commandes impossible (${reponse.status})`);
     }
     const commandes = await reponse.json();
     return commandes.map((c) => c.numero);
   }
   ```

   L'erreur levée décrit maintenant le vrai problème, et la couche d'interface peut afficher un message adapté.
   :::

2. Un formulaire d'envoi d'avatar contient un champ `nom` et un fichier. Écris l'appel qui l'envoie à `/avatars` en
   `POST`, puis explique pourquoi ajouter `headers: { 'Content-Type': 'multipart/form-data' }` casserait l'envoi.

   :::indice
   `new FormData(formulaire)` ou `formData.append(nom, valeur)` ; regarde l'en-tête que le navigateur calcule seul.
   :::

   :::solution
   ```js
   const donnees = new FormData();
   donnees.append('nom', 'Ada');
   donnees.append('avatar', new File(['…'], 'ada.png', { type: 'image/png' }));

   const requete = new Request('https://api.boutique.exemple/avatars', { method: 'POST', body: donnees });
   console.log(requete.headers.get('content-type').startsWith('multipart/form-data; boundary=')); // true

   // Dans la page : await fetch('/avatars', { method: 'POST', body: donnees });
   ```

   L'en-tête calculé contient une **délimitation** (`boundary`) qui sépare les parties du corps. En fixant
   `Content-Type` à la main, on supprime cette délimitation : le serveur ne sait plus où commence chaque champ et ne peut
   pas lire le fichier.
   :::

3. Ajoute à la fonction `requete` de l'exemple une option `parametres`, un objet transformé en chaîne de requête, et
   utilise-la pour obtenir les produits à 30 € maximum.

   :::indice
   `new URLSearchParams(parametres).toString()` produit une chaîne correctement encodée.
   :::

   :::solution
   ```js
   async function requete(chemin, { corps, parametres, ...options } = {}) {
     const requeteTexte = parametres ? `?${new URLSearchParams(parametres)}` : '';
     const reponse = await fetch(`${API}${chemin}${requeteTexte}`, {
       ...options,
       headers: {
         Accept: 'application/json',
         ...(corps !== undefined && { 'Content-Type': 'application/json' }),
         ...options.headers,
       },
       body: corps === undefined ? undefined : JSON.stringify(corps),
     });
     if (!reponse.ok) {
       const details = await reponse.json().catch(() => null);
       throw new Error(details?.erreur ?? `Erreur HTTP ${reponse.status}`);
     }
     return reponse.status === 204 ? null : reponse.json();
   }

   const abordables = await requete('/produits', { parametres: { prixMax: 30 } });
   console.log(abordables.map((p) => p.nom)); // ['Souris']
   ```
   :::

## Questions d'entretien

- Pourquoi `fetch` ne rompt-il pas sa promesse pour une réponse `404` ?

  :::indice
  Du point de vue du protocole, la requête a-t-elle échoué ?
  :::

  :::reponse
  Parce qu'une réponse `404` ou `500` est une réponse HTTP valide : le serveur a bien reçu la requête et répondu. `fetch`
  ne rompt sa promesse que lorsqu'aucune réponse n'a pu être obtenue — erreur réseau, requête bloquée ou annulée. C'est au
  code de tester `response.ok` ou `response.status`, en général dans une fonction d'accès commune qui transforme les
  statuts d'erreur en exceptions explicites.
  :::

- Pourquoi faut-il deux `await` pour obtenir les données d'une réponse ?

  :::indice
  Quand la promesse de `fetch` est-elle tenue ?
  :::

  :::reponse
  La promesse de `fetch` est tenue dès que les en-têtes sont reçus, ce qui permet de lire le statut et de décider
  quoi faire avant de télécharger un corps potentiellement volumineux. Le corps arrive ensuite sous forme de flux, et
  `json()` ou `text()` renvoient une seconde promesse, tenue une fois le corps entièrement lu et analysé. Ce flux ne peut
  être consommé qu'une fois.
  :::

- Comment envoyer du JSON, puis un formulaire avec un fichier ?

  :::indice
  Le `Content-Type` se fixe à la main dans un cas, et surtout pas dans l'autre.
  :::

  :::reponse
  Pour du JSON, on sérialise l'objet avec `JSON.stringify` et l'on déclare `Content-Type: application/json`. Pour un
  formulaire avec fichier, on passe un `FormData` comme `body` sans fixer `Content-Type` : l'environnement ajoute
  `multipart/form-data` avec la délimitation des parties, indispensable au serveur. Il en va de même pour
  `URLSearchParams`, envoyé en `application/x-www-form-urlencoded`.
  :::
