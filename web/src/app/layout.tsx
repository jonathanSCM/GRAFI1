import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://grafi.digital"),
  title: {
    default: "Grafi — Tarjetas digitales NFC | Tu contacto, en un solo toque",
    template: "%s | Grafi",
  },
  description:
    "Comparte tu WhatsApp, redes sociales, portafolio y catálogo con una tarjeta digital inteligente NFC + QR. Perfil editable, analíticas y captación de leads. La última tarjeta que vas a necesitar.",
  keywords: [
    "tarjeta digital",
    "tarjeta NFC",
    "tarjeta de presentación digital",
    "código QR",
    "networking digital",
    "perfil profesional",
    "Grafi",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://grafi.digital",
    siteName: "Grafi",
    title: "Grafi — La última tarjeta que vas a necesitar",
    description:
      "Tarjeta digital inteligente NFC + QR: comparte WhatsApp, redes, portafolio y catálogo con un solo toque. Perfil editable con analíticas y leads.",
    images: [
      {
        url: "/hero-product.png",
        width: 918,
        height: 874,
        alt: "Tarjeta NFC Grafi con código QR y perfil digital",
      },
    ],
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Grafi — La última tarjeta que vas a necesitar",
    description:
      "Tarjeta digital inteligente NFC + QR: comparte tu contacto, redes y catálogo con un solo toque.",
    images: ["/hero-product.png"],
  },
  icons: {
    icon: "/favicon-mark.png",
    apple: "/brand-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
