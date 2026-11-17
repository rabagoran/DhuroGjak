import type { Metadata } from "next";
import Qendrat from "@/components/Qendrat";

export const metadata: Metadata = { title: "Qendrat e transfuzionit" };

export default function QendratFaqe() {
  return (
    <main className="stack">
      <div>
        <h1>📍 Qendrat e transfuzionit</h1>
        <p className="muted">Gjej qendrën më të afërt ku mund të dhurosh gjak.</p>
      </div>
      <Qendrat />
    </main>
  );
}
