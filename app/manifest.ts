import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ホンネ",
    short_name: "ホンネ",
    description: "AIであることを明示した、透明・誠実なAI占いサービス",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0a1a",
    theme_color: "#0d0a1a"
  };
}
