---
id: javascript-motifs-modernes
title: "Moderniser du code JavaScript sans le rendre illisible"
slug: moderniser-du-code
technology: javascript
level: intermediate
module: javascript-moderne
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-syntaxe-moderne
  - javascript-async-await
skills:
  - modern-patterns
tags:
  - javascript
  - moderne
---

## Objectifs

- Reconnaître les écritures anciennes et leur équivalent moderne.
- Moderniser un code existant par petites étapes sûres, sans changer son comportement.
- Distinguer une modernisation utile d'une compression qui nuit à la lecture.

## Introduction

Une grande partie du JavaScript qu'on maintient a été écrite avant 2015 : `var`, `function` partout,
concaténations, `arguments`, callbacks imbriqués. Réécrire ce code avec la syntaxe moderne le rend plus
court et élimine des classes entières de bugs — mais une modernisation brutale peut aussi changer un
comportement sans qu'on s'en aperçoive, ou produire des lignes denses que personne ne veut relire. Ce
chapitre fait la synthèse de la partie : quoi moderniser, comment, et où s'arrêter.

## Concept

| Écriture ancienne | Écriture moderne | Précaution |
| --- | --- | --- |
| `var x` | `const x`, ou `let x` si réaffecté | portée de bloc : vérifier les usages hors du bloc |
| `function (x) { return x * 2; }` en callback | `(x) => x * 2` | pas de `this` propre |
| `'Bonjour ' + nom + ' !'` | `` `Bonjour ${nom} !` `` | aucune |
| `arguments` | `...args` | `arguments` n'existe pas dans une fléchée |
| `x = x \|\| 10` pour un défaut | paramètre par défaut, ou `??` | `0` et `''` ne sont plus remplacés |
| `a && a.b && a.b.c` | `a?.b?.c` | renvoie `undefined` au lieu de `false` ou `0` |
| `Object.assign({}, a, b)` | `{ ...a, ...b }` | aucune |
| boucle `for` qui construit un tableau | `map`, `filter` | garder la boucle si elle s'arrête tôt |
| `obj.hasOwnProperty(k)` | `Object.hasOwn(obj, k)` | aucune |
| callbacks imbriqués | `async` / `await` | gestion d'erreurs à revoir |

La règle de conduite : **une transformation à la fois, tests verts entre chaque**.

## Exemple

```js
// Avant : écrit en 2013.
var TVA_ANCIENNE = 0.2;
function resumeAncien(commande) {
  var lignes = [];
  for (var i = 0; i < commande.articles.length; i++) {
    var article = commande.articles[i];
    if (article.quantite > 0) {
      lignes.push(article.nom + ' x' + article.quantite);
    }
  }
  var client = commande.client && commande.client.nom ? commande.client.nom : 'Anonyme';
  var total = 0;
  for (var j = 0; j < commande.articles.length; j++) {
    total = total + commande.articles[j].prix * commande.articles[j].quantite;
  }
  return client + ' : ' + lignes.join(', ') + ' (' + (total * (1 + TVA_ANCIENNE)).toFixed(2) + ' €)';
}

// Après : même comportement, intentions lisibles.
const TVA = 0.2;
function resume({ articles, client }) {
  const lignes = articles
    .filter((article) => article.quantite > 0)
    .map(({ nom, quantite }) => `${nom} x${quantite}`);
  const total = articles.reduce((somme, { prix, quantite }) => somme + prix * quantite, 0);
  return `${client?.nom || 'Anonyme'} : ${lignes.join(', ')} (${(total * (1 + TVA)).toFixed(2)} €)`;
}

const commande = {
  client: { nom: 'Ada' },
  articles: [
    { nom: 'clavier', prix: 50, quantite: 1 },
    { nom: 'souris', prix: 20, quantite: 0 },
  ],
};
console.log(resumeAncien(commande)); // 'Ada : clavier x1 (60.00 €)'
console.log(resume(commande) === resumeAncien(commande)); // true
console.log(resume({ articles: [] }) === resumeAncien({ articles: [] })); // true
```

## Comment ça fonctionne

Moderniser, c'est **refactoriser** : changer la forme du code sans changer ce qu'il fait. Le danger
vient des transformations qui semblent équivalentes et ne le sont pas tout à fait. Remplacer
`x = x || 10` par un paramètre par défaut ou par `??` change le traitement de `0` et de `''`, qui ne
sont plus remplacés. Remplacer `a && a.b` par `a?.b` renvoie `undefined` là où l'ancien code renvoyait
`false`, `0` ou `null`. Remplacer une `function` par une fléchée supprime son `this` propre et son objet
`arguments`. Dans l'exemple, le nom du client garde `||` et non `??` : un nom vide doit toujours
afficher « Anonyme », comme avant.

D'où la méthode : **vérifier le comportement avant de toucher au code**. Si des tests existent, ils
tournent entre chaque transformation. S'il n'y en a pas, on écrit d'abord quelques cas de comparaison,
comme les deux `console.log` de l'exemple qui confrontent l'ancienne et la nouvelle version, y compris
sur un cas limite — ici une commande sans client et sans articles. On transforme ensuite **une écriture
à la fois** : si un test casse, on sait laquelle en est responsable.

Toute modernisation n'est pas un progrès. Une chaîne de méthodes de tableaux se lit bien quand chaque
étape a un sens ; un `reduce` qui fait trois choses à la fois est plus obscur que la boucle qu'il
remplace. Les ternaires imbriqués, les destructurings sur quatre niveaux ou les chaînes de `?.` qui
masquent une donnée anormale compriment le code sans l'éclaircir. Le critère est la lecture : quelqu'un
qui découvre la fonction comprend-il plus vite ce qu'elle fait ?

Enfin, certaines transformations se font **automatiquement et sans risque** : un linter comme ESLint
signale `var`, propose `const`, remplace la concaténation par un gabarit, et des outils de migration
transforment des bases de code entières. On les laisse faire le mécanique, et on réserve l'attention
humaine aux transformations qui changent la sémantique, comme le passage aux promesses.

## Erreurs fréquentes

**Remplacer `||` par `??` partout.** Le traitement de `0`, `''` et `false` change.

**Tout moderniser d'un seul commit.** Une régression devient impossible à localiser.

**Transformer une méthode utilisant `this` en fonction fléchée.** Elle perd son objet.

**Remplacer une boucle qui s'arrête tôt par `map` ou `forEach`.** On perd l'arrêt anticipé.

**Moderniser sans filet.** Écris d'abord des cas qui figent le comportement actuel.

## À retenir

- Moderniser, c'est refactoriser : même comportement, forme plus claire.
- Certaines équivalences sont trompeuses : `||` et `??`, `&&` et `?.`, `function` et fléchée.
- Figer le comportement par des tests, puis transformer une écriture à la fois.
- Une écriture courte n'est utile que si elle se lit plus vite.
- Laisser le mécanique aux outils, garder l'attention pour ce qui change la sémantique.

## Exercices

1. Modernise cette fonction. Elle doit continuer à renvoyer `0` pour une liste vide et à ignorer les prix
   négatifs.

   ```js
   function totalPositif() {
     var total = 0;
     for (var i = 0; i < arguments.length; i++) {
       if (arguments[i] > 0) {
         total = total + arguments[i];
       }
     }
     return total;
   }
   ```

   :::indice
   `arguments` devient un paramètre de reste ; la boucle devient `filter` puis `reduce` avec une valeur
   initiale.
   :::

   :::solution
   ```js
   const totalPositif = (...prix) =>
     prix.filter((montant) => montant > 0).reduce((total, montant) => total + montant, 0);

   console.log(totalPositif(10, -5, 20)); // 30
   console.log(totalPositif()); // 0 : la valeur initiale de reduce couvre le cas vide
   ```

   Sans la valeur initiale `0`, `reduce` lèverait une erreur sur une liste vide : l'ancien comportement
   serait cassé.
   :::

2. Réécris cette fonction à callbacks avec `async` / `await`, en supposant que `chargerUtilisateur` et
   `chargerCommandes` existent désormais en version à promesses. Une erreur de l'une ou l'autre doit remonter à
   l'appelant.

   ```js
   function recapitulatif(id, rappel) {
     chargerUtilisateur(id, function (erreur, utilisateur) {
       if (erreur) return rappel(erreur);
       chargerCommandes(utilisateur.id, function (erreur2, commandes) {
         if (erreur2) return rappel(erreur2);
         rappel(null, utilisateur.nom + ' a ' + commandes.length + ' commandes');
       });
     });
   }
   ```

   :::indice
   Chaque callback devient un `await`, et le premier argument d'erreur devient une exception qui remonte
   seule.
   :::

   :::solution
   ```js
   const chargerUtilisateur = async (id) => {
     if (id <= 0) throw new Error('Utilisateur introuvable');
     return { id, nom: 'Ada' };
   };
   const chargerCommandes = async () => [{ total: 30 }, { total: 12 }];

   async function recapitulatif(id) {
     const utilisateur = await chargerUtilisateur(id);
     const commandes = await chargerCommandes(utilisateur.id);
     return `${utilisateur.nom} a ${commandes.length} commandes`;
   }

   console.log(await recapitulatif(1)); // 'Ada a 2 commandes'
   console.log(await recapitulatif(0).catch((erreur) => erreur.message)); // 'Utilisateur introuvable'
   ```

   Les tests `if (erreur) return rappel(erreur)` disparaissent : une promesse rompue lève une exception qui
   remonte jusqu'à l'appelant sans code supplémentaire.
   :::

3. Une modernisation a introduit un bug : les commandes d'un article gratuit affichent désormais un prix de
   `0 €` au lieu de « Gratuit ». Écris un test de comparaison qui le révèle, puis corrige la version moderne.

   ```js
   function libelleAncien(article) {
     var prix = article.prix || 'Gratuit';
     return article.nom + ' : ' + prix + (prix === 'Gratuit' ? '' : ' €');
   }

   const libelle = ({ nom, prix }) => `${nom} : ${prix ?? 'Gratuit'}${prix == null ? '' : ' €'}`;
   ```

   :::indice
   Compare les deux versions sur `prix: 0`, `prix: undefined` et un prix normal.
   :::

   :::solution
   ```js
   function libelleAncien(article) {
     var prix = article.prix || 'Gratuit';
     return article.nom + ' : ' + prix + (prix === 'Gratuit' ? '' : ' €');
   }

   const cas = [{ nom: 'guide', prix: 0 }, { nom: 'carte' }, { nom: 'livre', prix: 12 }];

   const libelleCasse = ({ nom, prix }) => `${nom} : ${prix ?? 'Gratuit'}${prix == null ? '' : ' €'}`;
   console.log(cas.map((a) => libelleCasse(a) === libelleAncien(a))); // [false, true, true]

   const libelle = ({ nom, prix }) => (prix ? `${nom} : ${prix} €` : `${nom} : Gratuit`);
   console.log(cas.map((a) => libelle(a) === libelleAncien(a))); // [true, true, true]
   ```

   L'ancien code traitait `0` comme « pas de prix » : remplacer `||` par `??` a changé ce comportement. Si la
   règle métier voulait vraiment afficher `0 €`, c'est une modification de fonctionnalité, à décider et à tester
   explicitement — pas un effet de bord d'une modernisation.
   :::

## Questions d'entretien

- Comment moderniser un ancien code sans introduire de régression ?

  :::indice
  Que faut-il avoir avant de toucher au code, et quelle taille doit avoir chaque étape ?
  :::

  :::reponse
  D'abord figer le comportement actuel par des tests, ou au moins par des cas de comparaison entre l'ancienne et
  la nouvelle version, en incluant les cas limites. Ensuite transformer une écriture à la fois, en relançant les
  tests entre chaque étape, pour localiser immédiatement une régression. On laisse les transformations
  mécaniques aux outils, et on examine avec soin celles qui changent la sémantique : `||` et `??`, `&&` et `?.`,
  `function` et fonction fléchée, callbacks et promesses.
  :::

- `a && a.b` et `a?.b` sont-ils équivalents ?

  :::indice
  Que renvoie chacun quand `a` vaut `0` ou `false` ?
  :::

  :::reponse
  Pas exactement. `a?.b` renvoie `undefined` dès que `a` vaut `null` ou `undefined`, et lit `b` dans tous les
  autres cas. `a && a.b` renvoie `a` lui-même quand `a` est falsy : `0`, `''` ou `false`. Dans un test booléen le
  résultat est souvent le même, mais si la valeur est affichée, comparée ou sérialisée, la différence peut
  changer le comportement.
  :::

- Une écriture moderne est-elle toujours préférable ?

  :::indice
  Quel est le critère qui compte vraiment ?
  :::

  :::reponse
  Non. Le critère est la lisibilité et la justesse, pas l'âge de la syntaxe. `const`, les gabarits, `?.` ou
  `async` / `await` rendent en général le code plus clair. Mais un `reduce` complexe, des ternaires imbriqués ou
  une ligne qui enchaîne six opérateurs peuvent être plus obscurs que la boucle qu'ils remplacent, et une boucle
  `for` reste le bon choix quand il faut s'arrêter tôt.
  :::
