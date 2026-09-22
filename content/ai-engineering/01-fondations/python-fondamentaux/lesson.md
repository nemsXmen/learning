---
id: ai-python-fondamentaux
title: "Python pour l'AI Engineer : du script au pipeline"
slug: python-fondamentaux
technology: ai-engineering
level: beginner
module: fondations
order: 1
estimatedMinutes: 60
difficulty: 2
xp: 100
prerequisites: []
skills: [ai-python]
tags: [python, data, pipelines]
---

## Objectifs

À la fin de cette leçon, tu dois pouvoir :

- écrire des fonctions Python courtes, testables et lisibles ;
- choisir une structure de données selon le problème ;
- gérer explicitement les erreurs ;
- comprendre la différence entre itération en mémoire et traitement en flux ;
- construire un petit pipeline dont chaque étape possède un contrat clair.

## Pourquoi Python est une compétence d'ingénieur IA

En IA, Python n'est pas seulement le langage dans lequel on entraîne un modèle. Il relie presque toutes les briques du système :

```text
données → transformation → modèle → évaluation → API/job → observabilité
```

Un prototype peut tenir dans un notebook. Un produit IA doit survivre à des données absentes, des entrées inattendues, des volumes importants, des erreurs réseau et plusieurs versions de dépendances.

L'objectif est donc de passer de « je sais écrire du Python » à « je sais utiliser Python pour construire un composant fiable ».

## Modèle mental : les noms référencent des objets

Une variable Python n'est pas une boîte contenant une valeur : c'est un nom qui référence un objet.

```python
documents = ["doc-1", "doc-2"]
alias = documents

alias.append("doc-3")

print(documents)
# ["doc-1", "doc-2", "doc-3"]
```

`documents` et `alias` référencent ici la même liste. Cette distinction devient importante lorsqu'une étape de pipeline modifie une structure reçue d'une autre étape.

Si tu veux éviter une mutation accidentelle, crée explicitement une copie adaptée au besoin.

## Structures de données utiles en IA

| Structure | Quand l'utiliser | Exemple IA |
| --- | --- | --- |
| `list` | séquence ordonnée | liste de chunks |
| `dict` | association clé → valeur | métadonnées d'un document |
| `set` | appartenance / déduplication | IDs déjà vus |
| `tuple` | petit résultat immuable | `(id, score)` |
| générateur | traitement progressif | lecture d'un gros corpus |

Le bon choix n'est pas « la structure la plus moderne ». C'est celle qui exprime correctement le contrat et le coût du traitement.

## Fonctions : une étape, une responsabilité

Une bonne fonction répond à une question précise.

```python
def normalize_text(text: str) -> str:
    return " ".join(text.lower().split())
```

Cette fonction ne lit pas une base, n'appelle pas un LLM et n'écrit pas de fichier. C'est une fonction presque pure : son résultat dépend de son entrée.

Cette propriété facilite les tests.

À l'inverse, une fonction comme `process_document()` qui télécharge un PDF, le parse, appelle un modèle, écrit en PostgreSQL et envoie un événement est difficile à tester et à diagnostiquer.

Une architecture plus saine sépare :

```text
load → parse → normalize → validate → enrich → persist
```

Chaque frontière devient testable et observable.

## Types : documentation, pas validation runtime

Les annotations rendent les contrats visibles :

```python
def chunk_text(text: str, size: int) -> list[str]:
    ...
```

Elles aident l'IDE et les outils statiques, mais elles n'empêchent pas à elles seules une donnée invalide d'arriver au runtime.

Pour une entrée externe, il faut une vraie validation :

```text
entrée externe
    ↓
validation
    ↓
objet interne fiable
    ↓
logique métier
```

C'est une distinction fondamentale en AI Engineering : le modèle, l'utilisateur et les documents récupérés sont des sources de données non fiables.

## Exceptions : ne pas masquer la cause

Évite :

```python
try:
    result = run_pipeline()
except Exception:
    return None
```

Tu viens de transformer une erreur explicable en résultat ambigu.

Préfère une erreur contextualisée :

```python
try:
    config = load_config()
except FileNotFoundError as exc:
    raise RuntimeError("Configuration IA absente") from exc
```

En production, distingue au minimum :

- erreur d'entrée ;
- erreur de validation ;
- erreur réseau ;
- erreur du fournisseur de modèle ;
- timeout ;
- erreur interne.

Cette classification déterminera plus tard s'il faut corriger l'entrée, retenter, basculer vers un autre fournisseur ou arrêter le traitement.

## Mémoire : liste ou générateur ?

Charger 5 millions de lignes dans une liste peut devenir un problème de mémoire.

Un générateur permet de traiter progressivement :

```python
def read_lines(path: str):
    with open(path, encoding="utf-8") as file:
        for line in file:
            yield line.rstrip("\n")
```

Le générateur ne fabrique pas toutes les lignes à l'avance. Il produit la prochaine valeur quand le consommateur la demande.

Ce principe reviendra avec les datasets ML, les queues, les streams et les pipelines de documents.

## Environnement reproductible

Crée un environnement isolé :

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Sous PowerShell :

```powershell
.venv\Scripts\Activate.ps1
```

Un environnement reproductible doit permettre à un autre ingénieur de reconstruire le même contexte logiciel à partir du dépôt et des dépendances déclarées.

## Construire un pipeline avec des contrats

Prenons des documents entrants sous la forme `(id, texte)`.

```python
def normalize_text(text: str) -> str:
    return " ".join(text.lower().split())

def build_documents(items: list[tuple[str, str]]) -> list[dict]:
    documents = []
    seen: set[str] = set()

    for doc_id, raw in items:
        text = normalize_text(raw)

        if not text:
            raise ValueError(f"Document vide : {doc_id}")

        if doc_id in seen:
            continue

        seen.add(doc_id)
        documents.append({
            "id": doc_id,
            "text": text,
            "length": len(text),
        })

    return documents
```

Observe le contrat :

1. une entrée possède un ID et un texte ;
2. le texte est normalisé ;
3. un texte vide est refusé ;
4. un ID est traité une seule fois ;
5. la sortie possède une forme stable.

Ce sont ces contrats, plus que la quantité de code, qui rendent un pipeline maintenable.

## Erreurs fréquentes

- attraper `Exception` partout et perdre la cause réelle ;
- muter des objets partagés sans l'indiquer ;
- confondre type hint et validation ;
- charger tout un corpus alors qu'un traitement en flux suffit ;
- mélanger logique métier et appels réseau ;
- écrire des fonctions tellement grandes qu'on ne sait plus quelle étape a échoué.

## Exercices

- Construis une fonction qui reçoit des documents `(id, texte)`, normalise les textes, supprime les doublons et rejette les textes vides.
- Modifie-la pour traiter un itérateur au lieu d'une liste complète.
- Ajoute une distinction entre « document vide » et « document dupliqué ».

:::indice
Commence par écrire le contrat de la fonction avant son implémentation : type d'entrée, invariants et forme de sortie.
:::

:::solution
Une solution correcte sépare la normalisation, la validation et la déduplication. Pour un gros corpus, fais produire les résultats progressivement avec `yield` plutôt que de construire une liste complète.
:::

## À retenir

Python devient une compétence d'AI Engineer lorsqu'il sert à construire des composants prévisibles : fonctions petites, contrats explicites, erreurs conservées, mémoire maîtrisée et environnement reproductible.

## Questions d'entretien

- Pourquoi une fonction pure est-elle intéressante dans un pipeline IA ?
- Quelle différence fais-tu entre une annotation de type et une validation runtime ?
- Dans quel cas utiliserais-tu un générateur pour un pipeline de données ?

:::indice
Ne réponds pas seulement avec une définition Python : relie chaque concept à un problème de production IA.
:::

:::reponse
Une fonction pure est facile à tester et à reproduire. Une annotation documente et aide les outils statiques mais ne protège pas une entrée externe au runtime. Un générateur est utile lorsqu'un volume important peut être traité progressivement sans tout charger en mémoire.
:::
