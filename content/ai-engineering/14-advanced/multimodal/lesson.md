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
- comprendre une architecture multimodale ;
- traiter documents, images et audio ;
- séparer extraction, compréhension et génération ;
- contrôler provenance, permissions et données non fiables ;
- évaluer chaque étape du pipeline.

## Introduction

« Multimodal » ne signifie pas simplement envoyer un fichier à un modèle. Un document peut contenir du texte, des tableaux, des images, des métadonnées et même des instructions malveillantes.

Une architecture robuste transforme progressivement les entrées hétérogènes en représentations contrôlées.

## Concept

Un pipeline typique ressemble à ceci :

~~~
fichier
  ↓
détection du type
  ↓
parsing / OCR / extraction média
  ↓
représentation normalisée
  ↓
retrieval ou modèle multimodal
  ↓
validation
  ↓
réponse avec provenance
~~~

Chaque étape possède sa propre probabilité d'erreur. Il faut donc éviter de considérer toute erreur finale comme une « hallucination du LLM ».

Pour une image, la tâche doit être explicite : classification, extraction, comparaison, détection ou question-réponse. Pour l'audio, sépare transcription, diarisation éventuelle et compréhension.

## Exemple

Un système doit lire une facture PDF scannée et extraire le numéro, la date et le montant.

~~~
PDF
 ↓
détection pages scannées
 ↓
OCR
 ↓
texte + coordonnées
 ↓
extraction structurée
 ↓
validation métier
 ↓
résultat
~~~

Une mauvaise valeur peut venir d'un OCR incorrect, d'une mauvaise lecture du tableau ou de l'extraction finale. Conserver la provenance permet de diagnostiquer la chaîne.

## Comment ça fonctionne

Pour les documents, teste :
- formats et encodages ;
- pages scannées ;
- tableaux et colonnes ;
- images incorporées ;
- rotation et qualité ;
- ordre de lecture ;
- métadonnées ;
- limites de taille.

Pour l'audio, mesure séparément la qualité de transcription et la qualité de compréhension. Pour les images, constitue des cas représentatifs des résolutions, cadrages et contenus réellement rencontrés.

Traite les fichiers et leur contenu comme non fiables. Une phrase dans un PDF peut être une instruction destinée au modèle et non une instruction système.

## Erreurs fréquentes

- envoyer directement tout le document au modèle ;
- ignorer l'OCR et la qualité d'extraction ;
- confondre erreur de transcription et erreur de raisonnement ;
- ne pas conserver la provenance ;
- faire confiance aux instructions contenues dans un fichier ;
- évaluer uniquement la réponse finale sans tester les étapes intermédiaires.

## Exercices
- Un document scanné contient une information critique uniquement dans une image. Que faut-il tester avant de conclure que le modèle « comprend mal » le document ?

:::indice
Décompose la chaîne : acquisition, OCR, localisation de l'information, extraction puis validation.
::

:::solution
Tester la qualité de l'image, la détection de page, l'OCR, la localisation du texte critique et l'extraction structurée. Comparer chaque étape à une vérité de référence avant d'évaluer la réponse finale du modèle.
::
## À retenir

Un système multimodal est une chaîne de transformations. Mesurer chaque modalité et chaque étape permet de localiser les erreurs et de contrôler les données non fiables.

## Questions d'entretien
- Pourquoi tester l'OCR séparément du LLM ?
  - Quels risques particuliers apporte un document utilisateur ?
  - Comment évaluer un pipeline audio ?
  - Pourquoi conserver la provenance ?

:::indice
Pense à la diagnosticabilité, à la sécurité et à la possibilité de vérifier la sortie.
::

:::reponse
L'OCR peut être la cause principale d'une erreur. Un document utilisateur peut contenir des données ou instructions non fiables. L'audio se mesure au moins sur transcription puis compréhension. La provenance permet de relier une sortie à sa source et de diagnostiquer ou vérifier le résultat.
::