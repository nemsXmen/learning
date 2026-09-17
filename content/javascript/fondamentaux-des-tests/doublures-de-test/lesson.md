---
id: javascript-doublures-de-test
title: "Doublures de test : dummy, stub, spy, mock et fake"
slug: doublures-de-test
technology: javascript
level: intermediate
module: fondamentaux-des-tests
order: 3
estimatedMinutes: 35
difficulty: 3
xp: 90
prerequisites:
  - javascript-aaa-isolation
  - javascript-motifs-fonctionnels
skills:
  - test-doubles
tags:
  - javascript
  - tests
---

## Objectifs

- Nommer les cinq doublures de test et savoir ce que chacune remplace.
- Écrire à la main un stub, un espion, un mock et un fake, sans bibliothèque.
- Choisir la doublure la plus simple qui permet d'écrire le test.
- Reconnaître les risques d'une simulation trop éloignée du vrai composant.

## Introduction

Le code utile parle au monde : base de données, envoi d'emails, paiement, horloge. Pour tester une règle métier, on ne
veut ni envoyer de vrais emails ni dépendre d'une base allumée. On remplace alors ces collaborateurs par des
**doublures**, comme au cinéma. Le vocabulaire est souvent employé de travers — tout le monde dit « mock » pour tout —
alors que chaque doublure répond à un besoin différent. Les distinguer aide à écrire des tests plus simples et plus
robustes.

## Concept

| Doublure | Ce qu'elle fait | Question à laquelle elle répond |
| --- | --- | --- |
| Dummy | remplit un paramètre, n'est jamais utilisée | « il faut bien passer quelque chose » |
| Stub | renvoie des réponses préparées | « et si le dépôt répondait ceci ? » |
| Spy (espion) | enregistre les appels reçus, pour les vérifier après | « a-t-on bien envoyé l'email ? » |
| Mock | connaît à l'avance les appels attendus et se vérifie lui-même | « cet échange exact a-t-il eu lieu ? » |
| Fake | implémentation simplifiée mais fonctionnelle | « comme la vraie base, mais en mémoire » |

Toutes supposent que le code reçoit ses collaborateurs, en paramètre ou par une fabrique : c'est l'injection vue dans
les motifs fonctionnels.

## Exemple

```js
import { describe, it, expect } from 'vitest';

function creerInscription({ utilisateurs, emails, journal }) {
  return async (email) => {
    if (await utilisateurs.existe(email)) return { ok: false, erreur: 'Email déjà utilisé' };
    const utilisateur = await utilisateurs.creer({ email });
    await emails.envoyer(email, 'Bienvenue sur Atelier');
    return { ok: true, utilisateur };
  };
}

// Dummy : exigé par la signature, jamais utilisé dans ces scénarios.
const journalDummy = {};

// Fake : un dépôt qui fonctionne vraiment, en mémoire.
function creerUtilisateursEnMemoire() {
  const parEmail = new Map();
  return {
    existe: async (email) => parEmail.has(email),
    creer: async ({ email }) => {
      const utilisateur = { id: parEmail.size + 1, email };
      parEmail.set(email, utilisateur);
      return utilisateur;
    },
  };
}

// Espion : enregistre les appels.
function creerEspionEmails() {
  const appels = [];
  return { appels, envoyer: async (...args) => appels.push(args) };
}

describe('inscription', () => {
  it('crée l’utilisateur et envoie un email de bienvenue', async () => {
    const emails = creerEspionEmails();
    const inscrire = creerInscription({ utilisateurs: creerUtilisateursEnMemoire(), emails, journal: journalDummy });

    const resultat = await inscrire('ada@exemple.fr');

    expect(resultat).toEqual({ ok: true, utilisateur: { id: 1, email: 'ada@exemple.fr' } });
    expect(emails.appels).toEqual([['ada@exemple.fr', 'Bienvenue sur Atelier']]);
  });

  it('refuse un email déjà utilisé, sans rien créer ni envoyer', async () => {
    // Stub : une réponse préparée ; creer ne doit pas être appelé.
    const utilisateursStub = {
      existe: async () => true,
      creer: async () => {
        throw new Error('creer ne devrait pas être appelé');
      },
    };
    const emails = creerEspionEmails();
    const inscrire = creerInscription({ utilisateurs: utilisateursStub, emails, journal: journalDummy });

    const resultat = await inscrire('ada@exemple.fr');

    expect(resultat).toEqual({ ok: false, erreur: 'Email déjà utilisé' });
    expect(emails.appels).toEqual([]);
  });

  it('refuse le second compte avec le même email, avec le fake', async () => {
    const inscrire = creerInscription({
      utilisateurs: creerUtilisateursEnMemoire(),
      emails: creerEspionEmails(),
      journal: journalDummy,
    });

    await inscrire('ada@exemple.fr');
    const second = await inscrire('ada@exemple.fr');

    expect(second.ok).toBe(false);
  });
});
```

## Comment ça fonctionne

Le **dummy** est la doublure la plus pauvre : `journalDummy` n'est là que parce que la fabrique attend un journal. Si
le code l'utilisait, le test échouerait, ce qui signalerait justement un chemin inattendu.

Le **stub** fournit des réponses préparées pour placer le code dans une situation précise : ici, un email qui existe
déjà. On l'utilise pour les **entrées indirectes** du code — ce que ses collaborateurs lui renvoient —, notamment les
cas difficiles à produire autrement : erreur réseau, réponse vide, valeur limite. Faire lever une erreur par `creer`
dans ce stub est une précaution : si le code l'appelait malgré tout, le test le dirait clairement.

L'**espion** enregistre les appels pour vérifier les **sorties indirectes** : ce que le code envoie à ses
collaborateurs, et qui ne se voit pas dans sa valeur de retour. L'email de bienvenue en est l'exemple typique. Le test
vérifie après coup, dans le bloc Assert, ce qui a été appelé.

Le **mock**, au sens strict, reçoit ses attentes **avant** l'action — « on attend `envoyer('ada@exemple.fr', …)` une
fois » — et vérifie lui-même qu'elles ont été satisfaites. En pratique, les bibliothèques comme Vitest fournissent des
fonctions qui sont à la fois stub et espion, et qu'on appelle mocks par habitude : on programme leur réponse, puis on
vérifie leurs appels.

Le **fake** est une vraie implémentation, simplifiée : un dépôt en mémoire au lieu de PostgreSQL, un système de fichiers
en mémoire. Il permet des scénarios à plusieurs étapes — inscrire deux fois le même email — sans programmer chaque
réponse. Il demande plus de travail, mais se réutilise dans toute la suite, et ses tests vérifient des comportements
plutôt que des appels.

Chaque doublure est une **hypothèse** sur le vrai composant. Un stub qui renvoie `true` alors que le vrai dépôt
renvoie une promesse d'objet, un fake qui ignore une contrainte d'unicité : le test passe, la production échoue. Pour
limiter ce risque, on garde les doublures simples, on les fait respecter la même interface que le vrai composant, et
on complète par quelques tests d'intégration avec les vraies implémentations.

Enfin, vérifier des appels couple le test à l'implémentation. On vérifie un appel quand il **est** le comportement
attendu — envoyer l'email, débiter la carte —, pas pour décrire chaque étape interne du code.

## Erreurs fréquentes

**Appeler « mock » toute doublure.** Choisir le bon terme aide à choisir la bonne technique.

**Remplacer ce qui n'a pas besoin de l'être.** Une fonction pure ou un petit module interne s'utilisent tels quels.

**Vérifier chaque appel interne avec des espions.** Le moindre refactoring casse le test sans changer le comportement.

**Laisser un stub diverger du vrai composant.** Garde la même interface et teste aussi l'intégration réelle.

**Écrire un fake plus compliqué que le code testé.** Il devient lui-même une source de bugs.

## À retenir

- Dummy : remplit un paramètre. Stub : répond. Espion : enregistre. Mock : attend et se vérifie. Fake : fonctionne.
- Stub pour les entrées indirectes, espion pour les sorties indirectes.
- Un fake en mémoire permet des scénarios réalistes à plusieurs étapes.
- Chaque doublure est une hypothèse sur le vrai composant : complète par de l'intégration.
- Ne vérifie un appel que s'il fait partie du comportement attendu.

## Exercices

1. Pour chaque besoin, indique la doublure la plus adaptée.

   - a. Vérifier qu'une commande payée déclenche exactement un appel à `paiement.debiter(4500)`.
   - b. Tester l'affichage quand l'API météo répond `503`.
   - c. Tester un scénario « créer, modifier, supprimer » sur un dépôt d'articles.
   - d. Construire un service qui exige un `logger`, dans un test où rien n'est journalisé.

   :::indice
   Demande-toi si le test a besoin d'une réponse, d'un enregistrement d'appels, d'un comportement complet, ou de rien du
   tout.
   :::

   :::solution
   - a. Un espion, ou un mock : l'appel à `debiter` est la sortie indirecte qu'on veut vérifier.
   - b. Un stub : il renvoie la réponse `503` préparée, difficile à obtenir du vrai service.
   - c. Un fake : un dépôt en mémoire qui conserve vraiment l'état entre les étapes.
   - d. Un dummy : le paramètre est exigé mais jamais utilisé.
   :::

2. Écris à la main `creerMock()` pour une fonction : `attendre(...args)` enregistre un appel attendu, la fonction
   `appeler(...args)` enregistre un appel reçu, et `verifier()` lève une erreur si les appels reçus diffèrent des
   appels attendus. Utilise-le pour tester `notifierRetard`.

   :::indice
   Compare les deux listes d'appels après les avoir converties en JSON : c'est suffisant pour des arguments simples.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   function creerMock() {
     const attendus = [];
     const recus = [];
     return {
       attendre: (...args) => attendus.push(args),
       appeler: async (...args) => recus.push(args),
       verifier() {
         if (JSON.stringify(recus) !== JSON.stringify(attendus)) {
           throw new Error(`Appels attendus ${JSON.stringify(attendus)}, reçus ${JSON.stringify(recus)}`);
         }
       },
     };
   }

   async function notifierRetard(factures, envoyer) {
     for (const facture of factures.filter((f) => f.joursDeRetard > 0)) {
       await envoyer(facture.client, `Retard de ${facture.joursDeRetard} jours`);
     }
   }

   describe('notifierRetard', () => {
     it('notifie uniquement les factures en retard', async () => {
       const mock = creerMock();
       mock.attendre('ada', 'Retard de 3 jours');

       await notifierRetard(
         [
           { client: 'ada', joursDeRetard: 3 },
           { client: 'alan', joursDeRetard: 0 },
         ],
         mock.appeler,
       );

       mock.verifier();
     });

     it('signale un appel manquant', async () => {
       const mock = creerMock();
       mock.attendre('ada', 'Retard de 3 jours');

       await notifierRetard([], mock.appeler);

       expect(() => mock.verifier()).toThrow('Appels attendus');
     });
   });
   ```
   :::

3. `creerPanierService({ stock })` refuse d'ajouter un article si `stock.disponible(sku)` renvoie une quantité
   insuffisante. Teste les deux cas avec un stub configurable, puis explique ce qui manquerait si le vrai service de
   stock renvoyait un objet `{ quantite }` au lieu d'un nombre.

   :::indice
   Une fonction `stubStock(quantites)` qui renvoie un objet dont `disponible` lit dans un objet `quantites` suffit.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   function creerPanierService({ stock }) {
     const lignes = [];
     return {
       async ajouter(sku, quantite) {
         const disponible = await stock.disponible(sku);
         if (disponible < quantite) return { ok: false, erreur: `Stock insuffisant pour ${sku}` };
         lignes.push({ sku, quantite });
         return { ok: true };
       },
       lignes: () => [...lignes],
     };
   }

   const stubStock = (quantites) => ({ disponible: async (sku) => quantites[sku] ?? 0 });

   describe('ajout au panier', () => {
     it('ajoute quand le stock suffit', async () => {
       const service = creerPanierService({ stock: stubStock({ 'LIV-1': 5 }) });

       const resultat = await service.ajouter('LIV-1', 2);

       expect(resultat).toEqual({ ok: true });
       expect(service.lignes()).toEqual([{ sku: 'LIV-1', quantite: 2 }]);
     });

     it('refuse quand le stock est insuffisant', async () => {
       const service = creerPanierService({ stock: stubStock({ 'LIV-1': 1 }) });

       const resultat = await service.ajouter('LIV-1', 2);

       expect(resultat).toEqual({ ok: false, erreur: 'Stock insuffisant pour LIV-1' });
       expect(service.lignes()).toEqual([]);
     });
   });
   ```

   Si le vrai service renvoyait `{ quantite: 5 }`, ces tests passeraient toujours, car le stub renvoie un nombre. En
   production, `{ quantite: 5 } < 2` convertit l'objet en `NaN` et vaut `false` : tout ajout serait accepté, même sans
   stock. Seul un test d'intégration avec le vrai service, ou un contrat partagé entre le stub et le service,
   détecterait l'écart.
   :::

## Questions d'entretien

- Quelle différence entre un stub, un espion et un mock ?

  :::indice
  Qu'est-ce qui est préparé avant l'action, et qu'est-ce qui est vérifié après ?
  :::

  :::reponse
  Le stub fournit des réponses préparées : il contrôle les entrées indirectes du code, sans rien vérifier. L'espion
  enregistre les appels reçus, et le test les vérifie après l'action : il observe les sorties indirectes. Le mock, au
  sens strict, reçoit les appels attendus avant l'action et vérifie lui-même qu'ils ont eu lieu. Les outils modernes
  mélangent ces rôles : un `vi.fn()` peut renvoyer une valeur programmée et enregistrer ses appels.
  :::

- Quand préférer un fake à des stubs ?

  :::indice
  Pense aux scénarios à plusieurs étapes et à la réutilisation.
  :::

  :::reponse
  Quand les tests enchaînent plusieurs opérations qui dépendent de l'état — créer puis retrouver, inscrire deux fois le
  même email —, programmer chaque réponse de stub devient fastidieux et fragile. Un fake en mémoire se comporte comme le
  vrai composant, se réutilise dans toute la suite, et les tests vérifient des résultats plutôt que des appels. Il doit
  rester simple, respecter la même interface, et idéalement passer les mêmes tests de contrat que l'implémentation
  réelle.
  :::

- Quels risques présente l'usage intensif de doublures ?

  :::indice
  Que vérifie vraiment un test dont tous les collaborateurs sont simulés ?
  :::

  :::reponse
  Deux risques principaux. Les doublures peuvent diverger du vrai composant — format de retour, erreurs, contraintes —
  et les tests passent alors que la production échoue. Et des tests qui vérifient chaque appel interne sont couplés à
  l'implémentation : un refactoring sans changement de comportement les casse. On limite ces risques en ne simulant que
  les frontières — réseau, base, horloge —, en vérifiant les appels seulement quand ils sont le comportement attendu,
  et en gardant des tests d'intégration avec les vraies implémentations.
  :::
