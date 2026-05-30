import { getUsers } from '@/lib/supabase-admin';
import { Users, Search, Bookmark, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const search = params.q || '';
    const users = await getUsers(search || undefined);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Users className="w-7 h-7 text-blue-400" /> Utenti
                    </h1>
                    <p className="text-gray-400">{users.length} utenti registrati</p>
                </div>
            </div>

            <form className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    name="q"
                    defaultValue={search}
                    placeholder="Cerca per username..."
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all text-sm"
                    aria-label="Cerca utenti"
                />
            </form>

            {users.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    {search ? `Nessun utente trovato per "${search}".` : 'Nessun utente registrato.'}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="text-left py-4 px-4 font-medium text-gray-400">Username</th>
                                <th className="text-left py-4 px-4 font-medium text-gray-400 hidden sm:table-cell">ID</th>
                                <th className="text-left py-4 px-4 font-medium text-gray-400 hidden md:table-cell">Registrato il</th>
                                <th className="text-right py-4 px-4 font-medium text-gray-400">Contenuti</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                                                {(u.username || '?')[0]}
                                            </div>
                                            <span className="font-medium text-white">{u.username || 'Anonimo'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-500 font-mono text-xs hidden sm:table-cell">
                                        {u.id.slice(0, 12)}...
                                    </td>
                                    <td className="py-4 px-4 text-gray-400 hidden md:table-cell">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-gray-600" />
                                            {u.created_at
                                                ? new Date(u.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-blue-400 text-xs font-medium">
                                            <Bookmark className="w-3 h-3" /> {u.watchlist_count}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
