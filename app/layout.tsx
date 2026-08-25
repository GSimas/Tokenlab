import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokenLab — Analisador de Tokens",
  description: "Conte tokens, simule chunking e estime a carga de entrada dos seus documentos para embeddings.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

const THEME_SCRIPT = `(function(){try{var stored=localStorage.getItem("tokenlab-theme");if(stored==="light"||stored==="dark"){document.documentElement.setAttribute("data-theme",stored);}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
