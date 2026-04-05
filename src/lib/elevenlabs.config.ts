/**
 * Configuration ElevenLabs Conversational AI.
 *
 * serverLocation est hardcode a "eu-residency" pour conformite SOW section 4
 * (Residence Europeenne des Donnees). Ne pas rendre configurable par env var.
 */
export const ELEVENLABS_CONFIG = {
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? "",
  serverLocation: "eu-residency" as const,
  overrides: {
    agent: {
      language: "fr" as const,
      firstMessage:
        "Bonjour, ici Montag, agent de debordement du 18-112. " +
        "Pouvez-vous me decrire votre situation et me donner votre adresse ?",
    },
  },
} as const;
