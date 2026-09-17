---
id: typescript-01-pourquoi-utiliser-typescript
title: Pourquoi utiliser TypeScript ?
slug: pourquoi-utiliser-typescript
technology: typescript
level: beginner
module: 01-introduction-to-typescript
order: 2
estimatedMinutes: 20
difficulty: 1
xp: 50
prerequisites: [typescript-01-quest-ce-que-typescript]
skills: [typescript-basics]
tags: [typescript, introduction, avantages]
---

## Objectifs

- Comprendre les bénéfices concrets de TypeScript
- Identifier les situations où TypeScript apporte le plus de valeur
- Connaître les coûts et les compromis
- Savoir argumenter le choix de TypeScript dans un projet

## Introduction

Beaucoup de développeurs commencent TypeScript parce que « tout le monde l’utilise » ou parce que le job l’exige. C’est une mauvaise raison. TypeScript a des avantages mesurables, mais aussi un coût.

Cette leçon te donne les arguments solides pour décider *quand* et *pourquoi* l’adopter.

## Concept

TypeScript n’est pas magique. Il ne rend pas ton code plus rapide à l’exécution. Il ne corrige pas les bugs de logique métier. Ce qu’il fait très bien, c’est **réduire une catégorie précise d’erreurs** et **améliorer l’expérience de développement**.

### Les bénéfices principaux

1. **Détection d’erreurs plus tôt**  
   Beaucoup d’erreurs qui n’apparaissaient qu’à runtime (ou en production) sont maintenant attrapées pendant le développement.

2. **Meilleure autocomplétion et navigation**  
   Les éditeurs (VS Code surtout) deviennent extrêmement précis grâce aux types.

3. **Documentation vivante**  
   Les signatures de fonctions et les interfaces servent de documentation toujours à jour.

4. **Refactoring plus sûr**  
   Renommer une propriété, changer une signature, déplacer un module : le compilateur te dit immédiatement ce qui casse.

5. **Collaboration en équipe**  
   Les types agissent comme un contrat entre les différentes parties du code.

6. **Migration progressive**  
   Tu peux ajouter TypeScript fichier par fichier (`allowJs`, `checkJs`).

### Les coûts

- Courbe d’apprentissage (surtout les types avancés)
- Temps de configuration initial
- Parfois plus de verbosité
- Les types complexes peuvent ralentir le compilateur sur de très gros projets

## Exemple

Sans TypeScript :

```js
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Quelqu’un passe un tableau de strings par erreur
calculateTotal(["a", "b"]); // NaN à runtime, souvent en production
```

Avec TypeScript :

```ts
interface Item {
  price: number;
  name: string;
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

calculateTotal(["a", "b"]); // ❌ Erreur immédiate dans l’éditeur
```

L’erreur est visible *avant* même d’enregistrer le fichier.

## Comment ça fonctionne

TypeScript agit comme un **filet de sécurité à la compilation**. Il ne remplace pas :

- les tests unitaires
- la validation runtime des données externes (API, formulaires, env)
- une bonne architecture

Il complète ces pratiques. Les équipes qui tirent le maximum de TypeScript combinent :

- TypeScript strict
- Validation runtime (Zod, Valibot, etc.) aux frontières
- Tests
- Bonne conception

## Erreurs fréquentes

- **« TypeScript va tout sécuriser »**  
  Non. Les données qui arrivent de l’extérieur (JSON, query params, localStorage…) restent `unknown` tant que tu ne les valides pas.

- **Forcer `any` partout pour aller plus vite**  
  Ça annule la quasi-totalité des bénéfices. Mieux vaut typer progressivement.

- **Utiliser TypeScript uniquement pour l’autocomplétion**  
  C’est déjà bien, mais le vrai gain arrive quand tu actives le mode `strict` et que tu traites les erreurs sérieusement.

- **Sur-typer**  
  Créer des types extrêmement complexes pour des cas simples rend le code difficile à maintenir.

## À retenir

- TypeScript réduit les erreurs *de types* et améliore massivement l’expérience développeur
- Il ne remplace ni les tests ni la validation runtime
- Le mode `strict` est le point de départ recommandé
- La migration peut se faire progressivement
- Le ROI est maximal sur les projets de taille moyenne à grande et en équipe

## Exercices

1. Liste trois situations concrètes dans lesquelles TypeScript t’aurait déjà évité un bug (même si tu n’as pas encore beaucoup d’expérience).

   :::indice
   Pense aux `undefined is not a function`, aux mauvaises propriétés d’objets, aux paramètres dans le mauvais ordre…
   :::

   :::solution
   Exemples courants :
   - Appeler une méthode qui n’existe pas sur un objet
   - Passer `null` ou `undefined` là où une string est attendue
   - Confondre l’ordre des paramètres d’une fonction
   - Accéder à une propriété qui a été renommée
   - Utiliser un tableau à la place d’un objet (ou inversement)
   :::

2. Pourquoi TypeScript n’est-il **pas** suffisant pour sécuriser les données venant d’une API REST ?

   :::indice
   Rappelle-toi ce qui se passe à la compilation et ce qui se passe à runtime.
   :::

   :::solution
   Parce que les types sont effacés à la compilation. Le JSON reçu d’une API est du JavaScript brut. TypeScript ne peut pas vérifier sa forme à runtime. Il faut une validation runtime (Zod, io-ts, etc.) ou des assertions manuelles.
   :::

## Questions d'entretien

1. Quels sont les principaux avantages de TypeScript par rapport à JavaScript pur ?

   :::indice
   Structure ta réponse en 3-4 points concrets.
   :::

   :::reponse
   - Détection d’erreurs de types à la compilation plutôt qu’à runtime
   - Meilleure autocomplétion, navigation et refactoring dans l’éditeur
   - Documentation implicite grâce aux signatures et interfaces
   - Contrats clairs entre les modules et les développeurs
   - Possibilité de migrer progressivement un codebase JavaScript existant
   :::

2. Dans quels types de projets recommanderais-tu *de ne pas* utiliser TypeScript ?

   :::indice
   Pense à la taille du projet, à la durée de vie et à l’équipe.
   :::

   :::reponse
   - Scripts one-shot ou prototypes très courts
   - Projets personnels minuscules où la vitesse d’écriture prime totalement
   - Équipes qui refusent d’investir dans l’apprentissage des types
   - Certains environnements très spécifiques où le tooling TypeScript est trop limité
   Dans la majorité des projets professionnels modernes, TypeScript est un excellent choix.
   :::
