---
id: javascript-url-historique
title: "L'API URL et l'API History"
slug: url-et-historique
technology: javascript
level: intermediate
module: api-navigateur
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-evenements
skills:
  - url-history
tags:
  - javascript
  - navigateur
---

## Objectifs

- Analyser et construire des adresses avec `URL` et `URLSearchParams`, sans concaténation manuelle.
- Refléter l'état d'une page dans son adresse, pour qu'elle soit partageable et rechargeable.
- Changer l'adresse sans recharger la page avec `pushState`, et réagir au bouton Retour avec `popstate`.

## Introduction

Une page de résultats filtrée — deuxième page, tri par prix, catégorie « claviers » — doit pouvoir être partagée,
mise en favori et rechargée sans perdre ses filtres. L'endroit naturel pour cet état est l'**adresse** elle-même.
Deux API y sont consacrées : `URL` pour lire et construire les adresses correctement, et `History` pour les
modifier sans recharger la page, comme le font toutes les applications d'une seule page.

## Concept

| Élément | Rôle |
| --- | --- |
| `new URL(adresse, base)` | analyse une adresse ; `base` résout les chemins relatifs |
| `url.pathname`, `url.search`, `url.hash` | les parties de l'adresse |
| `url.searchParams` | un `URLSearchParams` : `get`, `getAll`, `set`, `append`, `delete`, `has` |
| `location` | l'adresse de la page courante ; `location.href = …` navigue en rechargeant |
| `history.pushState(etat, '', adresse)` | ajoute une entrée d'historique **sans** recharger |
| `history.replaceState(etat, '', adresse)` | remplace l'entrée courante |
| Événement `popstate` | se déclenche quand l'utilisateur navigue dans l'historique |

`URLSearchParams` encode et décode automatiquement : espaces, accents, `&` et `=` dans les valeurs.

## Exemple

```js
// Adresse de départ de la page : https://boutique.exemple/produits?page=2
const url = new URL('/produits?page=2&tag=promo&tag=neuf', 'https://boutique.exemple');
console.log(url.pathname, url.searchParams.get('page')); // '/produits' '2' : toujours une chaîne
console.log(url.searchParams.getAll('tag')); // ['promo', 'neuf']

url.searchParams.set('page', '3');
url.searchParams.append('tri', 'prix croissant');
console.log(url.search); // '?page=3&tag=promo&tag=neuf&tri=prix+croissant'

function lireFiltres() {
  const parametres = new URL(location.href).searchParams;
  return { page: Number(parametres.get('page') ?? 1), tri: parametres.get('tri') ?? 'pertinence' };
}

function appliquerFiltres(filtres) {
  const adresse = new URL(location.href);
  adresse.searchParams.set('page', String(filtres.page));
  adresse.searchParams.set('tri', filtres.tri);
  history.pushState(filtres, '', adresse); // l'adresse change, la page ne se recharge pas
}

console.log(lireFiltres()); // { page: 2, tri: 'pertinence' }
appliquerFiltres({ page: 3, tri: 'prix' });
console.log(location.search, lireFiltres()); // '?page=3&tri=prix' { page: 3, tri: 'prix' }

window.addEventListener('popstate', () => {
  console.log('retour arrière, filtres :', lireFiltres()); // { page: 2, tri: 'pertinence' }
});
history.back();
```

## Comment ça fonctionne

Construire une adresse par concaténation — `'/produits?recherche=' + saisie` — casse dès qu'une valeur contient
un espace, un `&` ou un `#`, et peut même injecter des paramètres. `URL` et `URLSearchParams` font l'analyse et
l'encodage selon les règles du web : un espace devient `+` dans les paramètres, un `&` est encodé, et `get`
renvoie la valeur décodée. Toutes les valeurs lues sont des **chaînes**, à convertir avant un calcul. Un paramètre
répété, comme `tag=promo&tag=neuf`, se lit avec `getAll`.

L'**historique** d'un onglet est une pile d'entrées. `pushState` ajoute une entrée et change l'adresse affichée,
sans requête au serveur ni rechargement : la page doit elle-même mettre à jour son contenu. Le premier argument,
l'**état**, est un objet associé à l'entrée ; il est restitué plus tard dans `history.state`. `replaceState`
modifie l'entrée courante au lieu d'en ajouter une, ce qui convient à un changement qui ne doit pas créer de pas
dans le bouton Retour, comme la saisie progressive d'une recherche.

Quand l'utilisateur clique sur Retour ou Suivant, le navigateur change l'adresse et déclenche `popstate` —
jamais lors d'un appel à `pushState`. La page lit alors l'adresse, ou l'état de l'entrée, et affiche le contenu
correspondant. Le schéma robuste est donc : **l'adresse est la source de vérité**. Une même fonction lit les
filtres depuis l'adresse au chargement initial, et à chaque `popstate` ; les actions de l'utilisateur écrivent dans
l'adresse avec `pushState`, puis affichent.

Deux contraintes à connaître. L'adresse passée à `pushState` doit rester sur la **même origine**, sinon une
erreur est levée. Et une adresse créée par `pushState` doit aussi fonctionner si l'utilisateur la **recharge** : le
serveur doit renvoyer la page pour ces chemins, sinon il répond 404. Les frameworks d'applications d'une seule page
et leurs routeurs reposent entièrement sur ces mécanismes.

## Erreurs fréquentes

**Construire une adresse par concaténation.** Utilise `URL` et `searchParams.set`.

**Calculer avec un paramètre sans conversion.** `get('page') + 1` donne `'21'`.

**Attendre `popstate` après `pushState`.** Il ne se déclenche que lors d'une navigation dans l'historique.

**Garder l'état seulement en mémoire.** Recharger ou partager la page le perd : mets-le dans l'adresse.

**Utiliser `pushState` pour chaque frappe.** Le bouton Retour devient inutilisable : `replaceState`.

## À retenir

- `URL` et `URLSearchParams` analysent et encodent les adresses ; les valeurs lues sont des chaînes.
- `pushState` change l'adresse et ajoute une entrée sans recharger ; `replaceState` remplace l'entrée courante.
- `popstate` se déclenche lors de la navigation dans l'historique, pas lors de `pushState`.
- L'adresse est la source de vérité : on la lit au chargement et à chaque `popstate`.
- Une adresse poussée doit fonctionner au rechargement : le serveur doit la servir.

## Exercices

1. Écris `adresseDeRecherche(base, termes, page)` qui construit une adresse `/recherche` avec les paramètres `q` et
   `page`, correctement encodés, en omettant `page` quand elle vaut 1.

   :::indice
   Crée une `URL` avec la base, puis `searchParams.set` pour chaque paramètre.
   :::

   :::solution
   ```js
   function adresseDeRecherche(base, termes, page = 1) {
     const url = new URL('/recherche', base);
     url.searchParams.set('q', termes);
     if (page > 1) {
       url.searchParams.set('page', String(page));
     }
     return url.href;
   }

   console.log(adresseDeRecherche('https://boutique.exemple', 'souris & clavier'));
   // 'https://boutique.exemple/recherche?q=souris+%26+clavier'
   console.log(adresseDeRecherche('https://boutique.exemple', 'écran', 2));
   // 'https://boutique.exemple/recherche?q=%C3%A9cran&page=2'
   ```

   Avec une concaténation, le `&` de « souris & clavier » aurait créé un second paramètre.
   :::

2. Cette page garde le numéro de page dans une variable : un rechargement ou le bouton Retour la ramène toujours en
   page 1. Réécris-la pour que l'adresse soit la source de vérité, au chargement comme lors d'un retour arrière.

   ```js
   let page = 1;
   function pageSuivante() {
     page += 1;
     afficher(page);
   }
   ```

   :::indice
   Une fonction `pageCourante()` lit l'adresse ; `pageSuivante` écrit dans l'adresse avec `pushState` puis affiche ;
   `popstate` réaffiche d'après l'adresse.
   :::

   :::solution
   ```js
   const affichages = [];
   const afficher = (page) => affichages.push(page);

   function pageCourante() {
     return Number(new URL(location.href).searchParams.get('page') ?? 1);
   }

   function pageSuivante() {
     const adresse = new URL(location.href);
     adresse.searchParams.set('page', String(pageCourante() + 1));
     history.pushState(null, '', adresse);
     afficher(pageCourante());
   }

   window.addEventListener('popstate', () => afficher(pageCourante()));

   afficher(pageCourante()); // au chargement : la page de l'adresse
   pageSuivante();
   history.back();
   await new Promise((resolve) => setTimeout(resolve, 50));
   console.log(affichages); // [2, 3, 2] si l'adresse de départ contient ?page=2
   ```

   Aucune variable ne duplique l'état : recharger, partager ou revenir en arrière affiche toujours la page indiquée par
   l'adresse.
   :::

3. Un champ de recherche met à jour l'adresse à chaque frappe, et le bouton Retour doit ensuite revenir à la page
   précédente d'un seul clic, pas lettre par lettre. Écris l'écouteur.

   :::indice
   Une frappe ne doit pas ajouter d'entrée d'historique, seulement modifier l'entrée courante.
   :::

   :::solution
   ```js
   document.body.innerHTML = '<input id="recherche">';
   const champ = document.getElementById('recherche');

   champ.addEventListener('input', () => {
     const adresse = new URL(location.href);
     adresse.searchParams.set('q', champ.value);
     history.replaceState(null, '', adresse);
   });

   const avant = history.length;
   for (const texte of ['c', 'cl', 'cla']) {
     champ.value = texte;
     champ.dispatchEvent(new Event('input'));
   }
   console.log(new URL(location.href).searchParams.get('q'), history.length === avant); // 'cla' true
   ```

   `replaceState` garde l'adresse à jour sans empiler une entrée par lettre. On réserve `pushState` aux changements
   que l'utilisateur voudra retrouver avec le bouton Retour, comme une recherche validée.
   :::

## Questions d'entretien

- Pourquoi utiliser `URL` et `URLSearchParams` plutôt que de concaténer des chaînes ?

  :::indice
  Que devient une valeur contenant `&`, un espace ou un accent ?
  :::

  :::reponse
  Parce qu'ils appliquent les règles d'encodage des adresses : les espaces, les `&`, les `=` et les caractères non
  ASCII sont encodés à l'écriture et décodés à la lecture. Une concaténation casse dès qu'une valeur contient l'un de
  ces caractères, et peut même permettre d'injecter un paramètre supplémentaire. Ils offrent aussi une interface claire
  pour lire, ajouter, remplacer ou supprimer des paramètres, y compris répétés.
  :::

- Quelle différence entre `pushState` et `replaceState` ?

  :::indice
  Que se passe-t-il avec le bouton Retour dans chaque cas ?
  :::

  :::reponse
  Les deux changent l'adresse sans recharger la page. `pushState` ajoute une nouvelle entrée à l'historique : le bouton
  Retour ramène à l'adresse précédente. `replaceState` remplace l'entrée courante : aucun pas supplémentaire n'est créé.
  On utilise `pushState` pour une navigation que l'utilisateur voudra annuler, et `replaceState` pour garder l'adresse
  synchronisée avec un état qui change souvent, comme une saisie.
  :::

- Quand l'événement `popstate` se déclenche-t-il ?

  :::indice
  Se déclenche-t-il quand le code appelle `pushState` ?
  :::

  :::reponse
  Quand l'entrée active de l'historique change à cause d'une navigation : bouton Retour ou Suivant, ou appels à
  `history.back()`, `forward()` et `go()`. Il ne se déclenche pas lors d'un `pushState` ou d'un `replaceState`. Son
  écouteur doit relire l'adresse ou `event.state` et afficher le contenu correspondant, puisque le navigateur ne
  recharge pas la page.
  :::
