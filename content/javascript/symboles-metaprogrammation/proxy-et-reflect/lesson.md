---
id: javascript-proxy
title: "Proxy et Reflect : intercepter les opérations sur un objet"
slug: proxy-et-reflect
technology: javascript
level: expert
module: symboles-metaprogrammation
order: 2
estimatedMinutes: 30
difficulty: 5
xp: 100
prerequisites:
  - javascript-symboles
  - javascript-prototype-proto
skills:
  - proxy-reflect
tags:
  - javascript
  - avance
---

## Objectifs

- Créer un `Proxy` qui intercepte la lecture, l'écriture, le test et la suppression de propriétés.
- Utiliser `Reflect` pour appliquer le comportement par défaut depuis un piège.
- Reconnaître les usages légitimes de la métaprogrammation, et ses limites.

## Introduction

Un framework réactif met l'interface à jour quand une donnée change, sans qu'on appelle la moindre fonction ; une
bibliothèque de validation refuse une affectation incorrecte au moment où elle a lieu. Ces comportements reposent
sur la **métaprogrammation** : du code qui intervient sur le fonctionnement même des objets. En JavaScript, l'outil
central est `Proxy`, qui place un intermédiaire devant un objet et intercepte les opérations fondamentales.

## Concept

```js
const proxy = new Proxy(cible, gestionnaire);
```

Le **gestionnaire** définit des **pièges**, un par opération interceptée :

| Piège | Opération interceptée |
| --- | --- |
| `get(cible, cle, recepteur)` | lecture `proxy.cle` |
| `set(cible, cle, valeur, recepteur)` | écriture `proxy.cle = valeur` ; renvoyer `true` en cas de succès |
| `has(cible, cle)` | `cle in proxy` |
| `deleteProperty(cible, cle)` | `delete proxy.cle` |
| `ownKeys(cible)` | `Object.keys`, `for...in`, `Reflect.ownKeys` |
| `apply(cible, thisArg, arguments)` | appel, si la cible est une fonction |

Chaque piège a un équivalent dans **`Reflect`** — `Reflect.get`, `Reflect.set`, `Reflect.has`… — qui réalise
l'opération par défaut. Un piège fait son traitement, puis délègue à `Reflect` pour conserver le comportement normal.

## Exemple

```js
function avecValidation(cible, schema) {
  return new Proxy(cible, {
    set(objet, cle, valeur, recepteur) {
      const valider = schema[cle];
      if (valider && !valider(valeur)) {
        throw new TypeError(`Valeur invalide pour ${String(cle)} : ${valeur}`);
      }
      return Reflect.set(objet, cle, valeur, recepteur);
    },
  });
}

const utilisateur = avecValidation(
  { nom: 'Ada', age: 36 },
  { age: (v) => Number.isInteger(v) && v >= 0, nom: (v) => typeof v === 'string' && v.length > 0 },
);
utilisateur.age = 37;
try {
  utilisateur.age = -4;
} catch (erreur) {
  console.log(erreur.message); // 'Valeur invalide pour age : -4'
}
console.log(utilisateur.age); // 37 : l'affectation invalide n'a pas eu lieu

function observer(cible, surChangement) {
  return new Proxy(cible, {
    set(objet, cle, valeur, recepteur) {
      const ancienne = objet[cle];
      const resultat = Reflect.set(objet, cle, valeur, recepteur);
      if (ancienne !== valeur) surChangement(cle, ancienne, valeur);
      return resultat;
    },
  });
}

const changements = [];
const panier = observer({ total: 0 }, (cle, avant, apres) => changements.push(`${cle} : ${avant} → ${apres}`));
panier.total = 50;
panier.total = 50; // même valeur : aucune notification
panier.total = 70;
console.log(changements); // ['total : 0 → 50', 'total : 50 → 70']

const configuration = new Proxy({ port: 3000 }, {
  get(objet, cle, recepteur) {
    if (!Reflect.has(objet, cle)) throw new ReferenceError(`Réglage inconnu : ${String(cle)}`);
    return Reflect.get(objet, cle, recepteur);
  },
});
console.log(configuration.port); // 3000
try {
  configuration.prot;
} catch (erreur) {
  console.log(erreur.message); // 'Réglage inconnu : prot' : la faute de frappe ne passe plus inaperçue
}
```

## Comment ça fonctionne

Un `Proxy` est un objet vide en apparence, qui redirige chaque **opération fondamentale** vers le gestionnaire. Si le
gestionnaire définit le piège correspondant, celui-ci est appelé ; sinon, l'opération est appliquée directement à la
cible. Le proxy et la cible sont deux objets distincts : les modifications faites par le proxy atteignent la cible, mais
un code qui détient une référence directe à la cible contourne entièrement les pièges.

`Reflect` fournit, pour chaque piège, la fonction qui réalise l'opération **par défaut**, avec la même signature. Dans un
piège, on appelle `Reflect.set(cible, cle, valeur, recepteur)` plutôt que `cible[cle] = valeur` : le récepteur est
transmis correctement aux accesseurs et à la chaîne de prototypes, et la valeur de retour indique le succès. Un piège
`set` doit renvoyer `true` ; s'il renvoie `false`, l'affectation lève une `TypeError` en mode strict.

Les pièges respectent des **invariants** : un proxy ne peut pas prétendre qu'une propriété non configurable n'existe pas,
ni renvoyer une valeur différente pour une propriété figée. Le moteur vérifie ces règles et lève une `TypeError` si un
piège les enfreint, ce qui garantit qu'un objet gelé reste gelé même derrière un proxy.

Certains objets natifs — `Date`, `Map`, `Set`, promesses, éléments du DOM — stockent leurs données dans des
**emplacements internes**. Leurs méthodes vérifient que `this` est bien l'objet d'origine : appelées à travers un proxy,
elles lèvent une `TypeError`. Pour ces types, il faut lier les méthodes à la cible dans le piège `get`, ou éviter le proxy.

`Proxy` a un coût : chaque opération passe par une fonction, ce qui ralentit les accès fréquents. Les usages légitimes
sont ceux où l'interception est la fonctionnalité elle-même : la **réactivité** des frameworks comme Vue, la
**validation** à l'affectation, la détection de propriétés inconnues en développement, l'enregistrement d'appels dans les
tests. Pour un besoin simple, une fonction ou un accesseur `set` restent plus lisibles.

## Erreurs fréquentes

**Oublier de renvoyer `true` dans le piège `set`.** L'affectation lève une `TypeError` en mode strict.

**Modifier la cible directement au lieu du proxy.** Les pièges ne voient rien.

**Écrire `cible[cle]` au lieu de `Reflect.get`.** Les accesseurs reçoivent le mauvais `this`.

**Envelopper une `Map` ou une `Date` sans précaution.** Leurs méthodes lèvent une `TypeError`.

**Utiliser un proxy là où une fonction suffit.** Le code devient plus lent et plus difficile à suivre.

## À retenir

- `new Proxy(cible, gestionnaire)` intercepte les opérations fondamentales par des pièges.
- `Reflect` réalise l'opération par défaut : un piège traite, puis délègue.
- Le piège `set` renvoie `true` en cas de succès ; les invariants de la cible restent vérifiés.
- Les objets natifs à emplacements internes, comme `Map` et `Date`, se prêtent mal aux proxys.
- Usages : réactivité, validation, détection d'erreurs, outils de test.

## Exercices

1. Écris `sansProprietesInconnues(objet)` qui renvoie un proxy levant une `ReferenceError` pour toute lecture d'une propriété
   absente, sauf pour les symboles comme `Symbol.toPrimitive`, que les outils lisent automatiquement.

   :::indice
   Dans le piège `get`, laisse passer les clés de type symbole, et teste l'existence avec `Reflect.has`.
   :::

   :::solution
   ```js
   function sansProprietesInconnues(objet) {
     return new Proxy(objet, {
       get(cible, cle, recepteur) {
         if (typeof cle === 'symbol' || Reflect.has(cible, cle)) {
           return Reflect.get(cible, cle, recepteur);
         }
         throw new ReferenceError(`Propriété inconnue : ${cle}`);
       },
     });
   }

   const reglages = sansProprietesInconnues({ theme: 'sombre' });
   console.log(reglages.theme, String(reglages)); // 'sombre' '[object Object]'
   try {
     reglages.tehme;
   } catch (erreur) {
     console.log(erreur.message); // 'Propriété inconnue : tehme'
   }
   ```

   `Reflect.has` regarde aussi la chaîne de prototypes : les méthodes héritées comme `toString` restent accessibles.
   :::

2. Écris `espionner(fonction)` qui renvoie un proxy de la fonction enregistrant chaque appel — arguments et résultat — dans
   un tableau `appels`, sans modifier le comportement de la fonction. C'est le principe des « espions » des outils de test.

   :::indice
   Le piège `apply(cible, thisArg, args)` intercepte l'appel ; `Reflect.apply` exécute la fonction d'origine.
   :::

   :::solution
   ```js
   function espionner(fonction) {
     const appels = [];
     const espion = new Proxy(fonction, {
       apply(cible, thisArg, args) {
         const resultat = Reflect.apply(cible, thisArg, args);
         appels.push({ args, resultat });
         return resultat;
       },
     });
     return { espion, appels };
   }

   const { espion: ttc, appels } = espionner((ht) => Math.round(ht * 1.2 * 100) / 100);
   console.log(ttc(10), ttc(25)); // 12 30
   console.log(appels); // [{ args: [10], resultat: 12 }, { args: [25], resultat: 30 }]
   ```
   :::

3. Un module de configuration doit pouvoir **retirer** l'accès à un objet sensible une fois l'initialisation terminée.
   Utilise `Proxy.revocable` pour écrire `accesTemporaire(secrets)`.

   :::indice
   `Proxy.revocable(cible, gestionnaire)` renvoie `{ proxy, revoke }` ; après `revoke()`, toute opération sur le proxy lève
   une `TypeError`.
   :::

   :::solution
   ```js
   function accesTemporaire(secrets) {
     const { proxy, revoke } = Proxy.revocable(secrets, {});
     return { secrets: proxy, revoquer: revoke };
   }

   const { secrets, revoquer } = accesTemporaire({ cleApi: 'xyz' });
   console.log(secrets.cleApi); // 'xyz' : lecture pendant l'initialisation
   revoquer();
   try {
     secrets.cleApi;
   } catch (erreur) {
     console.log(erreur.name); // 'TypeError' : l'accès est définitivement retiré
   }
   ```

   Seul l'accès **par ce proxy** est retiré : un code qui aurait conservé une référence directe à l'objet d'origine pourrait
   toujours le lire.
   :::

## Questions d'entretien

- Qu'est-ce qu'un `Proxy`, et à quoi sert `Reflect` ?

  :::indice
  L'un intercepte, l'autre réalise le comportement par défaut.
  :::

  :::reponse
  Un `Proxy` enveloppe un objet et intercepte ses opérations fondamentales — lecture, écriture, test d'appartenance,
  suppression, énumération des clés, appel — par des fonctions appelées pièges. `Reflect` expose, pour chaque piège, la
  fonction qui effectue l'opération normale, avec la même signature. Un piège fait son traitement puis délègue à
  `Reflect`, ce qui conserve le comportement attendu, notamment pour les accesseurs et l'héritage.
  :::

- Donne des usages concrets de `Proxy`.

  :::indice
  Pense aux frameworks, à la validation et aux outils de test.
  :::

  :::reponse
  La réactivité, où un framework comme Vue détecte les modifications d'un objet pour mettre l'interface à jour ; la
  validation au moment de l'affectation ; la détection de propriétés inconnues, qui transforme une faute de frappe
  silencieuse en erreur ; les espions et doublures des outils de test, qui enregistrent les appels ; ou encore un accès
  révocable à un objet sensible. Dans tous ces cas, l'interception est la fonctionnalité elle-même.
  :::

- Quelles sont les limites de `Proxy` ?

  :::indice
  Pense aux performances, aux objets natifs et à l'identité des objets.
  :::

  :::reponse
  Chaque opération passe par une fonction, ce qui ralentit les accès fréquents. Les objets natifs à emplacements internes,
  comme `Map`, `Set` ou `Date`, lèvent une `TypeError` quand leurs méthodes sont appelées à travers un proxy. Le proxy est
  un objet différent de sa cible : un code qui garde une référence à la cible contourne les pièges, et une comparaison
  `proxy === cible` est fausse. Enfin, les invariants des propriétés non configurables limitent ce qu'un piège peut
  renvoyer.
  :::
