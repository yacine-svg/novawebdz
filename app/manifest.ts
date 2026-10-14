import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.studio} · ${site.name}`,
    short_name: site.studio,
    start_url: "/",
    display: "standalone",
    background_color: "#070A16",
    theme_color: "#070A16",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
