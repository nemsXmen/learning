---
id: javascript-validation-secrets-et-dependances
title: "Valider les entrées, protéger les secrets, surveiller les dépendances"
slug: validation-secrets-et-dependances
technology: javascript
level: advanced
module: securite-javascript
order: 4
estimatedMinutes: 45
difficulty: 4
xp: 110
prerequisites:
  - javascript-injections-eval-et-pollution-de-prototype
  - javascript-process-et-environnement
  - javascript-npm-pnpm-et-gestion-des-paquets
skills:
  - js-validation-secrets-deps
tags:
  - javascript
  - securite
  - validation
---

## Objectifs

- Valider toute entrée à la frontière de confiance, par liste blanche, avec un schéma.
- Distinguer validation des entrées et encodage des sorties, et savoir pourquoi il faut les deux.
- Garder les secrets hors du code, du dépôt, du bundle et des journaux, et réagir à une fuite.
- Réduire le risque des dépendances : chaîne d'approvisionnement, vulnérabilités connues, paquets malveillants.

## Introduction

Les chapitres précédents ont traité des attaques précises. Celui-ci réunit trois pratiques transversales, qui
préviennent une grande partie des incidents réels. **Valider** : tout ce qui entre dans l'application est suspect tant
qu'on ne l'a pas vérifié. **Protéger les secrets** : une clé d'API publiée dans un dépôt est exploitée en quelques
minutes par des robots qui scrutent GitHub. **Surveiller les dépendances** : une application moderne exécute des
centaines de paquets écrits par d'autres, avec les mêmes droits que son propre code.

## Concept

| Validation des entrées | |
| --- | --- |
| où | à la frontière de confiance : requête HTTP, message reçu, fichier importé, réponse d'une API tierce |
| comment | liste blanche : types, formats, longueurs, valeurs permises ; rejeter les clés inconnues |
| côté client | pour le confort de l'utilisateur seulement : l'attaquant ne passe pas par le formulaire |
| après | le reste du code ne reçoit que des données validées et typées |

| Secret | Bonne place |
| --- | --- |
| clés d'API, mots de passe de base, clés de signature | variables d'environnement ou gestionnaire de secrets, côté serveur |
| valeurs « publiques » du front-end | le bundle, en sachant que tout le monde peut les lire |
| exemple de configuration | un `.env.example` commité, aux valeurs factices |
| journaux | jamais de secret ni de mot de passe ; masquer les champs sensibles |

| Dépendances | Mesure |
| --- | --- |
| vulnérabilités connues | `npm audit`, Dependabot ou Renovate, mises à jour régulières |
| paquet compromis ou malveillant | fichier de verrouillage, scripts d'installation bloqués, provenance vérifiée |
| typosquatting | vérifier le nom exact avant d'installer |
| surface | moins de dépendances, choisies pour leur maintenance et leur popularité |

## Exemple

Une route d'inscription valide son corps avec un schéma zod strict. Tout ce qui n'est pas prévu est rejeté, et le reste du
code reçoit un objet propre et typé :

```js
import { z } from 'zod';

const Inscription = z.strictObject({
  email: z.email().max(254).transform((email) => email.toLowerCase()),
  motDePasse: z.string().min(12).max(128),
  nom: z.string().trim().min(1).max(80),
  age: z.coerce.number().int().min(16).max(120),
  newsletter: z.boolean().default(false),
});

function validerInscription(corps) {
  const resultat = Inscription.safeParse(corps);
  if (resultat.success) return { ok: true, donnees: resultat.data };
  return {
    ok: false,
    erreurs: resultat.error.issues.map((probleme) => `${probleme.path.join('.') || 'corps'} : ${probleme.code}`),
  };
}

console.log(validerInscription({ email: 'Ana@Exemple.FR', motDePasse: 'correct-horse-battery', nom: ' Ana ', age: '34' }));
// { ok: true, donnees: { email: 'ana@exemple.fr', motDePasse: 'correct-horse-battery', nom: 'Ana', age: 34, newsletter: false } }

console.log(validerInscription({ email: { $ne: null }, motDePasse: 'court', nom: 'x', age: 12, estAdmin: true }));
// { ok: false, erreurs: [ 'email : invalid_type', 'motDePasse : too_small', 'age : too_small', 'corps : unrecognized_keys' ] }
```

L'objet `{ $ne: null }`, une tentative d'injection d'opérateur, est refusé parce que ce n'est pas une chaîne. La clé
`estAdmin`, une tentative d'affectation de masse, est refusée parce qu'elle n'est pas prévue. Et l'âge envoyé en chaîne
par un formulaire est converti en nombre.

## Comment ça fonctionne

**La frontière de confiance.** Tout ce qui vient de l'extérieur du processus peut être forgé : corps, en-têtes, paramètres
d'URL, cookies, fichiers téléversés, messages d'une file, et même les réponses d'une API partenaire. On valide
**une fois**, à l'entrée, puis on ne manipule plus que des données validées. La validation côté navigateur améliore
l'expérience, mais un attaquant envoie ses requêtes directement, avec `curl` ou un script : seule la validation serveur
compte pour la sécurité.

**Liste blanche plutôt que liste noire.** Chercher les caractères dangereux, `<`, `'`, `$`, échoue toujours : il y en a
trop, et leur danger dépend du contexte. On décrit plutôt ce qui est **permis** : un e-mail, une chaîne de 1 à 80
caractères, un entier entre 16 et 120, une valeur parmi une liste. Les longueurs maximales comptent autant que les
minimales : un nom de 10 Mo est une attaque par épuisement de ressources. Et un objet strict rejette les clés inconnues,
ce qui bloque l'**affectation de masse** : un client qui ajoute `role: 'admin'` à son profil, espérant que le serveur
copie tout le corps dans la base.

**Valider n'est pas encoder.** La validation vérifie qu'une donnée a la forme attendue à l'entrée. Elle ne rend pas une
donnée sûre pour tous les usages : un nom valide comme `O'Brien` contient une apostrophe, et un commentaire valide peut
contenir `<`. C'est l'encodage de sortie, les requêtes paramétrées, `textContent`, qui protègent chaque destination. Il
faut les deux.

**Les secrets ne quittent pas le serveur.** Un secret dans le code finit dans l'historique Git, que l'on ne peut pas
nettoyer une fois poussé, et dans chaque copie du dépôt. Un secret dans le code **front-end** est public par nature :
tout ce qui est dans le bundle se lit dans les outils de développement. Les outils de build l'assument en préfixant les
variables exposées, `VITE_` ou `NEXT_PUBLIC_` : une clé qui porte ce préfixe est publique. Une clé d'API tierce qui doit
rester secrète s'utilise depuis le serveur, qui fait l'appel pour le client. On donne à chaque secret le minimum de
droits nécessaires, et on prévoit sa rotation.

**Détecter et réagir.** Des outils de détection, comme la protection des pushs de GitHub ou gitleaks, bloquent un
commit qui contient une clé. Si un secret fuit malgré tout, l'ordre est toujours le même : **révoquer** le secret chez
son fournisseur, en créer un nouveau, déployer, puis chercher dans les journaux s'il a été utilisé. Retirer le fichier
du dépôt ne suffit jamais.

**Des journaux sans secrets.** Journaliser un corps de requête complet y met les mots de passe ; journaliser une
configuration y met les clés. On masque les champs sensibles avant d'écrire, de préférence dans le module de
journalisation lui-même, pour que personne ne l'oublie.

**La chaîne d'approvisionnement.** Chaque dépendance, et chaque dépendance de dépendance, exécute du code avec les droits
de l'application, et parfois à l'installation. Les risques sont de deux sortes. Des **vulnérabilités connues**, que
`npm audit` et les outils de mise à jour automatiques signalent : on les corrige selon leur exposition réelle. Des
**paquets malveillants** : un compte de mainteneur volé, un nom proche d'un paquet populaire, un script `postinstall`
qui exfiltre les variables d'environnement. On s'en protège avec un fichier de verrouillage commité et `npm ci`, les
scripts d'installation bloqués par défaut, comme le fait pnpm 10, la vérification de la provenance avec
`npm audit signatures`, et surtout en limitant le nombre de dépendances : une fonction de dix lignes ne justifie pas un
paquet.

## Erreurs fréquentes

**Valider seulement dans le navigateur.** L'attaquant n'utilise pas le formulaire ; valide sur le serveur.

**Copier tout le corps de la requête dans la base.** C'est l'affectation de masse ; choisis les champs, ou utilise un
schéma strict.

**Oublier les longueurs maximales.** Une chaîne énorme ou un tableau de millions d'éléments épuise le serveur.

**Croire qu'une donnée validée est sûre partout.** Encode toujours selon la destination.

**Mettre une clé secrète dans une variable `VITE_` ou `NEXT_PUBLIC_`.** Elle est publiée dans le bundle.

**Supprimer un secret du dépôt sans le révoquer.** Il reste dans l'historique et dans les copies ; révoque-le.

**Journaliser les corps de requêtes bruts.** Les mots de passe et les jetons finissent dans les journaux.

**Ajouter une dépendance pour une fonction triviale.** Chaque paquet est une porte d'entrée de plus.

## À retenir

- Valider à la frontière de confiance, côté serveur, par liste blanche et avec des longueurs maximales.
- Un schéma strict rejette les clés inconnues : il bloque l'affectation de masse et l'injection d'opérateurs.
- La validation ne remplace pas l'encodage de sortie.
- Les secrets restent sur le serveur, hors du code, du bundle et des journaux ; en cas de fuite, on révoque.
- Dépendances : verrouillage, `npm ci`, mises à jour régulières, audit, scripts d'installation contrôlés, et le moins
  possible.

## Exercices

1. Écris un schéma zod pour la mise à jour d'un profil : `nom` facultatif (1 à 80 caractères, sans espaces autour),
   `bio` facultative (500 caractères au plus), `siteWeb` facultatif (URL `https` uniquement), et aucune autre clé. Montre
   qu'une tentative d'ajouter `role` ou un site `javascript:` est refusée.

   :::indice
   `z.strictObject`, `.optional()`, et `z.url()` avec une vérification du protocole par `refine`.
   :::

   :::solution
   ```js
   import { z } from 'zod';

   const MiseAJourProfil = z.strictObject({
     nom: z.string().trim().min(1).max(80).optional(),
     bio: z.string().max(500).optional(),
     siteWeb: z
       .url()
       .refine((url) => new URL(url).protocol === 'https:', 'Seules les adresses https sont acceptées')
       .optional(),
   });

   const essais = [
     { nom: '  Ana  ', siteWeb: 'https://ana.exemple' },
     { nom: 'Ana', role: 'admin' },
     { siteWeb: 'javascript:alert(1)' },
   ];
   for (const essai of essais) {
     const resultat = MiseAJourProfil.safeParse(essai);
     console.log(resultat.success ? resultat.data : resultat.error.issues.map((p) => p.message));
   }
   // { nom: 'Ana', siteWeb: 'https://ana.exemple' }
   // [ 'Unrecognized key: "role"' ]
   // [ 'Seules les adresses https sont acceptées' ]
   ```

   Le serveur n'écrit ensuite dans la base que les champs présents dans `resultat.data` : il ne copie jamais le corps
   brut.
   :::

2. Écris `masquerSecrets(objet)`, qui renvoie une copie d'un objet à journaliser, en remplaçant par `'***'` la valeur de
   toute clé, à n'importe quelle profondeur, dont le nom contient `password`, `motdepasse`, `token`, `jeton`, `secret`,
   `cle` ou `authorization`, sans tenir compte de la casse.

   :::indice
   Une fonction récursive, qui traite aussi les tableaux, et une expression régulière insensible à la casse.
   :::

   :::solution
   ```js
   const CLE_SENSIBLE = /password|motdepasse|token|jeton|secret|cle|authorization/i;

   function masquerSecrets(valeur) {
     if (Array.isArray(valeur)) return valeur.map(masquerSecrets);
     if (valeur === null || typeof valeur !== 'object') return valeur;
     return Object.fromEntries(
       Object.entries(valeur).map(([cle, v]) => [cle, CLE_SENSIBLE.test(cle) ? '***' : masquerSecrets(v)]),
     );
   }

   console.log(
     masquerSecrets({
       email: 'ana@exemple.fr',
       motDePasse: 'correct-horse',
       headers: { Authorization: 'Bearer eyJ…', 'content-type': 'application/json' },
       integrations: [{ nom: 'stripe', cleApi: 'sk_live_…' }],
     }),
   );
   // {
   //   email: 'ana@exemple.fr',
   //   motDePasse: '***',
   //   headers: { Authorization: '***', 'content-type': 'application/json' },
   //   integrations: [ { nom: 'stripe', cleApi: '***' } ]
   // }
   ```

   La fonction renvoie une copie : l'objet d'origine, utilisé par la requête, reste intact. Les bibliothèques de
   journalisation comme pino offrent une option de masquage par chemins ; l'essentiel est de le faire dans le module de
   journalisation, pas à chaque appel.
   :::

3. Un développeur a commité, puis poussé, un fichier `.env` contenant la clé secrète d'un prestataire de paiement. Il
   propose de supprimer le fichier dans un nouveau commit. Décris les bonnes étapes, dans l'ordre, et ce qu'il faut mettre
   en place pour que cela ne se reproduise pas.

   :::indice
   Que reste-t-il dans l'historique et chez ceux qui ont cloné ? Par quoi commencer ?
   :::

   :::solution
   Supprimer le fichier ne retire pas la clé de l'historique, ni des clones, ni des caches d'outils qui ont pu la lire. Des
   robots scannent les dépôts publics en continu. Les étapes :

   1. **Révoquer** immédiatement la clé chez le prestataire, et en générer une nouvelle ;
   2. déployer la nouvelle clé dans le gestionnaire de secrets ou les variables d'environnement de production ;
   3. examiner les journaux du prestataire pour détecter un usage frauduleux depuis la fuite, et suivre la procédure
      d'incident de l'entreprise ;
   4. retirer le fichier du dépôt, et éventuellement réécrire l'historique, mais seulement après la révocation, qui est la
      vraie protection ;
   5. prévenir la récidive : `.env` dans `.gitignore`, un `.env.example` commité, la détection de secrets dans les pushs
      et dans l'intégration continue, et une clé aux droits minimaux, par environnement.
   :::

## Questions d'entretien

- Où et comment valides-tu les entrées d'une API ?

  :::indice
  Frontière, liste blanche, schéma, longueurs, clés inconnues.
  :::

  :::reponse
  À la frontière de confiance, côté serveur : dès l'arrivée de la requête, et aussi pour les messages, les fichiers et
  les réponses d'API tierces. J'utilise un schéma, par exemple zod, qui décrit ce qui est permis : types, formats,
  longueurs minimales et maximales, énumérations, et un objet strict qui rejette les clés inconnues. Le reste du code ne
  reçoit que les données validées et typées. La validation côté client n'est qu'un confort. Et je n'oublie pas que valider
  ne dispense pas d'encoder à la sortie ni de paramétrer les requêtes.
  :::

- Comment gères-tu les secrets d'une application ?

  :::indice
  Stockage, exposition, droits, rotation, fuite.
  :::

  :::reponse
  Ils vivent dans l'environnement du serveur, fournis par la plateforme ou un gestionnaire de secrets, jamais dans le
  code, le dépôt ou le bundle front-end, où tout est public. Chaque secret a des droits minimaux, un par environnement, et
  une rotation prévue. La détection de secrets bloque les commits fautifs, et le module de journalisation masque les
  champs sensibles. En cas de fuite, je révoque d'abord, je remplace, puis j'analyse l'usage éventuel ; supprimer le
  fichier ne suffit pas.
  :::

- Quels risques présentent les dépendances npm, et comment les réduire ?

  :::indice
  Vulnérabilités connues, paquets malveillants, surface.
  :::

  :::reponse
  Deux risques : des vulnérabilités connues dans des paquets légitimes, et des paquets malveillants, par compte de
  mainteneur compromis, typosquatting ou script d'installation qui exfiltre des secrets. Je réduis le premier avec des
  mises à jour régulières, automatisées par Renovate ou Dependabot, et l'audit en intégration continue, trié selon
  l'exposition réelle. Pour le second : fichier de verrouillage et `npm ci`, scripts d'installation bloqués sauf pour
  les paquets approuvés, vérification des noms et de la provenance, et surtout peu de dépendances, choisies pour leur
  maintenance.
  :::
