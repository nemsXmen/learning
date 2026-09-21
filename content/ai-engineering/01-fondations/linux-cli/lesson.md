---
id: ai-linux-cli
title: "Linux CLI et environnement d'un AI Engineer"
slug: linux-cli
technology: ai-engineering
level: beginner
module: fondations
order: 2
estimatedMinutes: 40
difficulty: 2
xp: 90
prerequisites: []
skills: [ai-cli-linux]
tags: [linux, cli, environment]
---

## Objectifs

- naviguer et inspecter Linux ;
- comprendre processus, signaux, variables d'environnement et permissions ;
- automatiser un pipeline depuis le shell ;
- diagnostiquer CPU, mémoire, disque et logs.

## Le terminal comme outil d'ingénierie

Les serveurs, conteneurs, runners CI et machines GPU sont souvent administrés sans interface graphique.

```bash
pwd
ls -la
find . -maxdepth 2 -type f
grep -R "timeout" .
```

## Flux et composition

```bash
cat logs.txt | grep ERROR | tail -n 50
```

stdout et stderr sont deux flux différents :

```bash
python worker.py > output.log 2> error.log
```

Les codes de sortie servent également de contrat : 0 indique généralement le succès, une valeur non nulle l'échec.

## Processus et signaux

```bash
ps aux
pgrep -af python
top
free -h
df -h
kill <PID>
```

SIGTERM demande un arrêt gracieux. SIGKILL force l'arrêt.

## Variables d'environnement

```bash
export MODEL_NAME="..."
export APP_ENV="production"
```

Python :

```python
import os
model_name = os.environ["MODEL_NAME"]
```

Les clés API ne doivent jamais être committées.

## Permissions

```bash
ls -l
chmod 750 script.sh
```

Une permission trop large sur un fichier de secrets est un problème de sécurité.

## Scripts robustes

```bash
#!/usr/bin/env bash
set -euo pipefail

python -m pytest
python -m my_pipeline
```

## Exercice

Écris un script qui crée output/, lance un pipeline, sépare stdout/stderr et affiche les 20 dernières lignes d'erreur.

### Solution

```bash
#!/usr/bin/env bash
set -euo pipefail

mkdir -p output
python -m my_pipeline > output/pipeline.log 2> output/pipeline.err
tail -n 20 output/pipeline.err
```

## À retenir

Le shell est une interface d'automatisation et de diagnostic. Comprendre processus, flux, permissions et ressources est indispensable avant de déployer des systèmes AI.
