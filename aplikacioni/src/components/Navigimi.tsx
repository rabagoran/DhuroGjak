"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LIDHJET = [
  { href: "/", emri: "Kërkesat", ikona: "🩸" },
  { href: "/kerkesa/e-re", emri: "Posto", ikona: "➕" },
  { href: "/qendrat", emri: "Qendrat", ikona: "📍" },
  { href: "/statistikat", emri: "Statistika", ikona: "📊" },
  { href: "/profili", emri: "Profili", ikona: "👤" },
];

export default function Navigimi() {
  const path = usePathname();
  const aktiv = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <nav className="bottom-nav" aria-label="Navigimi kryesor">
      <ul>
        {LIDHJET.map((l) => (
          <li key={l.href}>
            <Link href={l.href} aria-current={aktiv(l.href) ? "page" : undefined}>
              <span className="nav-icon" aria-hidden="true">{l.ikona}</span>
              {l.emri}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
