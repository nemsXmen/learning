---
id: ai-06-tools
title: "Tool calling et exécution contrôlée"
slug: tools
technology: ai-engineering
level: intermediate
module: llm-engineering
order: 3
estimatedMinutes: 70
difficulty: 4
xp: 150
prerequisites: [ai-06-structured-output]
skills: [ai-llm-apps]
tags: [llm, ai-engineering]
---


## Objectifs

Tool calling et exécution contrôlée

## Modèle mental
```text
LLM -> tool request -> validation -> authorization -> execution -> result -> LLM
```

Le LLM propose une action ; le serveur reste responsable de la validation et de l'autorisation.

## Contrats
Un outil expose nom, description, schéma d'entrée et résultat. Préfère des outils ciblés comme get_invoice(invoiceId) à une primitive générique permettant des commandes arbitraires.

## Effets de bord
Pour paiement, suppression ou modification de compte, exige une autorisation indépendante du modèle. Ajoute idempotence, limites et audit logs.

## Boucle
Limite nombre d'appels et temps total. Détecte répétitions, erreurs et absence de progrès.

## Tool output
Le résultat d'un service externe est une donnée non fiable. Il ne doit pas devenir automatiquement une instruction système.

## Exercices
- Un agent consulte une facture puis envoie un email. Pourquoi séparer les outils ?

:::indice
Compare le risque d'une lecture avec celui d'un effet de bord.
::

:::solution
La séparation permet d'appliquer des permissions, une confirmation éventuelle, des limites, l'idempotence et un audit différents pour la lecture et l'envoi.
::
## Erreurs fréquentes

Le résultat d'un service externe est lui aussi une donnée non fiable. Il ne doit pas devenir automatiquement une nouvelle instruction système. Il faut également prévoir les erreurs, timeouts et outils indisponibles.

## À retenir

Le tool calling relie probabilités et opérations déterministes ; les contrôles doivent rester dans le code serveur.

## Introduction

Le tool calling permet à un modèle de demander l'exécution d'une opération externe. Cela rend les LLM utiles dans des workflows, mais introduit une frontière de sécurité supplémentaire.

## Concept

Le modèle propose un appel d'outil avec des arguments. Le serveur valide ces arguments, vérifie l'autorisation puis exécute l'opération. Le modèle ne reçoit donc jamais une autorité implicite.

## Exemple

Pour une facture, un outil get_invoice(invoiceId) est préférable à une primitive générique capable d'exécuter une commande arbitraire. Un outil ciblé réduit la surface d'attaque et rend l'autorisation compréhensible.

## Comment ça fonctionne

Le flow est : LLM → tool request → validation → authorization → execution → résultat → LLM. Limite le nombre d'appels, le temps total et les répétitions. Pour un paiement, remboursement ou suppression, l'autorisation doit rester indépendante du modèle et l'action doit être idempotente et auditée.

## Questions d'entretien
- Qui doit autoriser un effet de bord ?

:::indice
Relie ta réponse à la frontière entre modèle et application.
::

:::reponse
Le système déterministe côté serveur doit vérifier les permissions et politiques avant l'exécution.
::