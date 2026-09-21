---
id: typescript-31-typage-des-donnees-api
title: Typage des données API
slug: typage-des-donnees-api
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 17
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-polymorphic-components]
skills: [react]
tags: [typescript, react, api]
---

## Objectifs

- Typer les données fetchées dans React
- Valider aux frontières
- Gérer loading / error / data

## Introduction

Les écrans React consomment des APIs : **unknown → validate → state typé**.

## Concept

```tsx
type User = { id: string; name: string };

function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = UserSchema.parse(await (await fetch(`/api/users/${id}`)).json());
        if (!cancelled) setUser(data);
      } catch (e) {
        if (!cancelled) setError("Failed");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return { user, error };
}
```

## Exemple

React Query / SWR typés : `useQuery<User>({ queryKey, queryFn })`.

## Comment ça fonctionne

Le générique de la lib de data-fetching + validation garantit le type de `data`.

## Erreurs fréquentes

- as User sur json()
- États loading non modélisés

## À retenir

- Schema parse
- State User | null
- Libs query typées

## Exercices

1. State pour data Product | null et error string | null.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   const [product, setProduct] = useState<Product | null>(null);
   const [error, setError] = useState<string | null>(null);
   ```
   :::

## Questions d'entretien

1. Comment types-tu un fetch dans un composant React ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En traitant la réponse comme unknown, en la validant (Zod…), puis en stockant un état typé (T | null) avec gestion d’erreur/loading. Les libs comme React Query ajoutent des génériques pour data/error.
   :::
