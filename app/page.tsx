import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "ホンネ",
  description:
    "ホンネは、AIであることを明示した透明・誠実なAI占いサービス。恋愛や人間関係の悩みに24時間、正直な鑑定を届けます。"
};

export default function HomePage() {
  return <LandingPage />;
}
