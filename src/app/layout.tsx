import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrackList - Tracker Film e Serie TV",
  description: "Tieni traccia dei tuoi film e serie TV preferiti, gestisci la watchlist e traccia il progresso degli episodi.",
  openGraph: {
    title: "TrackList",
    description: "Organizza la tua passione per cinema e serie TV.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
