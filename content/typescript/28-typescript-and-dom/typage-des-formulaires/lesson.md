---
id: typescript-28-typage-des-formulaires
title: Typage des formulaires
slug: typage-des-formulaires
technology: typescript
level: intermediate
module: 28-typescript-and-dom
order: 11
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-28-narrowing-dom]
skills: [dom]
tags: [typescript, dom, forms]
---

## Objectifs

- Typer la lecture des champs
- Utiliser FormData
- Préparer des valeurs métier

## Introduction

Les formulaires mélangent DOM et données métier à valider.

## Concept

```ts
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const email = String(data.get("email") ?? "");
  // valider email...
});
```

```ts
const emailInput = form.elements.namedItem("email");
if (emailInput instanceof HTMLInputElement) {
  console.log(emailInput.value);
}
```

## Exemple

Mapper vers un type métier :

```ts
type Signup = { email: string; age: number };
// construire Signup après validation
```

## Comment ça fonctionne

FormData.get retourne `FormDataEntryValue | null` (`string | File`). Il faut convertir et valider.

## Erreurs fréquentes

- Faire confiance à value sans validation
- Oublier les File (input type=file)

## À retenir

- FormData + conversion
- instanceof sur elements
- Validation métier après lecture DOM

## Exercices

1. Lis le champ "name" via FormData en string.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const name = String(data.get("name") ?? "");
   ```
   :::

## Questions d'entretien

1. FormData.get est-il typé précisément pour chaque champ ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Non : il retourne `FormDataEntryValue | null`. Le lien nom de champ → type métier se fait par conversion et validation côté application.
   :::
