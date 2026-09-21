---
id: typescript-31-forms
title: Forms
slug: forms
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-events]
skills: [react]
tags: [typescript, react, forms]
---

## Objectifs

- Typer état et handlers de formulaires
- Contrôler input value/onChange
- Préparer validation

## Introduction

Les formulaires React typés lient **state** et **events**.

## Concept

```tsx
type FormState = { email: string; age: number };

function Signup() {
  const [form, setForm] = useState<FormState>({ email: "", age: 0 });

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form>
      <input name="email" value={form.email} onChange={onChange} />
    </form>
  );
}
```

## Exemple

Libs : React Hook Form + Zod resolver pour un typage bout en bout.

## Comment ça fonctionne

Le générique de useState fixe la forme. Les names d’inputs doivent coller aux clés (attention au typage dynamique).

## Erreurs fréquentes

- value number stockée en string sans conversion
- name non contraint

## À retenir

- State typé
- ChangeEvent
- Libs form + schema

## Exercices

1. State { username: string } + input contrôlé.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```tsx
   const [username, setUsername] = useState("");
   <input value={username} onChange={(e) => setUsername(e.target.value)} />
   ```
   :::

## Questions d'entretien

1. Comment types-tu un formulaire contrôlé simple en React TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec un type d’état, `useState<FormState>`, et des handlers `ChangeEvent<HTMLInputElement>` (ou une lib comme React Hook Form typée avec un schema Zod).
   :::
