"use client";

/**
 * Placeholder Orb component.
 * Replace with the real ElevenLabs Orb via:
 *   npx @elevenlabs/cli@latest components add orb
 *
 * This placeholder mimics the Orb API so the app compiles without the ElevenLabs CLI.
 */
interface OrbProps {
  colors?: [string, string];
  agentState?: "listening" | "thinking" | "speaking" | null;
}

export function Orb({ colors = ["#e74c3c", "#f39c12"], agentState }: OrbProps) {
  const scale = agentState === "speaking" ? 1.1 : agentState === "listening" ? 1.05 : 1;
  const glow = agentState ? "0 0 80px" : "0 0 40px";

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="rounded-full transition-transform duration-700 ease-in-out"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle at 30% 30%, ${colors[0]}, ${colors[1]})`,
          transform: `scale(${scale})`,
          boxShadow: `${glow} ${colors[0]}40`,
          animation: agentState ? "pulse 2s ease-in-out infinite" : "pulse 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}
