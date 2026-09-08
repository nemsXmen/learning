# Cahier des charges — Plateforme de Learning avancé

## 1. Vision du projet

Construire une plateforme moderne de learning destinée aux développeurs souhaitant progresser de manière structurée sur plusieurs technologies.

L'objectif n'est pas de créer une simple bibliothèque de cours.

La plateforme doit fonctionner comme un **coach d'apprentissage personnel** :

> apprendre → pratiquer → tester → identifier les faiblesses → réviser → progresser → débloquer la suite.

Le système doit adapter le parcours de chaque utilisateur en fonction de :

- son niveau initial ;
- ses objectifs ;
- ses résultats aux tests ;
- ses erreurs ;
- ses chapitres terminés ;
- sa régularité ;
- sa maîtrise réelle des concepts ;
- les notions oubliées avec le temps.

Le contenu pédagogique est stocké dans des fichiers Markdown (`.md`) versionnés dans le repository.

La base PostgreSQL ne doit pas devenir le CMS principal des cours.

---

# 2. Objectifs principaux

La plateforme doit permettre à un utilisateur de :

1. créer un compte ;
2. choisir son objectif ;
3. passer éventuellement un test de niveau ;
4. obtenir un parcours personnalisé ;
5. suivre des cours ;
6. lire des chapitres Markdown ;
7. pratiquer avec des exercices ;
8. répondre à des quiz ;
9. passer des tests de chapitre ;
10. obtenir un score de maîtrise ;
11. identifier ses lacunes ;
12. recevoir des recommandations ;
13. réviser les notions faibles ;
14. suivre sa progression ;
15. gagner de l'XP ;
16. maintenir une série de jours d'apprentissage ;
17. débloquer des niveaux ;
18. réaliser des projets ;
19. suivre plusieurs technologies simultanément ;
20. voir son évolution globale.

---

# 3. Technologies proposées

La plateforme doit être capable de supporter plusieurs learning paths.

## Learning paths initiaux

### JavaScript

- JavaScript Fundamentals
- Variables
- Types
- Operators
- Functions
- Scope
- Hoisting
- Closures
- Objects
- Arrays
- Prototypes
- Classes
- `this`
- Async JavaScript
- Event Loop
- Promises
- Async/Await
- Modules
- Advanced JavaScript
- Performance

### TypeScript

- Fundamentals
- Type inference
- Primitive types
- Objects
- Interfaces
- Type aliases
- Union types
- Intersection types
- Generics
- Utility types
- Type narrowing
- Type guards
- Conditional types
- Mapped types
- Template literal types
- `infer`
- Advanced generics
- Type architecture

### React

- Fundamentals
- JSX
- Components
- Props
- State
- Events
- Hooks
- Effects
- Context
- Performance
- Forms
- Server state
- Architecture
- Advanced patterns

### Next.js

- App Router
- Server Components
- Client Components
- Routing
- Layouts
- Loading/Error states
- Server Actions
- Caching
- Revalidation
- Middleware
- Authentication
- Rendering strategies
- Performance
- Production architecture

### NestJS

- Fundamentals
- Modules
- Controllers
- Providers
- Dependency Injection
- Pipes
- Guards
- Interceptors
- Filters
- DTO
- Validation
- Authentication
- Authorization
- TypeORM
- PostgreSQL
- Redis
- Queues
- WebSockets
- Testing
- Architecture

### PostgreSQL

- SQL fundamentals
- Tables
- Constraints
- Relationships
- Joins
- Indexes
- Transactions
- Isolation
- Query planning
- EXPLAIN
- Performance
- CTE
- Window functions
- JSONB
- PostgreSQL architecture

### Ruby

- Syntax
- Objects
- Classes
- Modules
- Blocks
- Enumerable
- Exceptions
- Metaprogramming
- Gems
- Testing

### Ruby on Rails

- MVC
- Routing
- Controllers
- Models
- ActiveRecord
- Associations
- Validations
- Services
- Authentication
- Authorization
- APIs
- Background jobs
- Testing
- Architecture

---

# 4. Structure pédagogique

La structure doit être :

```text
Technology
    ↓
Learning Path
    ↓
Level
    ↓
Module
    ↓
Chapter
    ↓
Lesson
    ↓
Practice
    ↓
Quiz
    ↓
Chapter Test
    ↓
Mastery
```

Exemple :

```text
JavaScript
 ├── Fundamentals
 │    ├── Variables
 │    ├── Types
 │    ├── Operators
 │    └── Functions
 │
 ├── Scope & Execution
 │    ├── Scope
 │    ├── Hoisting
 │    ├── Closures
 │    └── Execution Context
 │
 └── Async JavaScript
      ├── Event Loop
      ├── Promise
      ├── async/await
      └── Concurrency
```

---

# 5. Format des cours

Les cours doivent être écrits en Markdown.

Exemple :

```text
content/
├── javascript/
│   ├── fundamentals/
│   │   ├── variables/
│   │   │   ├── lesson.md
│   │   │   ├── quiz.md
│   │   │   └── metadata.json
│   │   │
│   │   └── types/
│   │       ├── lesson.md
│   │       ├── quiz.md
│   │       └── metadata.json
│   │
│   └── async/
│
├── typescript/
├── react/
├── nextjs/
├── nestjs/
├── postgres/
├── ruby/
└── rails/
```

Le Markdown doit être considéré comme la **source de vérité du contenu pédagogique**.

---

# 6. Format d'un chapitre Markdown

Chaque chapitre doit respecter une structure standard.

Exemple :

```md
---
id: javascript-closures
title: Comprendre les closures
slug: closures
technology: javascript
level: intermediate
estimatedMinutes: 30
difficulty: 3
prerequisites:
  - javascript-functions
  - javascript-scope
---

# Comprendre les closures

## Objectifs

À la fin de ce chapitre, tu dois être capable de :

- expliquer ce qu'est une closure ;
- comprendre son fonctionnement ;
- identifier une closure ;
- utiliser une closure correctement.

## Introduction

...

## Concept

...

## Exemple

```js
function counter() {
  let count = 0;

  return () => {
    count++;
    return count;
  };
}
```

## Comment ça fonctionne

...

## Attention

...

## Erreurs fréquentes

...

## Résumé

...

## À retenir

...

## Exercices

...

## Questions d'entretien

...
```

---

# 7. Frontmatter obligatoire

Chaque contenu doit posséder des métadonnées.

```yaml
---
id: javascript-closures
title: Comprendre les closures
slug: closures
technology: javascript
level: intermediate
module: scope
order: 4
estimatedMinutes: 30
difficulty: 3
xp: 100

prerequisites:
  - javascript-functions
  - javascript-scope

skills:
  - closures
  - lexical-environment
  - scope

tags:
  - javascript
  - functions
  - scope
---
```

Cela permet au moteur de learning de comprendre le contenu sans analyser tout le Markdown.

---

# 8. Types de contenu

La plateforme doit supporter plusieurs types de contenu.

## Lesson

Cours théorique.

## Example

Exemple de code.

## Exercise

Exercice pratique.

## Quiz

Question courte.

## Chapter Test

Test complet d'un chapitre.

## Review

Session de révision.

## Challenge

Problème plus difficile.

## Project

Projet réel.

## Interview Question

Question d'entretien technique.

---

# 9. Système de test

Chaque chapitre doit posséder un test.

Exemple :

```text
Chapter
   ↓
Learn
   ↓
Practice
   ↓
Quiz
   ↓
Chapter Test
```

Le test doit pouvoir contenir :

- QCM ;
- vrai/faux ;
- réponse multiple ;
- prédiction de résultat ;
- correction de code ;
- question de compréhension ;
- question ouverte ;
- exercice de code.

---

# 10. Exemple de quiz

```yaml
id: js-closures-q1
type: multiple_choice
difficulty: 2

question: >
  Qu'est-ce qu'une closure ?

options:
  - Une fonction qui conserve accès à son environnement lexical
  - Une classe JavaScript
  - Une Promise
  - Un module ES

answer:
  - 0

explanation: >
  Une closure permet à une fonction d'accéder
  aux variables de son environnement lexical
  même après la fin de l'exécution de celui-ci.

skills:
  - closures
```

---

# 11. Système de progression

La progression ne doit pas être simplement :

```text
Chapitre lu = 100%
```

Ce serait trop simpliste.

La plateforme doit distinguer :

```text
Read
Practice
Understand
Pass
Mastered
Retained
```

Exemple :

```text
Closures

Lecture       ██████████ 100%
Exercices     ████████░░ 80%
Quiz          ██████████ 100%
Test          ███████░░░ 70%
Maîtrise      ███████░░░ 72%
Rétention     ██████░░░░ 60%
```

---

# 12. Score de maîtrise

Chaque compétence possède un score de maîtrise.

Exemple :

```text
closures       82%
promises       74%
event-loop     43%
prototypes     38%
async-await    91%
```

Le système doit utiliser ces scores pour identifier les lacunes.

Une compétence faible doit générer des recommandations.

---

# 13. Learning Boost Engine

C'est le cœur différenciant de la plateforme.

Le système doit fonctionner comme un moteur de coaching.

Il analyse :

```text
Progression
+
Résultats
+
Erreurs
+
Temps
+
Récurrence
+
Difficulté
+
Historique
```

et produit :

```text
NEXT BEST ACTION
```

Exemple :

```text
Tu viens de terminer Promises.

Ton score :
82%

Mais tu as fait 3 erreurs sur :
"Promise.all vs Promise.allSettled"

Boost recommandé :

→ Revoir cette notion
→ Faire 3 questions ciblées
→ Faire 1 exercice
→ Refaire le mini-test
```

---

# 14. Principe du Learning Boost

Le moteur doit éviter de simplement dire :

> "Continue le chapitre suivant."

Il doit pouvoir dire :

> "Tu peux continuer, mais ton niveau sur les Microtasks est encore faible. Fais cette session de 5 minutes avant."

---

# 15. Algorithme initial

Pour chaque compétence :

```text
masteryScore
confidenceScore
lastReviewedAt
lastSuccessAt
failureCount
successCount
difficulty
reviewCount
```

Exemple :

```text
skill: event-loop

mastery: 54
confidence: 61
failures: 4
successes: 7
lastReview: 5 days ago
difficulty: 4
```

Le système calcule un score de priorité.

Conceptuellement :

```text
priority =
  weakness
  × forgettingRisk
  × importance
  × prerequisiteImpact
```

Les compétences prioritaires deviennent les prochaines recommandations.

---

# 16. Spaced Repetition

Le système doit intégrer une logique de répétition espacée.

Exemple :

```text
Day 0 → apprendre

Day 1 → révision

Day 3 → révision

Day 7 → révision

Day 14 → révision

Day 30 → révision
```

Mais les intervalles doivent évoluer selon les résultats.

Bonne réponse :

```text
interval ↑
```

Mauvaise réponse :

```text
interval ↓
```

---

# 17. Session "Boost"

Créer un mode spécial :

# Learning Boost

Une session doit durer environ :

```text
5 - 15 minutes
```

Exemple :

```text
🔥 BOOST SESSION

Objectif :
Renforcer JavaScript Async

1. Question rapide
2. Explication
3. Exemple
4. Question
5. Exercice
6. Mini-test

Score final : 86%

Event Loop : +8%
Promises : +4%
```

Le Boost doit être l'une des fonctionnalités principales de la plateforme.

---

# 18. Diagnostic initial

Lorsqu'un utilisateur démarre une technologie :

```text
JavaScript
```

il peut lancer :

# Skill Assessment

Exemple :

```text
20 questions

Variables       95%
Functions       88%
Scope           71%
Closures        42%
Promises        30%
Event Loop      25%
```

Le système génère ensuite :

```text
Ton parcours recommandé

✓ Fundamentals
✓ Functions
→ Scope
→ Closures
→ Promises
→ Event Loop
```

Les notions déjà maîtrisées peuvent être raccourcies ou proposées en validation rapide.

---

# 19. Parcours adaptatif

Le parcours doit être un graphe de compétences plutôt qu'une simple liste.

Exemple :

```text
Functions
   ↓
Scope
   ↓
Closures
   ↓
Promises
   ↓
Event Loop
```

Si l'utilisateur maîtrise déjà `Functions` :

```text
Functions ───────────────→ Scope
```

S'il échoue sur `Scope` :

```text
Scope
 ↓
Review
 ↓
Practice
 ↓
Test
 ↓
Closures
```

---

# 20. Dashboard utilisateur

Le dashboard doit être visuellement très agréable.

Afficher :

```text
Bonjour 👋

Continue ton apprentissage

🔥 7 jours consécutifs

XP
2 450

Niveau
12

Progression globale
68%
```

Puis :

```text
Continue

JavaScript
Closures
72%
[Continuer]
```

Puis :

```text
🔥 Learning Boost

3 compétences nécessitent ton attention

• Event Loop
• Prototypes
• PostgreSQL Indexes

[Commencer le Boost]
```

---

# 21. Page Technology

Exemple :

```text
JavaScript

Progression
████████░░ 78%

12 modules
86 chapitres
34 exercices
18 projets
```

Afficher une roadmap visuelle.

```text
Fundamentals
     ↓
Functions
     ↓
Objects
     ↓
Scope
     ↓
Async
     ↓
Advanced
     ↓
Expert
```

---

# 22. Page Chapter

La page de cours doit être extrêmement agréable à lire.

Layout :

```text
┌──────────────────────────────────────────────┐
│ Sidebar        │ Content                    │
│                │                            │
│ Module         │ # Closures                 │
│                │                            │
│ ✓ Variables   │ Progress 72%                │
│ ✓ Functions   │                            │
│ → Closures    │ Explication                 │
│ ○ Promises    │                            │
│ ○ Event Loop  │ Code                         │
│                │                            │
│                │ Example                     │
│                │                            │
│                │ Exercise                    │
│                │                            │
└──────────────────────────────────────────────┘
```

La lecture doit être proche d'une expérience type documentation premium.

---

# 23. Design UI

Le design doit être :

- moderne ;
- premium ;
- minimaliste ;
- très lisible ;
- motivant ;
- orienté développeur ;
- responsive ;
- dark mode ;
- light mode.

Éviter :

- interfaces surchargées ;
- trop de gradients ;
- animations inutiles ;
- gros blocs de texte ;
- dashboards ressemblant à des ERP.

Privilégier :

- cartes ;
- espaces généreux ;
- typographie excellente ;
- code blocks premium ;
- progression visuelle ;
- petites animations ;
- feedback immédiat ;
- illustrations discrètes.

---

# 24. Inspiration visuelle

L'expérience doit se situer entre :

```text
Documentation technique
+
Notion
+
Duolingo
+
Frontend Mentor
+
LeetCode
```

mais avec une identité propre.

Le but est que l'utilisateur ait envie d'ouvrir la plateforme tous les jours.

---

# 25. Gamification

Ajouter :

## XP

Chaque activité rapporte de l'XP.

```text
Lecture       +10 XP
Quiz          +20 XP
Exercice      +40 XP
Test          +100 XP
Projet        +500 XP
Boost         +50 XP
```

## Levels

```text
Level 1
Level 2
...
Level 50
```

## Streak

```text
🔥 7 jours
```

## Achievements

Exemples :

```text
🔥 7 Day Streak
⚡ First Boost
🧠 JS Master
🏆 100 Questions
💻 First Project
🎯 Perfect Score
```

La gamification doit rester secondaire par rapport à l'apprentissage.

---

# 26. XP anti-abus

Ne pas permettre de farmer l'XP simplement en relisant le même cours.

Exemple :

```text
première lecture     +10 XP
relecture             +0 XP
nouvel exercice      +40 XP
réussite améliorée   +20 XP
```

---

# 27. Progression par compétence

Important :

La progression ne doit pas uniquement être liée aux chapitres.

Créer une entité :

```text
Skill
```

Exemples :

```text
javascript-closures
javascript-promises
javascript-event-loop
typescript-generics
typescript-infer
postgres-indexes
nestjs-dependency-injection
react-hooks
```

Un chapitre peut enseigner plusieurs compétences.

---

# 28. Skill graph

Créer un graphe :

```text
Functions
   │
   ├── Scope
   │    │
   │    └── Closures
   │
   └── Callbacks
        │
        └── Promises
             │
             └── Async/Await
                  │
                  └── Event Loop
```

Cela permettra au moteur Boost de comprendre les dépendances.

---

# 29. Projets pratiques

Chaque learning path doit finir par des projets.

### JavaScript

```text
Todo App
Event Emitter
Promise implementation
LRU Cache
Mini HTTP client
```

### TypeScript

```text
Type-safe Event Bus
Dependency Injection Container
Validation library
Type-safe API client
```

### NestJS

```text
Authentication API
E-commerce API
Booking API
Microservice architecture
```

### PostgreSQL

```text
Database design
Query optimization
Analytics database
Transaction system
```

---

# 30. Système de projets

Chaque projet possède :

```text
Brief
Requirements
Hints
Starter code
Expected result
Tests
Solution
Review
```

L'utilisateur doit pouvoir soumettre son travail.

---

# 31. Questions d'entretien

Chaque technologie possède une section :

# Interview Mode

Exemple :

```text
Question

Quelle est la différence entre
Promise.all et Promise.allSettled ?
```

L'utilisateur répond.

Puis :

```text
Ta réponse

████████░░ 80%

Points corrects :
✓ gestion des promises
✓ différence de comportement

À améliorer :
→ comportement en cas d'erreur
```

---

# 32. Modes d'apprentissage

La plateforme doit proposer :

### Learn

Cours normal.

### Practice

Exercices.

### Review

Révision.

### Boost

Session adaptative.

### Challenge

Questions difficiles.

### Interview

Simulation d'entretien.

### Project

Projet réel.

---

# 33. Profil utilisateur

```text
Profile

Level 18
XP 12 450

Technologies

JavaScript       82%
TypeScript       74%
React            61%
NestJS           68%
PostgreSQL       55%
Ruby             22%
Rails            15%
```

---

# 34. Objectifs

Lors de l'onboarding :

```text
Quel est ton objectif ?

○ Devenir meilleur développeur
○ Préparer un entretien
○ Changer de technologie
○ Devenir senior
○ Apprendre une nouvelle stack
○ Construire des projets
```

Puis :

```text
Temps disponible

○ 15 min/jour
○ 30 min/jour
○ 1h/jour
○ 2h+/jour
```

Le système adapte les recommandations.

---

# 35. Planning intelligent

Exemple :

```text
Ton objectif aujourd'hui

🔥 20 minutes

1. Review Closures       5 min
2. Practice Promises     7 min
3. Quiz Event Loop       5 min
4. Mini challenge        3 min
```

---

# 36. Notifications internes

Le système peut générer :

```text
🧠 Il est temps de revoir Event Loop.

Tu avais obtenu 58% lors de ta dernière session.

[Review]
```

---

# 37. Architecture technique

## Frontend

Utiliser :

```text
Next.js
TypeScript
React
Tailwind CSS
TanStack Query
React Hook Form
Zod
nuqs
```

Prioriser le Server Side lorsque pertinent.

Ne pas exposer directement l'API backend au navigateur lorsque ce n'est pas nécessaire.

Créer des routes proxy côté Next.js :

```text
/app/api/*
```

Le navigateur communique avec Next.js.

Next.js communique avec NestJS.

```text
Browser
   ↓
Next.js
   ↓
NestJS
   ↓
PostgreSQL
```

---

# 38. Backend

Utiliser :

```text
NestJS
TypeScript
TypeORM
PostgreSQL
Redis
BullMQ
```

Ne pas utiliser Prisma.

---

# 39. Pourquoi Redis

Redis peut être utilisé pour :

- sessions temporaires ;
- cache ;
- rate limiting ;
- learning recommendations ;
- queues ;
- jobs asynchrones ;
- génération de statistiques ;
- notifications.

---

# 40. BullMQ

Utiliser BullMQ pour les traitements asynchrones :

```text
Progress calculation
Analytics
Recommendation calculation
Achievement detection
Reminder generation
Content indexing
```

Exemple :

```text
User finishes quiz
        ↓
NestJS
        ↓
Queue
        ↓
Learning Engine
        ↓
Update mastery
        ↓
Generate recommendation
```

---

# 41. PostgreSQL

PostgreSQL est la source de vérité pour :

```text
users
courses
chapters metadata
skills
progress
attempts
quiz results
mastery
streaks
achievements
projects
```

Le contenu Markdown reste dans Git.

---

# 42. Architecture du contenu

Ne pas copier inutilement tout le Markdown en base.

Stocker plutôt :

```text
chapter
---------
id
slug
technology
module
content_path
version
estimated_minutes
difficulty
```

Exemple :

```text
content_path =
javascript/scope/closures/lesson.md
```

---

# 43. Content loader

Créer un service :

```text
ContentService
```

Responsabilités :

- charger Markdown ;
- parser frontmatter ;
- valider le contenu ;
- convertir Markdown → HTML/AST ;
- charger quiz ;
- charger exercices ;
- vérifier les références ;
- gérer les versions.

---

# 44. Validation du contenu

Créer un script :

```bash
pnpm content:validate
```

Il doit vérifier :

```text
✓ IDs uniques
✓ slugs uniques
✓ prerequisites existants
✓ skills existants
✓ quiz valides
✓ réponses valides
✓ liens valides
✓ metadata correcte
```

Le CI doit échouer si le contenu est invalide.

---

# 45. Structure backend

Ne pas créer de fichiers gigantesques.

Architecture modulaire :

```text
apps/api/

src/
├── auth/
├── users/
├── learning/
│   ├── courses/
│   ├── chapters/
│   ├── skills/
│   ├── progress/
│   ├── mastery/
│   ├── recommendations/
│   └── boost/
│
├── assessments/
├── quizzes/
├── exercises/
├── projects/
├── achievements/
├── streaks/
├── analytics/
└── notifications/
```

Chaque module doit rester indépendant.

---

# 46. Structure frontend

```text
apps/web/

app/
├── (marketing)/
├── dashboard/
├── learn/
├── boost/
├── practice/
├── interview/
├── projects/
├── profile/
└── api/

components/
├── ui/
├── learning/
├── progress/
├── quiz/
├── boost/
├── code/
└── dashboard/

lib/
├── api/
├── auth/
├── content/
├── utils/
└── validations/
```

Éviter les composants de plusieurs centaines de lignes.

---

# 47. Pages principales

Créer au minimum :

```text
/
 /login
 /register

/dashboard

/learn
/learn/[technology]
/learn/[technology]/[chapter]

/boost
/boost/session/[id]

/practice
/practice/[id]

/assessment
/assessment/[id]

/interview
/interview/session/[id]

/projects
/projects/[slug]

/profile
/settings
```

---

# 48. Authentication

Prévoir :

```text
Register
Login
Logout
Refresh session
Forgot password
Reset password
Email verification
```

Architecture JWT/session sécurisée.

Les tokens sensibles ne doivent pas être exposés inutilement au frontend.

---

# 49. Modèle de données principal

Créer au minimum :

```text
User
Technology
LearningPath
Module
Chapter
Skill
ChapterSkill
Prerequisite
Quiz
Question
QuestionOption
Exercise
Project
UserProgress
SkillMastery
QuizAttempt
ExerciseAttempt
ReviewItem
LearningSession
BoostSession
Achievement
UserAchievement
Streak
XPTransaction
```

---

# 50. UserProgress

Exemple :

```text
user_id
chapter_id

status:
NOT_STARTED
IN_PROGRESS
COMPLETED

progress_percent
time_spent
last_accessed_at
completed_at
```

---

# 51. SkillMastery

```text
user_id
skill_id

mastery_score
confidence_score

success_count
failure_count

last_attempt_at
last_reviewed_at
next_review_at
```

---

# 52. XPTransaction

Ne pas simplement stocker :

```text
user.xp = 12345
```

Créer un historique :

```text
XPTransaction

user
amount
reason
reference_type
reference_id
created_at
```

Exemple :

```text
+100 Chapter Test
+40 Exercise
+50 Boost
+500 Project
```

Cela permet d'auditer et d'éviter les abus.

---

# 53. Analytics

Mesurer :

```text
study time
chapters completed
quiz attempts
average score
failure rate
skills mastered
skills forgotten
boost sessions
streak
retention
```

Mais respecter la confidentialité et minimiser les données collectées.

---

# 54. Design system

Créer un design system dès le début.

Composants :

```text
Button
Card
Badge
ProgressBar
ProgressRing
Tabs
Modal
Drawer
Tooltip
Toast
CodeBlock
QuizCard
QuestionCard
ChapterCard
SkillCard
MasteryCard
BoostCard
AchievementCard
```

---

# 55. Animations

Utiliser des animations légères :

```text
progress transition
XP gain
achievement unlock
chapter completion
quiz answer feedback
streak update
```

Éviter les animations partout.

La performance reste prioritaire.

---

# 56. Code editor

Prévoir une architecture permettant d'ajouter plus tard un éditeur de code.

Exemple :

```text
Monaco Editor
```

Pour :

```text
JavaScript
TypeScript
Ruby
SQL
```

Pour le MVP, l'exécution de code peut être limitée.

Ne jamais exécuter du code utilisateur directement dans le serveur principal.

---

# 57. Sécurité de l'exécution de code

Si un sandbox de code est ajouté :

```text
Frontend
 ↓
API
 ↓
Job
 ↓
Isolated sandbox
 ↓
Result
```

Utiliser des environnements isolés.

Limiter :

```text
CPU
RAM
execution time
network
filesystem
processes
```

---

# 58. Accessibilité

La plateforme doit respecter :

- navigation clavier ;
- contraste ;
- labels ;
- focus visible ;
- lecteurs d'écran ;
- reduced motion ;
- responsive.

---

# 59. Responsive

Supporter :

```text
Desktop
Tablet
Mobile
```

Le mode desktop est prioritaire pour la lecture de code.

---

# 60. Dark mode

Le dark mode doit être particulièrement soigné.

Exemple :

```text
Background
#0B1020

Surface
#111827

Border
#1F2937
```

Ne pas multiplier les couleurs.

---

# 61. SEO

Les pages publiques doivent être indexables.

Les pages privées :

```text
/dashboard
/learn
/boost
/profile
```

ne doivent pas être indexées.

---

# 62. Performance

Priorités :

```text
Server Components
SSR
Streaming
Code splitting
Lazy loading
Image optimization
Caching
Prefetching
Virtualization
```

Éviter les gros bundles JavaScript.

---

# 63. Architecture générale

```text
                    ┌──────────────┐
                    │   Browser    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Next.js    │
                    │   Frontend   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    NestJS    │
                    │     API      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        PostgreSQL       Redis       Content
                                      Markdown
              │            │
              │            ▼
              │          BullMQ
              │            │
              └────────────┴──────► Learning Engine
```

---

# 64. Learning Engine

Le moteur doit être indépendant du reste de l'application.

Créer :

```text
LearningEngine
```

avec des responsabilités comme :

```text
calculateMastery()
calculateReviewPriority()
generateBoostSession()
recommendNextChapter()
detectWeakSkills()
calculateForgettingRisk()
calculateLearningPriority()
updateStreak()
calculateXP()
```

---

# 65. Exemple de décision du moteur

Entrée :

```json
{
  "skill": "event-loop",
  "mastery": 43,
  "confidence": 51,
  "failures": 5,
  "daysSinceReview": 6,
  "difficulty": 4
}
```

Sortie :

```json
{
  "priority": "high",
  "action": "review",
  "estimatedMinutes": 8,
  "reason": "Low mastery + high forgetting risk"
}
```

---

# 66. Recommendation Engine

Le système doit pouvoir produire :

```text
NEXT CHAPTER
NEXT REVIEW
NEXT EXERCISE
NEXT QUIZ
NEXT BOOST
NEXT PROJECT
```

Une recommandation doit toujours avoir une raison.

Exemple :

```text
Recommended for you

"Event Loop — Microtasks"

Pourquoi ?

Ton score est de 48%
et tu as échoué 3 fois sur cette compétence.
```

---

# 67. Éviter un système opaque

Pour le MVP, ne pas utiliser immédiatement une IA complexe.

Commencer avec un système déterministe.

```text
rules
+
mastery
+
spaced repetition
+
prerequisites
+
history
```

Puis ajouter de l'IA plus tard.

---

# 68. IA future

L'IA pourra ensuite :

- expliquer une mauvaise réponse ;
- reformuler une notion ;
- générer des exercices ;
- analyser une réponse ;
- créer des questions personnalisées ;
- adapter la difficulté ;
- simuler un entretien ;
- analyser du code ;
- générer des hints.

Mais le contenu officiel doit rester versionné et contrôlé.

L'IA ne doit pas remplacer le curriculum.

---

# 69. Architecture du contenu et IA

```text
Official Markdown
       │
       ▼
Content Parser
       │
       ├── Lessons
       ├── Skills
       ├── Questions
       ├── Exercises
       └── Projects
              │
              ▼
        Learning Engine
              │
              ▼
        User adaptation
```

---

# 70. MVP

Le premier MVP ne doit PAS implémenter toutes les fonctionnalités.

### MVP V1

```text
Authentication
Dashboard
Technology
Learning Path
Chapter
Markdown rendering
Quiz
Chapter Test
Progress
Skill Mastery
XP
Streak
Basic Boost
```

Avec seulement :

```text
JavaScript
TypeScript
```

---

# 71. V2

Ajouter :

```text
React
Next.js
NestJS
PostgreSQL
Ruby
Rails
```

Puis :

```text
Projects
Interview Mode
Code Editor
Advanced Boost
Spaced Repetition
Achievements
```

---

# 72. Roadmap

## Phase 1

Infrastructure.

```text
Monorepo
Next.js
NestJS
PostgreSQL
Redis
Docker
CI/CD
```

## Phase 2

Authentication.

## Phase 3

Content Engine.

## Phase 4

Learning Engine.

## Phase 5

Quiz / Assessment.

## Phase 6

Dashboard.

## Phase 7

Boost.

## Phase 8

Gamification.

## Phase 9

Projects.

## Phase 10

Interview Mode.

## Phase 11

AI.

---

# 73. Tests

Backend :

```text
Unit tests
Integration tests
E2E tests
```

Frontend :

```text
Component tests
E2E
```

Learning Engine :

```text
Unit tests obligatoires
```

Tester notamment :

```text
mastery calculation
review calculation
recommendations
XP
streak
prerequisites
boost generation
```

---

# 74. Qualité du contenu

Chaque chapitre doit respecter :

```text
Clear objective
Explanation
Example
Visual explanation
Common mistakes
Practice
Quiz
Summary
Interview questions
```

Un chapitre ne doit jamais être uniquement un bloc de texte.

---

# 75. Règle pédagogique importante

Le système doit favoriser :

```text
Active Recall
+
Spaced Repetition
+
Practice
+
Feedback
+
Progressive Difficulty
```

et éviter :

```text
Lecture passive
+
Longues vidéos
+
Quiz sans explication
```

---

# 76. Feedback après une erreur

Ne jamais afficher uniquement :

```text
❌ Incorrect
```

Afficher :

```text
❌ Incorrect

Ta réponse :
Promise.all()

Bonne réponse :
Promise.allSettled()

Pourquoi ?

Promise.all rejette dès qu'une Promise échoue,
alors que Promise.allSettled attend toutes les Promises.

À revoir :
→ Promise combinators
```

Puis éventuellement :

```text
[Réessayer]
[Voir l'explication]
[Ajouter au Boost]
```

---

# 77. Difficulté adaptative

Si l'utilisateur réussit :

```text
difficulty + 1
```

S'il échoue :

```text
difficulty - 1
```

Mais avec des limites.

Exemple :

```text
Easy
Medium
Hard
Expert
```

---

# 78. Motivation

Le système doit éviter les messages artificiels.

Préférer :

```text
"Tu es à 2 chapitres de terminer JavaScript Async."
```

plutôt que :

```text
"🔥🔥🔥 TU ES INCROYABLE !!!"
```

Le ton doit être motivant mais crédible.

---

# 79. Page de progression

Afficher :

```text
YOUR JOURNEY

JavaScript
━━━━━━━━━━━━━━━━━━ 82%

Fundamentals       ✓
Functions          ✓
Scope              ✓
Closures           82%
Promises           74%
Event Loop         43%
Advanced JS        🔒
```

Puis :

```text
Weak areas

Event Loop
████░░░░░░ 43%

Prototypes
█████░░░░░ 51%
```

---

# 80. Page Boost

La page Boost doit être une expérience dédiée.

```text
╭────────────────────────────╮
│      LEARNING BOOST        │
│                            │
│   Event Loop               │
│                            │
│   8 minutes                │
│                            │
│   ███████░░░ 72%           │
│                            │
│   [Start Boost]            │
╰────────────────────────────╯
```

Pendant la session :

```text
Question 1 / 5

What happens first?

A
B
C
D
```

Après :

```text
Great.

Tu viens de renforcer :

Event Loop +7%
Microtasks +9%
Promises +3%
```

---

# 81. Principes UX

La règle principale :

> L'utilisateur doit toujours savoir ce qu'il doit faire ensuite.

Chaque écran important doit avoir une action principale.

Exemple :

```text
Chapter terminé

✓ Lesson
✓ Practice
✓ Test

NEXT BEST ACTION

🔥 Review Event Loop

[Start Boost]
```

---

# 82. Architecture du repository

Proposition :

```text
learning-platform/

├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   ├── validation/
│   └── learning-engine/
│
├── content/
│   ├── javascript/
│   ├── typescript/
│   ├── react/
│   ├── nextjs/
│   ├── nestjs/
│   ├── postgres/
│   ├── ruby/
│   └── rails/
│
├── scripts/
│   ├── content/
│   └── database/
│
├── docker/
│
├── pnpm-workspace.yaml
└── package.json
```

---

# 83. Règle importante pour les agents IA

Le projet doit être conçu pour être facilement maintenable par des agents IA.

Ne jamais créer :

```text
mega-file.ts
mega-service.ts
mega-component.tsx
```

Préférer :

```text
small files
single responsibility
clear naming
typed interfaces
isolated modules
```

Un fichier doit rester raisonnablement petit.

---

# 84. Règle pour le code généré

Chaque fonctionnalité doit être livrée avec :

```text
Implementation
Tests
Types
Validation
Error handling
Documentation
```

Ne jamais implémenter une fonctionnalité uniquement dans le frontend.

---

# 85. Definition of Done

Une fonctionnalité est terminée uniquement si :

```text
✓ Backend
✓ Frontend
✓ Database
✓ Validation
✓ Error handling
✓ Loading state
✓ Empty state
✓ Responsive
✓ Accessibility
✓ Tests
✓ Documentation
```

---

# 86. Première fonctionnalité à développer

Ne pas commencer par tout le dashboard.

Commencer par :

```text
Content Engine
```

Objectif :

```text
Markdown
 ↓
Parser
 ↓
Chapter
 ↓
Frontend
 ↓
Progress
```

Puis ajouter :

```text
Quiz
 ↓
Attempt
 ↓
Mastery
 ↓
Recommendation
```

Cela permet de construire progressivement le cœur du produit.

---

# 87. Vision finale

La plateforme doit évoluer vers :

```text
                 LEARNING PLATFORM

                       USER
                        │
                        ▼
                 SKILL ASSESSMENT
                        │
                        ▼
                 PERSONAL ROADMAP
                        │
                        ▼
                    LEARNING
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
           READ       PRACTICE     QUIZ
             │          │          │
             └──────────┼──────────┘
                        ▼
                     MASTERY
                        │
                        ▼
                LEARNING ENGINE
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       REVIEW         BOOST        NEXT STEP
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                    PROJECT
                        │
                        ▼
                   INTERVIEW
                        │
                        ▼
                    MASTERY
```

Le produit final doit donner à l'utilisateur l'impression d'avoir **un mentor technique personnel**, et non simplement accès à des cours.

---

# 88. Priorité absolue

Les trois éléments qui doivent différencier la plateforme sont :

## 1. Qualité des cours

Les fichiers Markdown doivent être extrêmement bien structurés.

## 2. Learning Engine

Le système doit comprendre ce que l'utilisateur maîtrise réellement.

## 3. Learning Boost

Le système doit constamment répondre à :

> **"Qu'est-ce que je devrais apprendre ou réviser maintenant pour progresser le plus efficacement ?"**

C'est ce moteur qui doit devenir le cœur du produit.

---

# 89. Instruction finale pour l'agent IA

Lors du développement, respecter impérativement les règles suivantes :

```text
1. Ne pas construire toute l'application en une seule fois.

2. Construire par modules fonctionnels.

3. Commencer par l'infrastructure.

4. Ne pas utiliser Prisma.
   Utiliser TypeORM.

5. Le contenu pédagogique doit rester dans /content.

6. Utiliser Markdown + frontmatter.

7. Ne pas stocker le contenu complet des cours en PostgreSQL
   sauf nécessité explicite.

8. Chaque chapitre doit avoir des compétences associées.

9. La progression doit être basée sur les compétences,
   pas uniquement sur les chapitres.

10. Implémenter le Learning Engine comme un module indépendant.

11. Implémenter d'abord un moteur de recommandation
    déterministe et testable.

12. Ne pas introduire une IA générative partout.

13. Les recommandations doivent être explicables.

14. Chaque erreur à un quiz doit produire un feedback pédagogique.

15. Les utilisateurs doivent toujours savoir
    quelle est leur prochaine meilleure action.

16. Prioriser Server Components avec Next.js lorsque possible.

17. Utiliser TanStack Query pour le server state côté client.

18. Utiliser Zod pour la validation.

19. Utiliser React Hook Form pour les formulaires.

20. Utiliser nuqs pour les query parameters.

21. Ne pas exposer inutilement l'API NestJS directement au navigateur.

22. Utiliser les routes proxy Next.js lorsque nécessaire.

23. Garder les fichiers petits et spécialisés.

24. Tester le Learning Engine de manière exhaustive.

25. Ne jamais sacrifier UX et performance pour ajouter
    des fonctionnalités inutiles.

26. Le design doit être premium, moderne, responsive
    et agréable à utiliser quotidiennement.

27. Chaque fonctionnalité doit avoir :
    loading state,
    error state,
    empty state,
    success state.

28. Construire le système pour pouvoir ajouter
    facilement de nouvelles technologies.

29. JavaScript et TypeScript sont les premiers learning paths.

30. L'architecture doit permettre d'ajouter ultérieurement :
    IA,
    code execution,
    peer review,
    certifications,
    marketplace,
    communautés.
```

# Conclusion

Le produit n'est donc pas :

> **"Une plateforme avec des cours Markdown."**

C'est :

> **"Un système d'apprentissage adaptatif dont les cours sont alimentés par des fichiers Markdown."**

La distinction est importante.

Le **Markdown = connaissance**.

PostgreSQL = **état de l'utilisateur**.

Learning Engine = **intelligence pédagogique**.

Next.js = **expérience utilisateur**.

NestJS = **moteur applicatif**.

Redis/BullMQ = **traitements asynchrones**.

Et le **Learning Boost = boucle d'apprentissage personnalisée**.