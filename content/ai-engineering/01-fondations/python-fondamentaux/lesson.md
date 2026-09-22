---
id: ai-python-fondamentaux
title: "Python pour l'AI Engineer : du script au pipeline"
slug: python-fondamentaux
technology: ai-engineering
level: beginner
module: fondations
order: 1
estimatedMinutes: 45
difficulty: 2
xp: 100
prerequisites: []
skills: [ai-python]
tags: [python, data, ai]
---

## Objectifs

- écrire un script Python lisible et testable ;
- choisir entre listes, dictionnaires, tuples, ensembles et générateurs ;
- utiliser fonctions, exceptions et compréhensions ;
- isoler un environnement avec venv ;
- structurer un pipeline de données sans effets de bord inutiles.

## Pourquoi Python est central en AI Engineering

Python sert à assembler ingestion, nettoyage, appels de modèles, évaluation, API, jobs et automatisation. Un AI Engineer doit donc maîtriser le Python de production : modules, typage, erreurs, tests, environnements et observabilité.

## Modèle mental

Une variable référence un objet. Deux noms peuvent référencer la même liste :

```python
documents = ["doc-1", "doc-2"]
alias = documents
alias.append("doc-3")
print(documents)
```

Pour une copie superficielle, utiliser copy().

## Structures utiles en IA

| Structure | Usage |
| --- | --- |
| list | séquence ordonnée de documents |
| dict | métadonnées et configuration |
| tuple | résultat ou clé composite |
| set | déduplication et appartenance |
| générateur | flux de données sans tout charger |

## Fonctions et contrats

Une étape de pipeline doit avoir une responsabilité claire :

```python
def normalize_text(text: str) -> str:
    return " ".join(text.lower().split())
```

Un type hint documente et aide les outils statiques ; il ne constitue pas une validation runtime complète.

Sépare par exemple load_documents, normalize_text et chunk_document au lieu de créer une fonction qui lit, transforme, appelle un LLM et écrit en base.

## Exceptions

Conserver la cause originale :

```python
try:
    config = load_config()
except FileNotFoundError as exc:
    raise RuntimeError("Configuration absente") from exc
```

Dans un système AI, distinguer erreur d'entrée, réseau, fournisseur, validation et erreur interne permet ensuite de choisir correctement retry ou fallback.

## Environnement reproductible

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Sous Windows PowerShell : .venv/Scripts/Activate.ps1.

Le code, les dépendances et la configuration nécessaire doivent pouvoir être reconstruits.

## Itérateurs et mémoire

Pour un gros corpus :

```python
def read_lines(path: str):
    with open(path, encoding="utf-8") as file:
        for line in file:
            yield line.rstrip("\n")
```

Le générateur évite de charger tout le fichier en mémoire.

## Erreurs fréquentes

- attraper Exception partout et perdre la cause ;
- muter une collection partagée sans le documenter ;
- installer les dépendances globalement ;
- charger tout un corpus alors qu'un flux suffit ;
- mélanger ingestion, transformation et appel modèle.

## Exercices
- 
- Construis un pipeline qui lit des textes, les normalise, supprime les doublons, retourne id/text/length et lève une erreur pour un texte vide.

:::indice
Décompose le problème en étapes simples et vérifie chaque résultat intermédiaire.
:::

:::solution

```python
def normalize_text(text: str) -> str:
    return " ".join(text.lower().split())

def build_documents(items: list[tuple[str, str]]) -> list[dict]:
    documents = []
    seen = set()
    for doc_id, raw in items:
        text = normalize_text(raw)
        if not text:
            raise ValueError(f"Document vide: {doc_id}")
        if doc_id in seen:
            continue
        seen.add(doc_id)
        documents.append({"id": doc_id, "text": text, "length": len(text)})
    return documents
```

:::

## À retenir

Python pour l'IA demande une vraie rigueur d'ingénierie. Structures, erreurs, environnements et flux de données deviennent des briques réutilisées dans tous les modules suivants.


## Introduction

Python fournit l'environnement généraliste de l'AI Engineer : manipulation de données, orchestration, API et tooling.

## Concept

Un pipeline Python robuste sépare données, logique métier et intégrations externes.

## Exemple

Exemple : isoler une fonction de normalisation pure permet de la tester sans modèle ni base de données.

## Comment ça fonctionne

Le flux typique est ingestion → transformation → validation → sortie. Les erreurs et dépendances sont contrôlées à chaque frontière.

## Questions d'entretien

- Explique comment concevoir un pipeline Python reproductible.

  :::indice
  Relie le concept à un problème concret de production AI.
  :::

  :::reponse
  Réponse : isoler les étapes, versionner les dépendances, valider les entrées et tester les transformations indépendamment.
  :::
