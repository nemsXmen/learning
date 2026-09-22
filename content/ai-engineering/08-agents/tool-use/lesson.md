---
id: ai-08-tool-use
title: "Tool calling et contrats d'outils"
slug: tool-use
technology: ai-engineering
level: advanced
module: agents
order: 3
estimatedMinutes: 80
difficulty: 5
xp: 180
prerequisites: [ai-08-agent-loop]
skills: [ai-agents]
tags: [agents, tool-calling, schemas, safety]
---

## Objectifs
- définir un outil comme un contrat strict ;
- valider les arguments avant exécution ;
- séparer décision du modèle et autorisation métier ;
- gérer erreurs, timeouts, retries et résultats structurés.

 
## Introduction

Le tool calling permet à un modèle de proposer l'utilisation d'une capacité externe, mais un système de production doit transformer cette proposition en une exécution contrôlée. Le contrat de l'outil est donc une frontière entre le raisonnement probabiliste et le code déterministe.

## Concept

Un outil possède au minimum un nom, un schéma d'entrée, une politique d'autorisation, une sémantique d'erreur et un résultat normalisé. La validation de schéma garantit la forme des arguments ; l'autorisation et les règles métier décident si l'effet est permis.

## Exemple

Pour un outil `refundPayment`, le modèle peut proposer `{ orderId, amount }`. Le runtime valide le schéma, vérifie l'identité et les droits, contrôle les règles de remboursement, applique l'idempotence puis exécute la mutation. Un JSON valide mais non autorisé est refusé.

## Comment ça fonctionne

Le modèle émet un appel → le runtime résout l'outil → valide les arguments → applique l'autorisation et les budgets → exécute avec timeout → normalise le résultat → renvoie uniquement les informations nécessaires au modèle. Les secrets et permissions internes restent hors du contexte du modèle.

## Un outil est un contrat

Un tool calling robuste expose au modèle un nom, une description, un schéma d'entrée et un format de sortie attendu. Le modèle propose un appel ; le runtime décide ensuite si cet appel est autorisé et comment l'exécuter.

```text
model
  -> tool call {name, arguments}
  -> schema validation
  -> authorization
  -> execution
  -> normalized result
  -> model
```

Le JSON généré par le modèle n'est jamais une preuve d'autorisation.

## Schéma d'entrée

Chaque argument doit être validé côté serveur. Les contraintes métier ne doivent pas reposer uniquement sur la description donnée au modèle.

Exemple conceptuel :

```ts
const transferInput = z.object({
  accountId: z.string().uuid(),
  amount: z.number().positive().max(1000),
  currency: z.literal("EUR"),
});
```

Même avec un schéma valide, le runtime doit vérifier que l'utilisateur courant peut agir sur le compte ciblé.

## Autorisation

Sépare quatre décisions :

1. le modèle a-t-il demandé un outil connu ?
2. les arguments respectent-ils le schéma ?
3. l'utilisateur et le contexte autorisent-ils cette action ?
4. l'action peut-elle être exécutée avec les limites courantes ?

Cette séparation facilite les audits et empêche un prompt de contourner une permission.

## Effets de bord

Les outils de lecture et d'écriture n'ont pas le même niveau de risque.

Une lecture peut généralement être réessayée sans modifier l'état. Une écriture doit prévoir idempotence, déduplication et éventuellement confirmation explicite.

Pour une action sensible :

```text
proposition -> validation -> permission -> confirmation -> exécution
```

## Erreurs et retries

Normalise les erreurs afin que le modèle puisse distinguer :

- argument invalide ;
- permission refusée ;
- ressource inexistante ;
- timeout ;
- erreur temporaire du fournisseur ;
- erreur définitive.

Ne réessaie pas aveuglément une mutation. Un retry doit connaître la sémantique de l'opération et utiliser une clé d'idempotence lorsque nécessaire.

## Timeouts et budgets

Chaque appel doit avoir un timeout. Le runtime doit aussi borner :

- nombre d'appels ;
- durée totale de la tâche ;
- tokens consommés ;
- taille des arguments et résultats ;
- outils accessibles.

Ces limites doivent être imposées par le runtime, même si le prompt demande de continuer.

## Résultats structurés

Évite de renvoyer des dumps bruts. Un résultat d'outil devrait être compact, typé et directement exploitable par l'étape suivante.

```json
{
  "ok": true,
  "data": {
    "status": "paid",
    "transactionId": "tx_123"
  }
}
```

Les secrets, tokens internes et détails d'infrastructure ne doivent pas être propagés dans le contexte du modèle.

## Observabilité

Logue au minimum :

- tool name ;
- version du contrat ;
- durée ;
- statut ;
- erreur normalisée ;
- identifiant de corrélation.

Évite les arguments contenant des données sensibles en clair.

## Exercices

- Un agent demande `refundPayment(orderId, amount)`. Le schéma est valide mais l'utilisateur n'est pas propriétaire de la commande. Pourquoi l'appel doit-il être refusé ?
:::indice
Le schéma vérifie la forme des données, pas les permissions métier.
:::
:::solution
Le runtime doit effectuer une autorisation indépendante du modèle : vérifier l'identité, les droits sur la commande et les règles de remboursement avant toute mutation.
:::

- Un tool de paiement reçoit deux fois la même requête après un timeout. Quelle protection appliquer ?
:::indice
Le réseau peut échouer après l'exécution réelle.
:::
:::solution
Utilise une clé d'idempotence persistante et rends la mutation idempotente afin qu'un retry ne crée pas un second paiement.
:::

## Erreurs fréquentes

- croire qu'un JSON valide est automatiquement sûr ;
- donner au modèle un accès direct à une base de données ;
- mettre les permissions dans le prompt uniquement ;
- réessayer toutes les erreurs de la même manière ;
- exposer des secrets dans les résultats d'outils.

## À retenir

Le modèle propose une action, mais le runtime reste l'autorité d'exécution. Un tool de production est un contrat validé, autorisé, borné, observable et résilient.

## Questions d'entretien

- Pourquoi le tool calling ne doit-il pas être considéré comme une autorisation ?
:::indice
Distingue intention générée par le modèle et décision de sécurité.
:::
:::reponse
Le modèle produit une proposition d'appel à partir du contexte. L'autorisation dépend de l'identité, des permissions et des règles métier ; elle doit donc être vérifiée côté runtime indépendamment de la sortie du modèle.
:::

- Comment rendre un outil de mutation sûr face aux retries ?
:::indice
Pense au cas où la réponse réseau est perdue après une exécution réussie.
:::
:::reponse
Utilise une opération idempotente, une clé d'idempotence persistante et une politique de retry limitée aux erreurs réellement récupérables.
:::
