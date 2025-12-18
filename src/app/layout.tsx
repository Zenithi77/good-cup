import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer, ClientProviders } from "@/components/layout";
import { FloatingCart } from "@/components/cart";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-coffee-950 text-coffee-100 min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingCart />
        <ClientProviders>{null}</ClientProviders>
      </body>
    </html>
  );
}
