---
id: javascript-autorisation-et-controle-d-acces
title: "Autorisation et contrôle d'accès"
slug: autorisation-et-controle-d-acces
technology: javascript
level: advanced
module: api-securisees
order: 3
estimatedMinutes: 45
difficulty: 4
xp: 110
prerequisites:
  - javascript-sessions-jwt-et-refresh-tokens
  - javascript-architecture-hexagonale-et-clean
skills:
  - js-authorization
tags:
  - javascript
  - securite
  - autorisation
---

## Objectifs

- Refuser par défaut, et vérifier les droits à chaque requête, côté serveur.
- Combiner rôles et règles d'appartenance : qui peut faire quoi, sur quelle ressource.
- Reconnaître et corriger les failles d'accès aux objets (IDOR, ou BOLA), aux fonctions et aux propriétés.
- Centraliser les règles dans une politique testable, appliquée dans la couche application.
- Isoler les données des clients dans une application multi-locataire.

## Introduction

Un utilisateur authentifié n'a pas tous les droits. Ana peut lire **ses** factures, pas celles de Bao ; un client peut
passer commande, pas modifier les prix ; une personne du support peut consulter un compte, pas le supprimer. Ces règles
sont l'**autorisation**.

Le contrôle d'accès défaillant est en tête du classement OWASP des risques des applications web, et la faille d'accès aux
objets est la première des risques propres aux API. La raison est simple : l'authentification se configure une fois,
alors que l'autorisation doit être vérifiée dans chaque cas d'utilisation, pour chaque ressource. Un seul oubli suffit.

## Concept

| Faille | Exemple | Contrôle manquant |
| --- | --- | --- |
| accès aux objets (IDOR, BOLA) | `GET /factures/1043` renvoie la facture d'un autre client | cette ressource appartient-elle à l'utilisateur ? |
| accès aux fonctions | un client appelle `DELETE /admin/utilisateurs/7` | cet utilisateur a-t-il ce rôle ? |
| accès aux propriétés | la réponse contient `motDePasseHache`, ou le client modifie `solde` | ce champ peut-il être lu, écrit par lui ? |
| multi-locataire | une requête oublie le filtre par entreprise | la donnée appartient-elle au locataire courant ? |

| Modèle | Décide selon | Exemple |
| --- | --- | --- |
| rôles (RBAC) | le rôle de l'utilisateur | `admin`, `support`, `client` |
| attributs (ABAC) | des attributs de l'utilisateur, de la ressource, du contexte | « le propriétaire, ou le support de la même région, pendant les heures ouvrées » |
| appartenance | le lien entre l'utilisateur et la ressource | `facture.clientId === utilisateur.id` |

| Principe | |
| --- | --- |
| refus par défaut | une action non explicitement autorisée est refusée |
| vérification côté serveur, à chaque requête | cacher un bouton n'est pas une protection |
| moindre privilège | chaque rôle, chaque clé, chaque service n'a que les droits nécessaires |
| une seule politique | les règles vivent en un endroit, testées, et non dispersées dans les routes |

## Exemple

Une politique centralisée, qui répond à « cet utilisateur peut-il faire cette action sur cette ressource ? » :

```js
// autorisations.js
const REGLES = {
  'facture:lire': (u, facture) => u.role === 'support' || facture.clientId === u.id,
  'facture:rembourser': (u) => u.role === 'support',
  'profil:modifier': (u, profil) => profil.id === u.id,
  'utilisateur:supprimer': (u) => u.role === 'admin',
};

export class ErreurAcces extends Error {}

export function peut(utilisateur, action, ressource) {
  const regle = REGLES[action];
  if (!utilisateur || !regle) return false; // refus par défaut
  return utilisateur.role === 'admin' || regle(utilisateur, ressource);
}

export function exiger(utilisateur, action, ressource) {
  if (!peut(utilisateur, action, ressource)) throw new ErreurAcces(`${action} refusé`);
}
```

Le cas d'utilisation applique la politique **après** avoir chargé la ressource, et ne renvoie que les champs prévus :

```js
// lire-facture.js
export function creerLectureFacture({ factures }) {
  return async function lireFacture(utilisateur, id) {
    const facture = await factures.parId(id);
    // Ressource absente ou interdite : même réponse, pour ne pas révéler son existence.
    if (!facture || !peut(utilisateur, 'facture:lire', facture)) return { type: 'introuvable' };
    const { id: numero, total, emiseLe } = facture;
    return { type: 'trouvee', facture: { numero, total, emiseLe } };
  };
}

const donnees = new Map([
  ['f1', { id: 'f1', clientId: 'ana', total: 120, emiseLe: '2026-09-01', noteInterne: 'client difficile' }],
  ['f2', { id: 'f2', clientId: 'bao', total: 80, emiseLe: '2026-09-02', noteInterne: '' }],
]);
const lireFacture = creerLectureFacture({ factures: { parId: async (id) => donnees.get(id) ?? null } });

const ana = { id: 'ana', role: 'client' };
console.log(await lireFacture(ana, 'f1')); // { type: 'trouvee', facture: { numero: 'f1', total: 120, emiseLe: '2026-09-01' } }
console.log(await lireFacture(ana, 'f2')); // { type: 'introuvable' } : la facture de Bao
console.log(await lireFacture({ id: 's1', role: 'support' }, 'f2')); // { type: 'trouvee', … }
console.log(peut(ana, 'facture:supprimer-tout', {})); // false : action inconnue, refus par défaut
```

## Comment ça fonctionne

**L'IDOR, la faille la plus courante.** La route `GET /factures/:id` vérifie que l'utilisateur est connecté, charge la
facture par son identifiant, et la renvoie. Ana change `f1` en `f2` dans l'URL et lit la facture de Bao. Des
identifiants aléatoires, comme des UUID, rendent la devinette plus difficile, mais ne remplacent pas le contrôle : un
identifiant fuit dans un journal, un lien partagé, une autre réponse. La seule protection est de vérifier, **pour chaque
ressource**, que l'utilisateur y a droit.

**404 plutôt que 403.** Répondre « interdit » confirme que la facture `f2` existe. Pour une ressource qui appartient à
quelqu'un d'autre, on répond comme si elle n'existait pas. On garde 403 pour les cas où l'existence n'est pas un secret,
comme une fonction réservée aux administrateurs.

**Une politique, pas des `if` dispersés.** Quand chaque route écrit ses propres conditions, certaines oublient un cas,
d'autres divergent. Une politique centrale, `peut(utilisateur, action, ressource)`, rend les règles lisibles d'un bloc,
testables unitairement, et auditables. Elle **refuse par défaut** : une action absente de la table est interdite. Des
bibliothèques comme CASL formalisent cette approche pour les règles plus riches.

**Où vérifier.** Dans la couche application, là où la ressource est chargée : c'est le seul endroit par lequel passent
tous les canaux, API, ligne de commande, tâches planifiées. Un middleware de route peut vérifier un rôle, mais pas
l'appartenance d'une ressource qu'il n'a pas encore chargée. Et l'interface utilisateur peut masquer un bouton pour le
confort, sans que cela protège quoi que ce soit : l'attaquant appelle l'API directement.

**L'accès aux propriétés.** Renvoyer l'objet complet de la base expose ce qui ne devait pas sortir : haché du mot de
passe, notes internes, marge. On construit explicitement la réponse, champ par champ, comme `lireFacture` ci-dessus. Dans
l'autre sens, on n'accepte en écriture que les champs prévus pour ce rôle : c'est l'affectation de masse, que le schéma
strict du chapitre sur la validation bloque.

**Le multi-locataire.** Dans une application utilisée par plusieurs entreprises, chaque donnée appartient à un
locataire. Le filtre par locataire doit être présent dans **toutes** les requêtes. Pour ne pas dépendre de la mémoire
des développeurs, on le place dans le dépôt, qui reçoit le locataire à sa création, ou dans la base elle-même, avec la
sécurité au niveau des lignes de PostgreSQL.

**Tester l'autorisation.** Pour chaque cas d'utilisation, on teste l'accès autorisé, mais surtout les accès **refusés** :
un autre client, un rôle insuffisant, un autre locataire, un utilisateur absent. Ces tests négatifs sont ceux qu'on
oublie, et ceux qui attrapent les failles.

## Erreurs fréquentes

**Vérifier seulement que l'utilisateur est connecté.** Vérifie aussi qu'il a droit à **cette** ressource.

**Compter sur des identifiants imprévisibles.** Ils ralentissent l'attaquant, ils ne l'arrêtent pas.

**Cacher les boutons au lieu de contrôler l'API.** L'interface ne protège rien.

**Renvoyer l'objet de la base tel quel.** Choisis les champs de la réponse.

**Répondre 403 pour une ressource d'autrui.** Tu confirmes qu'elle existe ; réponds 404.

**Autoriser par défaut les actions non prévues.** Une politique refuse tout ce qu'elle ne connaît pas.

**Oublier le filtre de locataire dans une requête.** Place-le dans le dépôt ou dans la base.

**Ne tester que les accès autorisés.** Les tests d'accès refusés attrapent les failles.

## À retenir

- Authentifié ne veut pas dire autorisé : vérifier chaque action, sur chaque ressource, côté serveur.
- Refus par défaut, moindre privilège, une politique centrale et testée.
- IDOR : contrôler l'appartenance de chaque objet ; répondre 404 pour une ressource d'autrui.
- Choisir les champs lus et écrits ; filtrer par locataire dans le dépôt ou la base.
- Vérifier dans la couche application, là où passent tous les canaux ; l'interface ne protège rien.
- Tester surtout les accès refusés.

## Exercices

1. Cette route permet à un utilisateur de modifier une adresse de livraison. Trouve les deux failles d'autorisation et
   corrige-les.

   ```js
   async function modifierAdresse(utilisateur, idAdresse, corps, { adresses }) {
     if (!utilisateur) throw new Error('Non connecté');
     const adresse = await adresses.parId(idAdresse);
     Object.assign(adresse, corps);
     await adresses.enregistrer(adresse);
     return adresse;
   }
   ```

   :::indice
   À qui appartient l'adresse ? Et quels champs `corps` peut-il écraser ?
   :::

   :::solution
   Première faille, l'accès à l'objet : n'importe quel utilisateur connecté modifie n'importe quelle adresse en changeant
   `idAdresse`. Seconde faille, l'accès aux propriétés : `Object.assign` copie tout le corps, y compris `clientId`, ce qui
   permet de s'approprier ou de transférer une adresse.

   ```js
   const CHAMPS_MODIFIABLES = ['rue', 'codePostal', 'ville', 'pays'];

   async function modifierAdresse(utilisateur, idAdresse, corps, { adresses }) {
     if (!utilisateur) return { type: 'non-authentifie' };
     const adresse = await adresses.parId(idAdresse);
     if (!adresse || adresse.clientId !== utilisateur.id) return { type: 'introuvable' };

     const modifications = Object.fromEntries(
       CHAMPS_MODIFIABLES.filter((champ) => typeof corps[champ] === 'string').map((champ) => [champ, corps[champ].trim()]),
     );
     const miseAJour = { ...adresse, ...modifications };
     await adresses.enregistrer(miseAJour);
     return { type: 'modifiee', adresse: miseAJour };
   }

   const stock = new Map([['a1', { id: 'a1', clientId: 'ana', rue: '1 rue Neuve', codePostal: '69001', ville: 'Lyon', pays: 'FR' }]]);
   const adresses = { parId: async (id) => stock.get(id) ?? null, enregistrer: async (a) => void stock.set(a.id, a) };

   console.log((await modifierAdresse({ id: 'bao' }, 'a1', { ville: 'Paris' }, { adresses })).type); // introuvable
   const resultat = await modifierAdresse({ id: 'ana' }, 'a1', { ville: ' Villeurbanne ', clientId: 'bao' }, { adresses });
   console.log(resultat.adresse.ville, resultat.adresse.clientId); // Villeurbanne ana
   ```

   Le corps est filtré par une liste blanche de champs, et la propriété est vérifiée avant toute modification. En
   production, un schéma strict valide le corps avant d'arriver ici.
   :::

2. Ajoute à la politique du chapitre une règle `commande:annuler` : le client propriétaire peut annuler sa commande tant
   qu'elle n'est pas expédiée ; le support peut annuler toute commande non livrée. Écris les tests des cas autorisés et
   refusés.

   :::indice
   La règle reçoit l'utilisateur et la commande ; teste au moins un cas par rôle et par statut.
   :::

   :::solution
   ```js
   import assert from 'node:assert/strict';

   const REGLES = {
     'commande:annuler': (u, commande) =>
       (u.role === 'support' && commande.statut !== 'livree') ||
       (commande.clientId === u.id && ['brouillon', 'payee'].includes(commande.statut)),
   };

   function peut(utilisateur, action, ressource) {
     const regle = REGLES[action];
     if (!utilisateur || !regle) return false;
     return utilisateur.role === 'admin' || regle(utilisateur, ressource);
   }

   const ana = { id: 'ana', role: 'client' };
   const support = { id: 's1', role: 'support' };
   const commande = (statut, clientId = 'ana') => ({ id: 'c1', clientId, statut });

   // autorisés
   assert.equal(peut(ana, 'commande:annuler', commande('payee')), true);
   assert.equal(peut(support, 'commande:annuler', commande('expediee', 'bao')), true);
   // refusés
   assert.equal(peut(ana, 'commande:annuler', commande('expediee')), false); // trop tard pour le client
   assert.equal(peut(ana, 'commande:annuler', commande('payee', 'bao')), false); // commande d'autrui
   assert.equal(peut(support, 'commande:annuler', commande('livree')), false); // trop tard pour tous
   assert.equal(peut(null, 'commande:annuler', commande('payee')), false); // anonyme
   assert.equal(peut(ana, 'commande:rembourser', commande('payee')), false); // action inconnue
   console.log('politique vérifiée');
   ```

   Les tests négatifs sont plus nombreux que les positifs : ce sont eux qui protègent contre une régression de la règle.
   :::

3. Une application multi-locataire écrit ses requêtes ainsi : `factures.lister({ locataireId: requete.utilisateur.locataireId, statut })`.
   Un développeur a oublié `locataireId` dans une nouvelle route, et un client a vu les factures d'une autre entreprise.
   Propose une conception du dépôt qui rend cet oubli impossible.

   :::indice
   Le locataire ne devrait pas être un paramètre qu'on peut oublier, mais une propriété du dépôt lui-même.
   :::

   :::solution
   On crée un dépôt **par locataire**, au début de chaque requête, et aucune méthode n'accepte de locataire en paramètre :
   il est capturé à la création.

   ```js
   function creerDepotFactures(toutes, locataireId) {
     if (!locataireId) throw new Error('Locataire obligatoire');
     const duLocataire = () => toutes.filter((f) => f.locataireId === locataireId);
     return {
       lister: async ({ statut } = {}) => duLocataire().filter((f) => !statut || f.statut === statut),
       parId: async (id) => duLocataire().find((f) => f.id === id) ?? null,
     };
   }

   const toutes = [
     { id: 'f1', locataireId: 'acme', statut: 'payee' },
     { id: 'f2', locataireId: 'globex', statut: 'payee' },
   ];
   const depot = creerDepotFactures(toutes, 'acme'); // créé à partir de l'utilisateur authentifié
   console.log((await depot.lister()).map((f) => f.id)); // [ 'f1' ]
   console.log(await depot.parId('f2')); // null : la facture d'un autre locataire n'existe pas pour lui
   ```

   Une route ne peut plus oublier le filtre : elle n'a accès qu'au dépôt de son locataire. Avec PostgreSQL, la sécurité
   au niveau des lignes ajoute une seconde barrière dans la base elle-même, qui s'applique même à une requête SQL écrite à
   la main.
   :::

## Questions d'entretien

- Qu'est-ce qu'une faille IDOR, ou BOLA, et comment s'en protéger ?

  :::indice
  Un identifiant dans l'URL, un contrôle d'appartenance manquant.
  :::

  :::reponse
  C'est l'accès à un objet d'un autre utilisateur en changeant simplement son identifiant dans la requête, parce que le
  serveur vérifie que l'utilisateur est connecté, mais pas qu'il a droit à cet objet. On s'en protège en vérifiant,
  pour chaque ressource chargée, l'appartenance ou le droit, dans la couche application, idéalement avec une politique
  centrale qui refuse par défaut. Pour les ressources d'autrui, on répond comme si elles n'existaient pas. Des
  identifiants aléatoires ralentissent l'énumération, mais ne remplacent pas ce contrôle. Et on écrit des tests
  d'accès refusé.
  :::

- RBAC ou ABAC ?

  :::indice
  Rôles, ou attributs de l'utilisateur, de la ressource et du contexte.
  :::

  :::reponse
  Le contrôle par rôles attribue des permissions à des rôles, et des rôles aux utilisateurs : simple et lisible, il
  convient aux permissions fonctionnelles, comme l'accès à l'administration. Il ne suffit pas pour les règles qui
  dépendent de la ressource, comme « le propriétaire de la commande » ou « avant l'expédition ». Le contrôle par attributs
  décide selon des attributs de l'utilisateur, de la ressource et du contexte, et couvre ces cas. En pratique, on combine
  les deux dans une politique : les rôles pour les grandes permissions, des règles d'appartenance et d'état pour chaque
  ressource.
  :::

- Où placer les vérifications d'autorisation dans une application ?

  :::indice
  Par où passent tous les accès à une ressource ?
  :::

  :::reponse
  Côté serveur, dans la couche application, là où la ressource est chargée et où passent tous les canaux : API, ligne de
  commande, tâches planifiées. Un middleware peut filtrer tôt sur l'authentification ou un rôle, mais le contrôle
  d'appartenance demande la ressource elle-même. Les règles sont regroupées dans une politique testée. Les filtres de
  locataire sont intégrés au dépôt, voire à la base. L'interface utilisateur n'adapte l'affichage que pour le confort.
  :::
