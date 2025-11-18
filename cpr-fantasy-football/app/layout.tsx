import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CPR Fantasy Football 2025/26",
  description: "Fantasy football league for CPR Saturday team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} font-sans antialiased`}
      >
        <header className="bg-slate-900 text-white shadow-md border-b border-slate-700">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-4xl font-bold tracking-tight">CPR FANTASY FOOTBALL 2025/26</h1>
            <p className="text-sm font-light opacity-90 mt-2 tracking-wide">Saturday League Stats & Standings</p>
          </div>
        </header>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
