import { CitizenPanel } from "@/components/citizen/CitizenPanel";
import { OperatorDashboard } from "@/components/operator/OperatorDashboard";

export default function Home() {
  return (
    <main className="flex flex-1 h-screen">
      {/* Left: Citizen / Caller view */}
      <div className="flex-1">
        <CitizenPanel />
      </div>

      {/* Right: Operator / SGO dashboard */}
      <div className="w-[480px] shrink-0">
        <OperatorDashboard />
      </div>
    </main>
  );
}
