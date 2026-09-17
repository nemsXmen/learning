---
id: javascript-dom-modifier
title: "Modifier le contenu, les attributs, les classes et les styles"
slug: modifier-les-elements
technology: javascript
level: beginner
module: dom
order: 2
estimatedMinutes: 30
difficulty: 2
xp: 70
prerequisites:
  - javascript-dom-selection
skills:
  - dom-modification
tags:
  - javascript
  - navigateur
---

## Objectifs

- Changer le texte d'un élément en sécurité avec `textContent`, et savoir quand `innerHTML` est dangereux.
- Lire et modifier attributs, propriétés et attributs `data-*`.
- Changer l'apparence en ajoutant ou retirant des classes plutôt qu'en écrivant des styles.

## Introduction

Une fois l'élément trouvé, on le modifie : afficher un total, cocher une case, marquer un produit comme
sélectionné. Le DOM offre plusieurs façons de faire la même chose, et elles ne se valent pas. L'une
d'elles, `innerHTML`, est à l'origine d'une des failles de sécurité les plus répandues du web. Ce chapitre
présente les bons outils pour chaque type de modification.

## Concept

| Modifier | Écriture | Remarque |
| --- | --- | --- |
| Le texte | `element.textContent = texte` | le texte est inséré tel quel, jamais interprété |
| Le HTML | `element.innerHTML = html` | interprète le HTML : **dangereux** avec des données externes |
| Un attribut | `element.setAttribute('aria-label', 'Fermer')` | la valeur écrite dans le HTML |
| Une propriété | `input.value = 'Ada'`, `lien.href` | l'état courant de l'objet |
| Une donnée | `element.dataset.prixHt = '50'` | correspond à l'attribut `data-prix-ht` |
| Les classes | `element.classList.add/remove/toggle/contains` | la manière recommandée de changer l'apparence |
| Un style | `element.style.backgroundColor = 'red'` | style en ligne, à réserver aux valeurs calculées |

**Attribut** et **propriété** ne sont pas la même chose : l'attribut est la valeur écrite dans le HTML, la
propriété est l'état actuel de l'objet. Un champ dont l'utilisateur modifie le contenu garde son attribut
`value` d'origine, mais sa propriété `value` change.

## Exemple

```js
document.body.innerHTML = `
  <article class="produit" data-id="7" data-prix-ht="50">
    <h2 class="nom">Clavier</h2>
    <p class="prix"></p>
    <input class="quantite" value="1">
    <a class="lien" href="/produits/7">Voir</a>
  </article>`;

const produit = document.querySelector('.produit');
const prixHT = Number(produit.dataset.prixHt); // les data-* sont toujours des chaînes
produit.querySelector('.prix').textContent = `${prixHT * 1.2} €`;
console.log(produit.querySelector('.prix').textContent); // '60 €'

const pseudo = '<img src=x onerror="alert(1)">';
const titre = produit.querySelector('.nom');
titre.textContent = pseudo; // affiché comme du texte, jamais exécuté
console.log(titre.children.length); // 0 : aucun élément créé

const quantite = produit.querySelector('.quantite');
quantite.value = '3';
console.log(quantite.value, quantite.getAttribute('value')); // '3' '1'

const lien = produit.querySelector('.lien');
console.log(lien.getAttribute('href'), lien.href); // '/produits/7' 'https://boutique.exemple/produits/7'

produit.classList.add('en-promotion');
console.log(produit.classList.toggle('selectionne'), produit.classList.contains('selectionne')); // true true
produit.setAttribute('aria-selected', 'true');
console.log(produit.className); // 'produit en-promotion selectionne'
```

## Comment ça fonctionne

`textContent` insère une chaîne comme **texte** : les caractères `<` et `>` sont affichés, jamais
interprétés. `innerHTML`, lui, analyse la chaîne comme du HTML et crée les éléments correspondants. Si
cette chaîne contient une donnée venue de l'utilisateur ou d'une API — un pseudo, un commentaire —, un
attaquant peut y glisser une balise qui exécute du JavaScript dans la page de ses victimes : c'est une
faille **XSS**, détaillée dans la partie Security. La règle est simple : `textContent` pour tout ce qui
vient de l'extérieur ; `innerHTML` seulement pour du HTML entièrement écrit par le développeur, ou passé
par une bibliothèque d'assainissement.

Les **attributs** sont les valeurs écrites dans le HTML ; les **propriétés** sont l'état de l'objet DOM.
Beaucoup se correspondent, mais pas toujours à l'identique. `getAttribute('href')` renvoie ce qui est
écrit, `/produits/7`, alors que la propriété `href` renvoie l'adresse complète résolue. Pour un champ,
l'attribut `value` est la valeur **initiale**, et la propriété `value` la valeur **actuelle**, modifiée par
la saisie : c'est la propriété qu'on lit pour connaître ce que l'utilisateur a tapé.

`dataset` donne accès aux attributs `data-*` : `data-prix-ht` devient `dataset.prixHt`, en camelCase. Ces
valeurs sont **toujours des chaînes**, qu'il faut convertir avec `Number` avant tout calcul. Elles servent à
attacher à un élément une donnée utile au script, comme un identifiant.

Pour changer l'apparence, on modifie les **classes** plutôt que les styles : la feuille de style décrit
`.selectionne`, et le script se contente de l'ajouter ou de la retirer. Le rendu reste défini à un seul
endroit, les états se combinent, et les transitions CSS fonctionnent. `classList.toggle` ajoute ou retire,
et renvoie `true` si la classe est présente après l'appel ; un second argument force l'état. `element.style`
écrit des styles en ligne, à réserver aux valeurs réellement calculées, comme une position ou une largeur
de barre de progression.

Enfin, l'état visible doit aussi être accessible : une carte sélectionnée par une classe l'indique aux
technologies d'assistance avec un attribut comme `aria-selected` ou `aria-pressed`.

## Erreurs fréquentes

**Insérer une donnée externe avec `innerHTML`.** Utilise `textContent`.

**Calculer avec une valeur de `dataset` sans conversion.** `'50' + 10` donne `'5010'`.

**Lire `getAttribute('value')` pour connaître la saisie.** Lis la propriété `value`.

**Écrire les styles dans le script.** Ajoute une classe définie dans le CSS.

**Changer l'apparence sans l'état accessible correspondant.** Mets à jour l'attribut ARIA.

## À retenir

- `textContent` pour le texte, toujours sûr ; `innerHTML` jamais avec des données externes.
- Attribut : valeur écrite dans le HTML ; propriété : état actuel de l'objet.
- `dataset` expose les `data-*` en camelCase, sous forme de chaînes.
- `classList` pour l'apparence, `style` pour les seules valeurs calculées.
- Un changement visuel d'état s'accompagne de l'attribut ARIA correspondant.

## Exercices

1. Écris `afficherCommentaire(conteneur, auteur, texte)` qui crée un paragraphe « auteur : texte » dans le
   conteneur, sans risque même si `texte` contient du HTML.

   :::indice
   Crée l'élément, puis remplis-le avec `textContent`.
   :::

   :::solution
   ```js
   document.body.innerHTML = '<section id="commentaires"></section>';

   function afficherCommentaire(conteneur, auteur, texte) {
     const paragraphe = document.createElement('p');
     paragraphe.textContent = `${auteur} : ${texte}`;
     conteneur.append(paragraphe);
   }

   const zone = document.getElementById('commentaires');
   afficherCommentaire(zone, 'Mallory', '<img src=x onerror="alert(1)">');
   console.log(zone.querySelector('img'), zone.textContent); // null "Mallory : <img src=x onerror="alert(1)">"
   ```
   :::

2. Un bouton « favori » doit basculer l'état de sa carte : classe `favori` sur la carte, texte du bouton
   « Retirer des favoris » ou « Ajouter aux favoris », et attribut `aria-pressed` à jour. Écris `basculerFavori(bouton)`.

   :::indice
   `classList.toggle` renvoie le nouvel état : utilise-le pour le texte et pour l'attribut.
   :::

   :::solution
   ```js
   document.body.innerHTML = `
     <article class="carte">
       <button class="favori-bouton" aria-pressed="false">Ajouter aux favoris</button>
     </article>`;

   function basculerFavori(bouton) {
     const estFavori = bouton.closest('.carte').classList.toggle('favori');
     bouton.textContent = estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris';
     bouton.setAttribute('aria-pressed', String(estFavori));
   }

   const bouton = document.querySelector('.favori-bouton');
   basculerFavori(bouton);
   console.log(bouton.textContent, bouton.getAttribute('aria-pressed')); // 'Retirer des favoris' 'true'
   basculerFavori(bouton);
   console.log(bouton.closest('.carte').classList.contains('favori')); // false
   ```
   :::

3. Ce calcul affiche « Total : 05020 € » pour deux articles à 50 € et 20 €. Explique et corrige.

   ```js
   const articles = document.querySelectorAll('.article');
   let total = 0;
   articles.forEach((article) => {
     total = total + article.dataset.prix;
   });
   ```

   :::indice
   Quel est le type d'une valeur lue dans `dataset` ?
   :::

   :::solution
   Les valeurs de `dataset` sont des **chaînes** : `0 + '50'` donne `'050'`, puis `'050' + '20'` donne `'05020'`.

   ```js
   document.body.innerHTML = '<li class="article" data-prix="50"></li><li class="article" data-prix="20"></li>';

   const total = Array.from(document.querySelectorAll('.article')).reduce(
     (somme, article) => somme + Number(article.dataset.prix),
     0,
   );
   console.log(`Total : ${total} €`); // 'Total : 70 €'
   ```
   :::

## Questions d'entretien

- Pourquoi `innerHTML` est-il dangereux ?

  :::indice
  Que fait le navigateur d'une chaîne contenant une balise, quand elle vient d'un utilisateur ?
  :::

  :::reponse
  Parce que `innerHTML` interprète la chaîne comme du HTML. Si elle contient des données externes, un attaquant
  peut y injecter une balise qui exécute du JavaScript, par exemple via un attribut `onerror` : c'est une faille
  XSS, qui permet de voler des sessions ou d'agir au nom de la victime. On utilise `textContent` pour tout texte
  venu de l'extérieur, et on réserve `innerHTML` à du HTML entièrement maîtrisé, ou assaini par une bibliothèque
  dédiée.
  :::

- Quelle différence entre un attribut et une propriété du DOM ?

  :::indice
  Prends l'exemple d'un champ de saisie dont l'utilisateur change le contenu.
  :::

  :::reponse
  L'attribut est la valeur écrite dans le HTML, lue avec `getAttribute`. La propriété est l'état courant de
  l'objet DOM. Pour un champ, l'attribut `value` reste la valeur initiale alors que la propriété `value` suit la
  saisie ; pour un lien, l'attribut `href` est le texte écrit et la propriété l'adresse complète résolue. On lit
  en général les propriétés pour connaître l'état actuel.
  :::

- Pourquoi modifier des classes plutôt que des styles en ligne ?

  :::indice
  Où l'apparence est-elle définie, et combien d'états peut-on combiner ?
  :::

  :::reponse
  Parce que l'apparence reste décrite à un seul endroit, la feuille de style, et que le script ne gère que
  l'état. Les classes se combinent, profitent des transitions et des media queries, et se surchargent facilement
  dans le CSS. Les styles en ligne dispersent le design dans le JavaScript et ont une priorité difficile à
  contrer. On garde `element.style` pour les valeurs calculées dynamiquement, comme une position ou une largeur.
  :::
