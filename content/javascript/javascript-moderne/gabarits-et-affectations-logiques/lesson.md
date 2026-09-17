---
id: javascript-syntaxe-moderne
title: "Gabarits, affectations logiques et autres ajouts récents"
slug: gabarits-et-affectations-logiques
technology: javascript
level: intermediate
module: javascript-moderne
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 70
prerequisites:
  - javascript-objets-syntaxe-moderne
  - javascript-nullish-optional-chaining
skills:
  - modern-syntax
tags:
  - javascript
  - moderne
---

## Objectifs

- Utiliser les gabarits de chaînes avancés : multiligne, gabarits balisés et `String.raw`.
- Choisir entre `||=`, `&&=` et `??=` selon la valeur qu'on veut remplacer.
- Reconnaître les ajouts récents du langage : séparateurs numériques, appel optionnel, `at`,
  `findLast` et `Object.groupBy`.

## Introduction

Le destructuring, le spread, `?.` et `??` ont été présentés au fil du parcours, là où ils servaient.
Il reste une série d'ajouts plus discrets, arrivés entre ES2015 et ES2024, qu'on croise dans tout code
récent et qui remplacent des écritures plus longues et plus fragiles. Ce chapitre les regroupe, avec la
règle d'usage de chacun.

## Concept

| Écriture | Équivalent ancien | Remarque |
| --- | --- | --- |
| `` `Total : ${total} €` `` | `'Total : ' + total + ' €'` | expressions et retours à la ligne autorisés |
| `` balise`texte ${valeur}` `` | — | une fonction reçoit les morceaux et les valeurs |
| `` String.raw`C:\dossier` `` | — | les antislashs restent littéraux |
| `a \|\|= b` | `a = a \|\| b` | remplace toute valeur **falsy**, y compris `0` et `''` |
| `a ??= b` | `a = a ?? b` | remplace seulement `null` et `undefined` |
| `a &&= b` | `a = a && b` | remplace seulement une valeur **truthy** |
| `1_000_000` | `1000000` | séparateur de lecture, sans effet sur la valeur |
| `objet.methode?.()` | `objet.methode && objet.methode()` | n'appelle que si la méthode existe |
| `liste.at(-1)` | `liste[liste.length - 1]` | index négatif depuis la fin |
| `liste.findLast(f)` | parcours à l'envers | dernier élément qui correspond |
| `Object.groupBy(liste, f)` | `reduce` manuel | regroupe par clé calculée (ES2024) |

## Exemple

```js
const nom = 'Ada';
const message = `Bonjour ${nom},
votre commande de ${2 * 21} € est confirmée.`;
console.log(message.split('\n').length); // 2 : le retour à la ligne fait partie de la chaîne

function surligner(morceaux, ...valeurs) {
  return morceaux.reduce((texte, morceau, i) => `${texte}${morceau}${i < valeurs.length ? `[${valeurs[i]}]` : ''}`, '');
}
console.log(surligner`Bonjour ${nom}, total ${40 + 2} €`); // 'Bonjour [Ada], total [42] €'

const reglages = { theme: '', volume: 0, langue: null };
reglages.theme ||= 'clair'; // '' est falsy : remplacé
reglages.volume ??= 50; // 0 n'est ni null ni undefined : conservé
reglages.langue ??= 'fr'; // null : remplacé
console.log(reglages); // { theme: 'clair', volume: 0, langue: 'fr' }

const budget = 1_500_000;
console.log(budget === 1500000); // true

const service = { demarrer: () => 'démarré' };
console.log(service.demarrer?.(), service.arreter?.()); // 'démarré' undefined

const ventes = [
  { region: 'nord', montant: 10 },
  { region: 'sud', montant: 5 },
  { region: 'nord', montant: 3 },
];
const parRegion = Object.groupBy(ventes, (vente) => vente.region);
console.log(parRegion.nord.length, ventes.at(-1).montant); // 2 3
console.log(ventes.findLast((vente) => vente.region === 'nord').montant); // 3
```

## Comment ça fonctionne

Un **gabarit** évalue chaque expression `${…}` et la convertit en chaîne, et conserve tels quels les
retours à la ligne écrits dans le code. Un **gabarit balisé** va plus loin : la fonction placée devant
reçoit d'abord un tableau des morceaux de texte fixes, puis les valeurs des expressions en arguments
séparés, et renvoie ce qu'elle veut. C'est le mécanisme utilisé par les bibliothèques qui échappent
automatiquement le HTML ou construisent des requêtes SQL paramétrées : les valeurs ne sont jamais
collées brutes dans le texte. `String.raw` est une balise fournie par le langage, qui renvoie le texte
avec ses antislashs intacts — utile pour des chemins Windows ou des expressions régulières.

Les **affectations logiques** combinent un opérateur logique et une affectation, avec le même
court-circuit : `a ||= f()` n'appelle pas `f` si `a` est déjà truthy, et n'effectue même pas
l'affectation. Le choix de l'opérateur est une question de sens. `||=` remplace toute valeur falsy : un
volume à `0` ou un titre vide serait écrasé, ce qui est souvent un bug. `??=` ne remplace que l'absence
de valeur, `null` ou `undefined` : c'est le bon choix pour appliquer une valeur par défaut. `&&=` ne
modifie qu'une valeur déjà présente, par exemple pour transformer un champ seulement s'il existe.

Les **séparateurs numériques** `_` ne servent qu'à la lecture : `1_500_000` et `1500000` sont le même
nombre. Ils sont interdits en début ou en fin de nombre, et à côté du point décimal.

L'**appel optionnel** `?.()` complète `?.` : si la méthode vaut `null` ou `undefined`, l'expression
s'arrête et renvoie `undefined` sans lever d'erreur. Attention : si la propriété existe mais n'est pas une
fonction, l'appel lève toujours une `TypeError`.

Enfin, les méthodes récentes remplacent des écritures manuelles. `at(-1)` lit depuis la fin, `findLast`
et `findLastIndex` cherchent en partant de la fin, et `Object.groupBy`, arrivé avec ES2024, regroupe les
éléments d'une liste dans un objet dont les clés sont calculées par une fonction. Cet objet n'a pas de
prototype : on le parcourt avec `Object.entries`, pas avec des méthodes héritées. Sa variante `Map.groupBy`
produit une `Map`, pour des clés qui ne sont pas des chaînes.

## Erreurs fréquentes

**Utiliser `||=` pour une valeur par défaut numérique.** `0` est remplacé : utilise `??=`.

**Concaténer des valeurs dans du HTML avec un gabarit simple.** Les valeurs ne sont pas échappées.

**Croire que `?.()` protège d'une propriété qui n'est pas une fonction.** Seuls `null` et `undefined`
sont court-circuités.

**Appeler une méthode héritée sur le résultat d'`Object.groupBy`.** L'objet n'a pas de prototype.

**Abuser des nouveautés.** Une écriture courte n'est utile que si elle reste lisible.

## À retenir

- Les gabarits acceptent expressions et retours à la ligne ; une balise transforme le résultat.
- `??=` pour une valeur par défaut, `||=` remplace aussi `0` et `''`, `&&=` modifie une valeur présente.
- `1_000_000` améliore la lecture sans changer la valeur.
- `objet.methode?.()` n'appelle que si la méthode existe.
- `at`, `findLast` et `Object.groupBy` remplacent des calculs manuels.

## Exercices

1. Cette fonction applique des valeurs par défaut, mais efface un volume réglé à `0` et une signature
   volontairement vide. Corrige-la avec les bons opérateurs.

   ```js
   function preparer(reglages) {
     reglages.volume ||= 50;
     reglages.signature ||= 'Cordialement';
     reglages.langue ||= 'fr';
     return reglages;
   }
   ```

   :::indice
   Quelles valeurs doivent être conservées même si elles sont falsy ?
   :::

   :::solution
   ```js
   function preparer(reglages) {
     reglages.volume ??= 50;
     reglages.signature ??= 'Cordialement';
     reglages.langue ??= 'fr';
     return reglages;
   }

   console.log(preparer({ volume: 0, signature: '' }));
   // { volume: 0, signature: '', langue: 'fr' }
   ```

   `??=` ne remplace que `null` et `undefined` : un réglage volontaire à `0` ou à une chaîne vide est
   respecté.
   :::

2. Écris une balise `echapper` qui insère les valeurs dans un gabarit HTML en remplaçant `<`, `>` et `&` par
   leurs entités, sans toucher au texte fixe du gabarit.

   :::indice
   La balise reçoit les morceaux fixes et les valeurs ; seules les valeurs doivent être transformées.
   :::

   :::solution
   ```js
   const entites = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
   const echapperTexte = (valeur) => String(valeur).replace(/[&<>]/g, (c) => entites[c]);

   function echapper(morceaux, ...valeurs) {
     return morceaux.reduce(
       (html, morceau, i) => html + morceau + (i < valeurs.length ? echapperTexte(valeurs[i]) : ''),
       '',
     );
   }

   const pseudo = '<img src=x onerror=alert(1)>';
   console.log(echapper`<p>Bonjour ${pseudo}</p>`);
   // '<p>Bonjour &lt;img src=x onerror=alert(1)&gt;</p>'
   ```

   Le balisage écrit par le développeur reste intact ; seule la donnée venue de l'extérieur est neutralisée.
   La partie Security revient sur ces attaques.
   :::

3. Réécris cette fonction avec `Object.groupBy`, puis calcule le total par catégorie.

   ```js
   function parCategorie(depenses) {
     const groupes = {};
     for (const depense of depenses) {
       if (!groupes[depense.categorie]) groupes[depense.categorie] = [];
       groupes[depense.categorie].push(depense);
     }
     return groupes;
   }
   ```

   :::indice
   `Object.groupBy(liste, (element) => cle)`, puis `Object.entries` pour parcourir le résultat.
   :::

   :::solution
   ```js
   const depenses = [
     { categorie: 'transport', montant: 12 },
     { categorie: 'repas', montant: 18 },
     { categorie: 'transport', montant: 30 },
   ];

   const groupes = Object.groupBy(depenses, (depense) => depense.categorie);
   const totaux = Object.fromEntries(
     Object.entries(groupes).map(([categorie, liste]) => [
       categorie,
       liste.reduce((somme, { montant }) => somme + montant, 0),
     ]),
   );

   console.log(totaux); // { transport: 42, repas: 18 }
   ```
   :::

## Questions d'entretien

- Quelle différence entre `||=` et `??=` ?

  :::indice
  Que devient une valeur `0` avec chacun ?
  :::

  :::reponse
  `a ||= b` affecte `b` si `a` est falsy : `0`, `''`, `false`, `NaN`, `null` ou `undefined`. `a ??= b` n'affecte
  `b` que si `a` vaut `null` ou `undefined`. Pour appliquer une valeur par défaut, `??=` est presque toujours le
  bon choix, car il respecte les valeurs volontairement nulles ou vides. Les deux court-circuitent : `b` n'est
  pas évalué si l'affectation n'a pas lieu.
  :::

- À quoi sert un gabarit balisé ?

  :::indice
  Que reçoit la fonction placée devant le gabarit ?
  :::

  :::reponse
  La fonction reçoit séparément les morceaux de texte fixes et les valeurs interpolées, et construit le résultat
  comme elle l'entend. Cela permet de traiter les valeurs sans toucher au texte écrit par le développeur :
  échapper du HTML, paramétrer une requête SQL, traduire, ou mettre en forme. `String.raw` est une balise
  fournie par le langage, qui conserve les antislashs tels qu'écrits.
  :::

- Que fait `objet.methode?.()` si `methode` vaut `42` ?

  :::indice
  Que court-circuite exactement l'opérateur optionnel ?
  :::

  :::reponse
  Il lève une `TypeError`, car `42` n'est pas une fonction. L'appel optionnel ne court-circuite que si la
  méthode vaut `null` ou `undefined` ; dans ce cas il renvoie `undefined` sans appeler. Il protège contre une
  méthode absente, pas contre une valeur du mauvais type.
  :::
