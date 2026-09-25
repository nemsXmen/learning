---
id: javascript-responsabilite-cohesion-couplage
title: "Responsabilité unique, séparation des préoccupations, cohésion et couplage"
slug: responsabilite-cohesion-couplage
technology: javascript
level: advanced
module: code-propre
order: 2
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-nommage-et-petites-unites
  - javascript-composition
skills:
  - js-cohesion-coupling
tags:
  - javascript
  - architecture
  - clean-code
---

## Objectifs

- Appliquer le principe de responsabilité unique : une unité, une raison de changer.
- Séparer les préoccupations : règles métier, accès aux données, présentation, communication.
- Évaluer la cohésion d'un module : ce qui change ensemble reste ensemble.
- Reconnaître les formes de couplage, et réduire celles qui rendent le code fragile.

## Introduction

Le chapitre précédent travaillait à l'échelle de la ligne et de la fonction. On monte d'un cran : comment répartir
le code entre fonctions, modules et fichiers ? Deux mots guident ce choix. La **cohésion** mesure à quel point les
éléments d'un module vont ensemble. Le **couplage** mesure à quel point un module dépend des autres.

L'objectif se résume en une phrase : **forte cohésion, faible couplage**. Un changement de règle métier ne devrait
toucher qu'un endroit, et ce changement ne devrait pas casser dix autres endroits. Le principe de responsabilité
unique et la séparation des préoccupations sont deux façons d'y arriver.

## Concept

**Principe de responsabilité unique** (*Single Responsibility Principle*, le S de SOLID) : une unité de code ne
devrait avoir qu'**une raison de changer**. Une raison de changer, c'est souvent une personne ou un rôle qui
demande des modifications : le service comptable pour le calcul de la TVA, le marketing pour le texte des e-mails,
l'équipe technique pour la base de données.

| Préoccupation | Contient | Change quand… |
| --- | --- | --- |
| règles métier | calculs, validations, décisions | le métier change ses règles |
| accès aux données | requêtes, fichiers, cache | on change de base, de schéma |
| communication | appels HTTP, e-mails, files de messages | on change de fournisseur, de protocole |
| présentation | HTML, JSON de réponse, texte | le design ou le format change |

| Cohésion | Exemple |
| --- | --- |
| forte : une même responsabilité | `facturation.js` : calculer, numéroter, formater une facture |
| faible : un regroupement arbitraire | `utils.js` : dates, prix, chaînes, requêtes HTTP |

| Couplage, du plus fort au plus faible | Exemple |
| --- | --- |
| au contenu | modifier les champs internes d'un autre module |
| par état global partagé | plusieurs modules lisent et écrivent la même variable globale |
| au contrôle | passer un indicateur qui dicte ce que fait l'autre fonction : `traiter(x, 'mode2')` |
| aux données | passer seulement les données nécessaires, en paramètres |

## Exemple

Cette fonction gère une inscription de bout en bout :

```js
async function inscrire(requete, db, smtp) {
  const { email, motDePasse } = requete.body;
  if (!email.includes('@') || motDePasse.length < 12) {
    return { statut: 400, corps: '<p>Données invalides</p>' };
  }
  const existe = await db.query('SELECT id FROM utilisateurs WHERE email = $1', [email]);
  if (existe.rows.length > 0) {
    return { statut: 409, corps: '<p>Adresse déjà utilisée</p>' };
  }
  const id = crypto.randomUUID();
  await db.query('INSERT INTO utilisateurs (id, email) VALUES ($1, $2)', [id, email]);
  await smtp.send({ to: email, subject: 'Bienvenue !', html: `<h1>Bienvenue ${email}</h1>` });
  console.log(`inscription ${id}`);
  return { statut: 201, corps: `<p>Compte ${id} créé</p>` };
}
```

Elle a au moins cinq raisons de changer : les règles de validation, le schéma de la base, le fournisseur d'e-mails,
le texte de bienvenue, le format de la réponse. Pour tester la seule règle « mot de passe de 12 caractères », il faut
simuler une base de données et un serveur SMTP. On sépare les préoccupations :

```js
// Règles métier : pures, sans entrée-sortie.
export function validerInscription({ email, motDePasse }) {
  const erreurs = [];
  if (typeof email !== 'string' || !email.includes('@')) erreurs.push('email invalide');
  if (typeof motDePasse !== 'string' || motDePasse.length < 12) erreurs.push('mot de passe trop court');
  return erreurs;
}

// Cas d'utilisation : orchestre les étapes, sans savoir comment chacune est faite.
export function creerInscription({ utilisateurs, bienvenue, genererId }) {
  return async function inscrire(donnees) {
    const erreurs = validerInscription(donnees);
    if (erreurs.length > 0) return { type: 'invalide', erreurs };
    if (await utilisateurs.existeParEmail(donnees.email)) return { type: 'deja-utilise' };

    const utilisateur = { id: genererId(), email: donnees.email };
    await utilisateurs.ajouter(utilisateur);
    await bienvenue.envoyer(utilisateur);
    return { type: 'cree', utilisateur };
  };
}
```

L'accès aux données, l'envoi d'e-mail et la réponse HTTP vivent dans d'autres modules, chacun avec sa raison de
changer. Tester le cas d'utilisation ne demande plus que des objets simples :

```js
const enregistres = [];
const inscrire = creerInscription({
  utilisateurs: {
    existeParEmail: async (email) => enregistres.some((u) => u.email === email),
    ajouter: async (u) => enregistres.push(u),
  },
  bienvenue: { envoyer: async () => {} },
  genererId: () => 'u-1',
});

console.log(await inscrire({ email: 'ana@exemple.fr', motDePasse: 'correct-horse' }));
// { type: 'cree', utilisateur: { id: 'u-1', email: 'ana@exemple.fr' } }
console.log(await inscrire({ email: 'ana@exemple.fr', motDePasse: 'correct-horse' }));
// { type: 'deja-utilise' }
console.log(await inscrire({ email: 'ana', motDePasse: 'court' }));
// { type: 'invalide', erreurs: [ 'email invalide', 'mot de passe trop court' ] }
```

## Comment ça fonctionne

**« Une raison de changer », pas « une seule chose ».** Le principe de responsabilité unique ne dit pas qu'une
fonction ne doit contenir qu'une ligne. Il dit que les éléments qui changent pour des raisons différentes, et au
rythme de personnes différentes, doivent être séparés. Sinon, une demande du marketing sur le texte de bienvenue
oblige à modifier, relire et retester le code qui touche à la base de données.

**Séparer les préoccupations.** Les règles métier sont la partie la plus précieuse et la plus stable du code : elles
ne devraient dépendre ni de la base, ni de HTTP, ni du fournisseur d'e-mails. Ici, `validerInscription` est une
fonction pure, testable en une ligne. `creerInscription` orchestre, mais reçoit ses collaborateurs : il ne sait pas si
les utilisateurs sont dans PostgreSQL ou dans un tableau. La réponse HTTP, 201 ou 409, est décidée à la frontière,
dans le gestionnaire de route, qui traduit `{ type: 'deja-utilise' }` en statut. Le cas d'utilisation ne connaît pas
HTTP : on pourra l'appeler depuis une commande en ligne ou un traitement par lots.

**La cohésion : ce qui change ensemble reste ensemble.** Un module cohésif regroupe ce qui sert une même
responsabilité. À l'inverse, un dossier `controllers/`, un dossier `services/` et un dossier `models/` dispersent une
même fonctionnalité en trois endroits : ajouter un champ à l'inscription touche les trois. Organiser par
fonctionnalité, `inscription/`, `facturation/`, `catalogue/`, rapproche ce qui change ensemble ; le module suivant
en fera une architecture.

**Le couplage : ce qu'un module sait des autres.** Chaque dépendance est une raison de casser. Le couplage le plus
nocif est le couplage au contenu, où un module manipule les détails internes d'un autre, et l'état global partagé,
où n'importe qui peut modifier une valeur que tout le monde lit. Le couplage au contrôle, un paramètre comme
`mode: 'rapide'` qui change le comportement, signale une fonction qui fait deux choses. Le plus sain est le
couplage aux données : on passe ce qui est nécessaire, et rien de plus.

**Le couplage temporel.** « Appelle `init()` avant `envoyer()`, sinon ça plante » : l'ordre des appels est une
dépendance cachée. On l'élimine en rendant l'objet utilisable dès sa création, par exemple avec une fabrique qui
initialise tout, ou en exigeant les dépendances en paramètres du constructeur.

**Un équilibre.** Découper à l'excès crée d'autres problèmes : dix fichiers de dix lignes à ouvrir pour suivre une
seule fonctionnalité, des interfaces pour des choses qui n'ont qu'une implémentation. On sépare quand les raisons de
changer sont réellement différentes, ou quand une partie a besoin d'être testée ou remplacée seule.

## Erreurs fréquentes

**Mélanger règles métier et entrées-sorties.** Une règle testable seulement avec une base de données est une règle
mal placée.

**Faire décider le statut HTTP par la logique métier.** Le cas d'utilisation renvoie un résultat métier ; la frontière
HTTP le traduit.

**Organiser uniquement par type technique.** `controllers/`, `services/`, `models/` dispersent chaque fonctionnalité.

**Partager un état global modifiable.** Passe les données en paramètres, ou encapsule l'état derrière une interface.

**Passer des indicateurs qui changent le comportement.** Écris deux fonctions nommées.

**Découper sans raison.** Une séparation doit correspondre à une raison de changer, ou à un besoin de test.

## À retenir

- Responsabilité unique : une unité, une raison de changer, souvent liée à un acteur.
- Règles métier, accès aux données, communication et présentation sont des préoccupations distinctes.
- Forte cohésion : ce qui change ensemble est rangé ensemble, de préférence par fonctionnalité.
- Faible couplage : dépendre de peu de choses, et seulement des données nécessaires.
- Les formes nocives : couplage au contenu, état global, indicateurs de contrôle, ordre d'appel caché.
- Un cas d'utilisation qui reçoit ses collaborateurs se teste avec des objets simples.

## Exercices

1. Liste les raisons de changer de ce module, puis propose un découpage en fichiers, avec le rôle de chacun.

   ```js
   // rapport.js
   export async function rapportMensuel(mois) {
     const ventes = await fetch(`https://api.interne/ventes?mois=${mois}`).then((r) => r.json());
     const total = ventes.reduce((s, v) => s + v.montant, 0);
     const tva = total * 0.2;
     const html = `<h1>Rapport ${mois}</h1><p>Total : ${total} €</p><p>TVA : ${tva} €</p>`;
     await envoyerEmail('direction@atelier.fr', `Rapport ${mois}`, html);
   }
   ```

   :::indice
   Qui peut demander un changement de ce code ? L'équipe de l'API, la comptabilité, la direction, l'équipe technique…
   :::

   :::solution
   Raisons de changer : l'adresse ou le format de l'API des ventes ; les règles de calcul, comme le taux de TVA ; la
   mise en forme du rapport ; les destinataires et le mode d'envoi. Découpage :

   - `ventes-api.js` : `lireVentes(mois)`, seul à connaître l'URL et le format de l'API ;
   - `calculs-ventes.js` : `synthese(ventes)`, pure, renvoie `{ total, tva }` avec un taux nommé ;
   - `rapport-html.js` : `formaterRapport(mois, synthese)`, pure, produit le HTML, en échappant les valeurs ;
   - `rapport-mensuel.js` : le cas d'utilisation, qui reçoit ces collaborateurs et un `expediteur`, et enchaîne
     lecture, calcul, mise en forme et envoi.

   ```js
   const TAUX_TVA = 0.2;

   export function synthese(ventes) {
     const total = ventes.reduce((somme, vente) => somme + vente.montant, 0);
     return { total, tva: Math.round(total * TAUX_TVA * 100) / 100 };
   }

   export function creerRapportMensuel({ lireVentes, formaterRapport, expediteur }) {
     return async (mois) => {
       const resume = synthese(await lireVentes(mois));
       await expediteur.envoyer({ sujet: `Rapport ${mois}`, html: formaterRapport(mois, resume) });
       return resume;
     };
   }

   const envoyes = [];
   const rapport = creerRapportMensuel({
     lireVentes: async () => [{ montant: 100 }, { montant: 250.5 }],
     formaterRapport: (mois, { total }) => `<h1>${mois}</h1><p>${total}</p>`,
     expediteur: { envoyer: async (message) => envoyes.push(message) },
   });
   console.log(await rapport('2026-09'), envoyes[0].sujet); // { total: 350.5, tva: 70.1 } Rapport 2026-09
   ```

   Le calcul se teste sans réseau, le HTML sans e-mail, et changer de fournisseur d'e-mails ne touche qu'un module.
   :::

2. Pour chaque extrait, nomme la forme de couplage et propose une correction.

   ```js
   // a)
   panier.lignes.push({ sku, quantite }); // depuis le module de recommandations

   // b)
   export let utilisateurCourant = null; // modifié par la connexion, lu partout

   // c)
   formater(montant, true, false); // true : devise, false : pas de décimales

   // d)
   const client = new ClientPaiement();
   client.configurer(cle); // oublié ? paiement() lève une erreur obscure
   await client.paiement(montant);
   ```

   :::indice
   Qui modifie les données de qui ? Qui dépend de l'ordre des appels ? Qu'est-ce qu'un paramètre de contrôle ?
   :::

   :::solution
   - a) Couplage au contenu : le module de recommandations modifie la structure interne du panier. Correction : le
     panier expose une méthode, `panier.ajouter(sku, quantite)`, qui vérifie ses invariants ; ses lignes sont privées.
   - b) État global partagé et modifiable : n'importe quel module peut changer l'utilisateur courant, et l'ordre
     d'exécution devient important. Correction : passer l'utilisateur en paramètre, ou dans le contexte de la requête.
   - c) Couplage au contrôle, avec des booléens illisibles : deux fonctions, `formaterMontant` et `formaterPrix`, ou
     un objet d'options `{ devise: true, decimales: 0 }`.
   - d) Couplage temporel : `configurer` doit être appelé avant `paiement`. Correction : exiger la clé à la création,
     `new ClientPaiement({ cle })`, pour qu'un client existant soit toujours utilisable.
   :::

3. Une équipe range son API ainsi : `controllers/`, `services/`, `repositories/`, `models/`, chacun contenant un fichier
   par fonctionnalité. Ajouter le champ « téléphone » à l'inscription oblige à modifier quatre dossiers. Propose une
   autre organisation, et explique ce qu'elle change pour la cohésion.

   :::indice
   Ce qui change ensemble devrait être rangé ensemble.
   :::

   :::solution
   On organise par fonctionnalité, en gardant la séparation des préoccupations à l'intérieur de chaque dossier :

   ```text
   src/
   ├── inscription/
   │   ├── regles.js          validation et règles métier
   │   ├── inscrire.js        cas d'utilisation
   │   ├── depot-sql.js       accès aux données
   │   └── routes.js          traduction HTTP
   ├── facturation/
   │   └── …
   └── partage/               le vraiment commun : configuration, journalisation
   ```

   Ajouter le téléphone ne touche plus qu'un dossier, `inscription/`, dont les fichiers changent ensemble : la cohésion
   augmente. Le couplage entre fonctionnalités devient visible : si `facturation` importe un fichier interne de
   `inscription`, cela se voit dans les chemins, et l'on peut exiger de passer par un point d'entrée public. Les
   couches techniques ne disparaissent pas : elles sont à l'intérieur de chaque fonctionnalité.
   :::

## Questions d'entretien

- Explique le principe de responsabilité unique.

  :::indice
  « Une raison de changer », et qui porte cette raison.
  :::

  :::reponse
  Une unité de code, fonction, classe ou module, ne devrait avoir qu'une seule raison de changer. Une raison de
  changer correspond souvent à un acteur : la comptabilité pour un calcul de taxe, le marketing pour un texte, l'équipe
  technique pour la persistance. Si un même module mélange ces préoccupations, une demande de l'un risque de casser ce
  qui sert l'autre, et le module devient difficile à tester. Le principe ne demande pas des fonctions d'une ligne : il
  demande de séparer ce qui évolue pour des raisons différentes.
  :::

- Qu'est-ce que la cohésion et le couplage ? Pourquoi viser forte cohésion et faible couplage ?

  :::indice
  À l'intérieur d'un module, puis entre modules.
  :::

  :::reponse
  La cohésion mesure à quel point les éléments d'un module servent une même responsabilité ; le couplage mesure à
  quel point un module dépend d'autres modules et de leurs détails. Avec une forte cohésion, un changement se fait à
  un seul endroit ; avec un faible couplage, ce changement ne se propage pas. Le code devient plus facile à comprendre,
  à tester et à faire évoluer. Concrètement : organiser par fonctionnalité, exposer une petite interface publique,
  passer des données plutôt que des objets entiers, éviter l'état global et les dépendances à l'ordre des appels.
  :::

- Où placer le choix d'un statut HTTP dans une application bien découpée ?

  :::indice
  Qui connaît HTTP ?
  :::

  :::reponse
  À la frontière HTTP, dans le gestionnaire de route ou le contrôleur. Le cas d'utilisation renvoie un résultat métier,
  comme « créé », « déjà utilisé » ou « invalide » avec la liste des erreurs, et la couche HTTP le traduit en 201, 409 ou
  400. Ainsi, la logique métier ne dépend pas du protocole : on peut l'appeler depuis une commande, une file de
  messages ou un test, et changer la représentation HTTP sans toucher aux règles.
  :::
