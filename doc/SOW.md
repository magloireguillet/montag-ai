# STATEMENT OF WORK (SOW) : DEPLOIEMENT AGENT IA DE DEBORDEMENT NEXSIS 18-112

**Projet** : MONTAG AI
**Nom de l'agent** : Montag
**Client** : Agence du Numerique de la Securite Civile (ANSC)
**Approche** : Forward Deployed Engineering (FDE) - ElevenLabs France
**SDK** : `@elevenlabs/react` v0.14.x (hooks conversationnels) + `@elevenlabs/ui` v1.0+ (composant Orb 3D)

---

## 1. Vision et Methodologie FDE

L'approche Forward Deployed Engineering d'ElevenLabs differe fondamentalement des integrateurs classiques. Nous ne livrons pas une simple cle API ; nous nous integrons aux equipes pour concevoir, construire et deployer des architectures IA pretes pour la production.

Ce projet se divise en deux phases :

- **Implementation** : Cadrage du flux, ecriture du middleware de connexion aux systemes de l'Etat, et mise en production avec une gouvernance claire et des indicateurs de performance (KPIs) stricts.
- **Stabilisation** : Monitorage de la latence, ajustement de la detection d'activite vocale (VAD) pour la gestion des interruptions (barge-in), et transfert des bonnes pratiques operationnelles aux ingenieurs de l'ANSC.

---

## 2. Architecture du Pipeline Temps Reel (Budget Latence < 500ms)

L'agent doit soutenir une conversation naturelle sans blanc. L'architecture repose sur un flux continu (streaming) via des connexions WebSocket bidirectionnelles.

> **Note d'implementation** : Le SDK Conversational AI d'ElevenLabs gere le pipeline complet (STT → LLM → TTS) en interne. Cote client, une seule connexion WebSocket est ouverte via `ConversationProvider`. Le choix du LLM souverain, la configuration de Scribe v2 et de Flash v2.5 se font **cote plateforme ElevenLabs** (dashboard agent), pas dans le code Next.js. Les sections ci-dessous decrivent les composants du pipeline a des fins de specification, pas d'implementation manuelle.

### A. Ingestion et Transcription (Speech-to-Text)

| Parametre | Valeur |
|---|---|
| **Modele** | ElevenLabs Scribe v2 Realtime |
| **Latence** | < 150 ms |
| **Format audio** | 16-bit PCM, little-endian |
| **Echantillonnage** | 16 kHz (recommande) / 8 kHz mu-law (telephonie d'urgence) |

- **Securite des donnees** : Entity Redaction active — masquage automatique des PII (donnees personnellement identifiables) avant envoi au LLM.
- **Segmentation** : Detection d'activite vocale (VAD) automatique pour identifier les silences et declencher le rendu de la transcription.

### B. Moteur de Raisonnement (LLM Souverain)

- **Souverainete** : Le texte transcrit (et caviade) ne sera pas envoye vers un LLM americain public. Il sera route vers un modele heberge sur une infrastructure certifiee **SecNumCloud**.
- **Options d'hebergement** : IBM watsonx (integration native ElevenLabs) ou Mistral deploye sur Cloud Temple / Outscale.
- **Objectif** : Analyser le niveau de detresse et extraire les variables critiques de l'incident.

### C. Generation Vocale (Text-to-Speech)

| Parametre | Valeur |
|---|---|
| **Modele** | Eleven Flash v2.5 |
| **Latence** | ~75 ms |
| **Protocole** | Flux audio temps reel via WebSocket |

### D. Contraintes d'Integration Next.js

- **SSR interdit pour l'Orb** : Le composant Orb (Three.js/React Three Fiber) necessite `window` et WebGL. Import obligatoire via `next/dynamic` avec `ssr: false` pour eviter un crash au build.
- **Hooks granulaires obligatoires** : Ne JAMAIS utiliser le hook monolithique `useConversation()` qui declenche un re-render a chaque micro-changement d'etat (status, mode, volume). Utiliser exclusivement les hooks granulaires pour isoler les re-renders :
  - Orb : `useConversationMode()` uniquement
  - Boutons de controle : `useConversationControls()` (references stables, zero re-render)
  - Dashboard : `useConversationStatus()` pour l'etat de connexion
- **ConversationProvider au niveau layout** : Le `ConversationProvider` doit wrapper les deux panels (Citoyen + Operateur) pour que le Dashboard accede aux evenements `onMessage` (transcriptions). Les hooks granulaires ne sont pas affectes par ce placement — ils ne subscribent qu'a leur slice.
- **Gestion d'etat** : Zustand avec selectors pour le transit des donnees CISU du `client_tool_call` vers le tableau de bord operateur. Le callback `clientTools` etant une fonction plain JS (hors React), Zustand est le seul choix permettant `store.getState().updateAlert()` sans hook. Les selectors garantissent que le Dashboard re-render sans affecter l'Orb.
- **Residence EU cote code** : Le `ConversationProvider` passe `serverLocation: "eu-residency"` pour router les connexions WebSocket vers les serveurs europeens d'ElevenLabs. Cette valeur est hardcodee (non configurable par env var) pour garantir la conformite. Les options Zero Retention et Entity Redaction sont activees cote dashboard ElevenLabs.

---

## 3. Integration Backend : Systeme de Gestion des Echanges (SGE)

L'aboutissement de l'appel est la creation d'une fiche d'intervention. Le systeme s'interface avec le SGE de NexSIS, module responsable du routage des donnees vers les plateformes de secours.

### Standardisation des Donnees

- **Standard** : EMSI (Emergency Management Shared Information), derivant de la norme ISO 22-351.
- **Interoperabilite francaise** : Format strict CISU (Cadre d'Interoperabilite des Situations d'Urgence) — qualification multi-forces (SAMU, SDIS, Police).

### Protocole d'Injection Technique

- Format de la fiche d'alerte : **JSON** ou **XML** (le MVP implemente JSON uniquement ; le format XML sera ajoute lors de l'integration SGE reelle)
- Injection dans le broker de messages (AMQP/RabbitMQ) du Hub Sante de NexSIS
- Header requis : `Content-Type: application/json` ou `application/xml`

---

## 4. Conformite Reglementaire

Pour lever les verrous lies a l'hebergement de donnees sensibles (sante et urgence) par un acteur americain, le deploiement s'appuie sur deux configurations cles de l'offre "Enterprise" ElevenLabs :

### Zero Retention Mode

Mode obligatoirement active. Les flux audio, transcriptions et reponses generees sont traites uniquement en RAM — jamais ecrits sur les disques persistants d'ElevenLabs.

### Residence Europeenne des Donnees

- Environnements isoles physiquement localises en Europe (conformite RGPD)
- Reduction de la latence reseau
- Chiffrement de bout en bout (transit et repos)

### Contrainte HTTPS

Le deploiement (y compris la demo) DOIT etre en HTTPS. L'API `getUserMedia` (acces microphone) est bloquee par les navigateurs sur les origines non-HTTPS (exception : `localhost` pour le developpement). Vercel fournit HTTPS automatiquement ; en cas d'hebergement souverain, utiliser Let's Encrypt.

---

## 5. Resilience et Gestion des Erreurs

### 5.1 Autoplay Policy Navigateur (CRITIQUE)

Chrome, Firefox et Safari bloquent la lecture audio automatique sans geste utilisateur. Le flux TTS d'Eleven Flash v2.5 ne sera pas lu si la session demarre programmatiquement au chargement de la page.

**Solution obligatoire** : Pattern "Tap to Start". La page affiche l'Orb en etat idle avec un bouton "Appuyer pour commencer". Le clic utilisateur satisfait simultanement :
- La politique autoplay (deblocage audio)
- La demande de permission microphone (`getUserMedia`)

### 5.2 Permission Microphone

| Etat | Comportement |
|---|---|
| `prompt` | Afficher "Montag a besoin de votre microphone" + declenchement via le bouton Start |
| `granted` | Demarrage normal de la session |
| `denied` | Afficher "Microphone requis — Reinitialiser les permissions dans les parametres du navigateur" avec lien vers les instructions |

Pre-verification via `navigator.permissions.query({ name: "microphone" })` avant l'appel a `startSession()`.

### 5.3 Reconnexion WebSocket

En cas de coupure reseau pendant un appel :

1. Detection via `useConversationStatus()` (etat `disconnected`)
2. Overlay sur l'Orb : "Reconnexion en cours..."
3. Backoff exponentiel : retry a 1s, 2s, 4s (max 3 tentatives)
4. Verification de l'URL signee (expiration 15 min) — re-fetch si expiree avant retry
5. Apres 3 echecs : afficher "Connexion impossible — Cliquez pour reessayer"

### 5.4 Limite de Duree d'Appel

Duree maximale par session : **10 minutes**. Warning visuel et sonore a 8 minutes ("Votre appel sera transfere dans 2 minutes"). Cloture automatique a 10 minutes avec message de transfert vers un operateur humain.

### 5.5 Etats Visuels de l'Orb (Machine a Etats)

| Etat | Orb | Message affiche |
|---|---|---|
| Initial | Pulse idle, couleurs sourdes | "Appuyer pour commencer" |
| Connecting | Rotation lente | "Connexion en cours..." |
| Listening | Animation active, lumineux | "Montag vous ecoute" |
| Speaking | Animation onde | "Montag repond..." |
| Mic Denied | Teinte rouge | "Microphone requis" |
| Disconnected | Gris/fige | "Reconnexion..." |
| Failed | Pulse rouge | "Connexion impossible — Reessayer" |
| Timeout (8min) | Pulse orange | "Transfert imminent..." |

### 5.6 Fallback Mode

En cas d'indisponibilite de l'API ElevenLabs, basculement automatique vers un mode texte-only : saisie clavier du citoyen + reponses textuelles du LLM affichees dans l'interface. L'Orb passe en etat statique gris.

---

## 6. Livrables Techniques

| # | Livrable | Description |
|---|---|---|
| 1 | **Code de l'Orchestrateur (Middleware)** | Depot contenant le code Python/TypeScript gerant WebRTC/WebSocket, evenements asynchrones et logique metier |
| 2 | **Configurations des Modeles** | Parametrage optimal de Scribe v2 Realtime (incluant Keyterm prompting jargon pompiers) et Flash v2.5 |
| 3 | **Connecteurs SGE/CISU** | Scripts de conversion du JSON de sortie du LLM vers le schema XML/JSON CISU valide |
| 4 | **Endpoint Signed URL** | `POST /api/signed-url` — seul code server-side du MVP. Appelle l'API ElevenLabs pour generer une URL signee (cle API jamais exposee au client, expiration 15 min) |
| 5 | **Tests de Charge et Latence** | Rapports demontrant latence conversationnelle E2E < 500 ms lors de pics de simulation d'appels |

---

## 7. Architecture Technique du MVP

```
Application Web Next.js
├── Vue Citoyen
│   ├── Orb 3D interactif (ElevenLabs UI, reactif a la voix)
│   └── Interface appel d'urgence
├── Tableau de Bord Operateur
│   ├── Transcription temps reel
│   ├── Fiche CISU generee en direct (JSON)
│   └── Indicateurs de l'incident
└── Backend
    ├── WebSocket bidirectionnel
    ├── Scribe v2 Realtime (STT, < 150ms)
    ├── LLM Souverain (SecNumCloud)
    ├── Eleven Flash v2.5 (TTS, ~75ms)
    └── Client Tools → Generation fiche CISU
```

### Flux de Donnees

```
Appelant (voix) 
  → WebSocket → Scribe v2 (STT + Entity Redaction)
    → LLM Souverain (analyse + extraction variables)
      → Client Tools (generation fiche CISU JSON)
        → Tableau de bord operateur (affichage temps reel)
      → Eleven Flash v2.5 (TTS, reponse empathique)
    → WebSocket → Appelant (voix de reponse)
```

---

## 8. Budget Latence Detaille

| Etape | Composant | Latence Cible |
|---|---|---|
| STT | Scribe v2 Realtime | < 150 ms |
| Raisonnement | LLM Souverain | < 200 ms |
| TTS | Eleven Flash v2.5 | ~75 ms |
| Reseau | WebSocket E2E | < 75 ms |
| **Total** | **Pipeline complet** | **< 500 ms** |
