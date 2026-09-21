---
id: javascript-mocks-espions-et-modules
title: Mocks, espions et modules
slug: mocks-espions-et-modules
technology: javascript
level: intermediate
module: tests-javascript
order: 4
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites: [javascript-vitest-assertions]
skills: [test-doubles]
tags: [javascript, tests, mocks, modules]
---

## Objectifs

- Distinguer stub, mock et spy.
- Remplacer une dépendance externe dans un test.
- Vérifier les appels et les arguments utiles.

## Introduction

Les doubles de test permettent d'isoler le comportement testé d'un réseau, d'une horloge ou d'un service externe.

## Concept

Un stub fournit une réponse contrôlée, un spy observe les appels et un mock combine comportement configuré et vérifications. Le double doit rester limité au contrat dont le test dépend.

## Exemple

```js
const envoyer = vi.fn().mockResolvedValue({ ok: true });
const resultat = await publier({ envoyer }, { titre: 'Bonjour' });
expect(envoyer).toHaveBeenCalledWith({ titre: 'Bonjour' });
expect(resultat.ok).toBe(true);
```

## Comment ça fonctionne

Vitest remplace la dépendance par une fonction contrôlable. Le test vérifie alors le résultat et, lorsque c'est le comportement important, l'appel effectué vers cette dépendance.

## Erreurs fréquentes

- Vérifier tous les détails internes au lieu du contrat observable.
- Réutiliser un mock mutable entre plusieurs tests.
- Oublier de restaurer les spies après le test.

## À retenir

- Un double isole une dépendance.
- Un spy permet d'observer les appels.
- Les vérifications doivent rester centrées sur le comportement.

## Exercices

1. Remplace un service d'envoi par un mock et vérifie qu'il reçoit le bon payload.

   :::indice
   Utilise une fonction espion et une assertion sur ses arguments.
   :::

   :::solution
   Configure une fonction avec `vi.fn()`, injecte-la dans le code testé puis vérifie `toHaveBeenCalledWith`.
   :::

## Questions d'entretien

1. Quelle différence fais-tu entre un stub, un spy et un mock ?

   :::indice
   Compare réponse contrôlée, observation et comportement configuré.
   :::

   :::reponse
   Un stub fournit une réponse, un spy observe les appels et un mock peut fournir une réponse tout en permettant de vérifier les interactions.
   :::
