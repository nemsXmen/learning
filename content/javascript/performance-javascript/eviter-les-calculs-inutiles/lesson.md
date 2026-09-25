---
id: javascript-eviter-les-calculs-inutiles
title: "Éviter les calculs inutiles : mémoïsation et évaluation paresseuse"
slug: eviter-les-calculs-inutiles
technology: javascript
level: advanced
module: performance-javascript
order: 3
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-cout-et-complexite
  - javascript-memoization
  - javascript-generateurs
skills:
  - caching-and-laziness
tags:
  - javascript
  - performance
  - cache
---

## Objectifs

- Repérer le travail refait à chaque appel : objets coûteux recréés, calculs invariants dans une boucle, valeurs
  dérivées recalculées.
- Écrire des caches sûrs : taille bornée, clés objets avec `WeakMap`, promesses partagées, expiration.
- Retarder un calcul jusqu'à ce qu'on en ait besoin, avec un getter paresseux, une initialisation à la demande ou
  un itérateur.
- Savoir quand un cache coûte plus qu'il ne rapporte.

## Introduction

Le code le plus rapide est celui qui ne s'exécute pas. Après la complexité, c'est la deuxième grande source de
lenteur : du travail correct, mais fait trop souvent. Un formateur de dates recréé pour chaque ligne d'un tableau,
une expression régulière compilée dans une boucle, un total recalculé à chaque affichage alors que les données n'ont
pas changé.

Trois stratégies répondent à ce problème. **Sortir** le calcul de l'endroit où il se répète. **Retenir** son
résultat : c'est la mémoïsation, vue avec les closures, qu'on va rendre sûre en production. **Retarder** le calcul
jusqu'à ce qu'il soit vraiment nécessaire, voire ne jamais le faire : c'est l'évaluation paresseuse.

## Concept

| Stratégie | Quand | Outil |
| --- | --- | --- |
| sortir de la boucle | le calcul ne dépend pas de l'itération | une constante avant la boucle, au niveau du module |
| mettre en cache | mêmes entrées, même résultat, calcul coûteux, appels répétés | `Map`, `WeakMap`, cache borné |
| partager une promesse | plusieurs appels simultanés pour la même ressource | mémoïser la promesse, pas le résultat |
| retarder | le résultat n'est pas toujours utilisé | getter paresseux, initialisation à la demande, itérateurs |
| invalider | les données sources changent | indicateur « à recalculer », clé de version, expiration |

Un cache échange de la **mémoire** contre du **temps**, et ajoute une question difficile : quand le résultat
retenu devient-il faux ?

## Exemple

Formater 20 000 montants en euros. La première version crée un formateur pour chaque montant :

```js
const montants = Array.from({ length: 20_000 }, (_, i) => i * 1.37);

let debut = performance.now();
const lents = montants.map((montant) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant),
);
console.log(`formateur recréé : ${Math.round(performance.now() - debut)} ms`);

// Le formateur ne dépend pas du montant : on le crée une fois.
const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
debut = performance.now();
const rapides = montants.map((montant) => euros.format(montant));
console.log(`formateur réutilisé : ${Math.round(performance.now() - debut)} ms`);

console.log(lents.every((texte, i) => texte === rapides[i])); // true
```

Dans Node 22, la première version est environ 60 fois plus lente : créer un `Intl.NumberFormat` charge et analyse les
données de la locale, ce que `format` n'a plus à faire. `montant.toLocaleString('fr-FR', options)` a le même
défaut, car il crée un formateur à chaque appel.

Quand le calcul dépend de ses arguments, on le retient. Voici une mémoïsation prête pour la production : taille
bornée, et les entrées les moins récemment utilisées sont évincées en premier (*LRU*, *least recently used*).

```js
function memoiserLRU(fonction, { taille = 100, cle = (x) => x } = {}) {
  const cache = new Map();
  return (argument) => {
    const k = cle(argument);
    if (cache.has(k)) {
      const valeur = cache.get(k);
      cache.delete(k); // on la réinsère : elle devient la plus récente
      cache.set(k, valeur);
      return valeur;
    }
    const valeur = fonction(argument);
    cache.set(k, valeur);
    if (cache.size > taille) {
      cache.delete(cache.keys().next().value); // la plus ancienne
    }
    return valeur;
  };
}

let calculs = 0;
const carre = memoiserLRU((n) => (calculs++, n * n), { taille: 2 });
carre(2);
carre(3);
carre(2); // en cache, devient la plus récente
carre(4); // évince 3, la moins récemment utilisée
carre(2); // toujours en cache
carre(3); // recalculé
console.log(calculs); // 4
```

## Comment ça fonctionne

**Ce qui se sort d'une boucle.** Tout ce qui ne dépend pas de l'élément courant : formateurs `Intl`, expressions
régulières construites avec `new RegExp`, lectures de configuration, `Set` de recherche, valeurs comme
`Date.now()` quand un seul instant suffit pour tout le traitement. Les objets de configuration immuables peuvent
même vivre au niveau du module, créés une fois pour toute l'application.

**Pourquoi un cache borné.** Une `Map` qui ne fait que grandir est une fuite mémoire : un cache sur des
identifiants d'utilisateurs finit par contenir tous les utilisateurs vus depuis le démarrage du serveur. Une `Map`
conserve l'ordre d'insertion ; en supprimant puis réinsérant une clé à chaque lecture, la première clé est toujours
la moins récemment utilisée, et c'est elle qu'on évince. Chaque opération reste en O(1).

**Clés objets : `WeakMap`.** Pour mémoïser un calcul sur un objet, par exemple le total d'un panier, une `WeakMap`
indexée par l'objet ne l'empêche pas d'être récupéré par le ramasse-miettes : quand plus rien ne référence le
panier, son entrée disparaît avec lui. Cela suppose que l'objet ne change pas : si on modifie le panier en place,
le total retenu devient faux. C'est une raison de plus de traiter les données comme immuables ; un nouvel objet
est une nouvelle clé.

**Mémoïser une promesse.** Si trois composants demandent le même profil en même temps, mémoïser le **résultat** ne
suffit pas : aucun n'est encore arrivé, et les trois requêtes partent. On retient la **promesse** dès le premier
appel ; les suivants reçoivent la même. Si elle est rejetée, on la retire du cache, sinon l'erreur serait servie
pour toujours.

**Invalidation.** Un cache n'est correct que si le résultat ne dépend que de la clé. Quand les données sources
changent, il faut invalider : effacer l'entrée, inclure une version dans la clé, ou fixer une durée de vie. Pour une
valeur dérivée d'un état qui change, le motif le plus simple est un indicateur : on marque la valeur « à recalculer »
à chaque modification, et on ne la recalcule qu'à la prochaine lecture.

**L'évaluation paresseuse.** Retarder un calcul a deux avantages : on ne le paie pas s'il n'est jamais demandé, et on
peut s'arrêter dès qu'on a assez de résultats. Le getter paresseux calcule à la première lecture, puis se remplace
par une propriété ordinaire :

```js
class Rapport {
  constructor(lignes) {
    this.lignes = lignes;
  }

  get statistiques() {
    console.log('calcul des statistiques');
    const total = this.lignes.reduce((somme, ligne) => somme + ligne.montant, 0);
    const valeur = { total, moyenne: total / this.lignes.length };
    // La propriété propre masque désormais le getter du prototype.
    Object.defineProperty(this, 'statistiques', { value: valeur });
    return valeur;
  }
}

const rapport = new Rapport([{ montant: 10 }, { montant: 30 }]);
console.log(rapport.statistiques.total); // calcul des statistiques, puis 40
console.log(rapport.statistiques.moyenne); // 20, sans recalcul
```

Les générateurs et les méthodes d'itérateurs, vus dans les parties précédentes, appliquent la même idée aux suites :
`valeurs.values().filter(f).take(10)` s'arrête au dixième résultat, là où `filter` puis `slice` traitent tout.
L'opérateur `??` et le court-circuit de `&&` sont de la paresse au niveau d'une expression : le membre de droite
n'est évalué que si nécessaire. Et `import()` retarde le chargement d'un module entier, ce que le module suivant
exploite dans le navigateur.

**Quand ne pas mettre en cache.** Si le calcul est bon marché, la recherche dans le cache coûte autant que lui.
Si les arguments ne se répètent presque jamais, le cache ne fait que consommer de la mémoire. Si la fonction n'est pas
pure — elle lit l'heure, le réseau, un état modifiable —, le cache sert des réponses fausses. On mesure le taux de
succès d'un cache avant de le garder.

## Erreurs fréquentes

**Recréer un objet coûteux à chaque appel.** Formateurs `Intl`, `RegExp`, `Set` de recherche : crée-les une fois.

**Un cache sans limite.** Borne-le, ou utilise une `WeakMap` quand la clé est un objet.

**Mémoïser le résultat d'une requête au lieu de sa promesse.** Les appels simultanés partent tous ; et sans
éviction en cas d'échec, une erreur passagère devient permanente.

**Mettre en cache une fonction impure.** Le cache fige une réponse qui dépendait du moment ou de l'état.

**Muter un objet utilisé comme clé.** Le résultat mémoïsé ne correspond plus à son contenu.

**Construire la clé avec `JSON.stringify` d'un gros objet.** La sérialisation peut coûter plus que le calcul évité.

## À retenir

- Sors des boucles tout ce qui ne dépend pas de l'élément courant, en particulier les formateurs `Intl`.
- Un cache de production est borné (LRU avec l'ordre d'une `Map`) ou faible (`WeakMap` pour des clés objets).
- Pour de l'asynchrone, mémoïse la promesse et retire-la si elle échoue.
- Tout cache pose la question de l'invalidation : indicateur, version, durée de vie.
- La paresse évite le travail inutile : getter qui se remplace, initialisation à la demande, itérateurs.
- Un cache n'est rentable que si le calcul est coûteux, pur et souvent répété.

## Exercices

1. Ce code vérifie des adresses e-mail interdites dans une liste de 50 000 inscriptions. Repère ce qui est refait
   inutilement, et corrige-le.

   ```js
   function inscriptionsValides(inscriptions, domainesInterdits) {
     return inscriptions.filter((inscription) => {
       const motif = new RegExp(`@(${domainesInterdits.join('|')})$`, 'i');
       const date = new Date(inscription.date);
       return !motif.test(inscription.email) && date.getTime() <= Date.now();
     });
   }
   ```

   :::indice
   Qu'est-ce qui dépend de l'inscription, et qu'est-ce qui n'en dépend pas ? Et si un domaine contient un point ?
   :::

   :::solution
   L'expression régulière et l'instant présent ne dépendent pas de l'inscription : on les calcule une fois. Au
   passage, un point dans un domaine doit être échappé, sinon il signifie « n'importe quel caractère ». Un `Set` des
   domaines, interrogé avec la partie après `@`, évite même l'expression régulière.

   ```js
   function inscriptionsValides(inscriptions, domainesInterdits) {
     const interdits = new Set(domainesInterdits.map((domaine) => domaine.toLowerCase()));
     const maintenant = Date.now();
     return inscriptions.filter((inscription) => {
       const domaine = inscription.email.slice(inscription.email.lastIndexOf('@') + 1).toLowerCase();
       return !interdits.has(domaine) && Date.parse(inscription.date) <= maintenant;
     });
   }

   const resultat = inscriptionsValides(
     [
       { email: 'ana@exemple.fr', date: '2026-01-01' },
       { email: 'bot@Spam.io', date: '2026-01-01' },
       { email: 'bao@spamxio.com', date: '2026-01-01' },
       { email: 'futur@exemple.fr', date: '2999-01-01' },
     ],
     ['spam.io'],
   );
   console.log(resultat.map((i) => i.email)); // [ 'ana@exemple.fr', 'bao@spamxio.com' ]
   ```

   Avec l'expression régulière d'origine, le point non échappé de `spam.io` accepte n'importe quel caractère : une
   adresse en `@spam-io` aurait été rejetée à tort. Le `Set` compare des domaines entiers, sans ce piège.
   :::

2. Écris `memoiserAsync(fonction)` pour une fonction asynchrone à un argument : les appels simultanés avec le même
   argument partagent une seule exécution, et un échec n'est pas retenu. Vérifie-le avec une fausse requête qui
   compte ses appels.

   :::indice
   Stocke la promesse dans la `Map` avant qu'elle ne soit résolue. Ajoute un `catch` qui supprime l'entrée, puis
   relance l'erreur.
   :::

   :::solution
   ```js
   function memoiserAsync(fonction) {
     const enCours = new Map();
     return (argument) => {
       if (enCours.has(argument)) return enCours.get(argument);
       const promesse = fonction(argument).catch((erreur) => {
         enCours.delete(argument); // un échec ne reste pas en cache
         throw erreur;
       });
       enCours.set(argument, promesse);
       return promesse;
     };
   }

   let appels = 0;
   let echouer = true;
   const chargerProfil = memoiserAsync(async (id) => {
     appels += 1;
     await new Promise((resoudre) => setTimeout(resoudre, 10));
     if (echouer) throw new Error('réseau indisponible');
     return { id, nom: `Profil ${id}` };
   });

   const essais = await Promise.allSettled([chargerProfil(7), chargerProfil(7), chargerProfil(7)]);
   console.log(appels, essais.map((e) => e.status)); // 1 [ 'rejected', 'rejected', 'rejected' ]

   echouer = false;
   const [a, b] = await Promise.all([chargerProfil(7), chargerProfil(7)]);
   console.log(appels, a === b, a.nom); // 2 true Profil 7
   ```

   Trois appels simultanés ne déclenchent qu'une requête. Après l'échec, l'entrée est retirée : l'appel suivant
   retente, puis le succès est partagé.
   :::

3. Un panier recalcule son total à chaque lecture de `total`, alors qu'on le lit bien plus souvent qu'on ne le
   modifie. Réécris la classe pour ne recalculer le total qu'après une modification, et seulement si on le lit.

   ```js
   class Panier {
     #lignes = [];
     ajouter(prix, quantite) {
       this.#lignes.push({ prix, quantite });
     }
     get total() {
       return this.#lignes.reduce((somme, l) => somme + l.prix * l.quantite, 0);
     }
   }
   ```

   :::indice
   Un champ privé pour la valeur retenue, `null` quand elle doit être recalculée.
   :::

   :::solution
   ```js
   class Panier {
     #lignes = [];
     #total = null; // null : à recalculer
     calculs = 0;

     ajouter(prix, quantite) {
       this.#lignes.push({ prix, quantite });
       this.#total = null;
     }

     get total() {
       if (this.#total === null) {
         this.calculs += 1;
         this.#total = this.#lignes.reduce((somme, l) => somme + l.prix * l.quantite, 0);
       }
       return this.#total;
     }
   }

   const panier = new Panier();
   panier.ajouter(10, 2);
   panier.ajouter(5, 1);
   console.log(panier.total, panier.total, panier.total); // 25 25 25
   panier.ajouter(1, 3);
   panier.ajouter(2, 1);
   console.log(panier.total, panier.calculs); // 30 2
   ```

   Deux ajouts de suite ne coûtent aucun calcul : le total n'est recalculé qu'à la lecture suivante. C'est
   l'invalidation par indicateur, combinée à la paresse. Elle ne fonctionne que parce que `#lignes` est privé : aucune
   modification ne peut passer à côté de `ajouter`.
   :::

## Questions d'entretien

- Quels sont les risques d'une mémoïsation mal faite ?

  :::indice
  Mémoire, exactitude, et cas asynchrone.
  :::

  :::reponse
  La fuite mémoire d'abord : un cache sans limite grandit avec chaque argument distinct, d'où un cache borné (LRU)
  ou une `WeakMap` pour des clés objets. L'exactitude ensuite : si la fonction dépend d'autre chose que ses
  arguments, ou si l'objet clé est muté, le cache sert une réponse périmée ; il faut une stratégie d'invalidation.
  En asynchrone, il faut mémoïser la promesse pour dédupliquer les appels simultanés, et l'évincer en cas d'échec.
  Enfin, un cache sur un calcul bon marché ou rarement répété ne rapporte rien : on mesure son taux de succès.
  :::

- Qu'est-ce que l'évaluation paresseuse ? Donne des exemples en JavaScript.

  :::indice
  Pense aux opérateurs, aux itérateurs et aux modules.
  :::

  :::reponse
  C'est retarder un calcul jusqu'au moment où son résultat est nécessaire, et donc ne jamais le faire s'il ne l'est
  pas. En JavaScript : le court-circuit de `&&`, `||` et `??` ; les générateurs et les méthodes d'itérateurs, qui
  produisent les valeurs une à une et s'arrêtent avec `take` ou `find` ; les getters qui calculent à la première
  lecture puis retiennent la valeur ; l'initialisation d'un service coûteux au premier usage ; `import()` pour ne
  charger un module que si l'utilisateur en a besoin.
  :::

- Pourquoi `montants.map((m) => m.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }))` est-il lent ?

  :::indice
  Qu'est-ce que `toLocaleString` doit préparer avant de formater ?
  :::

  :::reponse
  À chaque appel, `toLocaleString` avec des options crée en interne un formateur : il résout la locale et prépare
  ses règles, ce qui coûte beaucoup plus que le formatage lui-même. On crée une fois
  `new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })` et on appelle `format` dans la boucle.
  Mesuré dans Node 22 sur 100 000 montants : plus de 10 secondes contre moins de 200 millisecondes.
  :::
