import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/layout/AuthProvider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        {children}
      </main>
      <footer className="py-10 border-t border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} TrackList. Dati da TMDB.
        </div>
      </footer>
    </AuthProvider>
  );
}