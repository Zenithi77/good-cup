import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Header, Footer } from "@/components/layout";
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
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#3d322d',
              color: '#f5ebe6',
              border: '1px solid #5a3e2b',
            },
            success: {
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#f5ebe6',
              },
            },
            error: {
              iconTheme: {
                primary: '#F44336',
                secondary: '#f5ebe6',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
