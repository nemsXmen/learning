---
id: javascript-pull-requests-revue-et-workflows
title: "Pull requests, revue de code et workflows Git"
slug: pull-requests-revue-et-workflows
technology: javascript
level: intermediate
module: git-et-collaboration
order: 3
estimatedMinutes: 45
difficulty: 3
xp: 100
prerequisites:
  - javascript-branches-fusions-conflits-et-rebase
  - javascript-refactoring
skills:
  - js-git-collaboration
tags:
  - javascript
  - git
  - collaboration
---

## Objectifs

- Préparer une pull request facile à relire : petite, décrite, testée, relue par son auteur.
- Relire le code d'un collègue : quoi vérifier, dans quel ordre, et comment formuler ses commentaires.
- Protéger la branche principale : vérifications obligatoires, approbations, propriétaires de code.
- Choisir un workflow d'équipe : GitHub flow, développement sur le tronc, Git flow.

## Introduction

Dans une équipe, le code n'arrive pas dans `main` directement : il passe par une **pull request**, ou *merge request*
selon les outils. C'est une proposition de changement, visible par toute l'équipe, sur laquelle l'intégration continue
vérifie le code et où des collègues le relisent avant de l'intégrer.

La revue de code n'est pas un contrôle policier. C'est le principal moyen de partager la connaissance d'un projet, de
repérer un bug avant la production, et de faire progresser tout le monde, relecteur compris. Bien faite, elle est rapide
et agréable ; mal faite, elle bloque les livraisons ou laisse tout passer.

## Concept

| Une bonne pull request | Pourquoi |
| --- | --- |
| petite : quelques centaines de lignes au plus | au-delà, la relecture devient superficielle |
| une seule intention | on sait quoi vérifier ; on peut l'annuler d'un bloc |
| une description : pourquoi, quoi, comment tester | le relecteur n'a pas à deviner le contexte |
| relue par son auteur d'abord | les oublis évidents, fichiers de débogage, `console.log`, sont retirés avant |
| verte en intégration continue | le relecteur ne perd pas de temps sur ce que les outils attrapent |

| Le relecteur vérifie, dans l'ordre | |
| --- | --- |
| le besoin | le changement répond-il au problème, sans en créer d'autres ? |
| la conception | est-ce au bon endroit, avec les bonnes dépendances ? |
| la correction | cas limites, erreurs, concurrence, sécurité |
| les tests | prouvent-ils le comportement, y compris les cas d'échec ? |
| la lisibilité | noms, découpage, commentaires utiles |
| les détails | style, formatage : idéalement déjà traités par les outils |

| Workflow | Principe | Adapté à |
| --- | --- | --- |
| GitHub flow | une branche courte par changement, pull request, fusion dans `main`, déploiement | la plupart des applications web |
| développement sur le tronc | intégration dans `main` au moins une fois par jour, fonctionnalités inachevées cachées par des *feature flags* | équipes rodées, déploiement continu |
| Git flow | branches `develop`, `release`, `hotfix` en plus de `main` | logiciels livrés par versions, plusieurs versions maintenues |

## Exemple

Une description de pull request qui donne au relecteur tout ce dont il a besoin :

```text
fix(panier): refuser les remises négatives

## Pourquoi
Un code promotionnel mal saisi dans l'administration (-15 au lieu de 15) augmentait le prix
au lieu de le baisser. Trois commandes ont été facturées trop cher le 24 septembre.

## Quoi
- `appliquerRemise` refuse une remise hors de 0..100 % (RangeError).
- L'administration valide la saisie avec le même schéma.

## Comment tester
- `pnpm test panier` : nouveau test de régression « refuse une remise négative ».
- Manuellement : créer un code à -15 dans l'administration → message d'erreur.

## Hors périmètre
Le remboursement des trois commandes est suivi dans le ticket #482.
```

Et des commentaires de revue qui disent clairement leur poids :

```text
bloquant : `remise === 100` renvoie un total de 0 et la commande passe sans paiement.
           Est-ce voulu ? Sinon, la borne haute devrait être exclue ou validée ailleurs.

question : pourquoi valider dans la route et dans le schéma ? Le schéma ne suffit-il pas ?

suggestion : `estRemiseValide` se lirait mieux que `checkRemise`, pour rester dans
             le vocabulaire du reste du module.

détail : une ligne vide en trop ligne 42 (sans importance, à ta convenance).
```

## Comment ça fonctionne

**Petite et ciblée.** La qualité d'une revue baisse avec la taille du diff : sur 50 lignes, on lit chaque ligne ; sur
2 000, on survole et on approuve. Découper est donc la meilleure façon d'obtenir une vraie relecture. Un gros changement
se livre en plusieurs pull requests successives : d'abord le refactoring qui prépare, puis la fonctionnalité, cachée
derrière un indicateur si elle n'est pas finie.

**La description fait gagner du temps à tous.** Le relecteur n'a pas le contexte de l'auteur : le ticket, la discussion
d'hier, le bug observé. La description le lui donne : pourquoi ce changement, ce qui change, comment le vérifier, ce qui
est volontairement laissé de côté. Pour une interface, une capture avant et après. Beaucoup d'équipes fournissent un
modèle de description dans le dépôt.

**L'auteur relit en premier.** Avant de demander une revue, l'auteur relit son propre diff dans l'outil, comme un
relecteur : il y trouve le `console.log` oublié, le fichier ajouté par erreur, le test manquant. L'intégration continue
doit être verte : lint, types, tests. Le temps du relecteur est réservé à ce qu'aucun outil ne sait juger.

**Relire l'essentiel d'abord.** Un relecteur qui commence par les virgules risque de manquer le problème de conception.
On lit la description, on regarde la forme générale du changement, puis on descend dans les détails : correction, cas
limites, sécurité, tests. On exécute le code en cas de doute, et on vérifie que les tests échoueraient si le bug revenait.

**Des commentaires utiles et bienveillants.** On commente le **code**, jamais la personne : « cette fonction ne gère pas
la liste vide » plutôt que « tu as oublié ». On explique le pourquoi d'une demande, on pose des questions quand on n'est
pas sûr, et on signale le poids de chaque remarque : **bloquant**, **question**, **suggestion**, **détail**. Le format
*Conventional Comments* formalise ces étiquettes. On note aussi ce qui est bien fait. Et l'on répond vite : une pull
request qui attend trois jours bloque son auteur et accumule les conflits.

**L'auteur répond à chaque commentaire.** En corrigeant, ou en expliquant pourquoi il ne corrige pas. Un désaccord se
tranche à l'oral quand il s'éternise à l'écrit. Les remarques qui reviennent souvent deviennent une règle de lint ou une
convention écrite, pour ne plus avoir à les faire.

**Protéger `main`.** Les dépôts permettent d'exiger, avant toute fusion dans `main` : des vérifications d'intégration
continue réussies, un nombre minimal d'approbations, une branche à jour, et parfois l'approbation des **propriétaires**
d'un dossier, déclarés dans un fichier `CODEOWNERS`. La poussée directe sur `main` est interdite. Ces règles rendent le
processus fiable même un soir de livraison urgente.

**Choisir un workflow.** Le GitHub flow convient à la plupart des applications web déployées en continu : des branches
courtes, une pull request, fusion dans `main`, qui est toujours déployable. Le développement sur le tronc pousse la
logique plus loin, avec des intégrations quotidiennes et des *feature flags* pour masquer ce qui n'est pas prêt. Git
flow, plus lourd, reste utile pour un logiciel livré par versions numérotées, avec plusieurs versions maintenues en
parallèle. Plus les branches vivent longtemps, plus les intégrations sont douloureuses : la tendance est aux branches
courtes.

## Erreurs fréquentes

**Une pull request de 2 000 lignes.** Elle sera survolée ; découpe-la.

**Une description vide.** Le relecteur devine le contexte, ou passe à côté du vrai sujet.

**Demander une revue avant que l'intégration continue soit verte.** Tu fais relire ce que les outils auraient signalé.

**Commencer la revue par le style.** Vérifie d'abord le besoin, la conception et la correction.

**Des commentaires sans poids ni explication.** « À changer » ne dit ni pourquoi ni si c'est bloquant.

**Critiquer la personne plutôt que le code.** La revue perd son rôle d'apprentissage.

**Laisser une pull request en attente plusieurs jours.** Relis vite, même brièvement.

**Pousser directement sur `main`.** Protège la branche.

## À retenir

- Une pull request : petite, une intention, décrite (pourquoi, quoi, comment tester), relue par son auteur, verte.
- Relire dans l'ordre : besoin, conception, correction, tests, lisibilité, détails.
- Commenter le code, expliquer, étiqueter : bloquant, question, suggestion, détail ; et répondre vite.
- Protéger `main` : vérifications obligatoires, approbations, `CODEOWNERS`, pas de poussée directe.
- Workflows : GitHub flow par défaut, tronc et *feature flags* pour les équipes rodées, Git flow pour les versions.

## Exercices

1. Relis cette pull request, intitulée « Ajout du calcul des frais de port express », et écris tes commentaires en
   indiquant leur poids. Vérifie tes remarques en exécutant le code.

   ```js
   // frais.js
   export function fraisExpress(commande) {
     let frais = 9.9;
     if (commande.poids > 5) frais = frais + (commande.poids - 5) * 2;
     if (commande.total > 100) frais == 0;
     console.log('frais express', frais);
     return frais;
   }
   ```

   :::indice
   Exécute la fonction pour une commande de 150 €. Regarde aussi ce qui manque dans la pull request, pas seulement dans
   le code.
   :::

   :::solution
   ```js
   function fraisExpress(commande) {
     let frais = 9.9;
     if (commande.poids > 5) frais = frais + (commande.poids - 5) * 2;
     if (commande.total > 100) frais == 0;
     return frais;
   }
   console.log(fraisExpress({ poids: 2, total: 150 })); // 9.9 : la gratuité ne s'applique pas
   console.log(fraisExpress({ poids: 6.4, total: 20 })); // 12.700000000000001
   ```

   ```text
   bloquant : ligne 4, `frais == 0` compare au lieu d'affecter : la gratuité au-delà de 100 €
              n'est jamais appliquée. Vérifié : 150 € → 9.9. Un test l'aurait montré.

   bloquant : aucun test dans la pull request. Il faudrait au moins : poids ≤ 5, poids > 5,
              total > 100, et les frontières exactes 5 kg et 100 €.

   question : au-delà de 100 € « inclus » ou « exclu » ? La règle commerciale dit « à partir de
              100 € » d'après le ticket, ce qui donnerait `>=`.

   suggestion : arrondir au centime (6,4 kg → 12.700000000000001) et nommer les constantes :
                FRAIS_EXPRESS_BASE, SUPPLEMENT_PAR_KG, SEUIL_GRATUITE.

   détail : retirer le `console.log` de débogage.
   ```

   Les deux premiers commentaires bloquent la fusion ; la question doit être tranchée avec le métier ; le reste améliore
   le code. Une règle de lint comme `no-unused-expressions` aurait signalé la ligne 4 : c'est une remarque à transformer
   en règle d'outil.
   :::

2. Rédige la description de pull request pour ce changement : ajout de la pagination à `GET /produits`, avec `page` et
   `limite` (100 au maximum), testée par trois tests d'intégration ; l'application mobile n'est pas encore mise à jour et
   continue d'appeler la route sans paramètres.

   :::indice
   Pourquoi, quoi, comment tester, et ce qui reste compatible ou hors périmètre.
   :::

   :::solution
   ```text
   feat(api): paginer la liste des produits

   ## Pourquoi
   GET /produits renvoie tout le catalogue (8 400 produits, 3,2 Mo) : temps de réponse de 1,8 s
   et page d'accueil lente. Ticket #512.

   ## Quoi
   - Paramètres `page` (défaut 1) et `limite` (défaut 20, plafonnée à 100).
   - Réponse : { produits, page, limite, total }.
   - Paramètres invalides (page=-1, limite=abc) → 400 avec un message.

   ## Compatibilité
   Sans paramètres, la route renvoie les 20 premiers produits. ⚠️ L'application mobile, qui
   attend tout le catalogue, est concernée : sa mise à jour est suivie dans #515, et cette
   pull request ne doit pas être déployée avant elle.

   ## Comment tester
   - `pnpm test produits.integration` : 3 nouveaux tests (défauts, plafond, paramètres invalides).
   - curl "localhost:3000/produits?page=2&limite=5"
   ```

   Le point le plus important est la section compatibilité : le changement modifie le comportement par défaut d'une
   route utilisée par une autre application. Le relecteur et la personne qui déploie doivent le savoir. Une alternative à
   discuter en revue : n'appliquer la pagination que si un paramètre est fourni, le temps que le mobile soit mis à jour.
   :::

3. Une équipe de huit personnes déploie son application web plusieurs fois par jour, mais ses branches de fonctionnalité
   vivent souvent deux semaines, et chaque fusion provoque des conflits pénibles. Propose des changements de workflow.

   :::indice
   Réduire la durée de vie des branches ; que faire d'une fonctionnalité qui n'est pas finie ?
   :::

   :::solution
   - Découper le travail en pull requests de un à deux jours au plus, chacune utile ou au moins inoffensive seule : un
     refactoring préparatoire, puis la fonctionnalité par étapes.
   - Masquer les fonctionnalités inachevées derrière des *feature flags*, pour pouvoir fusionner dans `main` sans les
     montrer aux utilisateurs ; on active le flag quand tout est prêt, et on le retire ensuite du code.
   - Mettre sa branche à jour avec `main` chaque jour, par rebase, pour résoudre les petits conflits tant qu'ils sont
     petits.
   - S'engager sur un délai de revue court, par exemple dans la demi-journée, pour que les pull requests ne s'empilent pas.
   - Protéger `main` avec des vérifications obligatoires, pour que l'intégration fréquente reste sûre.

   C'est un pas vers le développement sur le tronc : intégrer souvent de petits changements coûte moins cher que de
   réconcilier rarement de gros changements.
   :::

## Questions d'entretien

- Qu'est-ce qui fait une bonne pull request ?

  :::indice
  Taille, intention, description, préparation.
  :::

  :::reponse
  Elle est petite et n'a qu'une intention, pour être relue sérieusement et annulée d'un bloc si besoin. Sa description
  explique pourquoi, ce qui change, comment tester, et ce qui est hors périmètre ou peut casser la compatibilité. Son
  auteur l'a relue lui-même avant de demander une revue, et l'intégration continue est verte. Les commits sont propres, ou
  elle sera fusionnée en un seul commit au message soigné.
  :::

- Comment fais-tu une revue de code ?

  :::indice
  Ordre de lecture, ton, poids des remarques, délai.
  :::

  :::reponse
  Je lis d'abord la description, puis la forme générale du changement : répond-il au besoin, est-il au bon endroit ?
  Ensuite la correction : cas limites, erreurs, sécurité, concurrence ; puis les tests, en me demandant s'ils échoueraient
  si le bug revenait ; enfin la lisibilité. Je laisse le style aux outils. Mes commentaires portent sur le code,
  expliquent le pourquoi et indiquent leur poids : bloquant, question, suggestion, détail. Je signale aussi ce qui est
  réussi, et je réponds rapidement pour ne pas bloquer l'auteur.
  :::

- Quel workflow Git recommanderais-tu, et pourquoi ?

  :::indice
  Durée de vie des branches, fréquence de déploiement.
  :::

  :::reponse
  Pour une application web déployée en continu, le GitHub flow : une branche courte par changement, une pull request
  relue et vérifiée, fusion dans un `main` protégé et toujours déployable. Si l'équipe est rodée, j'évolue vers le
  développement sur le tronc, avec des intégrations quotidiennes et des *feature flags*. Git flow ne se justifie que pour
  un logiciel livré par versions, avec plusieurs versions maintenues. Dans tous les cas, des branches courtes réduisent
  les conflits et accélèrent les retours.
  :::
