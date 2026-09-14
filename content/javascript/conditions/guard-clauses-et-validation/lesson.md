---
id: javascript-guard-clauses
title: "Conditions complexes, guard clauses et validation"
slug: guard-clauses-et-validation
technology: javascript
level: intermediate
module: conditions
order: 4
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-truthy-falsy
skills:
  - guard-clauses
tags:
  - javascript
  - conditions
---

## Objectifs

- Rendre lisible une condition complexe en nommant ses parties.
- Remplacer une pyramide de `if` imbriqués par des sorties anticipées (*guard clauses*).
- Valider des données en collectant toutes les erreurs, séparément du traitement.

## Introduction

Les conditions deviennent vite illisibles dans du vrai code : trois niveaux
d'imbrication, des `&&` et des `||` mêlés, un `else` à quarante lignes de son `if`. Ce
chapitre présente les techniques utilisées par les équipes pour garder ce code clair.
Elles s'appliquent surtout dans des fonctions : on utilise ici leur forme la plus simple,
`function nom(parametre) { ... return valeur; }`, détaillée au module 10.

## Concept

**Nommer les conditions.** Une condition complexe devient lisible quand ses parties sont
stockées dans des variables qui disent ce qu'elles vérifient :

```js
const estMajeur = age >= 18;
const estResidentEligible = pays === 'FR' || pays === 'BE';
if (estMajeur && estResidentEligible && !estBanni) { /* ... */ }
```

**Les guard clauses.** Au lieu d'imbriquer le cas normal dans une série de `if`, on traite
d'abord chaque cas invalide et on **sort immédiatement** :

| Pyramide | Guard clauses |
| --- | --- |
| cas normal au fond, très indenté | cas normal à la fin, sans indentation |
| les `else` loin de leur `if` | chaque cas invalide traité et terminé sur place |
| il faut tout lire pour savoir ce qui est refusé | les refus se lisent en premier |

**La validation.** Vérifier des données, c'est produire la **liste de toutes les
erreurs**, pas seulement la première : un formulaire qui signale un problème à la fois
oblige l'utilisateur à le soumettre plusieurs fois.

## Exemple

```js
// Pyramide : le cas normal est enfoui
function prixLivraisonPyramide(commande) {
  if (commande) {
    if (commande.articles.length > 0) {
      if (commande.pays === 'FR') {
        return commande.total >= 50 ? 0 : 4.9;
      } else {
        return 14.9;
      }
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

// Guard clauses : les cas particuliers d'abord, le cas normal ensuite
function prixLivraison(commande) {
  if (!commande || commande.articles.length === 0) return 0;
  if (commande.pays !== 'FR') return 14.9;

  return commande.total >= 50 ? 0 : 4.9;
}

console.log(prixLivraison({ articles: ['livre'], pays: 'FR', total: 30 })); // 4.9
console.log(prixLivraison(null)); // 0
```

## Comment ça fonctionne

`return` termine immédiatement la fonction. Une fois qu'une guard clause a traité un cas,
tout le code qui suit sait que ce cas est exclu : il n'a plus besoin d'être protégé par une
condition. C'est ce qui permet au cas normal de se lire en dernier, à plat.

Pour la validation, on sépare deux responsabilités : **vérifier**, qui produit une liste
d'erreurs, et **traiter**, qui ne s'exécute que si la liste est vide.

```js
function validerInscription(donnees) {
  const erreurs = [];

  if (!donnees.email || !donnees.email.includes('@')) {
    erreurs.push('Adresse e-mail invalide');
  }
  if (!donnees.motDePasse || donnees.motDePasse.length < 12) {
    erreurs.push('Le mot de passe doit contenir au moins 12 caractères');
  }
  if (donnees.age === undefined || donnees.age < 16) {
    erreurs.push('Il faut avoir au moins 16 ans');
  }

  return erreurs;
}

const erreurs = validerInscription({ email: 'ada', motDePasse: 'court' });
if (erreurs.length > 0) {
  console.log(erreurs); // les trois messages
} else {
  // créer le compte
}
```

## Erreurs fréquentes

**Imbriquer le cas normal.** Chaque condition ajoute un niveau d'indentation et éloigne les
`else` de leur `if`. Inverse les conditions et sors tôt.

**Accumuler les négations.** `if (!(!estActif || estBanni))` se lit mal. Nomme la
condition positive : `const peutSeConnecter = estActif && !estBanni`.

**S'arrêter à la première erreur de validation.** L'utilisateur corrige un champ, soumet,
découvre le suivant. Collecte toutes les erreurs.

**Mélanger validation et traitement.** Un `if` de validation au milieu de l'enregistrement
rend les deux difficiles à tester. Valide d'abord, traite ensuite.

## À retenir

- Nomme les parties d'une condition complexe avec des variables explicites.
- Guard clauses : traite et termine chaque cas invalide en début de fonction.
- Le cas normal se lit à la fin, sans indentation.
- Une validation renvoie la liste de toutes les erreurs.
- Valider et traiter sont deux étapes séparées.

## Exercices

1. Réécris cette fonction avec des guard clauses.

   ```js
   function acces(utilisateur) {
     if (utilisateur) {
       if (utilisateur.estActif) {
         if (utilisateur.role === 'admin') {
           return 'complet';
         } else {
           return 'lecture';
         }
       } else {
         return 'aucun';
       }
     } else {
       return 'aucun';
     }
   }
   ```

   :::indice
   Commence par les cas qui renvoient `'aucun'` : ce sont eux qui doivent sortir en
   premier.
   :::

   :::solution
   ```js
   function acces(utilisateur) {
     if (!utilisateur || !utilisateur.estActif) return 'aucun';
     if (utilisateur.role !== 'admin') return 'lecture';

     return 'complet';
   }
   ```

   Même comportement, trois niveaux d'imbrication en moins, et les refus se lisent en
   premier.
   :::

2. Rends cette condition lisible sans en changer le sens.

   ```js
   if (age >= 18 && (pays === 'FR' || pays === 'BE') && !estBanni && solde > 0) {
     autoriserPari();
   }
   ```

   :::indice
   Stocke chaque partie dans une constante dont le nom décrit ce qu'elle vérifie.
   :::

   :::solution
   ```js
   const estMajeur = age >= 18;
   const resideDansUnPaysAutorise = pays === 'FR' || pays === 'BE';
   const aDuCredit = solde > 0;

   if (estMajeur && resideDansUnPaysAutorise && !estBanni && aDuCredit) {
     autoriserPari();
   }
   ```

   La condition se lit maintenant comme la règle métier, et chaque partie peut être
   affichée dans la console pour comprendre un refus.
   :::

3. Écris `validerContact(donnees)` qui renvoie la liste de toutes les erreurs : un nom non
   vide, une adresse e-mail contenant `@`, et un message d'au moins 20 caractères.

   :::indice
   Pars d'un tableau vide, et ajoute un message avec `push` pour chaque règle non
   respectée, sans jamais sortir de la fonction avant la fin.
   :::

   :::indice
   Pour le nom, pense aux saisies faites uniquement d'espaces : `trim()` les rend vides.
   :::

   :::solution
   ```js
   function validerContact(donnees) {
     const erreurs = [];

     if (!donnees.nom || donnees.nom.trim() === '') {
       erreurs.push('Le nom est obligatoire');
     }
     if (!donnees.email || !donnees.email.includes('@')) {
       erreurs.push('Adresse e-mail invalide');
     }
     if (!donnees.message || donnees.message.trim().length < 20) {
       erreurs.push('Le message doit contenir au moins 20 caractères');
     }

     return erreurs;
   }

   console.log(validerContact({ nom: '  ', email: 'ada@exemple.fr', message: 'Bonjour' }));
   // ['Le nom est obligatoire', 'Le message doit contenir au moins 20 caractères']
   ```
   :::

## Questions d'entretien

- Qu'est-ce qu'une guard clause, et pourquoi en utiliser ?

  :::indice
  Compare où se trouve le cas normal dans une pyramide de `if` et avec des sorties
  anticipées.
  :::

  :::reponse
  Une guard clause est un test placé en début de fonction qui traite un cas particulier ou
  invalide et sort immédiatement, avec `return` ou en levant une erreur. Elle remplace une
  imbrication de `if` : les cas refusés se lisent en premier, et le cas normal se trouve à
  la fin, sans indentation. Le code devient plus facile à lire, à modifier et à tester.
  :::

- Pourquoi collecter toutes les erreurs de validation plutôt que s'arrêter à la première ?

  :::indice
  Mets-toi à la place de la personne qui remplit le formulaire.
  :::

  :::reponse
  S'arrêter à la première erreur oblige l'utilisateur à corriger un champ, soumettre, puis
  découvrir le suivant, autant de fois qu'il y a d'erreurs. Renvoyer la liste complète lui
  permet de tout corriger en une fois, et côté API de répondre avec l'ensemble des champs
  invalides. On s'arrête tôt seulement quand une erreur rend les suivantes impossibles à
  vérifier, par exemple des données absentes.
  :::

- Comment rendre lisible une condition complexe ?

  :::indice
  Pense aux noms, aux négations et à ce qu'on peut sortir de la condition.
  :::

  :::reponse
  On stocke chaque partie dans une variable au nom explicite, pour que la condition se lise
  comme la règle métier. On préfère les formulations positives et on élimine les doubles
  négations, au besoin avec les lois de De Morgan. On extrait les vérifications
  réutilisables dans des fonctions. Enfin, on remplace l'imbrication par des guard clauses.
  :::
