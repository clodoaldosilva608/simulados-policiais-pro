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
  title: "Simulados Interativos — transforme PDFs em simulados de estudo",
  description:
    "Envie qualquer PDF (edital, apostila, resumo) e a IA transforma o conteúdo em um simulado interativo: questões inéditas, cronômetro, gabarito comentado e desempenho por assunto. Inclui o simulado PC PE – Agente (CEBRASPE) embutido.",
  keywords: ["simulado", "PDF", "concurso", "questões", "IA", "CEBRASPE", "estudos", "PC PE"],
  authors: [{ name: "Simulados Interativos" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Simulados Interativos — seus PDFs viram simulados",
    description: "Upload de PDF, geração de questões por IA, cronômetro real, desempenho por assunto e gabarito comentado.",
    siteName: "Simulados Interativos",
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
