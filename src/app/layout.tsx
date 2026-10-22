import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { APPEARANCE_BOOTSTRAP } from "@/lib/appearance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simulados Policiais Pro — provas oficiais + PDF vira simulado no celular",
  description:
    "Simulados interativos das provas policiais mais recentes (PF, PC, PM, PRF, Polícia Penal) com gabarito oficial, nos modelos Certo/Errado e A,B,C,D,E. Transforme qualquer PDF em simulado com IA. Assinatura R$ 17,90/mês.",
  keywords: [
    "simulado policial",
    "concurso policial",
    "PF",
    "Polícia Federal",
    "Polícia Civil",
    "PM",
    "PRF",
    "Polícia Penal",
    "certo ou errado",
    "questões",
    "PDF simulado",
  ],
  authors: [{ name: "Simulados Policiais Pro" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "Simulados Policiais Pro — estude provas oficiais no celular",
    description:
      "Provas oficiais com gabarito (PF, PC, PM, PRF, Polícia Penal) + transforme qualquer PDF em simulado com IA. Certo/Errado ou A,B,C,D,E.",
    siteName: "Simulados Policiais Pro",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020617",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Simulados Pro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOTSTRAP }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
