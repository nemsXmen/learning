---
id: ai-14-multimodal
title: "Multimodal : texte, image, audio et documents"
slug: multimodal
technology: ai-engineering
level: advanced
module: 14-advanced
order: 3
estimatedMinutes: 85
difficulty: 5
xp: 190
prerequisites: [ai-14-efficient]
skills: [ai-advanced]
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
