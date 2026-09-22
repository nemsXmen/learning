---
id: ai-linux-cli
title: "Linux et CLI : comprendre l'environnement d'exécution"
slug: linux-cli
technology: ai-engineering
level: beginner
module: fondations
order: 2
estimatedMinutes: 60
difficulty: 2
xp: 100
prerequisites: [ai-python-fondamentaux]
skills: [ai-cli-linux]
tags: [linux, cli, processes, debugging]
---

## Objectifs

- naviguer et manipuler des fichiers depuis le terminal ;
- comprendre processus, signaux, stdout, stderr et codes de sortie ;
- composer des commandes sans perdre les erreurs ;
- diagnostiquer un job IA qui consomme trop de mémoire ou reste bloqué ;
- écrire des commandes reproductibles plutôt que des manipulations manuelles opaques.

## Pourquoi le terminal est une compétence IA

Les notebooks masquent une partie de l'environnement. En production, un AI Engineer rencontre des conteneurs, des workers, des jobs GPU, des logs, des fichiers de modèles et des processus.

Le terminal permet de répondre à des questions concrètes :

```text
Quel processus tourne ?
Quel fichier est utilisé ?
Quelle commande a échoué ?
Où est passé le stderr ?
Le processus consomme-t-il trop de mémoire ?
```

## Anatomie d'une commande

Une commande possède généralement :

```text
commande [options] [arguments]
```

Exemples :

```bash
pwd
ls -la
find . -name "*.json"
grep -R "timeout" logs/
```

Ne mémorise pas seulement des commandes. Comprends ce qu'elles te permettent d'observer.

## stdout, stderr et code de sortie

Un programme peut écrire sur deux flux principaux :

- stdout : sortie normale ;
- stderr : diagnostic et erreurs.

Le code de sortie indique si la commande s'est terminée correctement. Par convention, `0` signifie succès et une valeur non nulle signale un échec.

```bash
python job.py > output.log 2> error.log
echo $?
```

Cette distinction devient essentielle dans un worker IA : un résultat vide n'est pas forcément un succès.

## Pipes : composer des observations

Un pipe transmet la sortie d'une commande à l'entrée d'une autre :

```bash
cat app.log | grep "ERROR" | tail -20
```

Pour les diagnostics, préfère souvent des commandes simples et explicites plutôt qu'une chaîne illisible.

Le but est de pouvoir expliquer chaque étape à un collègue.

## Processus et signaux

Un processus possède notamment un PID. Pour observer les processus :

```bash
ps aux
```

Pour chercher un processus particulier :

```bash
ps aux | grep worker
```

Un signal permet de demander une action au processus. Par exemple, `SIGTERM` demande une terminaison propre ; `SIGKILL` force l'arrêt et ne laisse pas au programme la possibilité de nettoyer son état.

En production, l'arrêt gracieux est généralement préférable : fermer une connexion, terminer un batch cohérent, libérer des ressources.

## Mémoire et ressources

Pour un job IA, surveille notamment :

```bash
free -h
df -h
ps aux --sort=-%mem | head
```

Il faut distinguer :

- mémoire disponible ;
- espace disque ;
- mémoire d'un processus ;
- mémoire GPU, lorsqu'un GPU est présent.

Un modèle qui ne tient pas en VRAM ne sera pas réparé par une simple optimisation Python : il faut raisonner sur la taille du modèle, la précision, le batch et le cache.

## Variables d'environnement

Les secrets et configurations d'exécution ne doivent pas être codés en dur.

```bash
export MODEL_NAME="..."
export API_TIMEOUT="30"
```

Puis, côté application, lire ces valeurs via l'environnement.

Attention : une variable d'environnement n'est pas un coffre-fort par nature. Elle doit être injectée par un mécanisme de secrets adapté à l'environnement de déploiement.

## Diagnostic reproductible

Lorsqu'un job échoue, collecte d'abord :

1. la commande exacte ;
2. le code de sortie ;
3. stdout et stderr ;
4. l'environnement pertinent ;
5. les ressources disponibles ;
6. les étapes déjà exécutées.

Cette discipline évite le diagnostic « ça ne marche pas » et permet de transformer un incident en hypothèse testable.

## Erreurs fréquentes

- lancer des commandes destructrices sans vérifier le chemin courant ;
- supprimer stderr en redirigeant uniquement stdout ;
- utiliser `SIGKILL` comme première solution ;
- modifier manuellement le serveur sans conserver la commande exécutée ;
- confondre espace disque et mémoire ;
- mettre des secrets directement dans le shell history ou le dépôt.

## Exercices

- Écris une commande qui capture stdout et stderr dans deux fichiers puis affiche le code de sortie.
- Imagine qu'un worker Python consomme progressivement toute la RAM. Quelles observations fais-tu avant de le redémarrer ?
- Un job retourne un code non nul mais stdout est vide. Où cherches-tu en premier ?

:::indice
Pour chaque exercice, pense en termes d'observation avant d'agir. Un bon diagnostic commence par des faits.
:::

:::solution
Sépare stdout et stderr avec `>` et `2>`. Pour une fuite mémoire, observe le processus, sa consommation et l'évolution dans le temps avant de tuer le processus. Si stdout est vide, consulte stderr et le code de sortie : l'absence de sortie normale ne signifie pas l'absence de diagnostic.
:::

## À retenir

Le terminal est l'interface de base avec l'exécution réelle d'un système IA. Savoir observer processus, ressources, flux et codes de sortie réduit fortement le temps de diagnostic.

## Questions d'entretien

- Quelle différence entre SIGTERM et SIGKILL ?
- Pourquoi stdout et stderr doivent-ils être traités séparément ?
- Comment diagnostiquerais-tu un worker IA qui termine avec un code non nul ?

:::indice
Réponds comme un ingénieur de production : observation, hypothèse, test, correction.
:::

:::reponse
SIGTERM permet une terminaison contrôlée alors que SIGKILL force l'arrêt. stdout contient la sortie normale et stderr les diagnostics. Pour un worker en échec, on commence par la commande, le code de sortie, stderr, les logs et les ressources avant de modifier le système.
:::
