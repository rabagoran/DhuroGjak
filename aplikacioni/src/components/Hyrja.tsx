"use client";
import { signIn, signOut } from "next-auth/react";

export function ButonatEHyrjes({ ofruesit, kthehu = "/profili" }: { ofruesit: { id: string; emri: string }[]; kthehu?: string }) {
  if (ofruesit.length === 0) {
    return <p className="alert alert-info">Hyrja nuk është konfiguruar ende. Shto <code>GITHUB_ID</code> dhe <code>GITHUB_SECRET</code> në <code>.env.local</code>.</p>;
  }
  return (
    <div className="stack">
      {ofruesit.map((o) => (
        <button key={o.id} type="button" className="btn btn-block" onClick={() => signIn(o.id, { callbackUrl: kthehu })}>
          Hyr me {o.emri}
        </button>
      ))}
    </div>
  );
}

export function ButoniDalja() {
  return <button type="button" className="btn btn-ghost btn-small" onClick={() => signOut({ callbackUrl: "/" })}>Dil</button>;
}
