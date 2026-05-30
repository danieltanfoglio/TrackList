import { getActivity } from '@/lib/supabase-admin';
import { Activity, Bookmark, Star, CheckCircle, Eye, Play } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    watching: { label: 'In corso', icon: <Play className="w-3.5 h-3.5" />, color: 'text-blue-400 bg-blue-500/10' },
    completed: { label: 'Completato', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-green-400 bg-green-500/10' },
    to_watch: { label: 'Da vedere', icon: <Eye className="w-3.5 h-3.5" />, color: 'text-purple-400 bg-purple-500/10' },
};

export default async function AdminActivityPage() {
    const activities = await getActivity();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Activity className="w-7 h-7 text-orange-400" /> Attività Recente
                </h1>
                <p className="text-gray-400">Ultime {activities.length} attività sulla piattaforma</p>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    Nessuna attività registrata.
                </div>
            ) : (
                <div className="space-y-2">
                    {activities.map((a) => {
                        const statusInfo = STATUS_LABELS[a.status] || STATUS_LABELS.to_watch;
                        return (
                            <div
                                key={a.id}
                                className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-xl p-4 hover:bg-white/5 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm uppercase flex-none">
                                    {(a.username || '?')[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-300">
                                        <span className="font-medium text-white">{a.username || 'Utente anonimo'}</span>
                                        {' ha '}
                                        {a.status === 'completed' ? 'completato' : a.status === 'watching' ? 'iniziato' : 'aggiunto'}
                                        {' il contenuto '}
                                        <span className="font-mono text-xs text-gray-500">#{a.tmdb_id}</span>
                                        {' '}
                                        <span className="text-[10px] uppercase font-medium text-gray-600">
                                            ({a.media_type === 'movie' ? 'Film' : 'Serie TV'})
                                        </span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${statusInfo.color}`}>
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                        {a.rating && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-yellow-400 bg-yellow-500/10">
                                                <Star className="w-3 h-3 fill-yellow-400" /> {a.rating}/10
                                            </span>
                                        )}
                                        <span className="text-[11px] text-gray-600">
                                            {new Date(a.created_at).toLocaleDateString('it-IT', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
