---
id: javascript-stockage
title: "localStorage, sessionStorage et cookies"
slug: stockage-local
technology: javascript
level: intermediate
module: api-navigateur
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-dom-modifier
skills:
  - browser-storage
tags:
  - javascript
  - navigateur
---

## Objectifs

- Conserver des données dans le navigateur avec `localStorage` et `sessionStorage`.
- Lire et écrire des cookies, et comprendre leurs attributs de sécurité.
- Choisir le bon stockage selon la durée de vie, la taille et la sensibilité des données.

## Introduction

Un thème sombre choisi hier, un panier rempli avant de fermer l'onglet, une langue préférée : certaines données
doivent survivre au rechargement de la page. Le navigateur offre plusieurs stockages, qui se ressemblent en
apparence et diffèrent sur des points décisifs — qui peut les lire, combien de temps ils durent, et s'ils partent
avec chaque requête au serveur.

## Concept

| Stockage | Durée de vie | Portée | Envoyé au serveur | Taille |
| --- | --- | --- | --- | --- |
| `localStorage` | jusqu'à suppression | toute l'origine, tous les onglets | non | environ 5 Mo |
| `sessionStorage` | fermeture de l'onglet | cet onglet seulement | non | environ 5 Mo |
| Cookie | date d'expiration, ou fin de session | origine et chemin choisis | **oui, à chaque requête** | environ 4 Ko |

L'interface de `localStorage` et de `sessionStorage` :

| Méthode | Effet |
| --- | --- |
| `setItem(cle, valeur)` | enregistre une **chaîne** |
| `getItem(cle)` | renvoie la chaîne, ou `null` |
| `removeItem(cle)` / `clear()` | supprime une clé / tout |

Les attributs d'un cookie : `max-age` ou `expires` pour la durée, `path` pour la portée, `Secure` pour n'être
envoyé qu'en HTTPS, `SameSite` contre les requêtes intersites, et `HttpOnly`, posé par le serveur, pour le rendre
**inaccessible** à JavaScript.

## Exemple

```js
localStorage.setItem('visites', 5);
console.log(typeof localStorage.getItem('visites'), localStorage.getItem('visites')); // 'string' '5'

localStorage.setItem('reglages', { theme: 'sombre' });
console.log(localStorage.getItem('reglages')); // '[object Object]' : l'objet a été converti en chaîne

function enregistrer(cle, valeur) {
  localStorage.setItem(cle, JSON.stringify(valeur));
}
function lire(cle, parDefaut) {
  const brut = localStorage.getItem(cle);
  if (brut === null) return parDefaut;
  try {
    return JSON.parse(brut);
  } catch {
    return parDefaut; // donnée corrompue ou modifiée à la main
  }
}

enregistrer('reglages', { theme: 'sombre', taillePolice: 16 });
console.log(lire('reglages', {}).theme, lire('inconnue', 'défaut')); // 'sombre' 'défaut'

sessionStorage.setItem('etape-formulaire', '2'); // disparaît à la fermeture de l'onglet

document.cookie = 'langue=fr; path=/; max-age=31536000; SameSite=Lax';
document.cookie = `recherche=${encodeURIComponent('clavier; sans fil')}; path=/`;
console.log(document.cookie); // 'langue=fr; recherche=clavier%3B%20sans%20fil'

function lireCookie(nom) {
  const paire = document.cookie.split('; ').find((element) => element.startsWith(`${nom}=`));
  return paire ? decodeURIComponent(paire.slice(nom.length + 1)) : null;
}
console.log(lireCookie('recherche')); // 'clavier; sans fil'

document.cookie = 'langue=; path=/; max-age=0'; // suppression
console.log(lireCookie('langue')); // null
```

## Comment ça fonctionne

`localStorage` et `sessionStorage` sont des dictionnaires de **chaînes** rattachés à l'**origine** — le
protocole, le domaine et le port. Toute valeur est convertie en chaîne à l'écriture : un nombre devient `'5'`,
un objet devient `'[object Object]'`. On passe donc systématiquement par `JSON.stringify` et `JSON.parse`, en
prévoyant qu'une valeur lue soit absente, ancienne ou corrompue. Les deux API sont **synchrones** : lire ou
écrire de gros volumes bloque le fil principal. Pour beaucoup de données structurées, `IndexedDB` est l'outil
adapté.

`localStorage` est partagé par tous les onglets de la même origine et persiste sans limite de temps.
`sessionStorage` est propre à un onglet et disparaît avec lui. Quand un onglet modifie `localStorage`, les
**autres** onglets de la même origine reçoivent un événement `storage`, ce qui permet de synchroniser un thème
ou une déconnexion.

Un **cookie** fonctionne différemment : il est géré par le navigateur et **envoyé au serveur avec chaque
requête** vers son domaine. C'est ce qui en fait le support naturel d'une session, et ce qui impose de le garder
petit. `document.cookie` a une interface déroutante : l'écriture ajoute ou remplace **un** cookie, avec ses
attributs, alors que la lecture renvoie tous les cookies accessibles sous forme `nom=valeur; nom2=valeur2`,
sans leurs attributs. Les valeurs contenant `;`, `,` ou des espaces doivent être encodées avec
`encodeURIComponent`. Supprimer un cookie consiste à le réécrire avec `max-age=0` et le même `path`.

La **sécurité** guide le choix. Tout ce que JavaScript peut lire, un script malveillant injecté dans la page —
une faille XSS — peut le lire aussi. Un jeton de session ne doit donc jamais être stocké dans `localStorage` : on
le place dans un cookie `HttpOnly`, invisible pour JavaScript, avec `Secure` pour ne voyager qu'en HTTPS et
`SameSite=Lax` ou `Strict` pour limiter les requêtes intersites. Le stockage local convient aux préférences et
aux données non sensibles.

Enfin, ces stockages ne sont pas garantis : l'utilisateur peut les vider, la navigation privée peut les limiter,
et le quota peut être atteint — `setItem` lève alors une exception. Un code robuste traite toujours l'absence de
valeur comme un cas normal.

## Erreurs fréquentes

**Stocker un objet sans `JSON.stringify`.** On relit `'[object Object]'`.

**Oublier que `getItem` renvoie `null` pour une clé absente.** Prévois une valeur par défaut.

**Stocker un jeton d'authentification dans `localStorage`.** Utilise un cookie `HttpOnly`.

**Écrire une valeur de cookie non encodée.** Un `;` coupe la valeur.

**Supposer que les données sont toujours là.** L'utilisateur ou le navigateur peuvent les supprimer.

## À retenir

- `localStorage` persiste et se partage entre onglets ; `sessionStorage` vit avec l'onglet.
- Les deux ne stockent que des chaînes : `JSON.stringify` à l'écriture, `JSON.parse` protégé à la lecture.
- Un cookie part avec chaque requête vers son domaine : petit, et encodé.
- `HttpOnly`, `Secure` et `SameSite` protègent les cookies sensibles ; `HttpOnly` les cache à JavaScript.
- Jamais de jeton de session dans un stockage accessible au JavaScript.

## Exercices

1. Écris un module `preferences` avec `lirePreferences()` et `modifierPreference(cle, valeur)`, qui conserve les
   préférences dans `localStorage` et renvoie `{ theme: 'clair', langue: 'fr' }` complétées par ce qui a été
   enregistré, même si la donnée stockée est corrompue.

   :::indice
   Fusionne les valeurs par défaut avec l'objet lu, et protège `JSON.parse` avec un `try`.
   :::

   :::solution
   ```js
   const CLE = 'preferences';
   const PAR_DEFAUT = { theme: 'clair', langue: 'fr' };

   function lirePreferences() {
     try {
       return { ...PAR_DEFAUT, ...JSON.parse(localStorage.getItem(CLE) ?? '{}') };
     } catch {
       return { ...PAR_DEFAUT };
     }
   }

   function modifierPreference(cle, valeur) {
     const preferences = lirePreferences();
     preferences[cle] = valeur;
     localStorage.setItem(CLE, JSON.stringify(preferences));
     return preferences;
   }

   modifierPreference('theme', 'sombre');
   console.log(lirePreferences()); // { theme: 'sombre', langue: 'fr' }
   localStorage.setItem(CLE, '{corrompu');
   console.log(lirePreferences()); // { theme: 'clair', langue: 'fr' }
   ```
   :::

2. Quand l'utilisateur change de thème dans un onglet, les autres onglets ouverts doivent l'appliquer aussi. Écris
   l'écouteur qui le permet, sachant que chaque onglet affiche le thème avec l'attribut `data-theme` de `<html>`.

   :::indice
   Les autres onglets de la même origine reçoivent l'événement `storage`, avec `key` et `newValue`.
   :::

   :::solution
   ```js
   function appliquerTheme(theme) {
     document.documentElement.dataset.theme = theme;
   }

   window.addEventListener('storage', (event) => {
     if (event.key === 'theme' && event.newValue) {
       appliquerTheme(event.newValue);
     }
   });

   // Simulation de ce que reçoit un autre onglet quand celui-ci écrit localStorage.setItem('theme', 'sombre') :
   window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'sombre' }));
   console.log(document.documentElement.dataset.theme); // 'sombre'
   ```

   L'onglet qui écrit ne reçoit pas l'événement : il applique le thème directement au moment où il l'enregistre.
   :::

3. Pour chaque donnée, choisis entre cookie `HttpOnly`, `localStorage` et `sessionStorage`, et justifie : le jeton de
   session d'un utilisateur connecté ; le brouillon d'un formulaire en plusieurs étapes, propre à l'onglet ; la langue
   préférée ; le contenu du panier d'un visiteur non connecté.

   :::indice
   Pour chaque donnée : est-elle sensible ? Doit-elle survivre à la fermeture de l'onglet ? Le serveur en a-t-il besoin
   à chaque requête ?
   :::

   :::solution
   - **Jeton de session** : cookie `HttpOnly`, `Secure`, `SameSite`, posé par le serveur. Il est sensible, envoyé à
     chaque requête, et doit rester invisible pour un éventuel script injecté.
   - **Brouillon de formulaire propre à l'onglet** : `sessionStorage`. Il ne doit pas fuiter vers un autre onglet et
     peut disparaître à la fermeture.
   - **Langue préférée** : `localStorage`, non sensible et durable ; ou un cookie simple si le serveur doit rendre la
     page directement dans la bonne langue.
   - **Panier d'un visiteur** : `localStorage` pour le retrouver à la prochaine visite, sans information sensible, et
     synchronisé avec le serveur à la connexion.
   :::

## Questions d'entretien

- Quelle différence entre `localStorage`, `sessionStorage` et les cookies ?

  :::indice
  Compare durée de vie, portée, taille et envoi au serveur.
  :::

  :::reponse
  `localStorage` persiste sans limite de temps et se partage entre les onglets d'une même origine ; `sessionStorage`
  est propre à un onglet et disparaît à sa fermeture ; les deux stockent quelques mégaoctets de chaînes et ne sont
  jamais envoyés au serveur. Les cookies sont petits, ont une date d'expiration, et sont envoyés automatiquement avec
  chaque requête vers leur domaine, ce qui en fait le support des sessions — et impose de les garder légers.
  :::

- Pourquoi ne pas stocker un jeton d'authentification dans `localStorage` ?

  :::indice
  Qui peut lire `localStorage` si la page contient une faille XSS ?
  :::

  :::reponse
  Parce que tout script exécuté dans la page peut lire `localStorage`, y compris un script injecté par une faille XSS,
  qui pourrait alors voler le jeton et usurper la session. Un cookie `HttpOnly` n'est pas accessible depuis
  JavaScript : même en cas d'injection, le jeton ne peut pas être lu. On l'accompagne de `Secure` et `SameSite` pour
  limiter aussi son envoi aux connexions chiffrées et réduire les attaques CSRF.
  :::

- Pourquoi `localStorage.setItem('prefs', { theme: 'sombre' })` pose-t-il problème ?

  :::indice
  Quel type de valeur `localStorage` accepte-t-il ?
  :::

  :::reponse
  `localStorage` ne stocke que des chaînes : l'objet est converti avec `String`, et l'on relit `'[object Object]'`,
  sans aucune donnée. Il faut sérialiser avec `JSON.stringify` à l'écriture et analyser avec `JSON.parse` à la
  lecture, en prévoyant une valeur absente — `getItem` renvoie `null` — ou corrompue, qui ferait échouer `JSON.parse`.
  :::
