---
id: javascript-figer
title: "freeze, seal et preventExtensions"
slug: figer-sceller-empecher
technology: javascript
level: advanced
module: descripteurs
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-descripteurs
skills:
  - object-immutability
tags:
  - javascript
  - avance
---

## Objectifs

- Distinguer les trois niveaux de protection d'un objet : non extensible, scellé, gelé.
- Savoir ce que chacun change aux descripteurs des propriétés.
- Geler en profondeur un objet de configuration, et connaître les limites de ces protections.

## Introduction

`const` empêche de réaffecter une variable, mais pas de modifier l'objet qu'elle désigne. Pour protéger l'objet
lui-même — une configuration qui ne doit pas changer, des constantes partagées, un état qu'aucun module ne doit altérer
— le langage offre trois niveaux, de plus en plus stricts. Ils s'expliquent entièrement par les descripteurs vus au
chapitre précédent.

## Concept

| Opération | Ajouter | Supprimer | Modifier une valeur | Test |
| --- | --- | --- | --- | --- |
| `Object.preventExtensions(o)` | non | oui | oui | `Object.isExtensible(o)` |
| `Object.seal(o)` | non | non | oui | `Object.isSealed(o)` |
| `Object.freeze(o)` | non | non | non | `Object.isFrozen(o)` |

Ce que chaque opération fait aux descripteurs :

- `preventExtensions` rend l'objet **non extensible**, sans toucher aux propriétés existantes ;
- `seal` fait de même et passe toutes les propriétés à `configurable: false` ;
- `freeze` fait de même et passe en plus toutes les propriétés de données à `writable: false`.

Les trois sont **superficiels** : les objets imbriqués ne sont pas protégés. Une opération interdite lève une
`TypeError` en mode strict, et échoue silencieusement sinon.

## Exemple

```js
const configuration = Object.freeze({
  port: 3000,
  base: { hote: 'localhost' },
});

try {
  configuration.port = 8080;
} catch (erreur) {
  console.log(erreur.name); // 'TypeError' : modification refusée
}
configuration.base.hote = 'ailleurs'; // l'objet imbriqué n'est pas gelé
console.log(configuration.port, configuration.base.hote); // 3000 'ailleurs'
console.log(Object.getOwnPropertyDescriptor(configuration, 'port'));
// { value: 3000, writable: false, enumerable: true, configurable: false }

const profil = Object.seal({ nom: 'Ada', ville: 'Londres' });
profil.ville = 'Paris'; // modification permise
try {
  profil.age = 36; // ajout refusé
} catch (erreur) {
  console.log('scellé :', erreur.name); // 'scellé : TypeError'
}
console.log(profil); // { nom: 'Ada', ville: 'Paris' }

const brouillon = Object.preventExtensions({ titre: 'Sans titre' });
delete brouillon.titre; // suppression permise
try {
  brouillon.auteur = 'Ada';
} catch (erreur) {
  console.log('non extensible :', erreur.name); // 'non extensible : TypeError'
}

function gelerProfondement(objet) {
  Object.freeze(objet);
  for (const valeur of Object.values(objet)) {
    if (typeof valeur === 'object' && valeur !== null && !Object.isFrozen(valeur)) {
      gelerProfondement(valeur);
    }
  }
  return objet;
}

const constantes = gelerProfondement({ tva: 0.2, devises: { euro: '€' } });
console.log(Object.isFrozen(constantes.devises)); // true
```

## Comment ça fonctionne

Les trois opérations agissent sur deux choses : l'**extensibilité** de l'objet, et les **descripteurs** de ses
propriétés existantes. `preventExtensions` pose un drapeau interne qui interdit toute nouvelle propriété, et ne touche
à rien d'autre. `seal` pose ce drapeau et rend chaque propriété non configurable : on ne peut plus en supprimer, mais
leurs valeurs restent modifiables. `freeze` ajoute `writable: false` sur les propriétés de données : plus rien ne peut
changer. Chaque niveau inclut le précédent, et aucun ne peut être annulé : un objet gelé le reste.

Ces protections sont **superficielles** : elles ne concernent que les propriétés directes. Un objet imbriqué, un
tableau contenu dans un objet gelé restent modifiables, ce que montre `configuration.base.hote`. Pour une protection
complète, on gèle récursivement chaque objet atteint, comme `gelerProfondement`. La fonction gèle l'objet **avant** de
descendre : grâce au test `Object.isFrozen`, une référence circulaire retombe sur un objet déjà gelé et la récursion
s'arrête. Contrepartie : un objet gelé superficiellement par ailleurs est sauté, avec ses enfants encore modifiables.

Les **accesseurs** d'un objet gelé restent des fonctions : un `set` peut toujours s'exécuter et modifier autre chose que
l'objet, par exemple une variable de closure. Geler un objet ne garantit donc pas qu'aucun état associé ne change.

Deux cas particuliers méritent d'être connus. Les propriétés d'un objet gelé ne sont pas « copiées » par le gel : c'est
bien le même objet, modifié dans ses attributs. Et un objet gelé peut toujours être **copié** par le spread, ce qui donne
un nouvel objet ordinaire, modifiable : `{ ...configuration }` n'est plus gelé.

En pratique, `Object.freeze` sert surtout à protéger des constantes et des configurations partagées, et à rendre
bruyante une modification accidentelle pendant le développement. Pour gérer un état qui évolue, on préfère les mises à
jour immuables — créer de nouvelles versions avec le spread — plutôt que geler et copier sans cesse. Dans un code en
TypeScript, `readonly` et `as const` offrent une protection vérifiée à la compilation, sans coût à l'exécution.

## Erreurs fréquentes

**Croire qu'`Object.freeze` protège les objets imbriqués.** Gèle récursivement si nécessaire.

**Confondre `const` et `Object.freeze`.** `const` fige la variable, `freeze` fige l'objet.

**Attendre une erreur en mode non strict.** Les écritures refusées échouent en silence : travaille en module.

**Vouloir dégeler un objet.** C'est impossible : crée une copie modifiable avec le spread.

**Geler un état qui change souvent.** Préfère les mises à jour immuables.

## À retenir

- `preventExtensions` : pas d'ajout. `seal` : ni ajout ni suppression. `freeze` : aucune modification.
- `seal` rend les propriétés non configurables ; `freeze` les rend aussi non modifiables.
- Les trois sont superficiels et irréversibles.
- Une écriture refusée lève une `TypeError` en mode strict.
- Une copie par spread d'un objet gelé est un objet ordinaire.

## Exercices

1. Pour chaque ligne, dis si l'opération réussit, en mode strict, et justifie.

   ```js
   const a = Object.preventExtensions({ x: 1 });
   const b = Object.seal({ x: 1 });
   const c = Object.freeze({ x: 1, liste: [] });

   a.x = 2;
   delete a.x;
   b.x = 2;
   delete b.x;
   c.liste.push(1);
   c.x = 2;
   ```

   :::indice
   Pour chaque objet, demande-toi : ajout, suppression ou modification d'une valeur ? Et l'opération porte-t-elle sur
   l'objet protégé lui-même ?
   :::

   :::solution
   - `a.x = 2` réussit : un objet non extensible accepte les modifications.
   - `delete a.x` réussit : les suppressions sont permises.
   - `b.x = 2` réussit : un objet scellé accepte les modifications de valeur.
   - `delete b.x` échoue avec une `TypeError` : les propriétés d'un objet scellé ne sont pas configurables.
   - `c.liste.push(1)` réussit : le tableau imbriqué n'est pas gelé.
   - `c.x = 2` échoue avec une `TypeError` : la propriété d'un objet gelé n'est pas modifiable.
   :::

2. Écris `niveauDeProtection(objet)` qui renvoie `'gelé'`, `'scellé'`, `'non extensible'` ou `'libre'`, du niveau le
   plus fort au plus faible.

   :::indice
   Teste dans l'ordre `Object.isFrozen`, `Object.isSealed`, puis `Object.isExtensible` : chaque niveau inclut le
   suivant.
   :::

   :::solution
   ```js
   function niveauDeProtection(objet) {
     if (Object.isFrozen(objet)) return 'gelé';
     if (Object.isSealed(objet)) return 'scellé';
     if (!Object.isExtensible(objet)) return 'non extensible';
     return 'libre';
   }

   console.log(niveauDeProtection(Object.freeze({ a: 1 }))); // 'gelé'
   console.log(niveauDeProtection(Object.seal({ a: 1 }))); // 'scellé'
   console.log(niveauDeProtection(Object.preventExtensions({ a: 1 }))); // 'non extensible'
   console.log(niveauDeProtection({ a: 1 })); // 'libre'
   console.log(niveauDeProtection(Object.preventExtensions({}))); // 'gelé'
   ```

   Le dernier cas surprend : un objet vide et non extensible n'a aucune propriété à protéger, il est donc à la fois
   scellé et gelé.
   :::

3. Une fonction `mettreAJour(etat, changements)` reçoit un état gelé. Écris-la pour qu'elle renvoie un nouvel état,
   gelé lui aussi, sans jamais modifier l'ancien.

   :::indice
   Le spread d'un objet gelé produit un objet ordinaire : fusionne, puis gèle le résultat.
   :::

   :::solution
   ```js
   function mettreAJour(etat, changements) {
     return Object.freeze({ ...etat, ...changements });
   }

   const initial = Object.freeze({ page: 1, filtre: 'tous' });
   const suivant = mettreAJour(initial, { page: 2 });

   console.log(initial.page, suivant.page, suivant.filtre); // 1 2 'tous'
   console.log(Object.isFrozen(suivant), initial === suivant); // true false
   ```

   L'ancien état reste intact, ce qui permet de comparer les versions par référence pour détecter un changement.
   :::

## Questions d'entretien

- Quelle différence entre `Object.freeze`, `Object.seal` et `Object.preventExtensions` ?

  :::indice
  Pour chacun, regarde l'ajout, la suppression et la modification d'une propriété.
  :::

  :::reponse
  `preventExtensions` interdit seulement l'ajout de propriétés. `seal` interdit aussi la suppression en rendant les
  propriétés non configurables, mais les valeurs restent modifiables. `freeze` rend en plus les propriétés de données
  non modifiables. Les trois sont superficiels, irréversibles, et une opération refusée lève une `TypeError` en mode
  strict, ou échoue en silence sinon.
  :::

- Un objet gelé peut-il changer malgré tout ?

  :::indice
  Pense aux objets imbriqués et aux accesseurs.
  :::

  :::reponse
  Oui, de deux façons. Les objets qu'il référence ne sont pas gelés : un tableau contenu dans un objet gelé accepte
  `push`. Et un accesseur reste une fonction : son `get` peut renvoyer une valeur calculée différente à chaque lecture,
  et son `set` peut modifier un état extérieur. Le gel garantit que les propriétés propres ne changent pas de valeur ni
  de forme, pas que tout ce qui est atteignable est immuable.
  :::

- `Object.freeze` est-il une bonne façon de gérer l'état d'une application ?

  :::indice
  Pense au coût d'un gel profond et à la manière dont l'état évolue.
  :::

  :::reponse
  C'est utile pour des constantes partagées et pour détecter en développement une mutation accidentelle. Mais l'état
  d'une application change sans cesse : on le gère plutôt par des mises à jour immuables, en créant de nouvelles
  versions avec le spread, sans modifier les anciennes. Geler profondément chaque version coûte du temps, et
  TypeScript, avec `readonly` et `as const`, apporte la même discipline à la compilation, sans coût à l'exécution.
  :::
