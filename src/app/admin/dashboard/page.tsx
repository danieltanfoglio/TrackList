import { getAdminStats, AdminStats } from '@/lib/supabase-admin';
import { Activity, Users, Film, Star, UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    let stats: AdminStats | null = null;
    let statsError = false;

    try {
        stats = await getAdminStats();
    } catch {
        statsError = true;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Benvenuto, Admin</h1>
                <p className="text-gray-400">Ecco le statistiche generali dell&apos;applicazione TrackList.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-black border border-white/10 p-6 rounded-2xl glass-morphism">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Utenti Totali</h3>
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold">
                        {statsError || !stats ? '—' : stats.totalUsers.toLocaleString('it-IT')}
                    </p>
                </div>

                <div className="bg-black border border-white/10 p-6 rounded-2xl glass-morphism">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Contenuti Salvati</h3>
                        <Film className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold">
                        {statsError || !stats ? '—' : stats.totalWatchlistItems.toLocaleString('it-IT')}
                    </p>
                </div>

                <div className="bg-black border border-white/10 p-6 rounded-2xl glass-morphism">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Valutazioni</h3>
                        <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-3xl font-bold">
                        {statsError || !stats ? '—' : stats.totalRatings.toLocaleString('it-IT')}
                    </p>
                </div>

                <div className="bg-black border border-white/10 p-6 rounded-2xl glass-morphism">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Stato API</h3>
                        <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">
                        {statsError ? 'Errore' : 'Online'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Dati in tempo reale</p>
                </div>
            </div>

            <div className="bg-black border border-white/10 rounded-2xl glass-morphism p-6 overflow-hidden">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-400" /> Ultimi Utenti
                </h2>
                {statsError || !stats ? (
                    <p className="text-gray-500">Impossibile caricare gli ultimi utenti. Verifica la chiave SUPABASE_SERVICE_ROLE_KEY.</p>
                ) : stats.recentUsers.length === 0 ? (
                    <p className="text-gray-500">Nessun utente registrato ancora.</p>
                ) : (
                    <div className="space-y-4">
                        {stats.recentUsers.map((u, i) => (
                            <div key={u.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold uppercase">
                                        {(u.email || 'U')[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium">{u.email || 'Utente anonimo'}</p>
                                        <p className="text-sm text-gray-400">{u.id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('it-IT') : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
