---
id: javascript-http-requete
title: "Requête et réponse HTTP, et les méthodes"
slug: requete-et-reponse
technology: javascript
level: intermediate
module: http
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 70
prerequisites:
  - javascript-async-await
skills:
  - http-basics
tags:
  - javascript
  - http
---

## Objectifs

- Décrire les éléments d'une requête et d'une réponse HTTP.
- Choisir la bonne méthode — `GET`, `POST`, `PUT`, `PATCH`, `DELETE` — selon l'intention.
- Comprendre les notions de méthode sûre et de méthode idempotente, et leurs conséquences.

## Introduction

Chaque chargement de page, chaque appel `fetch`, chaque envoi de formulaire est un échange HTTP : le client
envoie une **requête**, le serveur renvoie une **réponse**. Un développeur JavaScript manipule ces échanges en
permanence, souvent à travers des bibliothèques qui les cachent. Comprendre leur structure permet de lire l'onglet
Réseau, de concevoir une API cohérente, et de savoir quelles requêtes peuvent être rejouées sans danger.

## Concept

Une **requête** comporte :

| Élément | Exemple |
| --- | --- |
| Méthode | `POST` |
| Adresse | `https://api.boutique.exemple/produits?categorie=claviers` |
| En-têtes | `Content-Type: application/json`, `Authorization: Bearer …` |
| Corps (facultatif) | `{"nom": "Souris", "prix": 20}` |

Une **réponse** comporte un **code de statut** (`201`), des **en-têtes** (`Location: /produits/3`) et un **corps**.

Les méthodes expriment l'intention :

| Méthode | Intention | Sûre | Idempotente |
| --- | --- | --- | --- |
| `GET` | lire une ressource | oui | oui |
| `POST` | créer, ou déclencher une action | non | non |
| `PUT` | remplacer entièrement une ressource | non | oui |
| `PATCH` | modifier une partie d'une ressource | non | pas nécessairement |
| `DELETE` | supprimer une ressource | non | oui |

**Sûre** : ne modifie rien côté serveur. **Idempotente** : l'envoyer une ou dix fois produit le même état final.

## Exemple

```js
const API = 'https://api.boutique.exemple';

const lecture = await fetch(`${API}/produits?prixMax=30`); // GET par défaut
console.log(lecture.status, lecture.headers.get('content-type')); // 200 'application/json'
console.log(await lecture.json()); // [{ id: 2, nom: 'Souris', prix: 20 }]

const creation = await fetch(`${API}/produits`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nom: 'Écran', prix: 199 }),
});
console.log(creation.status, creation.headers.get('location')); // 201 '/produits/3'

const modification = await fetch(`${API}/produits/3`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prix: 179 }),
});
console.log((await modification.json()).prix); // 179 : seul le prix a changé

const suppression = await fetch(`${API}/produits/3`, { method: 'DELETE' });
console.log(suppression.status); // 204 : succès, sans corps

const deuxiemeSuppression = await fetch(`${API}/produits/3`, { method: 'DELETE' });
console.log(deuxiemeSuppression.status); // 404 : la ressource n'existe plus, l'état final est le même
```

## Comment ça fonctionne

HTTP est un protocole **sans état** : chaque requête est indépendante, et le serveur ne se souvient pas de la
précédente. Tout ce dont il a besoin — qui fait la demande, dans quelle langue, avec quel format — voyage donc dans
chaque requête, en général dans les en-têtes. Les cookies et les jetons d'authentification existent précisément
pour recréer une continuité par-dessus ce protocole.

La **méthode** indique l'intention, et elle a des conséquences concrètes. Une méthode **sûre** comme `GET` peut
être appelée par un navigateur qui précharge des liens, par un robot d'indexation ou par un cache, sans risque de
modifier quoi que ce soit : une API qui supprime des données sur un `GET` finira par les perdre. Une méthode
**idempotente** peut être rejouée sans effet supplémentaire : si une connexion coupe au milieu d'un `PUT` ou d'un
`DELETE`, le client peut réessayer. Un `POST`, lui, n'est pas idempotent : l'envoyer deux fois peut créer deux
commandes. C'est pourquoi les navigateurs demandent confirmation avant de renvoyer un formulaire, et pourquoi les
nouvelles tentatives automatiques ne concernent normalement que les méthodes idempotentes.

`PUT` et `PATCH` ne se confondent pas. `PUT` envoie la **représentation complète** : une propriété absente du corps
est supprimée ou remise à sa valeur par défaut. `PATCH` envoie seulement les **champs à modifier**. Utiliser `PUT`
avec un objet partiel efface donc des données.

L'**adresse** identifie la ressource : `/produits/3` désigne le produit 3, et la méthode dit ce qu'on en fait. Les
paramètres de requête, après `?`, servent à filtrer, trier ou paginer une collection. Le **corps** transporte les
données envoyées ; son format est annoncé par l'en-tête `Content-Type`. Un `GET` n'a pas de corps.

Enfin, une réponse n'a pas toujours de corps : `204 No Content` signale un succès sans contenu, typique d'une
suppression. Le chapitre suivant détaille les codes de statut et les en-têtes.

## Erreurs fréquentes

**Modifier des données sur un `GET`.** Robots, préchargements et caches le déclencheront.

**Envoyer un objet partiel avec `PUT`.** Les champs absents peuvent être effacés : utilise `PATCH`.

**Réessayer automatiquement un `POST`.** Le risque est de créer deux fois la même ressource.

**Mettre dans l'adresse des données sensibles.** Elles apparaissent dans l'historique et les journaux : utilise le
corps ou les en-têtes.

**Oublier que HTTP est sans état.** Chaque requête doit porter son authentification.

## À retenir

- Requête : méthode, adresse, en-têtes, corps ; réponse : statut, en-têtes, corps.
- `GET` lit, `POST` crée, `PUT` remplace, `PATCH` modifie en partie, `DELETE` supprime.
- Sûre : ne modifie rien. Idempotente : la répéter ne change pas l'état final.
- HTTP est sans état : chaque requête porte tout ce dont le serveur a besoin.
- Seules les requêtes idempotentes se réessaient sans précaution.

## Exercices

1. Pour chaque opération d'une application de réservation, donne la méthode et l'adresse : lister les séances d'un
   film, réserver une place, modifier le nombre de places d'une réservation, annuler une réservation, remplacer
   entièrement le profil de l'utilisateur.

   :::indice
   L'adresse désigne la ressource, la méthode l'intention. Distingue création, modification partielle et remplacement.
   :::

   :::solution
   | Opération | Méthode et adresse |
   | --- | --- |
   | Lister les séances d'un film | `GET /films/42/seances` |
   | Réserver une place | `POST /reservations` |
   | Modifier le nombre de places | `PATCH /reservations/7` |
   | Annuler une réservation | `DELETE /reservations/7` |
   | Remplacer entièrement le profil | `PUT /utilisateurs/moi` |

   La réservation est un `POST` : l'envoyer deux fois réserverait deux places, ce qui justifie de désactiver le bouton
   pendant l'envoi.
   :::

2. Le produit 1 vaut `{ id: 1, nom: 'Clavier', prix: 50 }`. Prédis son contenu après chacune de ces requêtes, envoyées
   sur deux copies indépendantes du produit, puis explique la différence.

   ```js
   await fetch(`${API}/produits/1`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prix: 45 }) });
   await fetch(`${API}/produits/1`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prix: 45 }) });
   ```

   :::indice
   `PATCH` fusionne les champs envoyés ; `PUT` remplace la ressource par ce qui est envoyé.
   :::

   :::solution
   Après le `PATCH` : `{ id: 1, nom: 'Clavier', prix: 45 }` — seul le prix change. Après le `PUT` :
   `{ id: 1, prix: 45 }` — la ressource est **remplacée** par le corps envoyé, et le nom a disparu. Avec `PUT`, le client
   doit envoyer la représentation complète :

   ```js
   const produit = await (await fetch(`${API}/produits/1`)).json();
   await fetch(`${API}/produits/1`, {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ ...produit, prix: 45 }),
   });
   ```
   :::

3. Un double clic sur « Commander » crée deux commandes. Explique pourquoi c'est possible, puis écris `commander` pour
   que le bouton ne puisse pas relancer la requête tant que la première n'est pas terminée.

   :::indice
   Quelle méthode crée la commande, et est-elle idempotente ? Pendant l'envoi, que peut-on faire du bouton ?
   :::

   :::solution
   La création passe par `POST`, qui n'est pas idempotent : deux envois créent deux commandes. On empêche le second
   envoi pendant que le premier est en cours, et l'on réactive le bouton quoi qu'il arrive.

   ```js
   async function commander(bouton, envoyer) {
     if (bouton.disabled) return null;
     bouton.disabled = true;
     try {
       return await envoyer();
     } finally {
       bouton.disabled = false;
     }
   }

   let appels = 0;
   const envoyer = () => new Promise((resolve) => setTimeout(() => resolve(++appels), 20));
   const bouton = { disabled: false };
   const [premier, second] = await Promise.all([commander(bouton, envoyer), commander(bouton, envoyer)]);
   console.log(premier, second, appels); // 1 null 1
   ```

   Côté serveur, une **clé d'idempotence** envoyée dans un en-tête permet en plus de reconnaître et d'ignorer un doublon,
   par exemple après une coupure réseau : c'est ce que font les API de paiement.
   :::

## Questions d'entretien

- Qu'est-ce qu'une méthode idempotente, et pourquoi est-ce important ?

  :::indice
  Pense à une requête dont la réponse s'est perdue en route.
  :::

  :::reponse
  Une méthode est idempotente si l'envoyer une ou plusieurs fois produit le même état final côté serveur : c'est le cas
  de `GET`, `PUT` et `DELETE`, mais pas de `POST`. C'est important parce qu'un client ne sait pas toujours si sa requête
  a abouti — délai dépassé, connexion coupée. Une requête idempotente peut être réessayée sans risque ; une requête non
  idempotente demande une protection, comme une clé d'idempotence, pour ne pas créer de doublon.
  :::

- Quelle différence entre `PUT` et `PATCH` ?

  :::indice
  Que devient un champ absent du corps de la requête ?
  :::

  :::reponse
  `PUT` remplace la ressource entière par la représentation envoyée : un champ absent est supprimé ou réinitialisé.
  `PATCH` applique une modification partielle : seuls les champs envoyés changent. Utiliser `PUT` avec un objet partiel
  efface donc des données. `PUT` est idempotent ; `PATCH` peut ne pas l'être, par exemple s'il incrémente un compteur.
  :::

- Que signifie « HTTP est sans état » ?

  :::indice
  Le serveur se souvient-il de la requête précédente du même client ?
  :::

  :::reponse
  Chaque requête est traitée indépendamment : le serveur ne conserve pas de contexte entre deux échanges au niveau du
  protocole. Toute information nécessaire — identité, préférences, format attendu — doit donc être transmise à chaque
  requête, généralement dans les en-têtes. Les sessions reposent sur des cookies ou des jetons envoyés à chaque fois ;
  ce sont eux qui recréent une continuité par-dessus HTTP.
  :::
