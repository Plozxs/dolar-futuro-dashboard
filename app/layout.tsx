import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Monitor de Dolar Futuro · A3 Mercados",
  description:
    "Dashboard profesional de futuros de dolar (A3 Mercados): TNA implicita, bases, spreads, open interest, curvas forward y metricas de liquidez en tiempo real.",
  keywords: [
    "futuros de dolar",
    "A3 Mercados",
    "PyRofex",
    "TNA implicita",
    "trading desk",
    "quant",
  ],
  authors: [{ name: "Trading Desk" }],
};

export const viewport: Viewport = {
  themeColor: "#070b16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
