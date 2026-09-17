---
id: javascript-try-catch
title: "try, catch, finally : ce qu'il faut attraper, et ce qu'il ne faut pas"
slug: try-catch-finally
technology: javascript
level: intermediate
module: erreurs
order: 3
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-throw-error
skills:
  - try-catch
tags:
  - javascript
  - erreurs
---

## Objectifs

- Structurer un bloc `try` / `catch` / `finally` et connaître l'ordre exact d'exécution.
- Ne rattraper que les erreurs qu'on sait traiter, et relever les autres.
- Éviter les pièges de `finally` : `return` qui écrase un résultat ou avale une erreur.

## Introduction

Entourer du code d'un `try` / `catch` donne une impression de sécurité. Mal utilisé, c'est
l'inverse : un `catch` trop large masque les bugs, transforme une panne franche en comportement
bizarre, et rend le diagnostic impossible. Ce chapitre donne les règles d'un usage sain — dont la
plus importante : **on n'attrape que ce qu'on sait traiter**.

## Concept

| Bloc | S'exécute | Rôle |
| --- | --- | --- |
| `try` | toujours, jusqu'à la première erreur levée | le code qui peut échouer |
| `catch (erreur)` | seulement si une erreur est levée dans `try` | traiter, ou relever |
| `finally` | toujours, après `try` ou `catch`, même après un `return` | nettoyer |

Règles d'usage :

- le `try` entoure **le plus petit** morceau de code qui peut échouer de la façon attendue ;
- le `catch` vérifie le **type** de l'erreur et **relève** tout ce qu'il ne sait pas traiter ;
- le `finally` **libère** des ressources et ne contient ni `return` ni `throw`.

Depuis ES2019, le paramètre du `catch` est facultatif : `catch { … }` quand l'erreur elle-même
n'est pas utilisée.

## Exemple

```js
class ErreurValidation extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErreurValidation';
  }
}

function lireAge(saisie) {
  const age = Number(saisie);
  if (!Number.isInteger(age) || age < 0) {
    throw new ErreurValidation(`Âge invalide : ${saisie}`);
  }
  return age;
}

function traiterFormulaire(saisie, journal) {
  journal.push('ouverture');
  try {
    return `âge enregistré : ${lireAge(saisie)}`;
  } catch (erreur) {
    if (erreur instanceof ErreurValidation) {
      return `message à l'utilisateur : ${erreur.message}`; // erreur attendue : traitée
    }
    throw erreur; // erreur inattendue : relevée telle quelle
  } finally {
    journal.push('fermeture'); // exécuté même après un return
  }
}

const journal = [];
console.log(traiterFormulaire('42', journal)); // 'âge enregistré : 42'
console.log(traiterFormulaire('-3', journal)); // "message à l'utilisateur : Âge invalide : -3"
console.log(journal); // ['ouverture', 'fermeture', 'ouverture', 'fermeture']

function piege() {
  try {
    throw new Error('panne réelle');
  } finally {
    return 'tout va bien'; // écrase l'erreur : à ne jamais faire
  }
}
console.log(piege()); // 'tout va bien'
```

## Comment ça fonctionne

Le moteur exécute le `try`. Si aucune erreur n'est levée, il passe au `finally`, puis à la suite. Si
une erreur est levée, le reste du `try` est abandonné, le `catch` reçoit la valeur levée, puis le
`finally` s'exécute. Le `finally` s'exécute **toujours** : après un `return` du `try` ou du `catch`, la
valeur à renvoyer est calculée, mise de côté, le `finally` s'exécute, puis la fonction renvoie la valeur.

Ce mécanisme a deux pièges. Un **`return` dans `finally`** remplace la valeur mise de côté — et s'il y
avait une erreur en cours de propagation, il l'**annule** : la fonction renvoie normalement, et la panne
disparaît sans trace. Un **`throw` dans `finally`** remplace de même l'erreur d'origine. On réserve donc
`finally` au nettoyage : fermer un fichier, libérer un verrou, masquer un indicateur.

Le `catch` reçoit **n'importe quelle valeur** levée : une erreur attendue, mais aussi un bug — une
`TypeError` sur `undefined`, une faute de frappe. Un `catch` qui traite tout de la même façon transforme
ces bugs en comportement silencieux. D'où la règle : tester le type avec `instanceof`, traiter ce qu'on
attend, et **relever** le reste avec `throw erreur`, sans le modifier, pour que la pile d'origine soit
conservée.

La portée du `try` compte aussi. Un `try` qui entoure trente lignes rattrape des erreurs venues de
n'importe laquelle d'entre elles, y compris celles qu'on n'envisageait pas. Entourer seulement l'appel
susceptible d'échouer rend l'intention lisible et le traitement correct.

Un `try` ne rattrape que les erreurs levées **pendant son exécution**. Une erreur levée plus tard dans un
callback de minuteur ou dans une promesse non attendue lui échappe, comme vu dans la partie Asynchronous :
avec du code asynchrone, il faut `await`.

Enfin, le coût d'un `try` est négligeable dans les moteurs modernes ; la raison de l'éviter n'est jamais
la performance, mais la clarté.

## Erreurs fréquentes

**Attraper toutes les erreurs de la même façon.** Les bugs deviennent silencieux : teste le type et
relève le reste.

**Rattraper sans rien faire.** Un `catch` vide cache la panne.

**Écrire `return` ou `throw` dans `finally`.** La valeur ou l'erreur d'origine est écrasée.

**Entourer un long bloc d'un seul `try`.** Réduis-le à l'opération qui peut échouer.

**Relever une nouvelle erreur au lieu de l'originale, sans `cause`.** La pile d'origine est perdue.

## À retenir

- `finally` s'exécute toujours, même après un `return`.
- On n'attrape que ce qu'on sait traiter ; le reste est relevé avec `throw erreur`.
- Pas de `return` ni de `throw` dans `finally` : il nettoie, c'est tout.
- Un `try` court rend l'intention claire.
- Un `try` ne voit pas les erreurs asynchrones qu'on n'attend pas.

## Exercices

1. Ce code affiche « Aucun utilisateur » même quand le problème est une faute de frappe dans le code.
   Explique pourquoi, puis corrige pour ne traiter que l'absence d'utilisateur.

   ```js
   function nomAffiche(utilisateurs, id) {
     try {
       return utilisateurs.find((u) => u.id === id).nom.toUppercase();
     } catch {
       return 'Aucun utilisateur';
     }
   }
   ```

   :::indice
   Que lève `toUppercase`, qui n'existe pas ? Et comment distinguer « rien trouvé » d'un bug ?
   :::

   :::solution
   Le `catch` attrape tout : l'absence d'utilisateur, mais aussi la `TypeError` levée par
   `toUppercase`, qui n'existe pas (le nom correct est `toUpperCase`). Le bug est donc masqué pour
   toujours. L'absence est un cas prévu : elle se teste sans exception.

   ```js
   function nomAffiche(utilisateurs, id) {
     const utilisateur = utilisateurs.find((u) => u.id === id);
     if (!utilisateur) {
       return 'Aucun utilisateur';
     }
     return utilisateur.nom.toUpperCase();
   }

   console.log(nomAffiche([{ id: 1, nom: 'Ada' }], 1)); // 'ADA'
   console.log(nomAffiche([{ id: 1, nom: 'Ada' }], 2)); // 'Aucun utilisateur'
   ```
   :::

2. `exporter` doit toujours fermer le fichier, même quand l'écriture échoue, sans masquer l'échec.
   Complète-la.

   ```js
   function exporter(fichier, lignes) {
     fichier.ouvrir();
     fichier.ecrire(lignes.join('\n'));
     fichier.fermer();
   }
   ```

   :::indice
   `finally` pour la fermeture, et aucun `catch` : l'erreur doit continuer à remonter.
   :::

   :::solution
   ```js
   function exporter(fichier, lignes) {
     fichier.ouvrir();
     try {
       fichier.ecrire(lignes.join('\n'));
     } finally {
       fichier.fermer();
     }
   }

   const journal = [];
   const fichier = (echoue) => ({
     ouvrir: () => journal.push('ouvert'),
     ecrire: () => { if (echoue) throw new Error('disque plein'); journal.push('écrit'); },
     fermer: () => journal.push('fermé'),
   });

   exporter(fichier(false), ['a']);
   try {
     exporter(fichier(true), ['a']);
   } catch (erreur) {
     journal.push(`échec : ${erreur.message}`);
   }
   console.log(journal); // ['ouvert', 'écrit', 'fermé', 'ouvert', 'fermé', 'échec : disque plein']
   ```

   Un `try` / `finally` sans `catch` est parfaitement valide : il garantit le nettoyage et laisse
   l'appelant décider du traitement.
   :::

3. `montantDepuisJSON(texte)` doit renvoyer `0` quand le texte n'est pas un JSON valide, mais laisser
   passer toute autre erreur. Écris-la.

   :::indice
   Dans le `catch`, teste `erreur instanceof SyntaxError`, et relève le reste.
   :::

   :::solution
   ```js
   function montantDepuisJSON(texte) {
     try {
       return JSON.parse(texte).montant.valeur;
     } catch (erreur) {
       if (erreur instanceof SyntaxError) {
         return 0;
       }
       throw erreur;
     }
   }

   console.log(montantDepuisJSON('{"montant": {"valeur": 12}}')); // 12
   console.log(montantDepuisJSON('pas du json')); // 0
   try {
     montantDepuisJSON('{"total": 5}');
   } catch (erreur) {
     console.log(erreur.name); // 'TypeError' : une donnée inattendue n'est pas masquée
   }
   ```
   :::

## Questions d'entretien

- Dans quel ordre s'exécutent `try`, `catch` et `finally` quand `try` contient un `return` ?

  :::indice
  La valeur de retour est-elle calculée avant ou après `finally` ?
  :::

  :::reponse
  L'expression du `return` est évaluée dans le `try`, la valeur est mise de côté, puis le `finally`
  s'exécute, et la fonction renvoie enfin la valeur. Le `catch` n'intervient que si une erreur a été
  levée. Si le `finally` contient lui-même un `return` ou un `throw`, il remplace la valeur ou l'erreur
  d'origine, ce qui peut effacer silencieusement une panne.
  :::

- Pourquoi relever les erreurs qu'on ne sait pas traiter ?

  :::indice
  Que devient un bug de programmation attrapé par un `catch` générique ?
  :::

  :::reponse
  Parce qu'un `catch` reçoit toutes les erreurs, y compris les bugs — une propriété lue sur `undefined`,
  une méthode mal orthographiée. Les traiter comme un cas prévu les rend silencieux et produit un état
  incohérent, découvert bien plus tard. En testant le type et en relevant le reste avec `throw erreur`,
  on traite ce qui est attendu et on laisse remonter l'inattendu, avec sa pile d'origine.
  :::

- À quoi sert un `try` / `finally` sans `catch` ?

  :::indice
  On veut nettoyer sans décider du traitement de l'erreur.
  :::

  :::reponse
  À garantir un nettoyage — fermer une ressource, libérer un verrou, arrêter un indicateur — tout en
  laissant l'erreur remonter intacte à l'appelant, qui est mieux placé pour la traiter. C'est souvent
  la forme la plus juste dans les fonctions de bas niveau : elles n'ont pas assez de contexte pour
  décider quoi faire d'un échec, mais elles sont responsables de leurs ressources.
  :::
