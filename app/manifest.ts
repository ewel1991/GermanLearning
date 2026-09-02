import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DeutschMeister",
    short_name: "DeutschMeister",
    description: "Single-user German B2/C1 learning app",
    start_url: "/screen1",
    display: "standalone",
    background_color: "#10141F",
    theme_color: "#1B2233",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
