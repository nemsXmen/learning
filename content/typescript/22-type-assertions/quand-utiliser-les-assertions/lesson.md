---
id: typescript-22-quand-utiliser-les-assertions
title: Quand utiliser les assertions ?
slug: quand-utiliser-les-assertions
technology: typescript
level: intermediate
module: 22-type-assertions
order: 8
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-22-assertions-vs-narrowing]
skills: [type-assertions]
tags: [typescript, assertions]
---

## Objectifs

- Identifier les bons cas d’usage des assertions
- Rester discipliné
- Documenter les assertions critiques

## Introduction

Les assertions ont des usages légitimes.

## Concept

Bons cas :
- **as const** pour des configs / unions
- DOM quand le HTML garantit l’élément
- Après une **validation runtime** (Zod, etc.)
- Libs mal typées (temporaire, isolé)
- Tests (helpers de fixtures)

```ts
const roles = ["admin", "user"] as const;

const schema = z.object({ id: z.number(), name: z.string() });
const user = schema.parse(data); // déjà typé ; parfois cast résiduel selon l’API
```

## Exemple

```ts
// Garantie HTML : <div id="root"></div>
const root = document.getElementById("root") as HTMLDivElement;
```

## Comment ça fonctionne

L’assertion exprime une connaissance que le compilateur n’a pas. Elle doit être **fondée**.

## Erreurs fréquentes

- Généraliser « assertion = mal » sans nuance
- Ou l’inverse : assertion partout

## À retenir

- as const : oui
- Après validation : oui
- Garantie structurelle (HTML) : acceptable
- Toujours se demander : « qu’est-ce qui prouve ce type ? »

## Exercices

1. Donne un cas légitime d’assertion DOM.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Élément présent de façon statique dans le HTML, type connu (ex. div#root).
   :::

## Questions d'entretien

1. Dans quels cas juges-tu une assertion acceptable ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   as const, après validation runtime, éléments DOM garantis par le markup, ou adaptation temporaire d’une lib mal typée — toujours avec une justification claire.
   :::
