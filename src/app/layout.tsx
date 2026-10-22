import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simulado Interativo — PC PE Agente (Banca CEBRASPE)",
  description:
    "Simulado interativo completo do concurso PC PE – Agente: 60 questões objetivas, cronômetro de 5h30, marcação de questões, desempenho por disciplina e revisão comentada.",
  keywords: ["PC PE", "Agente", "simulado", "CEBRASPE", "concurso", "Pernambuco", "Polícia Civil"],
  authors: [{ name: "Simulado Interativo" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Simulado Interativo — PC PE Agente",
    description: "60 questões, cronômetro real, desempenho por disciplina e gabarito comentado.",
    siteName: "Simulado PC PE – Agente",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
