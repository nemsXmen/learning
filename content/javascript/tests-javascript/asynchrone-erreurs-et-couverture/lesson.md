---
id: javascript-asynchrone-erreurs-et-couverture
title: Tests asynchrones, erreurs et couverture
slug: asynchrone-erreurs-et-couverture
technology: javascript
level: intermediate
module: tests-javascript
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites: [javascript-vitest-assertions]
skills: [testing-levels]
tags: [javascript, tests, asynchrone, couverture]
---

## Objectifs

- Tester les fonctions asynchrones avec Vitest.
- Vérifier les rejets et les erreurs attendues.
- Utiliser la couverture pour repérer les chemins non testés.

## Introduction

Les fonctions asynchrones demandent des assertions qui attendent explicitement leur résultat ou leur rejet.

## Concept

Avec Vitest, `await expect(promise).resolves` vérifie une réussite et `await expect(promise).rejects` vérifie un rejet. La couverture complète ces assertions en montrant les lignes et branches encore non exécutées.

## Exemple

```js
await expect(chargerUtilisateur('ada')).resolves.toMatchObject({ nom: 'Ada' });
await expect(chargerUtilisateur('inconnu')).rejects.toThrow('Utilisateur introuvable');
```

## Comment ça fonctionne

Une assertion asynchrone doit être retournée ou attendue afin que Vitest ne termine pas le test avant la promesse. La couverture exécute ensuite la suite et mesure les instructions, fonctions, lignes et branches parcourues.

## Erreurs fréquentes

- Oublier `await` devant une assertion `resolves` ou `rejects`.
- Tester uniquement le cas nominal d'une fonction asynchrone.
- Confondre un seuil de couverture avec une preuve de qualité fonctionnelle.

## À retenir

- Attendre explicitement les promesses.
- Tester les réussites et les rejets.
- Lire la couverture comme un signal, pas comme une garantie.

## Exercices

1. Écris un test qui vérifie le résultat et le rejet d'une fonction asynchrone.

   :::indice
   Utilise `resolves` et `rejects` avec `await`.
   :::

   :::solution
   Chaque branche doit être vérifiée avec une assertion attendue.
   :::

## Questions d'entretien

1. Pourquoi faut-il attendre une assertion sur une promesse ?

   :::indice
   Pense au moment où Vitest considère le test terminé.
   :::

   :::reponse
   Sans `await` ou `return`, le test peut se terminer avant la promesse et manquer un rejet ou une assertion échouée.
   :::
