---
id: javascript-injections-eval-et-pollution-de-prototype
title: "Injections, évaluation dangereuse et pollution de prototype"
slug: injections-eval-et-pollution-de-prototype
technology: javascript
level: advanced
module: securite-javascript
order: 3
estimatedMinutes: 50
difficulty: 5
xp: 120
prerequisites:
  - javascript-xss-et-encodage-de-sortie
  - javascript-chaine-prototypes
skills:
  - js-injection-prototype-pollution
tags:
  - javascript
  - securite
  - injection
---

## Objectifs

- Reconnaître le schéma commun à toutes les injections : une donnée transmise à un interpréteur.
- Prévenir l'injection SQL avec des requêtes paramétrées, et l'injection d'opérateurs dans les bases NoSQL.
- Éviter `eval`, `new Function` et leurs cousins, et savoir par quoi les remplacer.
- Comprendre la pollution de prototype, propre à JavaScript, et s'en protéger.

## Introduction

La XSS injecte du code dans le navigateur. Le même schéma existe partout où une chaîne est **interprétée** : une requête
SQL, une commande shell, un filtre de base de données, une expression passée à `eval`. Dès qu'une donnée venue de
l'extérieur se retrouve dans ce que l'interpréteur lit comme des instructions, un attaquant peut changer le sens de
l'instruction.

JavaScript ajoute une faille qui lui est propre : la **pollution de prototype**. Parce que tous les objets héritent de
`Object.prototype`, une clé `__proto__` glissée dans un JSON peut modifier le comportement de **tous** les objets de
l'application.

## Concept

| Injection | Interpréteur | Protection |
| --- | --- | --- |
| SQL | la base de données | requêtes paramétrées, jamais de concaténation |
| NoSQL, d'opérateurs | le moteur de requêtes, comme MongoDB | vérifier les types : une chaîne, pas un objet `{ $ne: … }` |
| commande | le shell | `execFile` avec un tableau d'arguments, vu dans la partie Node.js |
| chemin | le système de fichiers | résoudre puis vérifier la racine, vu dans la partie Node.js |
| code | `eval`, `new Function`, `setTimeout(chaine)`, `vm` | ne jamais évaluer de données ; tables de correspondance, `JSON.parse` |

| Pollution de prototype | |
| --- | --- |
| cause | une fonction qui copie ou fusionne des clés venues de l'extérieur, y compris `__proto__` ou `constructor.prototype` |
| effet | une propriété ajoutée à `Object.prototype` apparaît sur tous les objets |
| conséquences | contournement de contrôles (`utilisateur.estAdmin`), plantages, parfois exécution de code via une bibliothèque |
| protections | filtrer les clés dangereuses, `Object.create(null)`, `Map`, schémas stricts, `Object.hasOwn`, `--disable-proto` |

## Exemple

**L'injection SQL**, démontrée avec la base SQLite intégrée à Node 22 :

```js
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE utilisateurs (email TEXT, role TEXT);
         INSERT INTO utilisateurs VALUES ('ana@exemple.fr', 'admin'), ('bao@exemple.fr', 'client');`);

// Vulnérable : la donnée devient une partie de la requête.
const chercherVulnerable = (email) => db.prepare(`SELECT * FROM utilisateurs WHERE email = '${email}'`).all();

// Sûr : la requête et les données voyagent séparément.
const chercher = (email) => db.prepare('SELECT * FROM utilisateurs WHERE email = ?').all(email);

const attaque = "x' OR '1'='1";
console.log(chercherVulnerable(attaque).length); // 2 : toute la table
console.log(chercher(attaque).length); // 0 : personne n'a cet e-mail
```

**La pollution de prototype**, avec une fonction de fusion écrite à la main :

```js
function fusionnerNaif(cible, source) {
  for (const cle in source) {
    if (typeof source[cle] === 'object' && source[cle] !== null) {
      cible[cle] ??= {};
      fusionnerNaif(cible[cle], source[cle]);
    } else {
      cible[cle] = source[cle];
    }
  }
  return cible;
}

// Un corps de requête envoyé par un attaquant pour « mettre à jour ses préférences » :
const corps = JSON.parse('{ "theme": "sombre", "__proto__": { "estAdmin": true } }');
fusionnerNaif({}, corps);

const visiteur = { nom: 'Bao' };
console.log(visiteur.estAdmin); // true : tous les objets sont maintenant « administrateurs »
delete Object.prototype.estAdmin; // on répare pour la suite
```

## Comment ça fonctionne

**Pourquoi la requête paramétrée protège.** Dans la version vulnérable, la chaîne de l'attaquant ferme la chaîne SQL par
une apostrophe et ajoute `OR '1'='1'`, toujours vrai : la condition devient vraie pour toutes les lignes. Avec `?`, la
requête est d'abord analysée, avec un emplacement pour une valeur, puis la donnée est transmise à part : elle ne peut
jamais devenir du SQL, quelle que soit sa forme. Tous les pilotes le permettent : `$1` pour PostgreSQL, `?` pour MySQL et
SQLite. Les constructeurs de requêtes et les ORM paramètrent aussi, sauf dans leurs fonctions de SQL brut, qu'on utilise
avec des paramètres. Échapper les apostrophes à la main n'est pas une solution : les cas particuliers sont trop nombreux.

**L'injection d'opérateurs NoSQL.** Une base comme MongoDB reçoit des objets, pas des chaînes : la concaténation n'existe
pas, mais le problème prend une autre forme. `utilisateurs.findOne({ email, motDePasse })` avec un corps JSON
`{ "email": "ana@exemple.fr", "motDePasse": { "$ne": null } }` demande « un mot de passe différent de null », ce qui est
vrai pour tout le monde. La protection consiste à vérifier que chaque valeur a le type attendu, une chaîne, avant de la
placer dans un filtre : c'est le rôle de la validation par schéma, au chapitre suivant.

**`eval` et ses cousins.** `eval(chaine)`, `new Function(chaine)`, `setTimeout(chaine, 0)` et
`setInterval(chaine, 0)` exécutent du texte comme du code, avec l'accès aux variables et aux API de l'application. Avec
une donnée extérieure, c'est une injection de code directe. Il existe presque toujours une alternative : `JSON.parse`
pour lire des données, une table de fonctions pour choisir une opération par son nom, un petit analyseur pour une
formule. Le module `node:vm` n'est **pas** un bac à sable de sécurité : sa documentation le dit explicitement. Une CSP
sans `'unsafe-eval'` interdit ces fonctions dans le navigateur, ce qui signale aussi les bibliothèques qui les utilisent.

**La pollution de prototype.** `JSON.parse` crée une propriété propre, ordinaire, nommée `"__proto__"`, sans danger en
soi. Le danger vient ensuite : la fonction de fusion parcourt les clés, rencontre `__proto__`, et écrit
`cible['__proto__']`, qui désigne l'accesseur hérité de `Object.prototype` et renvoie le prototype de `cible`, c'est-à-
dire `Object.prototype` lui-même. La récursion y écrit alors `estAdmin = true`. Toute vérification comme
`if (utilisateur.estAdmin)` sur un objet qui n'a pas cette propriété lit désormais la valeur héritée. Le même chemin
existe avec `constructor.prototype`. Beaucoup de failles réelles venaient de fonctions de fusion, de copie profonde ou de
lecture de paramètres imbriqués (`?a[__proto__][x]=1`) dans des bibliothèques populaires.

**Les protections contre la pollution.** Refuser les clés `__proto__`, `constructor` et `prototype` dans toute fonction
qui copie des clés venues de l'extérieur. Stocker les dictionnaires dont les clés viennent des utilisateurs dans une
`Map`, ou un objet créé par `Object.create(null)`, sans prototype. Tester l'appartenance avec `Object.hasOwn`, qui ignore
les propriétés héritées, plutôt qu'avec `in` ou une lecture directe. Valider les corps de requête avec un schéma strict,
qui rejette les clés inattendues. En dernier rempart, Node propose `--disable-proto=delete`, qui retire l'accesseur
`__proto__`, et l'on peut geler `Object.prototype` au démarrage, si les dépendances le supportent. Et l'on garde ses
dépendances à jour : ces failles sont corrigées régulièrement dans les bibliothèques.

## Erreurs fréquentes

**Construire une requête SQL par concaténation ou gabarit.** Utilise des paramètres, toujours.

**Échapper soi-même les apostrophes.** Les cas limites sont nombreux ; les paramètres les règlent tous.

**Placer un objet de la requête dans un filtre NoSQL.** Vérifie que chaque valeur est une chaîne ou un nombre.

**Utiliser `eval` pour lire du JSON ou choisir une fonction.** `JSON.parse` et une table de correspondance suffisent.

**Croire que `node:vm` isole du code non fiable.** Ce n'est pas un mécanisme de sécurité.

**Fusionner récursivement des objets venus de l'extérieur sans filtrer les clés.** Exclus `__proto__`, `constructor`,
`prototype`, ou valide avec un schéma.

**Tester une permission avec `utilisateur.estAdmin` hérité.** Utilise `Object.hasOwn`, et des objets validés.

## À retenir

- Toute injection suit le même schéma : une donnée interprétée comme une instruction.
- SQL : requêtes paramétrées ; NoSQL : vérification des types ; shell : `execFile` ; chemins : résolution et contrôle.
- `eval`, `new Function`, `setTimeout(chaine)` : jamais avec une donnée ; `node:vm` n'est pas un bac à sable.
- Pollution de prototype : une clé `__proto__` copiée modifie `Object.prototype`, donc tous les objets.
- Filtrer les clés dangereuses, `Map` ou `Object.create(null)`, `Object.hasOwn`, schémas stricts, dépendances à jour.

## Exercices

1. Réécris cette fonction de recherche de produits pour qu'elle ne soit plus injectable. Le tri doit rester paramétrable,
   parmi `prix`, `nom` et `date`, dans l'ordre croissant ou décroissant.

   ```js
   function rechercher(db, { texte, tri, ordre }) {
     return db
       .prepare(`SELECT * FROM produits WHERE nom LIKE '%${texte}%' ORDER BY ${tri} ${ordre}`)
       .all();
   }
   ```

   :::indice
   Une valeur se passe en paramètre, mais un nom de colonne ne le peut pas : pour le tri, une liste blanche.
   :::

   :::solution
   ```js
   import { DatabaseSync } from 'node:sqlite';

   const COLONNES_DE_TRI = { prix: 'prix', nom: 'nom', date: 'cree_le' };
   const ORDRES = { asc: 'ASC', desc: 'DESC' };

   function rechercher(db, { texte = '', tri = 'nom', ordre = 'asc' }) {
     const colonne = COLONNES_DE_TRI[tri];
     const sens = ORDRES[ordre];
     if (!colonne || !sens) throw new Error('Tri invalide');
     return db
       .prepare(`SELECT nom, prix FROM produits WHERE nom LIKE ? ORDER BY ${colonne} ${sens}`)
       .all(`%${texte}%`);
   }

   const db = new DatabaseSync(':memory:');
   db.exec(`CREATE TABLE produits (nom TEXT, prix REAL, cree_le TEXT);
            INSERT INTO produits VALUES ('Lampe', 49.9, '2026-01'), ('Lampadaire', 129, '2026-02'), ('Vase', 25, '2026-03');`);

   console.log(rechercher(db, { texte: 'Lamp', tri: 'prix', ordre: 'desc' }).map((p) => p.nom));
   // [ 'Lampadaire', 'Lampe' ]
   console.log(rechercher(db, { texte: "' OR 1=1 --" }).length); // 0
   try {
     rechercher(db, { tri: 'prix; DROP TABLE produits' });
   } catch (erreur) {
     console.log(erreur.message); // Tri invalide
   }
   ```

   Les paramètres ne remplacent que des valeurs, pas des identifiants comme un nom de colonne ou un mot-clé `ASC`. Pour
   ceux-là, on choisit dans une liste fixe écrite dans le code : la donnée sert de clé, jamais de texte SQL.
   Détail révélateur : `node:sqlite` renvoie chaque ligne comme un objet sans prototype, créé comme avec
   `Object.create(null)` : une colonne nommée `__proto__` y reste une propriété ordinaire.
   :::

2. Une calculatrice en ligne évalue les formules saisies avec `eval`. Remplace-la par une fonction `calculer(a, operation,
   b)` qui ne peut exécuter que les quatre opérations, et montre qu'une tentative d'injection échoue.

   ```js
   const resultat = eval(`${a} ${operation} ${b}`);
   ```

   :::indice
   Une table qui associe chaque symbole à une fonction ; vérifie aussi que les opérandes sont des nombres.
   :::

   :::solution
   ```js
   const OPERATIONS = {
     '+': (a, b) => a + b,
     '-': (a, b) => a - b,
     '*': (a, b) => a * b,
     '/': (a, b) => {
       if (b === 0) throw new RangeError('Division par zéro');
       return a / b;
     },
   };

   function calculer(a, operation, b) {
     const x = Number(a);
     const y = Number(b);
     if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Opérandes invalides');
     if (!Object.hasOwn(OPERATIONS, operation)) throw new Error(`Opération inconnue : ${operation}`);
     return OPERATIONS[operation](x, y);
   }

   console.log(calculer('6', '*', '7')); // 42
   for (const essai of [['1', '+ process.exit() +', '1'], ['1', 'constructor', '2'], ['1', '+', 'require("fs")']]) {
     try {
       calculer(...essai);
     } catch (erreur) {
       console.log(erreur.message);
     }
   }
   // Opération inconnue : + process.exit() +
   // Opération inconnue : constructor
   // Opérandes invalides
   ```

   `Object.hasOwn` est important : `OPERATIONS['constructor']` existe par héritage, et un simple
   `OPERATIONS[operation]` aurait trouvé `Object`, une fonction. Pour des formules plus riches, on écrit ou on choisit un
   analyseur d'expressions qui ne connaît que les opérations prévues.
   :::

3. Corrige `fusionnerNaif` pour qu'elle résiste à la pollution de prototype, et vérifie avec les deux attaques
   classiques : `__proto__` et `constructor.prototype`.

   :::indice
   Parcours les clés propres avec `Object.keys`, ignore les clés dangereuses, et ne descends que dans des objets propres
   à la cible.
   :::

   :::solution
   ```js
   const CLES_INTERDITES = new Set(['__proto__', 'constructor', 'prototype']);
   const estObjetSimple = (valeur) =>
     typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);

   function fusionner(cible, source) {
     for (const cle of Object.keys(source)) {
       if (CLES_INTERDITES.has(cle)) continue;
       const valeur = source[cle];
       if (estObjetSimple(valeur)) {
         if (!Object.hasOwn(cible, cle) || !estObjetSimple(cible[cle])) cible[cle] = {};
         fusionner(cible[cle], valeur);
       } else {
         cible[cle] = valeur;
       }
     }
     return cible;
   }

   const attaques = [
     '{ "__proto__": { "estAdmin": true } }',
     '{ "constructor": { "prototype": { "estAdmin": true } } }',
   ];
   for (const json of attaques) fusionner({ theme: 'clair' }, JSON.parse(json));
   console.log({}.estAdmin); // undefined : le prototype est intact

   console.log(fusionner({ theme: 'clair', notif: { email: true } }, JSON.parse('{ "notif": { "sms": false } }')));
   // { theme: 'clair', notif: { email: true, sms: false } }
   ```

   En pratique, on évite d'écrire sa propre fusion profonde pour des données extérieures : on valide le corps avec un
   schéma strict qui n'accepte que les clés prévues, puis on construit l'objet explicitement.
   :::

## Questions d'entretien

- Comment se protéger d'une injection SQL ?

  :::indice
  Séparer la requête et les données.
  :::

  :::reponse
  En utilisant toujours des requêtes paramétrées : la requête est envoyée avec des emplacements, et les valeurs à part,
  si bien qu'aucune donnée ne peut devenir du SQL. Les ORM et constructeurs de requêtes le font, sauf dans leurs
  fonctions de SQL brut, qu'on paramètre aussi. Pour ce qui ne peut pas être paramétré, comme un nom de colonne de tri,
  on choisit dans une liste blanche écrite dans le code. En complément : un compte de base aux droits minimaux, la
  validation des entrées, et aucun message d'erreur SQL renvoyé au client.
  :::

- Qu'est-ce que la pollution de prototype ?

  :::indice
  `__proto__`, fusion récursive, `Object.prototype`.
  :::

  :::reponse
  C'est l'ajout ou la modification de propriétés sur `Object.prototype`, dont héritent presque tous les objets, via des
  clés comme `__proto__` ou `constructor.prototype` contenues dans des données extérieures. Elle survient typiquement
  dans une fusion récursive, une copie profonde ou une lecture de paramètres imbriqués qui écrit ces clés sans les
  filtrer. L'effet est global : une propriété `estAdmin` apparaît sur tous les objets, des contrôles sont contournés, et
  certaines bibliothèques peuvent même être amenées à exécuter du code. Protections : filtrer ces clés, utiliser `Map` ou
  `Object.create(null)`, `Object.hasOwn`, valider les entrées avec des schémas stricts et garder ses dépendances à jour.
  :::

- Pourquoi `eval` est-il dangereux, et par quoi le remplacer ?

  :::indice
  Que peut faire le code évalué ?
  :::

  :::reponse
  `eval` exécute une chaîne comme du code, avec l'accès à la portée et à toutes les API de l'application : avec une donnée
  extérieure, c'est une injection de code directe. `new Function` et `setTimeout` avec une chaîne ont le même problème,
  et `node:vm` n'offre pas d'isolation de sécurité. On le remplace par `JSON.parse` pour lire des données, par une table
  de fonctions pour choisir une opération, ou par un analyseur dédié pour des expressions. Une CSP sans `'unsafe-eval'`
  l'interdit dans le navigateur.
  :::
