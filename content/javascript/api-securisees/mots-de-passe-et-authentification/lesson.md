---
id: javascript-mots-de-passe-et-authentification
title: "Authentification et hachage des mots de passe"
slug: mots-de-passe-et-authentification
technology: javascript
level: advanced
module: api-securisees
order: 1
estimatedMinutes: 45
difficulty: 4
xp: 110
prerequisites:
  - javascript-validation-secrets-et-dependances
skills:
  - js-password-auth
tags:
  - javascript
  - securite
  - authentification
---

## Objectifs

- Distinguer authentification et autorisation.
- Stocker un mot de passe avec un hachage lent et salé : argon2id, scrypt ou bcrypt, jamais un simple SHA-256.
- Vérifier un mot de passe en temps constant, et faire évoluer les paramètres de hachage sans réinitialiser les comptes.
- Concevoir une connexion qui ne révèle pas quels comptes existent, et une réinitialisation de mot de passe sûre.
- Savoir ce qu'apportent la double authentification et les clés d'accès (*passkeys*).

## Introduction

L'**authentification** répond à la question « qui es-tu ? » ; l'**autorisation**, au chapitre suivant mais un, à la
question « as-tu le droit de faire ceci ? ». Tout commence par la première : si un attaquant peut se faire passer pour
un utilisateur, les meilleures règles d'accès ne servent à rien.

Le mot de passe reste le moyen d'authentification le plus répandu, et sa conservation est une responsabilité lourde. Les
bases de données fuient : par une injection, une sauvegarde mal protégée, un accès interne. Ce jour-là, la question
n'est plus « la base a-t-elle fui ? », mais « combien de temps faudra-t-il pour retrouver les mots de passe à partir de
ce qu'elle contient ? ». La bonne réponse est : trop longtemps pour que ce soit rentable.

## Concept

| Stockage | Verdict |
| --- | --- |
| en clair | inacceptable : la fuite de la base livre tous les mots de passe |
| chiffré | inacceptable : qui obtient la clé déchiffre tout, et le serveur n'a jamais besoin de relire un mot de passe |
| SHA-256, MD5, même salé | insuffisant : conçus pour être rapides, des milliards d'essais par seconde sur une carte graphique |
| argon2id, scrypt, bcrypt | correct : lents, salés, et gourmands en mémoire pour argon2id et scrypt |

| Pour chaque mot de passe | Rôle |
| --- | --- |
| un **sel** aléatoire, unique | deux mots de passe identiques donnent deux hachés différents ; les tables précalculées sont inutiles |
| un **facteur de coût** | règle le temps et la mémoire d'un calcul, qu'on augmente avec le matériel |
| un format qui garde les paramètres | `scrypt$N$r$p$sel$haché` : on peut changer les paramètres plus tard |

| Parcours de connexion | Bonne pratique |
| --- | --- |
| identifiant ou mot de passe faux | un seul message, « Identifiants incorrects », et un temps de réponse comparable |
| essais répétés | limitation de débit par compte et par adresse, vue plus loin |
| mot de passe oublié | jeton aléatoire, à usage unique, de courte durée, stocké haché |
| comptes sensibles | double authentification, ou clés d'accès |

## Exemple

Un module de hachage avec `scrypt`, intégré à Node, et les paramètres recommandés par l'OWASP :

```js
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const PARAMETRES = { N: 2 ** 17, r: 8, p: 1 }; // coût ; environ 128 Mo de mémoire par calcul
const LONGUEUR = 64;

export async function hacherMotDePasse(motDePasse) {
  const sel = randomBytes(16);
  const { N, r, p } = PARAMETRES;
  const hache = await scryptAsync(motDePasse.normalize('NFKC'), sel, LONGUEUR, { N, r, p, maxmem: 256 * 1024 * 1024 });
  return ['scrypt', N, r, p, sel.toString('base64'), hache.toString('base64')].join('$');
}

export async function verifierMotDePasse(motDePasse, stocke) {
  const [algo, N, r, p, sel, attendu] = stocke.split('$');
  if (algo !== 'scrypt') return false;
  const attenduOctets = Buffer.from(attendu, 'base64');
  const calcule = await scryptAsync(motDePasse.normalize('NFKC'), Buffer.from(sel, 'base64'), attenduOctets.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: 256 * 1024 * 1024,
  });
  return timingSafeEqual(calcule, attenduOctets);
}

const stocke = await hacherMotDePasse('correct horse battery staple');
console.log(stocke.split('$').slice(0, 4).join('$')); // scrypt$131072$8$1
console.log(await verifierMotDePasse('correct horse battery staple', stocke)); // true
console.log(await verifierMotDePasse('Correct horse battery staple', stocke)); // false
console.log(stocke === (await hacherMotDePasse('correct horse battery staple'))); // false : un sel différent
```

Mesuré dans Node 22 sur un poste de développement : un SHA-256 prend environ 3 microsecondes, ce scrypt environ 700
millisecondes. Pour un attaquant qui teste des mots de passe candidats contre une base volée, chaque essai coûte plus de
200 000 fois plus cher.

## Comment ça fonctionne

**Pourquoi « lent » est une qualité.** Un utilisateur légitime calcule le haché une fois par connexion : une fraction de
seconde passe inaperçue. Un attaquant qui a volé la base doit le calculer pour chaque mot de passe candidat et chaque
compte : des milliards de fois. Les fonctions rapides, comme SHA-256, sont faites pour vérifier des fichiers, et une
carte graphique en calcule des milliards par seconde. argon2id et scrypt ajoutent un coût en **mémoire**, qui rend les
cartes graphiques et les circuits spécialisés beaucoup moins efficaces. L'OWASP recommande argon2id en premier choix,
avec la bibliothèque `argon2` ; scrypt, disponible dans `node:crypto` sans dépendance, est un bon choix ; bcrypt reste
acceptable, mais tronque les mots de passe au-delà de 72 octets.

**Le sel.** Sans sel, deux utilisateurs au même mot de passe ont le même haché, et un attaquant peut précalculer les
hachés des mots de passe courants une fois pour toutes. Un sel aléatoire, différent pour chaque mot de passe et stocké à
côté du haché, oblige à attaquer chaque compte séparément. Il n'est pas secret.

**Des paramètres dans le haché.** En stockant l'algorithme et ses paramètres avec le haché, on peut les renforcer plus
tard : à la prochaine connexion réussie, on connaît le mot de passe en clair, on vérifie avec les anciens paramètres,
puis on le hache de nouveau avec les nouveaux et on met à jour la base. Aucun utilisateur n'a à changer son mot de passe.
Le calcul étant lent, on utilise la version **asynchrone**, exécutée dans le groupe de fils de libuv : le fil principal
continue de servir les autres requêtes.

**La comparaison en temps constant.** Une comparaison ordinaire s'arrête au premier octet différent : sa durée révèle,
en théorie, combien d'octets sont corrects. `timingSafeEqual` compare toujours tous les octets. Le risque est faible
pour des hachés de mots de passe, mais la règle vaut pour tout secret comparé : jetons, signatures, codes.

**Ne pas révéler les comptes.** « Aucun compte avec cet e-mail » d'un côté, « mot de passe incorrect » de l'autre :
l'attaquant sait quels e-mails sont inscrits, et peut cibler ces comptes. On répond le même message dans les deux cas.
Et comme la vérification d'un vrai compte prend 700 ms, répondre instantanément pour un compte inexistant trahirait
aussi l'information : on calcule un haché factice dans ce cas. La réinitialisation de mot de passe répond de même :
« Si un compte existe, un e-mail a été envoyé. »

**Réinitialiser un mot de passe.** On génère un jeton aléatoire long, avec `randomBytes(32)`, envoyé par e-mail ; on en
stocke seulement un **haché** rapide, SHA-256 suffit ici car le jeton est aléatoire et long, avec une expiration courte,
comme 30 minutes, et on l'invalide après usage. Après la réinitialisation, on ferme les autres sessions de l'utilisateur.

**Les règles de mot de passe.** Les recommandations actuelles, comme celles du NIST (SP 800-63B), privilégient la
**longueur** plutôt que les règles de composition : leur dernière révision demande au moins 15 caractères quand le mot de
passe est le seul facteur, 8 quand il est complété par un second facteur, des phrases de passe acceptées jusqu'à 64
caractères au moins, et le refus des mots de passe connus pour avoir fui. On n'impose pas de changement périodique
sans raison, qui pousse à des variantes prévisibles.

**Au-delà du mot de passe.** La double authentification, par application TOTP ou clé physique, protège même si le mot
de passe est volé. Les **clés d'accès**, ou *passkeys*, basées sur WebAuthn, remplacent le mot de passe par une paire de
clés liée au site : rien à retenir, rien à hacher côté serveur, et aucune possibilité d'hameçonnage.

## Erreurs fréquentes

**Hacher avec SHA-256 ou MD5, même salés.** Ils sont rapides : utilise argon2id, scrypt ou bcrypt.

**Un sel unique pour toute l'application.** Chaque mot de passe a son propre sel aléatoire.

**Chiffrer les mots de passe.** Le serveur n'a jamais besoin de les relire ; on hache.

**Hacher de façon synchrone dans un serveur.** Chaque connexion bloquerait tous les clients ; utilise la version
asynchrone.

**Des messages d'erreur qui distinguent e-mail inconnu et mot de passe faux.** Ils révèlent les comptes existants.

**Stocker le jeton de réinitialisation en clair, sans expiration.** Hache-le, limite sa durée, invalide-le après usage.

**Journaliser les corps de requête de connexion.** Les mots de passe finissent en clair dans les journaux.

## À retenir

- Authentification : qui es-tu ; autorisation : as-tu le droit.
- Mots de passe : hachage lent, salé, gourmand en mémoire ; argon2id, scrypt ou bcrypt ; jamais SHA-256 seul.
- Stocker l'algorithme et les paramètres avec le haché, et rehacher à la connexion quand ils évoluent.
- Comparer les secrets avec `timingSafeEqual` ; hacher de façon asynchrone.
- Même message et même durée pour un compte inconnu et un mot de passe faux.
- Jetons de réinitialisation aléatoires, hachés, courts et à usage unique ; double authentification et clés d'accès.

## Exercices

1. Écris `connecter(email, motDePasse, { utilisateurs })`, qui renvoie `{ ok: true, utilisateur }` ou
   `{ ok: false, message: 'Identifiants incorrects' }`, sans révéler si le compte existe, ni par le message, ni par la
   durée. Utilise `hacherMotDePasse` et `verifierMotDePasse` du chapitre.

   :::indice
   Pour un compte inexistant, vérifie quand même le mot de passe contre un haché factice, calculé une fois au démarrage.
   :::

   :::solution
   ```js
   import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
   import { promisify } from 'node:util';

   const scryptAsync = promisify(scrypt);
   const OPTIONS = { N: 2 ** 14, r: 8, p: 1 }; // réduit pour l'exercice ; 2 ** 17 en production

   async function hacher(motDePasse) {
     const sel = randomBytes(16);
     const hache = await scryptAsync(motDePasse, sel, 64, OPTIONS);
     return `${sel.toString('base64')}$${hache.toString('base64')}`;
   }
   async function verifier(motDePasse, stocke) {
     const [sel, attendu] = stocke.split('$').map((partie) => Buffer.from(partie, 'base64'));
     return timingSafeEqual(await scryptAsync(motDePasse, sel, 64, OPTIONS), attendu);
   }

   const HACHE_FACTICE = await hacher(randomBytes(16).toString('hex'));
   const ECHEC = { ok: false, message: 'Identifiants incorrects' };

   async function connecter(email, motDePasse, { utilisateurs }) {
     const utilisateur = await utilisateurs.parEmail(email.trim().toLowerCase());
     const valide = await verifier(motDePasse, utilisateur?.hache ?? HACHE_FACTICE);
     if (!utilisateur || !valide) return ECHEC;
     return { ok: true, utilisateur: { id: utilisateur.id, email: utilisateur.email } };
   }

   const comptes = new Map([['ana@exemple.fr', { id: 'u1', email: 'ana@exemple.fr', hache: await hacher('phrase de passe longue') }]]);
   const utilisateurs = { parEmail: async (email) => comptes.get(email) ?? null };

   for (const [email, mdp] of [['Ana@exemple.fr', 'phrase de passe longue'], ['ana@exemple.fr', 'faux'], ['inconnu@exemple.fr', 'faux']]) {
     const debut = performance.now();
     const resultat = await connecter(email, mdp, { utilisateurs });
     console.log(resultat.ok ? `connecté : ${resultat.utilisateur.id}` : resultat.message, `(${Math.round(performance.now() - debut)} ms)`);
   }
   ```

   Les deux échecs affichent le même message et prennent un temps comparable, qu'il s'agisse d'un compte inexistant ou
   d'un mot de passe faux. La réponse ne contient jamais le haché. En production, on ajoute la limitation de débit par
   compte et par adresse.
   :::

2. Tu changes les paramètres de hachage de `N: 2 ** 14` à `N: 2 ** 17`. Écris la logique de connexion qui, après une
   vérification réussie, détecte un haché aux anciens paramètres et le remplace, sans intervention de l'utilisateur.

   :::indice
   Le format stocke `N` : compare-le à la valeur actuelle, et rehache le mot de passe en clair, que tu connais à ce
   moment-là.
   :::

   :::solution
   ```js
   import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
   import { promisify } from 'node:util';

   const scryptAsync = promisify(scrypt);
   const ACTUELS = { N: 2 ** 17, r: 8, p: 1 };
   const MAXMEM = 256 * 1024 * 1024;

   async function hacher(motDePasse, { N, r, p } = ACTUELS) {
     const sel = randomBytes(16);
     const hache = await scryptAsync(motDePasse, sel, 64, { N, r, p, maxmem: MAXMEM });
     return ['scrypt', N, r, p, sel.toString('base64'), hache.toString('base64')].join('$');
   }

   async function verifier(motDePasse, stocke) {
     const [, N, r, p, sel, attendu] = stocke.split('$');
     const calcule = await scryptAsync(motDePasse, Buffer.from(sel, 'base64'), 64, {
       N: Number(N), r: Number(r), p: Number(p), maxmem: MAXMEM,
     });
     return timingSafeEqual(calcule, Buffer.from(attendu, 'base64'));
   }

   function parametresObsoletes(stocke) {
     const [, N, r, p] = stocke.split('$').map(Number);
     return N !== ACTUELS.N || r !== ACTUELS.r || p !== ACTUELS.p;
   }

   async function apresConnexionReussie(utilisateur, motDePasse, depot) {
     if (parametresObsoletes(utilisateur.hache)) {
       await depot.mettreAJourHache(utilisateur.id, await hacher(motDePasse));
     }
   }

   const ancien = await hacher('phrase de passe longue', { N: 2 ** 14, r: 8, p: 1 });
   const utilisateur = { id: 'u1', hache: ancien };
   const depot = { mettreAJourHache: async (id, hache) => (utilisateur.hache = hache) };

   if (await verifier('phrase de passe longue', utilisateur.hache)) {
     await apresConnexionReussie(utilisateur, 'phrase de passe longue', depot);
   }
   console.log(ancien.split('$')[1], '→', utilisateur.hache.split('$')[1]); // 16384 → 131072
   console.log(await verifier('phrase de passe longue', utilisateur.hache)); // true
   ```

   Les comptes se mettent à jour au fil des connexions. Pour les comptes inactifs, restés sur les anciens paramètres, on
   peut forcer une réinitialisation après un certain délai, si l'ancien réglage est jugé trop faible.
   :::

3. Décris et écris la partie serveur d'une réinitialisation de mot de passe : `demanderReinitialisation(email)` et
   `reinitialiser(jeton, nouveauMotDePasse)`. Précise ce qui est stocké, ce qui est envoyé, et ce qui est invalidé.

   :::indice
   Un jeton aléatoire envoyé, son haché stocké avec une date d'expiration, une seule utilisation, et la même réponse
   que le compte existe ou non.
   :::

   :::solution
   ```js
   import { randomBytes, createHash } from 'node:crypto';

   const DUREE_MS = 30 * 60 * 1000;
   const hacherJeton = (jeton) => createHash('sha256').update(jeton).digest('hex');

   function creerReinitialisation({ utilisateurs, demandes, envoyerEmail, hacherMotDePasse, sessions, maintenant = () => Date.now() }) {
     return {
       async demanderReinitialisation(email) {
         const utilisateur = await utilisateurs.parEmail(email);
         if (utilisateur) {
           const jeton = randomBytes(32).toString('base64url');
           await demandes.enregistrer({ hache: hacherJeton(jeton), utilisateurId: utilisateur.id, expire: maintenant() + DUREE_MS });
           await envoyerEmail(utilisateur.email, `https://atelier.exemple/reinitialiser?jeton=${jeton}`);
         }
         return { message: 'Si un compte existe pour cette adresse, un e-mail a été envoyé.' };
       },

       async reinitialiser(jeton, nouveauMotDePasse) {
         const demande = await demandes.consommer(hacherJeton(jeton)); // lit et supprime : usage unique
         if (!demande || demande.expire < maintenant()) return { ok: false, message: 'Lien invalide ou expiré' };
         await utilisateurs.mettreAJourHache(demande.utilisateurId, await hacherMotDePasse(nouveauMotDePasse));
         await sessions.fermerToutes(demande.utilisateurId);
         return { ok: true };
       },
     };
   }

   // Démonstration avec des implémentations en mémoire
   const demandesStockees = new Map();
   const courriers = [];
   const service = creerReinitialisation({
     utilisateurs: {
       parEmail: async (email) => (email === 'ana@exemple.fr' ? { id: 'u1', email } : null),
       mettreAJourHache: async () => {},
     },
     demandes: {
       enregistrer: async (d) => void demandesStockees.set(d.hache, d),
       consommer: async (hache) => {
         const demande = demandesStockees.get(hache);
         demandesStockees.delete(hache);
         return demande;
       },
     },
     envoyerEmail: async (a, lien) => courriers.push(lien),
     hacherMotDePasse: async (m) => `haché(${m.length})`,
     sessions: { fermerToutes: async () => {} },
   });

   console.log((await service.demanderReinitialisation('inconnu@exemple.fr')).message);
   await service.demanderReinitialisation('ana@exemple.fr');
   const jeton = new URL(courriers[0]).searchParams.get('jeton');
   console.log([...demandesStockees.keys()][0] === jeton); // false : seul le haché est stocké
   console.log(await service.reinitialiser(jeton, 'nouvelle phrase de passe')); // { ok: true }
   console.log(await service.reinitialiser(jeton, 'encore une fois')); // { ok: false, message: 'Lien invalide ou expiré' }
   ```

   Stocké : le haché du jeton, l'utilisateur, l'expiration. Envoyé : le jeton en clair, dans le lien, une seule fois.
   Invalidé : la demande après usage, et toutes les sessions de l'utilisateur après le changement. Le message de demande
   est identique que le compte existe ou non.
   :::

## Questions d'entretien

- Comment stocker des mots de passe ?

  :::indice
  Hachage lent, sel, paramètres, et ce qu'il ne faut pas faire.
  :::

  :::reponse
  Jamais en clair ni chiffrés : on les hache avec une fonction conçue pour les mots de passe, lente et gourmande en
  mémoire, comme argon2id ou scrypt, ou à défaut bcrypt, avec un sel aléatoire unique par mot de passe. On stocke
  l'algorithme et ses paramètres avec le haché, pour pouvoir les renforcer et rehacher à la connexion suivante. On
  vérifie avec une comparaison en temps constant, de façon asynchrone pour ne pas bloquer le serveur. SHA-256, même
  salé, est trop rapide : une base volée se casse à des milliards d'essais par seconde.
  :::

- Pourquoi un sel, et est-il secret ?

  :::indice
  Pense aux tables précalculées et aux mots de passe identiques.
  :::

  :::reponse
  Le sel est une valeur aléatoire propre à chaque mot de passe, combinée avant le hachage. Il empêche deux mots de passe
  identiques d'avoir le même haché, et rend inutiles les tables de hachés précalculées : l'attaquant doit attaquer chaque
  compte séparément. Il n'est pas secret : il est stocké à côté du haché, car il faut le connaître pour vérifier. Un
  secret supplémentaire, stocké hors de la base, s'appelle un poivre, et reste facultatif.
  :::

- Comment éviter l'énumération des comptes à la connexion et à la réinitialisation ?

  :::indice
  Messages et temps de réponse.
  :::

  :::reponse
  En renvoyant exactement le même message quand l'e-mail est inconnu et quand le mot de passe est faux, et un message
  neutre pour la réinitialisation : « si un compte existe, un e-mail a été envoyé ». Il faut aussi égaliser la durée :
  pour un compte inconnu, on vérifie quand même le mot de passe contre un haché factice, sinon la réponse rapide trahit
  l'absence du compte. L'inscription reste un point délicat, qu'on traite souvent en envoyant un e-mail dans tous les
  cas, et la limitation de débit freine les essais massifs.
  :::
