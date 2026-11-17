"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Zilja në shiritin e sipërm: numri i palexuarave, rifreskohet çdo 30 s dhe pas çdo navigimi. */
export default function Zilja() {
  const [numri, setNumri] = useState(0);
  const [hyre, setHyre] = useState(false);
  const path = usePathname();

  useEffect(() => {
    let aktiv = true;
    async function lexo() {
      if (document.visibilityState === "hidden") return;
      try {
        const r = await fetch("/api/njoftimet/numri", { cache: "no-store" });
        const d = await r.json();
        if (aktiv) { setHyre(Boolean(d.hyre)); setNumri(Number(d.numri) || 0); }
      } catch { /* offline */ }
    }
    lexo();
    const t = setInterval(lexo, 30000);
    return () => { aktiv = false; clearInterval(t); };
  }, [path]);

  if (!hyre) return <Link className="topbar-link" href="/hyrja">Hyr</Link>;
  return (
    <Link className="topbar-link bell" href="/njoftimet" aria-label={numri ? `Njoftimet: ${numri} të palexuara` : "Njoftimet"}>
      <span aria-hidden="true">🔔</span>
      {numri > 0 && <span className="bell-count">{numri > 9 ? "9+" : numri}</span>}
    </Link>
  );
}
