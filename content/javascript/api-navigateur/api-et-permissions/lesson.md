---
id: javascript-api-permissions
title: "Presse-papiers, géolocalisation, notifications, fichiers et permissions"
slug: api-et-permissions
technology: javascript
level: intermediate
module: api-navigateur
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-async-erreurs
  - javascript-stockage
skills:
  - browser-apis
tags:
  - javascript
  - navigateur
---

## Objectifs

- Utiliser les API qui touchent à l'appareil : presse-papiers, position, notifications, fichiers.
- Comprendre les conditions qu'elles imposent : contexte sécurisé, geste de l'utilisateur, permission.
- Écrire un code qui détecte l'absence d'une API ou un refus, et reste utilisable dans tous les cas.

## Introduction

Copier un lien d'un clic, afficher les magasins proches, prévenir d'un message reçu, importer un fichier : ces
fonctions accèdent à des ressources que l'utilisateur doit contrôler. Le navigateur les protège par des règles —
HTTPS obligatoire, action volontaire, autorisation explicite — et par des API souvent **asynchrones**. Le code
qui les utilise doit donc prévoir trois issues : l'API existe et fonctionne, l'API n'existe pas, ou l'utilisateur
refuse.

## Concept

| API | Utilisation | Conditions |
| --- | --- | --- |
| Presse-papiers | `await navigator.clipboard.writeText(texte)` | contexte sécurisé, souvent un geste de l'utilisateur |
| Géolocalisation | `navigator.geolocation.getCurrentPosition(succes, erreur, options)` | contexte sécurisé, permission |
| Notifications | `await Notification.requestPermission()`, puis `new Notification(titre)` | contexte sécurisé, permission, geste |
| Fichiers | `input.files`, `await fichier.text()`, `URL.createObjectURL(fichier)` | choix explicite de l'utilisateur |
| Permissions | `await navigator.permissions.query({ name: 'geolocation' })` | renvoie `granted`, `denied` ou `prompt` |

Un **contexte sécurisé** est une page servie en HTTPS, ou depuis `localhost` pendant le développement ;
`window.isSecureContext` l'indique. La **détection de fonctionnalité** vérifie l'existence d'une API avant de
l'appeler : `'clipboard' in navigator`, `'geolocation' in navigator`.

## Exemple

```js
// Les fonctions reçoivent l'environnement en paramètre : elles se testent sans navigateur.
async function copierTexte(texte, env = globalThis) {
  if (!env.isSecureContext || !env.navigator?.clipboard) {
    return { ok: false, raison: 'presse-papiers indisponible' };
  }
  try {
    await env.navigator.clipboard.writeText(texte);
    return { ok: true };
  } catch (erreur) {
    return { ok: false, raison: erreur.name }; // par exemple NotAllowedError
  }
}

function positionActuelle(geolocalisation, options = { timeout: 5000 }) {
  return new Promise((resolve, reject) => {
    if (!geolocalisation) {
      reject(new Error('Géolocalisation indisponible'));
      return;
    }
    geolocalisation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      reject,
      options,
    );
  });
}

async function lireFichierTexte(fichier, tailleMax = 1_000_000) {
  if (fichier.size > tailleMax) {
    throw new RangeError(`Fichier trop volumineux : ${fichier.size} octets`);
  }
  return fichier.text();
}

const environnementSecurise = { isSecureContext: true, navigator: { clipboard: { writeText: async () => {} } } };
console.log(await copierTexte('https://boutique.exemple/produits/7', environnementSecurise)); // { ok: true }
console.log(await copierTexte('texte', { isSecureContext: false, navigator: {} }));
// { ok: false, raison: 'presse-papiers indisponible' }

const gpsFactice = { getCurrentPosition: (succes) => succes({ coords: { latitude: 48.85, longitude: 2.35 } }) };
console.log(await positionActuelle(gpsFactice)); // { latitude: 48.85, longitude: 2.35 }
const refus = { getCurrentPosition: (_, erreur) => erreur({ code: 1, message: 'User denied Geolocation' }) };
console.log(await positionActuelle(refus).catch((e) => `refus, code ${e.code}`)); // 'refus, code 1'

console.log(await lireFichierTexte(new File(['bonjour'], 'note.txt'))); // 'bonjour'
```

## Comment ça fonctionne

Ces API sont réservées aux **contextes sécurisés** : sur une page en HTTP, `navigator.clipboard` ou
`navigator.geolocation` peuvent tout simplement ne pas exister. Beaucoup exigent aussi une **activation par
l'utilisateur** : écrire dans le presse-papiers ou demander l'autorisation de notifier doit se faire dans le
traitement d'un clic ou d'une touche, et non au chargement de la page. Un appel hors de ce contexte échoue avec
une `NotAllowedError`.

Les **permissions** sont accordées par l'utilisateur, qui voit une invite du navigateur. Le code ne peut que
demander ; l'utilisateur peut refuser, ignorer l'invite, ou révoquer plus tard son accord dans les réglages.
`navigator.permissions.query` indique l'état actuel — `granted`, `denied` ou `prompt` — sans déclencher d'invite,
ce qui permet d'adapter l'interface : proposer un bouton « Me localiser » plutôt que de demander à l'arrivée. Une
permission refusée ne peut pas être redemandée par le site : il faut expliquer à l'utilisateur comment la
réactiver.

La **géolocalisation** utilise encore des callbacks : `getCurrentPosition` reçoit une fonction de succès et une
fonction d'erreur. L'envelopper dans une promesse, comme dans l'exemple, permet de l'utiliser avec `await`. L'erreur
porte un `code` : 1 pour un refus, 2 pour une position indisponible, 3 pour un délai dépassé — d'où l'option
`timeout`, sans laquelle l'attente peut être longue.

Les **fichiers** ne sont accessibles qu'après un choix explicite : un `<input type="file">` ou un glisser-déposer.
Chaque fichier est un objet `File` qui porte `name`, `size` et `type`, et dont le contenu se lit avec `text()`,
`arrayBuffer()` ou l'ancien `FileReader`. `URL.createObjectURL(fichier)` crée une adresse temporaire pour afficher
un aperçu d'image ; il faut la libérer avec `URL.revokeObjectURL` une fois inutile. Le `type` et le nom sont fournis
par le système : ils ne prouvent rien du contenu réel, qui doit être revalidé côté serveur.

La conception qui en découle est constante : **détecter**, **demander au bon moment**, **prévoir le refus**. Passer
l'environnement en paramètre, comme dans l'exemple, rend ces fonctions testables sans navigateur, avec des objets
factices qui simulent l'acceptation, le refus ou l'absence de l'API.

## Erreurs fréquentes

**Demander une permission au chargement de la page.** L'invite surprend et reçoit souvent un refus : demande au
moment de l'action.

**Appeler une API sans vérifier qu'elle existe.** En HTTP ou dans un ancien navigateur, elle est absente.

**Ignorer le refus.** Prévois toujours un chemin sans l'API : saisie manuelle d'une ville, bouton de copie visible.

**Faire confiance au type ou à la taille d'un fichier.** Revalide côté serveur.

**Oublier `URL.revokeObjectURL`.** Les aperçus créés restent en mémoire.

## À retenir

- Presse-papiers, position et notifications exigent un contexte sécurisé, souvent un geste de l'utilisateur.
- `navigator.permissions.query` donne l'état d'une permission sans déclencher d'invite.
- Détecter l'API, demander au bon moment, prévoir le refus et l'absence.
- La géolocalisation utilise des callbacks : on l'enveloppe dans une promesse, avec un `timeout`.
- Un fichier se lit avec `text()` ou `arrayBuffer()` ; son type et sa taille se revalident côté serveur.

## Exercices

1. Écris l'écouteur d'un bouton « Copier le lien » qui copie l'adresse de la page, affiche « Lien copié » en cas de
   succès, et sinon affiche le lien dans un champ sélectionné pour une copie manuelle.

   :::indice
   Appelle `writeText` dans l'écouteur du clic ; en cas d'absence ou d'échec, remplis un champ et appelle `select()`.
   :::

   :::solution
   ```js
   async function copierAvecRepli(lien, { presse, champ, message }) {
     try {
       if (!presse) throw new Error('indisponible');
       await presse.writeText(lien);
       message.textContent = 'Lien copié';
     } catch {
       champ.hidden = false;
       champ.value = lien;
       champ.select();
       message.textContent = 'Copiez le lien ci-dessous';
     }
   }

   // Test sans navigateur, avec des objets factices.
   const champ = { hidden: true, value: '', selectionne: false, select() { this.selectionne = true; } };
   const message = { textContent: '' };
   await copierAvecRepli('https://boutique.exemple/p/7', { presse: undefined, champ, message });
   console.log(message.textContent, champ.value, champ.selectionne); // 'Copiez le lien ci-dessous' 'https://boutique.exemple/p/7' true
   ```

   Dans la page, l'écouteur appelle
   `copierAvecRepli(location.href, { presse: navigator.clipboard, champ, message })`, dans le traitement du clic.
   :::

2. Écris `peutLocaliserSansInvite(permissions)` qui renvoie `true` seulement si la permission de géolocalisation est
   déjà accordée, `false` sinon, y compris quand l'API Permissions est absente.

   :::indice
   `await permissions.query({ name: 'geolocation' })` renvoie un objet dont la propriété `state` vaut `granted`,
   `denied` ou `prompt`.
   :::

   :::solution
   ```js
   async function peutLocaliserSansInvite(permissions) {
     if (!permissions?.query) return false;
     try {
       const { state } = await permissions.query({ name: 'geolocation' });
       return state === 'granted';
     } catch {
       return false;
     }
   }

   const accordee = { query: async () => ({ state: 'granted' }) };
   const aDemander = { query: async () => ({ state: 'prompt' }) };
   console.log(await peutLocaliserSansInvite(accordee), await peutLocaliserSansInvite(aDemander)); // true false
   console.log(await peutLocaliserSansInvite(undefined)); // false
   ```

   Dans la page : `peutLocaliserSansInvite(navigator.permissions)`. Si le résultat est `false`, on affiche un bouton
   « Me localiser » plutôt que de déclencher une invite à l'arrivée.
   :::

3. Écris `validerImage(fichier)` pour un envoi d'avatar : refuser tout fichier de plus de 2 Mo ou dont le type ne
   commence pas par `image/`, en renvoyant un message clair, et accepter sinon.

   :::indice
   Utilise `fichier.size` et `fichier.type` ; rappelle-toi que ces vérifications côté client ne dispensent pas de celles
   du serveur.
   :::

   :::solution
   ```js
   const TAILLE_MAX = 2 * 1024 * 1024;

   function validerImage(fichier) {
     if (!fichier.type.startsWith('image/')) {
       return { ok: false, message: `« ${fichier.name} » n'est pas une image` };
     }
     if (fichier.size > TAILLE_MAX) {
       return { ok: false, message: `« ${fichier.name} » dépasse 2 Mo` };
     }
     return { ok: true };
   }

   console.log(validerImage(new File(['x'], 'avatar.png', { type: 'image/png' }))); // { ok: true }
   console.log(validerImage(new File(['x'], 'cv.pdf', { type: 'application/pdf' })).message);
   // '« cv.pdf » n'est pas une image'
   const lourd = new File([new Uint8Array(3 * 1024 * 1024)], 'photo.jpg', { type: 'image/jpeg' });
   console.log(validerImage(lourd).message); // '« photo.jpg » dépasse 2 Mo'
   ```

   Ce contrôle améliore l'expérience en évitant un envoi inutile ; le serveur doit refaire la vérification, car le
   type déclaré par le navigateur peut être falsifié.
   :::

## Questions d'entretien

- Pourquoi certaines API du navigateur exigent-elles un contexte sécurisé ?

  :::indice
  Que pourrait faire un intermédiaire sur une connexion HTTP non chiffrée ?
  :::

  :::reponse
  Parce qu'elles donnent accès à des ressources sensibles — position, presse-papiers, notifications, caméra. Sur une
  connexion HTTP, un intermédiaire peut modifier la page et en profiter pour espionner ou manipuler l'utilisateur au
  nom du site. Exiger HTTPS garantit que le code qui demande l'accès est bien celui du site. `localhost` est considéré
  comme sécurisé pour permettre le développement.
  :::

- Comment gérer correctement une demande de permission ?

  :::indice
  Pense au moment de la demande, à l'état existant et au refus.
  :::

  :::reponse
  On vérifie d'abord que l'API existe, et éventuellement l'état actuel avec `navigator.permissions.query`, sans
  déclencher d'invite. On demande au moment où l'utilisateur fait l'action qui en a besoin, en expliquant pourquoi,
  plutôt qu'au chargement. Et on prévoit le refus comme un cas normal, avec une alternative : saisie manuelle, copie
  manuelle, message dans l'interface au lieu d'une notification système.
  :::

- Pourquoi valider un fichier côté serveur alors qu'il l'est déjà dans le navigateur ?

  :::indice
  Qui contrôle le navigateur et les requêtes envoyées ?
  :::

  :::reponse
  Parce que le client est entièrement sous le contrôle de l'utilisateur : le type déclaré, le nom et même la taille
  annoncée peuvent être falsifiés, et une requête peut être envoyée sans passer par la page. La validation côté client
  améliore l'expérience en évitant un envoi inutile ; seule la validation côté serveur protège réellement l'application.
  :::
