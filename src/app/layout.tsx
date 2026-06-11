import type { Metadata } from "next";
import { Inter, Montserrat, JetBrains_Mono } from "next/font/google";
import { Header, Footer, ClientProviders, IntroSplash } from "@/components/layout";
import { FloatingCart } from "@/components/cart";
import "./globals.css";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const montserratDisplay = Montserrat({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Good Cup - Цаасан аяга, таг, соруул",
  description: "Чанартай цаасан аяга, таг, соруулыг бөөний үнээр нийлүүлнэ.",
  keywords: ["цаасан аяга", "кофены аяга", "таг", "соруул", "бөөний худалдаа"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body
        className={`${interSans.variable} ${montserratDisplay.variable} ${jetbrainsMono.variable} antialiased bg-coffee-950 text-coffee-100 min-h-screen flex flex-col`}
      >
        <IntroSplash />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingCart />
        <ClientProviders>{null}</ClientProviders>
      </body>
    </html>
  );
}
