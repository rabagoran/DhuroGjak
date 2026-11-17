import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Navigimi from "@/components/Navigimi";
import Pwa from "@/components/Pwa";

export const metadata: Metadata = {
  title: { default: "DhuroGjak", template: "%s · DhuroGjak" },
  description: "Lidh pacientët që kanë nevojë për gjak me dhuruesit e përputhshëm afër tyre.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#b91c1c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sq">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand"><span aria-hidden="true">🩸</span> DhuroGjak</Link>
          </div>
        </header>
        <Pwa />
        {children}
        <Navigimi />
      </body>
    </html>
  );
}
