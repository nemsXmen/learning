---
id: typescript-33-guards
title: Guards
slug: guards
technology: typescript
level: intermediate
module: 33-typescript-and-nestjs
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-33-pipes]
skills: [nestjs]
tags: [typescript, nestjs, auth]
---

## Objectifs

- Comprendre les guards
- Auth / roles
- CanActivate typé

## Introduction

Les **guards** décident si une requête peut atteindre le handler (authz/authn).

## Concept

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return Boolean(req.headers.authorization);
  }
}

@UseGuards(AuthGuard)
@Get("profile")
getProfile() {
  return { ok: true };
}
```

## Exemple

`RolesGuard` + décorateur `@Roles("admin")` via Reflector.

## Comment ça fonctionne

`canActivate` retourne boolean | Promise | Observable. false → 403 (selon setup).

## Erreurs fréquentes

- Auth dans chaque controller sans guard réutilisable
- Oublier de propager le user sur request

## À retenir

- CanActivate
- @UseGuards
- Auth centralisée

## Exercices

1. Applique AuthGuard sur une route.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   @UseGuards(AuthGuard)
   @Get("secure")
   secure() { return "ok"; }
   ```
   :::

## Questions d'entretien

1. Guard vs middleware / interceptor ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Guard : responsabilité claire d’autorisation (canActivate) avec accès ExecutionContext. Middleware : pipeline HTTP plus bas niveau. Interceptor : autour du handler (transform response, logging, timeout).
   :::
