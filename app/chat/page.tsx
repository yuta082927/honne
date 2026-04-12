import type { Metadata } from "next";
import { FortuneForm } from "@/components/fortune-form";

export const metadata: Metadata = {
  title: "AI占いチャット",
  description: "ホンネのAI占いチャット。AIであることを開示した透明な鑑定を、24時間いつでも利用できます。"
};

export default function ChatPage() {
  return <FortuneForm />;
}
