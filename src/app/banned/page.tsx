import { ShieldAlert, Mail } from 'lucide-react';
import Link from 'next/link';

export default function BannedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-900">
      <div className="max-w-md w-full glass-morphism p-8 bg-black/40 rounded-2xl border border-white/10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-red-600/20 rounded-2xl mb-4">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Account Sospeso</h1>
        <p className="text-gray-400 mb-6">
          Il tuo account è stato sospeso dall&apos;amministrazione.
        </p>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400 font-medium">Motivo:</p>
          <p className="text-sm text-gray-300 mt-1">
            {searchParams.then(s => s.reason || 'Nessun motivo specificato.')}
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Per qualsiasi chiarimento, contatta l&apos;amministrazione.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
          <Mail className="w-4 h-4" />
          <span>admin@tracklist.app</span>
        </div>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-colors"
        >
          Torna al login
        </Link>
      </div>
    </div>
  );
}