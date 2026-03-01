// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/layout/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MovieTracker AI",
  description: "Tieni traccia dei tuoi film e serie TV preferiti con l'AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
          <footer className="py-10 border-t border-white/5 bg-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} MovieTracker AI. Dati da TMDB.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
