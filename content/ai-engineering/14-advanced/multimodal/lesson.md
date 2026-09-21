---
id: ai-14-multimodal
title: "Multimodal : texte, image, audio et documents"
slug: multimodal
technology: ai-engineering
level: advanced
module: advanced
order: 3
estimatedMinutes: 85
difficulty: 5
xp: 190
prerequisites: [ai-14-efficient]
skills: [ai-multimodal]
tags: [fine-tuning, inference, multimodal, optimization]
---

## Objectifs
- comprendre les pipelines multimodaux ;
- traiter documents et images ;
- contrôler provenance et permissions ;
- évaluer chaque modalité.

## Pipeline
```text
file -> detection -> parsing/OCR -> normalized representation
                                  -> retrieval/model
```

Un PDF peut contenir texte, tableaux, images et instructions malveillantes. Chaque composant doit être traité comme donnée non fiable.

## Images
Pour une analyse visuelle, précise les tâches attendues : classification, extraction, comparaison ou question-réponse.

## Audio
Sépare transcription, diarisation éventuelle et compréhension. Une erreur de transcription peut devenir une erreur de raisonnement.

## Exercice
Un document scanné contient une information critique dans une image. Que faut-il tester ?

### Solution
OCR, qualité de lecture, localisation de l'information et validation de la sortie finale avec la source.

## À retenir
Multimodal signifie plusieurs chaînes de données et plusieurs surfaces d'erreur.


## Introduction

Les systèmes multimodaux combinent plusieurs chaînes de données et plusieurs sources d'erreur.

## Concept

OCR, vision, audio, transcription et compréhension doivent être évalués séparément.

## Exemple

Un document scanné nécessite de tester extraction visuelle avant de juger la réponse finale.

## Comment ça fonctionne

file → parse/OCR → normalized data → model → evaluation

## Questions d'entretien

- Pourquoi tester chaque modalité séparément ?

  :::indice
  Pense en compromis mesurables plutôt qu'en optimisation absolue.
  :::

  :::reponse
  Une erreur de transcription ou OCR peut être confondue avec une erreur du modèle final.
  :::
