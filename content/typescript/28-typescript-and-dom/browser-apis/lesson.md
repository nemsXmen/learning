---
id: typescript-28-browser-apis
title: Browser APIs
slug: browser-apis
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-28-typage-des-formulaires]
skills: [dom]
tags: [typescript, dom, browser]
---

## Objectifs

- Typer d’autres APIs navigateur
- Voir localStorage, fetch, geolocation…
- Gérer disponibilité et permissions

## Introduction

Au-delà du DOM, le navigateur expose de nombreuses APIs typées via lib.dom.

## Concept

```ts
localStorage.setItem("key", "value");
const v: string | null = localStorage.getItem("key");

const res = await fetch("/api");
const buf = await res.arrayBuffer();

navigator.geolocation.getCurrentPosition((pos) => {
  const { latitude, longitude } = pos.coords;
});
```

## Exemple

```ts
if ("serviceWorker" in navigator) {
  await navigator.serviceWorker.register("/sw.js");
}
```

## Comment ça fonctionne

Les interfaces (`Storage`, `Response`, `Geolocation`…) sont dans les libs DOM. Certaines APIs nécessitent des checks de disponibilité.

## Erreurs fréquentes

- Assumer que toutes les APIs existent (vieux navigateurs)
- localStorage sans try/catch (mode privé, quotas)

## À retenir

- APIs typées via lib.dom
- Feature detection
- Données externes → validation

## Exercices

1. Lis une clé localStorage en gérant null.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const raw = localStorage.getItem("user");
   if (raw !== null) {
     // parser / valider
   }
   ```
   :::

## Questions d'entretien

1. Comment types-tu l’usage de localStorage de façon sûre ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   getItem retourne `string | null` : gérer null, parser le JSON en unknown, valider, puis utiliser le type métier. Prévoir les exceptions (quota, mode privé).
   :::
