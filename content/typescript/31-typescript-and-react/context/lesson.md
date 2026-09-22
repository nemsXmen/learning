---
id: typescript-31-context
title: Context
slug: context
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 13
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-usecallback]
skills: [react]
tags: [typescript, react]
---

## Objectifs

- Typer createContext
- Éviter null non géré
- Fournir un hook d’accès sûr

## Introduction

Le Context API se type via le générique de `createContext`.

## Concept

```tsx
type AuthContextValue = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
```

## Exemple

Provider :

```tsx
<AuthContext.Provider value={{ user, login, logout }}>
  {children}
</AuthContext.Provider>
```

## Comment ça fonctionne

Soit valeur par défaut réelle, soit `null` + hook qui throw si hors provider.

## Erreurs fréquentes

- createContext sans générique
- Optional chaining partout sans garantir le provider

## À retenir

- createContext<T>
- Hook useX avec check
- Provider typé

## Exercices

1. createContext pour un thème "light" | "dark".

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   const ThemeContext = createContext<"light" | "dark">("light");
   ```
   :::

## Questions d'entretien

1. Comment évites-tu un context `null` silencieux ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En exposant un hook custom qui lit le context et lance une erreur claire si le provider est absent, plutôt qu’en propageant null partout.
   :::
