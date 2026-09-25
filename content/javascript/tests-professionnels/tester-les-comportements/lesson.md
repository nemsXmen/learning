---
id: javascript-tester-les-comportements
title: Tester les comportements, éviter les tests fragiles
slug: tester-les-comportements
technology: javascript
level: advanced
module: tests-professionnels
order: 1
estimatedMinutes: 40
difficulty: 4
xp: 100
prerequisites:
  - javascript-mocks-espions-et-modules
skills:
  - behavior-testing
tags:
  - javascript
  - tests
  - refactoring
---

## Objectifs

- Distinguer un comportement observable d'un détail d'implémentation.
- Reconnaître les causes d'un test fragile : état interne, appels internes, sur-spécification, temps, ordre.
- Réécrire un test pour qu'il survive à un refactoring et casse seulement quand le comportement change.
- Utiliser les snapshots avec parcimonie.

## Introduction

Un bon test a deux qualités qui tirent en sens opposé. Il doit **détecter les régressions** : casser quand le
comportement change. Et il doit **résister au refactoring** : rester vert quand on réorganise le code sans changer ce
qu'il fait. Un test qui casse à chaque réorganisation finit par être considéré comme du bruit ; on le « répare » en
recopiant la nouvelle valeur, et il ne protège plus rien.

La clé est de tester ce que voit l'**utilisateur du code** — les valeurs renvoyées, les erreurs levées, les effets
sur ses dépendances extérieures — et non la façon dont le code s'y prend.

## Concept

| Test fragile : il vérifie… | Test robuste : il vérifie… |
| --- | --- |
| une propriété interne (`panier.lignes`) | ce que renvoie l'API publique (`panier.contenu()`) |
| qu'une méthode interne a été appelée | le résultat produit |
| un objet entier avec des champs sans rapport | les champs qui portent la règle testée |
| le texte exact d'un gros rendu | les éléments qui comptent pour l'utilisateur |
| l'heure réelle, le hasard, un `sleep` | une horloge et un hasard contrôlés |
| un état laissé par le test précédent | un état préparé dans le test lui-même |

## Exemple

```js
// panier.js — première version
export class Panier {
  constructor(catalogue) {
    this.catalogue = catalogue;
    this.lignes = [];
  }

  ajouter(sku, quantite = 1) {
    if (!Number.isInteger(quantite) || quantite < 1) throw new RangeError(`Quantité invalide : ${quantite}`);
    const ligne = this.lignes.find((l) => l.sku === sku);
    if (ligne) ligne.quantite += quantite;
    else this.lignes.push({ sku, quantite });
  }

  contenu() {
    return this.lignes.map(({ sku, quantite }) => ({ sku, quantite }));
  }

  total() {
    return this.lignes.reduce((somme, l) => somme + this.catalogue.prix(l.sku) * l.quantite, 0);
  }
}
```

Un test fragile, qui passe aujourd'hui :

```js
it('ajoute un article', () => {
  const catalogue = { prix: vi.fn().mockReturnValue(10) };
  const panier = new Panier(catalogue);

  panier.ajouter('A', 2);
  panier.ajouter('A');

  expect(catalogue.prix).not.toHaveBeenCalled();
  expect(panier.lignes).toEqual([{ sku: 'A', quantite: 3 }]);
  expect(panier.total()).toBe(30);
});
```

Des tests robustes, qui vérifient le même comportement par l'API publique :

```js
import { describe, it, expect } from 'vitest';
import { Panier } from './panier.js';

const catalogue = { prix: (sku) => ({ A: 10, B: 2.5 })[sku] };

describe('Panier', () => {
  it('cumule les quantités d’un même article', () => {
    const panier = new Panier(catalogue);

    panier.ajouter('A', 2);
    panier.ajouter('A');

    expect(panier.contenu()).toEqual([{ sku: 'A', quantite: 3 }]);
  });

  it('calcule le total à partir des prix du catalogue', () => {
    const panier = new Panier(catalogue);

    panier.ajouter('A', 3);
    panier.ajouter('B', 2);

    expect(panier.total()).toBe(35);
  });

  it.each([0, -1, 1.5])('refuse la quantité %s', (quantite) => {
    expect(() => new Panier(catalogue).ajouter('A', quantite)).toThrow(RangeError);
  });
});
```

## Comment ça fonctionne

Supposons maintenant qu'on refactore `Panier` : les lignes passent dans un champ privé `#lignes` de type `Map`, et le
prix est lu une fois, à l'ajout, pour que le total ne change pas si le catalogue change pendant la commande.

```js
// panier.js — après refactoring
export class Panier {
  #catalogue;
  #lignes = new Map();

  constructor(catalogue) {
    this.#catalogue = catalogue;
  }

  ajouter(sku, quantite = 1) {
    if (!Number.isInteger(quantite) || quantite < 1) throw new RangeError(`Quantité invalide : ${quantite}`);
    const ligne = this.#lignes.get(sku) ?? { prix: this.#catalogue.prix(sku), quantite: 0 };
    ligne.quantite += quantite;
    this.#lignes.set(sku, ligne);
  }

  contenu() {
    return [...this.#lignes].map(([sku, { quantite }]) => ({ sku, quantite }));
  }

  total() {
    let somme = 0;
    for (const { prix, quantite } of this.#lignes.values()) somme += prix * quantite;
    return somme;
  }
}
```

Les tests robustes passent sans modification : le panier cumule, calcule et refuse exactement comme avant. Le test
fragile, lui, échoue deux fois pour de mauvaises raisons. `expect(catalogue.prix).not.toHaveBeenCalled()` décrivait
**quand** le prix était lu, un choix interne. `panier.lignes` n'existe plus : `toEqual` reçoit `undefined`. Aucun bug
n'a été introduit, pourtant le test est rouge — c'est un **faux positif**, et chaque faux positif apprend à l'équipe à
ignorer les tests rouges.

Un comportement, c'est ce qu'un utilisateur du code peut observer sans lire son code source : les valeurs renvoyées,
les erreurs levées, et les effets sur les dépendances **extérieures** — l'email réellement envoyé, la ligne écrite en
base. Vérifier un appel à une dépendance est légitime quand cet appel **est** le résultat attendu, comme l'envoi d'un
email ; c'est fragile quand il n'est qu'un moyen d'arriver au résultat, comme la lecture d'un prix.

Les autres sources de fragilité suivent la même logique. La **sur-spécification** compare un objet entier alors que
la règle ne porte que sur un champ : le test casse quand on ajoute un champ sans rapport. Le **temps** et le **hasard
réels** font échouer un test une fois sur cent, ou seulement le 29 février : on les contrôle avec les faux minuteurs,
`vi.spyOn(Math, 'random')` ou l'injection. Un **`sleep`** qui attend « assez longtemps » est à la fois lent et
instable. Et un test qui dépend de l'**ordre** d'exécution échoue dès qu'on le lance seul.

Les **snapshots** méritent une mention. `expect(valeur).toMatchSnapshot()` enregistre la valeur au premier passage
dans un fichier, puis compare les passages suivants ; `toMatchInlineSnapshot()` l'écrit directement dans le test.
Pratiques pour une petite sortie stable, ils deviennent fragiles sur un gros rendu : le moindre changement produit un
long diff, qu'on accepte avec `vitest -u` sans le lire. Un snapshot ne dit pas ce qui compte ; une assertion ciblée,
si.

Tester par l'API publique ne signifie pas tester uniquement de très gros morceaux. L'« unité » d'un test unitaire est
une unité de **comportement** : une fonction, une classe, ou quelques modules qui collaborent, tant qu'on les
utilise comme un client le ferait.

## Erreurs fréquentes

**Lire l'état interne d'un objet.** Passe par ses méthodes publiques ; si aucune ne permet de vérifier la règle,
c'est souvent que l'API manque de quelque chose.

**Rendre une méthode publique uniquement pour la tester.** Teste-la à travers la méthode publique qui l'utilise.

**Vérifier chaque appel interne avec un espion.** Réserve-le aux effets extérieurs qui font partie du résultat.

**Accepter un snapshot sans lire le diff.** Le test ne vérifie plus rien.

**Corriger un test rouge en recopiant la nouvelle valeur.** Demande-toi d'abord si le comportement a changé.

## À retenir

- Un bon test casse quand le comportement change, et seulement dans ce cas.
- On vérifie les sorties, les erreurs et les effets extérieurs, par l'API publique.
- Un appel à une dépendance ne se vérifie que s'il est lui-même le résultat attendu.
- Temps, hasard, ordre et `sleep` sont des sources de tests instables : on les contrôle.
- Les snapshots conviennent aux petites sorties stables ; ailleurs, préfère des assertions ciblées.

## Exercices

1. Ce test d'inscription casse à chaque refactoring. Repère ce qui relève de l'implémentation, puis réécris-le
   autour de deux comportements : l'utilisateur est enregistré, et un email de bienvenue lui est envoyé.

   ```js
   it('inscrit un utilisateur', async () => {
     const depot = { enregistrer: vi.fn().mockResolvedValue(), existe: vi.fn().mockResolvedValue(false) };
     const emails = { envoyer: vi.fn().mockResolvedValue() };
     const service = creerServiceInscription({ depot, emails });
     const normaliser = vi.spyOn(service, 'normaliserEmail');

     await service.inscrire(' Ada@Exemple.fr ');

     expect(normaliser).toHaveBeenCalledTimes(1);
     expect(depot.existe).toHaveBeenCalledBefore(depot.enregistrer);
     expect(depot.enregistrer).toHaveBeenCalledWith({ id: expect.any(String), email: 'ada@exemple.fr', creeLe: expect.any(Date), version: 1 });
   });
   ```

   :::indice
   L'utilisateur du service se soucie-t-il de `normaliserEmail`, de l'ordre des appels au dépôt, du champ `version` ?
   Un faux dépôt en mémoire permet de vérifier ce qui a été enregistré.
   :::

   :::solution
   `normaliserEmail` est une méthode interne, l'ordre `existe` puis `enregistrer` un choix d'implémentation, et
   `version` un détail de stockage. Ce qui compte : l'utilisateur est retrouvable avec son email normalisé, un email de
   bienvenue part, et un doublon est refusé.

   ```js
   import { describe, it, expect, vi } from 'vitest';

   function creerServiceInscription({ depot, emails }) {
     return {
       normaliserEmail: (email) => email.trim().toLowerCase(),
       async inscrire(emailBrut) {
         const email = this.normaliserEmail(emailBrut);
         if (await depot.existe(email)) throw new Error('Email déjà utilisé');
         await depot.enregistrer({ id: crypto.randomUUID(), email, creeLe: new Date(), version: 1 });
         await emails.envoyer(email, 'Bienvenue !');
       },
     };
   }

   function creerDepotEnMemoire() {
     const utilisateurs = new Map();
     return {
       existe: async (email) => utilisateurs.has(email),
       enregistrer: async (utilisateur) => void utilisateurs.set(utilisateur.email, utilisateur),
       trouverParEmail: async (email) => utilisateurs.get(email),
     };
   }

   describe('inscription', () => {
     it('enregistre l’utilisateur avec son email normalisé', async () => {
       const depot = creerDepotEnMemoire();
       const service = creerServiceInscription({ depot, emails: { envoyer: vi.fn() } });

       await service.inscrire(' Ada@Exemple.fr ');

       await expect(depot.trouverParEmail('ada@exemple.fr')).resolves.toMatchObject({ email: 'ada@exemple.fr' });
     });

     it('envoie un email de bienvenue', async () => {
       const emails = { envoyer: vi.fn() };
       const service = creerServiceInscription({ depot: creerDepotEnMemoire(), emails });

       await service.inscrire('ada@exemple.fr');

       expect(emails.envoyer).toHaveBeenCalledWith('ada@exemple.fr', expect.stringContaining('Bienvenue'));
     });

     it('refuse un email déjà inscrit', async () => {
       const service = creerServiceInscription({ depot: creerDepotEnMemoire(), emails: { envoyer: vi.fn() } });
       await service.inscrire('ada@exemple.fr');

       await expect(service.inscrire('ADA@exemple.fr')).rejects.toThrow('déjà utilisé');
     });
   });
   ```

   L'espion sur `emails.envoyer` reste : l'email envoyé est un effet extérieur attendu, pas un détail.
   :::

2. Ce test échoue certains jours seulement. Explique pourquoi, puis rends-le déterministe sans modifier
   `estOuvert`.

   ```js
   const estOuvert = (date = new Date()) => date.getDay() !== 0 && date.getHours() >= 9 && date.getHours() < 19;

   it('le magasin est ouvert', () => {
     expect(estOuvert()).toBe(true);
   });
   ```

   :::indice
   Le résultat dépend du jour et de l'heure où le test tourne. Le paramètre `date` permet de choisir l'instant.
   :::

   :::solution
   Le test lit l'heure réelle : il échoue le dimanche, avant 9 h et après 19 h. On passe des dates choisies, en
   couvrant les limites.

   ```js
   import { it, expect } from 'vitest';

   const estOuvert = (date = new Date()) => date.getDay() !== 0 && date.getHours() >= 9 && date.getHours() < 19;

   it.each([
     { quand: 'mardi 9 h', date: new Date(2026, 8, 22, 9, 0), attendu: true },
     { quand: 'mardi 18 h 59', date: new Date(2026, 8, 22, 18, 59), attendu: true },
     { quand: 'mardi 19 h', date: new Date(2026, 8, 22, 19, 0), attendu: false },
     { quand: 'mardi 8 h 59', date: new Date(2026, 8, 22, 8, 59), attendu: false },
     { quand: 'dimanche 11 h', date: new Date(2026, 8, 27, 11, 0), attendu: false },
   ])('$quand → ouvert : $attendu', ({ date, attendu }) => {
     expect(estOuvert(date)).toBe(attendu);
   });
   ```

   Les dates sont construites en heure locale, comme `getHours` les lit : le test donne le même résultat quel que soit
   le fuseau de la machine.
   :::

3. `classerJoueurs(joueurs)` renvoie les noms triés par score décroissant. Ce test vérifie comment le tri est fait.
   Pourquoi est-ce un problème ? Remplace-le par des tests de comportement, dont un sur les ex æquo : à score égal,
   l'ordre alphabétique.

   ```js
   it('trie les joueurs', () => {
     const tri = vi.spyOn(Array.prototype, 'sort');
     classerJoueurs([{ nom: 'Bob', score: 3 }, { nom: 'Ada', score: 5 }]);
     expect(tri).toHaveBeenCalledTimes(1);
   });
   ```

   :::indice
   Si demain le code utilise `toSorted`, le classement change-t-il ? Le test, oui.
   :::

   :::solution
   Le test impose un outil (`sort`) au lieu d'un résultat : il cassera si l'on passe à `toSorted`, et il passerait
   même si le tri était dans le mauvais sens. Il espionne en plus un prototype global, qu'il faudrait restaurer.

   ```js
   import { describe, it, expect } from 'vitest';

   const classerJoueurs = (joueurs) =>
     joueurs.toSorted((a, b) => b.score - a.score || a.nom.localeCompare(b.nom)).map((j) => j.nom);

   describe('classerJoueurs', () => {
     it('classe par score décroissant', () => {
       expect(classerJoueurs([{ nom: 'Bob', score: 3 }, { nom: 'Ada', score: 5 }])).toEqual(['Ada', 'Bob']);
     });

     it('départage les ex æquo par ordre alphabétique', () => {
       const joueurs = [{ nom: 'Chloé', score: 4 }, { nom: 'Ada', score: 4 }, { nom: 'Bob', score: 9 }];
       expect(classerJoueurs(joueurs)).toEqual(['Bob', 'Ada', 'Chloé']);
     });

     it('ne modifie pas le tableau reçu', () => {
       const joueurs = [{ nom: 'Bob', score: 3 }, { nom: 'Ada', score: 5 }];
       classerJoueurs(joueurs);
       expect(joueurs.map((j) => j.nom)).toEqual(['Bob', 'Ada']);
     });
   });
   ```
   :::

## Questions d'entretien

- Qu'est-ce qu'un test fragile, et comment l'éviter ?

  :::indice
  Pense aux faux positifs lors d'un refactoring.
  :::

  :::reponse
  Un test fragile échoue alors que le comportement n'a pas changé, typiquement après un refactoring. Il vérifie des
  détails d'implémentation : état interne, appels à des méthodes internes, objets entiers sur-spécifiés, ou il
  dépend de l'heure, du hasard ou de l'ordre des tests. Pour l'éviter, je teste par l'API publique, je vérifie les
  sorties, les erreurs et les effets extérieurs, je cible les champs qui portent la règle, et je contrôle le temps et
  le hasard. Un test rouge doit signifier « le comportement a changé ».
  :::

- Quand est-il légitime de vérifier qu'une dépendance a été appelée ?

  :::indice
  Distingue les requêtes, qui renvoient une donnée, des commandes, qui produisent un effet.
  :::

  :::reponse
  Quand l'appel est lui-même le comportement attendu : une commande vers l'extérieur, comme envoyer un email, publier
  un message ou débiter un paiement. Pour une requête qui ne sert qu'à obtenir une donnée, comme lire un prix, je
  vérifie le résultat qui en découle, pas l'appel : le nombre et le moment des lectures sont des choix internes qui
  peuvent changer, par exemple avec un cache.
  :::

- Que penses-tu des tests par snapshot ?

  :::indice
  Que vérifie un snapshot, et que se passe-t-il quand il change ?
  :::

  :::reponse
  Ils sont utiles pour une petite sortie stable dont la forme exacte compte, comme un message d'erreur formaté ou un
  petit objet sérialisé, surtout en version inline où la valeur reste lisible dans le test. Sur un gros rendu, ils
  vérifient tout et donc rien de précis : chaque changement produit un long diff qu'on finit par accepter sans le
  lire. Dans ce cas, je préfère des assertions ciblées sur ce qui compte pour l'utilisateur.
  :::
