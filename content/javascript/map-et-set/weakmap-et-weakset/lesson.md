---
id: javascript-weak-collections
title: "WeakMap et WeakSet : associer sans retenir en mémoire"
slug: weakmap-et-weakset
technology: javascript
level: advanced
module: map-et-set
order: 3
estimatedMinutes: 25
difficulty: 4
xp: 90
prerequisites:
  - javascript-map
skills:
  - weak-collections
tags:
  - javascript
  - map-et-set
---

## Objectifs

- Comprendre ce qu'est une référence faible, et pourquoi elle évite une fuite mémoire.
- Utiliser une `WeakMap` pour attacher des données à un objet sans le modifier.
- Connaître les limites de ces collections : clés objets uniquement, aucune itération.

## Introduction

Une `Map` garde ses clés en vie : tant que la `Map` existe, les objets qu'elle référence ne
peuvent pas être libérés, même si plus personne d'autre ne s'en sert. Pour un cache ou des
métadonnées attachées à des objets temporaires — des nœuds du DOM, des requêtes en cours —,
c'est une fuite mémoire qui grandit tant que l'application tourne. La `WeakMap` résout
exactement ce problème.

## Concept

| | `Map` | `WeakMap` |
| --- | --- | --- |
| Clés acceptées | n'importe quelle valeur | objets (et symboles non partagés) |
| Retient la clé en mémoire | oui | non |
| `size` | oui | non |
| Itérable | oui | non |
| Méthodes | `set`, `get`, `has`, `delete`, `clear`, itération | `set`, `get`, `has`, `delete` |

Le `WeakSet` est l'équivalent du `Set` : `add`, `has`, `delete`, des objets pour seules
valeurs, aucune itération.

Une référence **faible** n'empêche pas le ramasse-miettes de libérer l'objet. Quand le
dernier autre lien vers la clé disparaît, l'entrée disparaît aussi, toute seule.

## Exemple

```js
const metadonnees = new WeakMap();

function marquerCommeVu(element) {
  metadonnees.set(element, { vuLe: Date.now() });
}

let bouton = { id: 'valider' }; // dans un navigateur : un élément du DOM
marquerCommeVu(bouton);
console.log(metadonnees.has(bouton)); // true
console.log(metadonnees.get(bouton).vuLe); // un horodatage

bouton = null; // plus aucune référence : l'entrée devient éligible au nettoyage

const traites = new WeakSet();
const commande = { id: 42 };
traites.add(commande);
console.log(traites.has(commande)); // true

try {
  metadonnees.set('une chaine', 1);
} catch (erreur) {
  console.log(erreur.constructor.name); // 'TypeError' : clé primitive refusée
}
```

## Comment ça fonctionne

Le ramasse-miettes libère un objet quand plus aucune référence **forte** ne pointe vers lui.
Une `Map` crée une référence forte sur ses clés : tant qu'elle vit, ses clés vivent. Une
`WeakMap` crée une référence **faible** : elle n'empêche rien. Quand le dernier lien fort
vers la clé disparaît, l'objet est libéré et l'entrée s'efface, sans qu'on ait à nettoyer.

C'est pour cela qu'une `WeakMap` n'est ni itérable, ni comptable. Exposer ses entrées
rendrait le résultat dépendant du moment où le ramasse-miettes passe : le même programme
donnerait deux résultats différents. La spécification supprime donc `size`, `keys`,
`values`, `entries` et `clear`.

Les clés doivent être des objets — ou des symboles non enregistrés. Une clé primitive lève
une `TypeError` : `'ada'` n'a pas d'identité propre, deux chaînes égales sont la même
valeur, et rien ne pourrait être libéré.

Trois usages reviennent :

- **attacher des métadonnées** à des objets qu'on ne contrôle pas, sans y ajouter de
  propriété ;
- **mettre en cache** un résultat coûteux par instance, sans empêcher l'instance d'être
  libérée ;
- **stocker l'état privé** d'une classe, avant l'arrivée des champs privés `#champ`.

Pour observer une valeur unique, `WeakRef` et `FinalizationRegistry` existent aussi, mais
leur comportement dépend du moteur : on ne les utilise qu'en dernier recours.

## Erreurs fréquentes

**Utiliser une clé primitive.** `weakMap.set('cle', v)` lève une `TypeError`.

**Vouloir itérer ou compter.** Ces collections ne l'autorisent pas ; s'il faut lister les
entrées, c'est qu'une `Map` convient mieux.

**Croire que l'entrée disparaît immédiatement.** Elle devient éligible au nettoyage ; le
moment reste à la main du moteur.

**Garder la clé dans un tableau à côté.** Cette référence forte annule tout le bénéfice.

## À retenir

- Référence faible : la collection n'empêche pas la libération de la clé.
- Clés objets uniquement ; `set`, `get`, `has`, `delete`, rien d'autre.
- Ni `size`, ni itération : le résultat dépendrait du ramasse-miettes.
- Usages : métadonnées, cache par instance, état privé.
- Une `Map` classique sur des objets temporaires fuit en mémoire.

## Exercices

1. Écris un cache qui mémorise un calcul coûteux par objet, sans empêcher ces objets d'être
   libérés.

   :::indice
   La clé du cache est l'objet lui-même : quelle collection accepte cela sans le retenir ?
   :::

   :::solution
   ```js
   const cache = new WeakMap();

   function tailleTotale(dossier) {
     if (cache.has(dossier)) {
       return cache.get(dossier);
     }
     const total = dossier.fichiers.reduce((somme, f) => somme + f.taille, 0);
     cache.set(dossier, total);
     return total;
   }

   const dossier = { fichiers: [{ taille: 10 }, { taille: 32 }] };
   console.log(tailleTotale(dossier)); // 42
   console.log(tailleTotale(dossier)); // 42, sans recalcul
   ```
   :::

2. Stocke l'état privé d'une classe `Compteur` dans une `WeakMap`, de sorte qu'il ne soit pas
   lisible depuis l'extérieur.

   :::indice
   La clé est l'instance, `this`, et la valeur est l'objet d'état.
   :::

   :::solution
   ```js
   const etat = new WeakMap();

   class Compteur {
     constructor() {
       etat.set(this, { valeur: 0 });
     }

     incrementer() {
       etat.get(this).valeur += 1;
       return this;
     }

     get valeur() {
       return etat.get(this).valeur;
     }
   }

   const compteur = new Compteur();
   compteur.incrementer().incrementer();
   console.log(compteur.valeur); // 2
   console.log(Object.keys(compteur)); // [] : rien n'est exposé
   ```

   Les champs privés `#valeur` remplissent aujourd'hui ce rôle plus simplement, mais ce motif
   reste très présent dans le code existant.
   :::

3. Explique pourquoi `new WeakMap().size` vaut `undefined` et pourquoi ce n'est pas un
   oubli.

   :::indice
   Que faudrait-il connaître pour donner une taille exacte à un instant donné ?
   :::

   :::solution
   `size` n'existe pas sur une `WeakMap`. Le nombre d'entrées dépend du moment où le
   ramasse-miettes a libéré les clés devenues inutiles, or ce moment n'est pas prévisible :
   le même programme pourrait renvoyer 3 puis 2 sans qu'aucune ligne de code n'ait changé
   l'état. Exposer `size` ou l'itération rendrait le comportement du ramasse-miettes
   observable, ce que la spécification refuse. S'il faut compter, c'est qu'une `Map` est la
   bonne structure.

   ```js
   console.log(new WeakMap().size); // undefined
   ```
   :::

## Questions d'entretien

- Quelle différence entre `Map` et `WeakMap` ?

  :::indice
  Que devient un objet utilisé comme clé quand plus personne d'autre ne s'en sert ?
  :::

  :::reponse
  Une `Map` garde une référence forte sur ses clés : tant qu'elle existe, les objets qu'elle
  référence ne sont jamais libérés, ce qui provoque une fuite mémoire quand les clés sont des
  objets temporaires. Une `WeakMap` garde une référence faible : l'entrée disparaît d'elle-même
  quand la clé n'est plus utilisée ailleurs. En échange, elle n'accepte que des objets comme
  clés, et n'offre ni `size`, ni itération, ni `clear`.
  :::

- Pourquoi une `WeakMap` n'est-elle pas itérable ?

  :::indice
  Qu'observerait-on, exactement, en la parcourant ?
  :::

  :::reponse
  Parce que le contenu dépend du passage du ramasse-miettes, qui n'est ni déterministe ni
  observable par le programme. Itérer reviendrait à exposer quand la mémoire a été libérée :
  le résultat varierait d'une exécution à l'autre, et un code correct pourrait devenir faux
  selon la charge machine. La spécification supprime donc tout ce qui révélerait le contenu :
  `size`, `keys`, `values`, `entries` et `clear`.
  :::

- Dans quels cas réels utilise-t-on une `WeakMap` ?

  :::indice
  Pense aux données qu'on veut associer à un objet sans le modifier.
  :::

  :::reponse
  Pour attacher des métadonnées à des objets qu'on ne contrôle pas — marquer des nœuds du DOM
  déjà traités, associer un observateur à un élément — sans y ajouter de propriété ni empêcher
  leur libération. Pour un cache de résultats coûteux indexé par instance. Et, historiquement,
  pour l'état privé d'une classe, rôle repris par les champs privés `#champ`. Le point commun :
  la durée de vie des données doit suivre celle de l'objet.
  :::
