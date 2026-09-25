---
id: javascript-identifier-reproduire-et-isoler-un-bug
title: "Identifier, reproduire et isoler un bug dans une vraie application"
slug: identifier-reproduire-et-isoler-un-bug
technology: javascript
level: advanced
module: debogage-application-reelle
order: 2
estimatedMinutes: 50
difficulty: 4
xp: 110
prerequisites:
  - javascript-lire-une-codebase-et-tracer-une-requete
  - javascript-branches-fusions-conflits-et-rebase
skills:
  - js-bug-isolation
tags:
  - javascript
  - debogage
  - git
---

## Objectifs

- Transformer un signalement vague en description précise : attendu, obtenu, conditions, fréquence.
- Reproduire le bug de façon fiable, idéalement par un test automatisé qui échoue.
- Isoler la cause par dichotomie : dans l'historique avec `git bisect`, dans les données, dans le code.
- Comparer un environnement où tout fonctionne avec un environnement où le bug apparaît.
- Aborder les bugs difficiles : intermittents, liés au temps, aux données ou à la concurrence.

## Introduction

La partie sur le débogage a posé la méthode : reproduire, isoler, corriger, prouver. Sur un exercice de vingt lignes,
elle s'applique en quelques minutes. Dans une application réelle, chaque étape devient plus difficile : le signalement
vient d'un client qui décrit ce qu'il a vu, pas ce qui s'est passé ; le bug n'apparaît qu'en production, avec certaines
données ; le code concerné a été modifié par dix personnes ces derniers mois.

Ce chapitre donne les outils de cette échelle. Le plus puissant tient en une idée : quand on ne sait pas où chercher, on
coupe l'espace de recherche en deux, encore et encore. Dix étapes suffisent à trouver un commit parmi mille.

## Concept

| Un bon signalement | Exemple |
| --- | --- |
| ce qui était attendu | « des frais de port de 4,90 € » |
| ce qui a été obtenu | « 9,90 € » |
| les conditions | « colis de 5 kg exactement, livré en France, depuis la version 1.4.0 » |
| la fréquence | « à chaque fois », « une fois sur dix », « seulement le matin » |
| les traces | identifiant de requête, capture, message d'erreur, heure |

| Dichotomie | Question | Outil |
| --- | --- | --- |
| dans l'historique | quel commit a introduit le bug ? | `git bisect`, `git bisect run` |
| dans les données | quelle partie de l'entrée le déclenche ? | réduire l'entrée de moitié, et recommencer |
| dans le code | quelle étape produit la mauvaise valeur ? | journaux ou points d'arrêt au milieu du traitement |
| entre environnements | qu'est-ce qui diffère entre « ça marche » et « ça casse » ? | versions, configuration, données, fuseau horaire, locale |

## Exemple

Un client signale : « depuis la dernière mise à jour, un colis de 5 kg en France me coûte 9,90 € de port au lieu de
4,90 € ». La version 1.4.0 compte onze commits depuis la première version des frais de port, qui était correcte. On
écrit d'abord un script qui décrit le bon comportement et sort avec le code 0 s'il est respecté, 1 sinon :

```js
// verifier-frais.mjs : 0 si le comportement est correct, 1 sinon, comme l'attend git bisect run.
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { fraisDePort } = await import(pathToFileURL(path.resolve('frais.js')).href);
const obtenu = fraisDePort({ poids: 5, pays: 'FR' });
console.log(`5 kg en France : ${obtenu} €`);
process.exitCode = obtenu === 4.9 ? 0 : 1;
```

Puis on laisse Git chercher, en lui indiquant une version mauvaise et une version bonne :

```text
$ git bisect start HEAD afbacf7
$ git bisect run node ../verifier-frais.mjs
Bisecting: 5 revisions left to test after this (roughly 3 steps)
[0661787] feat: arrondi au centime
5 kg en France : 4.9 €
Bisecting: 2 revisions left to test after this (roughly 2 steps)
[5bf9f81] feat: devise
5 kg en France : 9.9 €
Bisecting: 0 revisions left to test after this (roughly 1 step)
[1ef75cc] feat: tarif Belgique et constantes nommées
5 kg en France : 9.9 €
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[6e955d4] docs: installation
5 kg en France : 4.9 €
1ef75cc is the first bad commit
    feat: tarif Belgique et constantes nommées
 frais.js | 6 ++++--
$ git bisect reset
```

En quatre exécutions, Git désigne le commit fautif. Son diff tient en quelques lignes, et l'erreur saute aux yeux :

```text
-  return poids <= 5 ? base : base + 5;
+  return poids < POIDS_LEGER ? base : base + SUPPLEMENT_LOURD;
```

En extrayant la constante, l'auteur a changé `<=` en `<` : un colis d'exactement 5 kg est passé dans la tranche lourde.
Le commit annonçait une fonctionnalité, le tarif belge ; il a aussi introduit une régression que personne n'a vue, faute
de test sur la frontière.

## Comment ça fonctionne

**D'abord, comprendre le signalement.** « Les frais de port sont faux » ne se reproduit pas. On complète avec la personne
qui signale, ou avec les journaux grâce à l'identifiant de la requête : quelle commande, quel poids, quel pays, quelle
version, quand. On sépare ce qui est observé de ce qui est supposé. On vérifie aussi que c'est bien un bug : le
comportement attendu est-il celui décrit par les règles, les tests, le ticket d'origine ?

**Reproduire, idéalement dans un test.** Tant que le bug ne se reproduit pas à volonté, on ne peut ni l'isoler ni prouver
sa correction. La meilleure reproduction est un test automatisé qui échoue : rapide, précis, et réutilisable comme test
de régression. Si le bug ne se produit qu'avec certaines données, on les extrait, en retirant les informations
personnelles ; s'il dépend de l'heure, on fixe l'horloge ; s'il dépend d'un service externe, on rejoue sa réponse.

**`git bisect`, la dichotomie dans l'historique.** Quand on sait qu'une ancienne version fonctionnait, le bug a été
introduit par l'un des commits intermédiaires. `git bisect` en extrait un au milieu ; on teste, on répond `good` ou `bad`,
et Git divise l'intervalle par deux. Pour `n` commits, il faut environ log₂(n) essais : 4 pour 11 commits, 10 pour
1 000. Avec `git bisect run`, un script fait le test : code 0 pour bon, 1 à 127 pour mauvais, 125 pour « impossible à
tester ». Des commits atomiques, qui laissent le projet fonctionnel, rendent `bisect` efficace ; un commit qui mélange dix
changements le rend presque inutile. Le script de test est placé hors du dépôt, ou ignoré par Git, pour qu'il ne change
pas d'un commit à l'autre.

**La dichotomie dans les données et dans le code.** Un import de 10 000 lignes échoue : on essaie la première moitié,
puis la moitié de la moitié, jusqu'à la ligne coupable. Un traitement en dix étapes produit un mauvais total : on
vérifie la valeur au milieu, avec un journal ou un point d'arrêt, et l'on sait dans quelle moitié chercher. On retire
aussi ce qui n'est pas nécessaire au bug : cache, réseau, fonctionnalités annexes, jusqu'au cas minimal.

**Comparer deux environnements.** « Ça marche chez moi, pas en production » : on liste les différences, versions de
Node et des dépendances, variables d'environnement, données, fuseau horaire, locale, volume, et on les réduit une à une.
Les causes classiques : une variable d'environnement absente, une dépendance à une autre version, un fuseau horaire
différent qui décale une date d'un jour, des données de production qu'on n'avait jamais imaginées.

**Les bugs difficiles.** Un bug **intermittent** vient souvent d'une concurrence, deux requêtes qui modifient la même
donnée, d'un ordre non garanti, de promesses non attendues, ou d'un cache ; on le rend fréquent en répétant l'opération
en boucle, ou en ajoutant des délais artificiels. Un bug lié au **temps** apparaît à minuit, en fin de mois, au
changement d'heure : on fixe l'horloge dans un test. Un bug lié aux **données** tient à un caractère spécial, un champ
vide, un nombre énorme. Dans tous les cas, la méthode reste : une hypothèse, un test qui la confirme ou l'infirme, et une
seule variable changée à la fois.

## Erreurs fréquentes

**Corriger avant d'avoir reproduit.** On corrige peut-être autre chose, et l'on ne peut pas prouver la correction.

**Partir d'un signalement incomplet.** Obtiens l'attendu, l'obtenu, les conditions et la fréquence.

**Chercher à l'aveugle dans l'historique.** `git bisect` trouve en dix essais ce qu'une lecture prend des heures à trouver.

**Un script de bisect qui renvoie toujours 0 ou toujours 1.** Vérifie-le d'abord sur une version bonne et une mauvaise.

**Changer plusieurs choses à la fois.** Tu ne sais plus laquelle a eu de l'effet.

**Ignorer un bug « qui ne se produit qu'une fois sur dix ».** Il se produira en production, au pire moment ; rends-le
reproductible.

**Oublier `git bisect reset`.** Le dépôt reste sur un commit ancien, en `HEAD` détachée.

## À retenir

- Un signalement utile : attendu, obtenu, conditions, fréquence, traces.
- Reproduire d'abord, idéalement par un test qui échoue, avec données, horloge et services maîtrisés.
- Dichotomie partout : historique avec `git bisect run`, données, étapes du code, différences d'environnement.
- `git bisect` trouve un commit parmi `n` en environ log₂(n) essais, si les commits sont atomiques.
- Bugs intermittents, temporels, liés aux données : une hypothèse, un test, une variable à la fois.

## Exercices

1. Reformule ce signalement en un rapport exploitable, en listant les questions à poser : « L'export CSV ne marche plus
   pour certains clients. »

   :::indice
   Attendu, obtenu, conditions, fréquence, traces : chacune de ces rubriques est vide.
   :::

   :::solution
   Questions à poser, ou réponses à chercher dans les journaux :

   - **Obtenu** : que se passe-t-il exactement ? Erreur affichée, fichier vide, fichier corrompu, caractères illisibles,
     délai dépassé ?
   - **Attendu** : quel fichier, avec quelles colonnes ?
   - **Conditions** : quels clients ? Qu'ont-ils en commun : volume de données, caractères accentués, séparateur
     décimal, navigateur, langue ? Quelle période exportée ?
   - **Depuis quand** : quelle version, quelle date ? Qu'est-ce qui a été déployé à ce moment-là ?
   - **Fréquence** : à chaque export, ou parfois ?
   - **Traces** : identifiant de requête, heure exacte, capture, fichier obtenu.

   Rapport reformulé, par exemple : « Depuis le déploiement du 22 septembre (1.4.0), l'export CSV des commandes d'un mois
   complet échoue avec l'erreur 504 pour les clients de plus de 5 000 commandes ; les exports plus petits fonctionnent.
   Requête de référence : `7f3c…`. » Ce rapport oriente déjà vers une piste : le volume, et un délai dépassé.
   :::

2. Dans un dépôt jetable, crée un historique d'au moins huit commits dont l'un introduit un bug dans une fonction
   `estJourOuvre(date)`, puis trouve-le avec `git bisect run`. Donne le script de vérification et les commandes.

   :::indice
   Le script importe la fonction depuis le répertoire courant, teste un cas précis, et fixe `process.exitCode`.
   :::

   :::solution
   ```js
   // ../verifier-jour-ouvre.mjs, en dehors du dépôt
   import { pathToFileURL } from 'node:url';
   import path from 'node:path';

   const { estJourOuvre } = await import(pathToFileURL(path.resolve('calendrier.js')).href);
   const cas = [
     ['2026-09-25', true], // vendredi
     ['2026-09-26', false], // samedi
     ['2026-09-27', false], // dimanche
     ['2026-09-28', true], // lundi
   ];
   const echecs = cas.filter(([jour, attendu]) => estJourOuvre(new Date(`${jour}T12:00:00Z`)) !== attendu);
   for (const [jour] of echecs) console.log(`incorrect pour ${jour}`);
   process.exitCode = echecs.length === 0 ? 0 : 1;
   ```

   ```text
   $ node ../verifier-jour-ouvre.mjs && echo bon       # sur la version actuelle : doit échouer
   $ git checkout <ancienne-version> && node ../verifier-jour-ouvre.mjs && echo bon   # doit réussir
   $ git switch main
   $ git bisect start HEAD <ancienne-version>
   $ git bisect run node ../verifier-jour-ouvre.mjs
   … <identifiant> is the first bad commit
   $ git bisect reset
   ```

   Vérifier le script sur une version bonne et une version mauvaise avant de lancer la recherche évite un faux résultat.
   Une introduction classique du bug : remplacer `getUTCDay()` par `getDay()`, ou changer `[0, 6]` en `[0, 5]`. Le script
   utilise midi UTC pour que le fuseau horaire de la machine ne change pas le jour.
   :::

3. Un test échoue une fois sur vingt en intégration continue, jamais en local. Voici le code testé. Formule une hypothèse,
   et montre comment la confirmer en rendant le bug systématique.

   ```js
   async function enregistrerTout(commandes, depot) {
     const resultats = [];
     commandes.forEach(async (commande) => {
       resultats.push(await depot.enregistrer(commande));
     });
     return resultats;
   }
   ```

   :::indice
   Que renvoie `forEach` d'un callback asynchrone ? Qu'est-ce qui change entre la machine locale et l'intégration
   continue ?
   :::

   :::solution
   Hypothèse : `forEach` n'attend pas les callbacks asynchrones. `enregistrerTout` renvoie immédiatement un tableau vide,
   qui se remplit plus tard. Le test passe seulement quand, par hasard, les enregistrements sont terminés avant
   l'assertion, ce qui dépend de la vitesse de la machine : c'est pourquoi le résultat varie en intégration continue. Pour
   rendre le bug systématique, on ajoute un délai au faux dépôt :

   ```js
   async function enregistrerTout(commandes, depot) {
     const resultats = [];
     commandes.forEach(async (commande) => {
       resultats.push(await depot.enregistrer(commande));
     });
     return resultats;
   }

   const depotLent = { enregistrer: async (c) => { await new Promise((r) => setTimeout(r, 10)); return c.id; } };
   console.log(await enregistrerTout([{ id: 1 }, { id: 2 }], depotLent)); // [] : le bug devient systématique

   async function enregistrerToutCorrige(commandes, depot) {
     return Promise.all(commandes.map((commande) => depot.enregistrer(commande)));
   }
   console.log(await enregistrerToutCorrige([{ id: 1 }, { id: 2 }], depotLent)); // [ 1, 2 ]
   ```

   La correction attend toutes les promesses, et garde l'ordre des résultats. Si les enregistrements doivent être faits
   un par un, une boucle `for...of` avec `await` convient. Le faux dépôt lent reste dans le test : il empêche le bug de
   revenir silencieusement.
   :::

## Questions d'entretien

- Comment procèdes-tu face à un bug signalé en production ?

  :::indice
  Comprendre, reproduire, isoler, puis corriger.
  :::

  :::reponse
  Je commence par préciser le signalement : comportement attendu et obtenu, conditions, fréquence, et traces, en
  retrouvant la requête concernée dans les journaux grâce à son identifiant. J'évalue l'impact pour décider de l'urgence.
  Ensuite je reproduis, idéalement par un test automatisé qui échoue, avec les données et les conditions en cause. J'isole
  la cause par dichotomie : dans l'historique avec `git bisect` si une ancienne version fonctionnait, dans les données,
  ou dans les étapes du traitement, en changeant une seule chose à la fois. Seulement ensuite, je corrige la cause, et le
  test rejoint la suite comme test de régression.
  :::

- Comment fonctionne `git bisect` ?

  :::indice
  Une recherche dichotomique entre un bon et un mauvais commit.
  :::

  :::reponse
  On indique un commit où le bug est présent et un commit où il est absent. Git place le dépôt sur un commit au milieu ;
  on le teste et on répond `good` ou `bad`, et Git divise l'intervalle par deux, jusqu'à désigner le premier commit
  mauvais, en environ log₂(n) étapes. Avec `git bisect run`, un script fait le test automatiquement, selon son code de
  sortie : 0 pour bon, 125 pour ignorer, les autres codes jusqu'à 127 pour mauvais. Cela fonctionne d'autant mieux que les
  commits sont petits et laissent tous le projet fonctionnel. On termine par `git bisect reset`.
  :::

- Comment déboguer un bug intermittent ?

  :::indice
  Rendre fréquent ce qui est rare.
  :::

  :::reponse
  Je cherche ce qui peut varier d'une exécution à l'autre : ordre des opérations asynchrones, promesses non attendues,
  accès concurrents à une même donnée, caches, horloge et fuseau horaire, données aléatoires, services externes. Je forme
  une hypothèse, puis je rends le bug fréquent pour la tester : exécuter l'opération en boucle, ajouter des délais
  artificiels, fixer l'horloge, forcer un ordre. Quand il se reproduit à chaque fois, je le fige dans un test, je corrige
  la cause, et le test garde les conditions qui le déclenchaient.
  :::
