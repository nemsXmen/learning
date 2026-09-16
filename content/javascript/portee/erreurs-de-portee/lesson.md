---
id: javascript-erreurs-portee
title: "Diagnostiquer les erreurs de portée"
slug: erreurs-de-portee
technology: javascript
level: intermediate
module: portee
order: 3
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-hoisting
skills:
  - scope-errors
tags:
  - javascript
  - portee
---

## Objectifs

- Lire un message d'erreur de portée et remonter à sa cause en une lecture.
- Distinguer une variable non déclarée d'une variable valant `undefined`.
- Reconnaître le masquage (*shadowing*) et les globales accidentelles.

## Introduction

Les erreurs de portée sont parmi les plus fréquentes, et leurs messages sont plus précis
qu'il n'y paraît : chaque formulation désigne une cause unique. Savoir les lire transforme
un débogage tâtonnant en diagnostic direct — et c'est une question d'entretien classique,
parce qu'elle révèle immédiatement la compréhension du modèle.

## Concept

| Message | Cause | Correction |
| --- | --- | --- |
| `x is not defined` | le nom n'existe dans aucune portée accessible | déclarer, importer, corriger l'orthographe |
| `Cannot access 'x' before initialization` | lecture dans la zone morte d'un `let` / `const` | déplacer l'usage après la déclaration |
| `Assignment to constant variable` | réaffectation d'un `const` | utiliser `let`, ou modifier le contenu de l'objet |
| `x is not a function` | le nom existe mais ne contient pas de fonction | vérifier ce que la variable contient vraiment |
| `Identifier 'x' has already been declared` | deux `let` / `const` du même nom dans la portée | renommer, ou supprimer le doublon |

Le **masquage** n'est pas une erreur : une variable intérieure du même nom cache celle de
l'extérieur, dans sa portée seulement.

## Exemple

```js
function total(prix) {
  const taux = 0.2;
  {
    const taux = 0.05; // masque le taux extérieur, dans ce bloc uniquement
    console.log(prix * (1 + taux)); // 105 pour prix = 100
  }
  return prix * (1 + taux); // 120 : le taux extérieur est intact
}
console.log(total(100)); // 105 affiché, puis 120 renvoyé

function compteur() {
  resultat = 0; // aucune déclaration : globale accidentelle en mode non strict
  return resultat;
}

console.log(typeof inexistant); // 'undefined'
// console.log(inexistant); // ReferenceError: inexistant is not defined

const utilisateur = { nom: 'Ada' };
// utilisateur = {}; // TypeError: Assignment to constant variable
utilisateur.nom = 'Grace'; // autorisé : le contenu n'est pas figé
console.log(utilisateur.nom); // 'Grace'
```

## Comment ça fonctionne

Trois questions suffisent à diagnostiquer presque toutes les erreurs de portée : **où le
nom est-il déclaré ?**, **dans quelle portée le lis-tu ?**, et **à quel moment** ?

`is not defined` répond à la première : le nom n'existe dans aucune portée de la chaîne.
C'est souvent une faute de frappe, un import oublié, ou une variable déclarée dans un bloc
voisin. `Cannot access 'x' before initialization` répond à la troisième : le nom existe bien
dans cette portée, mais la ligne de déclaration n'a pas encore été exécutée.

La confusion classique oppose `undefined` et `is not defined`. `undefined` est une
**valeur** : la variable existe et ne contient rien d'utile. `is not defined` est une
**erreur** : la variable n'existe pas. `typeof` renvoie `'undefined'` dans les deux cas pour
une variable jamais déclarée, ce qui masque parfois la vraie cause.

Le masquage est un outil légitime : un paramètre nommé comme une variable extérieure évite
d'inventer un nom laid. Il devient un problème quand il est involontaire — une variable de
boucle qui cache une variable d'état, par exemple : le code extérieur ne change pas, et on
cherche l'erreur au mauvais endroit. L'indice est qu'une modification « n'a aucun effet ».

Les **globales accidentelles** viennent d'une affectation sans déclaration. En mode non
strict, `resultat = 0` crée silencieusement une variable globale, partagée par tout le
programme : deux fonctions peuvent alors s'écraser mutuellement. Le mode strict — actif
d'office dans les modules ES et les classes — en fait une `ReferenceError`. C'est une des
meilleures raisons de travailler en modules.

## Erreurs fréquentes

**Chercher la cause au point de l'erreur.** Le message indique où le nom manque, pas où il
aurait dû être déclaré.

**Confondre `undefined` et `is not defined`.** L'un est une valeur, l'autre une absence.

**Masquer sans le vouloir.** Deux variables du même nom dans deux portées imbriquées : la
modification de l'une ne touche pas l'autre.

**Oublier le mode strict.** Sans lui, une faute de frappe dans une affectation crée une
globale au lieu d'échouer.

## À retenir

- `is not defined` : le nom n'existe nulle part dans la chaîne de portée.
- `Cannot access … before initialization` : zone morte, la déclaration est plus bas.
- `Assignment to constant variable` : `const` interdit la réaffectation, pas la mutation.
- Le masquage est local et volontaire ; involontaire, il fait chercher au mauvais endroit.
- Le mode strict transforme les globales accidentelles en erreurs.

## Exercices

1. Diagnostique ces trois erreurs : nomme la cause et propose la correction.

   ```js
   // a)
   console.log(nom);
   let nom = 'Ada';

   // b)
   const total = 10;
   total = 20;

   // c)
   const outils = { nom: 'clé' };
   outils.utiliser();
   ```

   :::indice
   Chaque message correspond à une seule cause : lecture trop tôt, réaffectation, ou valeur
   qui n'est pas ce qu'on croit.
   :::

   :::solution
   **a)** `Cannot access 'nom' before initialization` : lecture dans la zone morte. Déplace le
   `console.log` après la déclaration.

   **b)** `Assignment to constant variable` : `const` interdit de réaffecter la liaison.
   Utilise `let` si la valeur doit changer.

   **c)** `outils.utiliser is not a function` : la propriété n'existe pas, donc vaut
   `undefined`, et on tente de l'appeler. Vérifie le nom de la méthode, ou son existence avec
   `outils.utiliser?.()`.
   :::

2. Corrige cette fonction, qui crée une variable globale sans le vouloir.

   ```js
   function calculer(prix) {
     resultat = prix * 1.2;
     return resultat;
   }
   ```

   :::indice
   Que manque-t-il devant `resultat` ?
   :::

   :::solution
   ```js
   function calculer(prix) {
     const resultat = prix * 1.2;
     return resultat;
   }
   ```

   Sans déclaration, `resultat` devient une globale partagée par tout le programme en mode non
   strict : deux appels concurrents ou deux fonctions du même nom s'écraseraient. En mode
   strict — donc dans tout module ES —, la version d'origine lève
   `ReferenceError: resultat is not defined`.
   :::

3. Explique pourquoi cette fonction renvoie toujours `0`.

   ```js
   let compteur = 0;
   function incrementer() {
     let compteur = compteur + 1; // ?
     return compteur;
   }
   ```

   :::indice
   À quelle variable `compteur` se réfère-t-il à droite du `=` ?
   :::

   :::solution
   Elle ne renvoie rien du tout : elle lève
   `ReferenceError: Cannot access 'compteur' before initialization`. Le `let` intérieur masque
   le `compteur` extérieur dans toute la fonction, y compris à droite du `=`, où il est encore
   en zone morte.

   ```js
   let compteur = 0;
   function incrementer() {
     compteur += 1; // agit sur la variable extérieure
     return compteur;
   }
   console.log(incrementer(), incrementer()); // 1 2
   ```

   Si l'on voulait vraiment une variable locale, il faudrait un autre nom : le masquage
   involontaire est ici la cause de l'erreur.
   :::

## Questions d'entretien

- Quelle différence entre `undefined` et `is not defined` ?

  :::indice
  L'un est une valeur, l'autre interrompt le programme.
  :::

  :::reponse
  `undefined` est une valeur : la variable ou la propriété existe, mais ne contient rien
  d'utile — paramètre non fourni, propriété absente, `var` lue avant son affectation.
  `is not defined` est une `ReferenceError` : le nom n'existe dans aucune portée accessible,
  et l'exécution s'arrête. Le piège est que `typeof` renvoie `'undefined'` dans les deux cas
  pour un nom jamais déclaré.
  :::

- Qu'est-ce que le masquage, et quand devient-il gênant ?

  :::indice
  Que se passe-t-il quand deux portées imbriquées déclarent le même nom ?
  :::

  :::reponse
  Le masquage, c'est une déclaration intérieure qui cache une variable extérieure du même nom,
  dans sa portée seulement. C'est normal et utile — un paramètre `utilisateur` dans une
  fonction qui manipule un `utilisateur` global. Il devient gênant quand il est involontaire :
  on croit modifier la variable extérieure alors qu'on écrit dans une locale, et le symptôme
  est une modification « sans effet ». Des noms distincts et des portées courtes l'évitent.
  :::

- En quoi le mode strict aide-t-il sur les erreurs de portée ?

  :::indice
  Que devient une affectation à une variable non déclarée ?
  :::

  :::reponse
  Il transforme plusieurs erreurs silencieuses en erreurs immédiates : une affectation à une
  variable non déclarée lève `ReferenceError` au lieu de créer une globale, les doublons de
  paramètres sont interdits, et `this` vaut `undefined` plutôt que l'objet global dans une
  fonction appelée seule. Les modules ES et les corps de classe sont en mode strict d'office :
  écrire du JavaScript moderne suffit à en bénéficier.
  :::
