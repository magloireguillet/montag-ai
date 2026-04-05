import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConversationWrapper } from "@/components/providers/ConversationWrapper";
import { ElevenLabsWidget } from "@/components/citizen/ElevenLabsWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Montag AI — Agent de Debordement 18/112",
  description: "Agent vocal IA de debordement pour l'ANSC — MVP ElevenLabs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-white">
        <ConversationWrapper>{children}</ConversationWrapper>
        <ElevenLabsWidget />
      </body>
    </html>
  );
}
