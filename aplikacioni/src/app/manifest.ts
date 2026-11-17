import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DhuroGjak — Dhuro gjak, shpëto jetë",
    short_name: "DhuroGjak",
    description: "Lidh pacientët që kanë nevojë për gjak me dhuruesit e përputhshëm afër tyre.",
    lang: "sq",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#b91c1c",
    categories: ["health", "medical", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
