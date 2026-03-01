// src/components/media/EpisodeTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, CheckCircle, Clock, Play, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { getWatchlistItem, updateWatchlistStatus } from '@/lib/watchlist';

interface EpisodeTrackerProps {
    tmdbId: number;
}

export default function EpisodeTracker({
    tmdbId
}: EpisodeTrackerProps) {
    const { user } = useAuth();
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [status, setStatus] = useState<'to_watch' | 'watching' | 'completed'>('watching');
    const [loading, setLoading] = useState(true);
    const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchProgress();
        } else {
            setLoading(false);
        }
    }, [user, tmdbId]);

    const fetchProgress = async () => {
        try {
            const item = await getWatchlistItem(user!.id, tmdbId, 'tv');
            if (item) {
                setSeason(item.season_progress || 1);
                setEpisode(item.episode_progress || 1);
                setStatus(item.status as any);
                setWatchlistItemId(item.id);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (newS: number, newE: number, newStatus: string) => {
        setSeason(newS);
        setEpisode(newE);
        setStatus(newStatus as any);

        if (user && watchlistItemId) {
            try {
                await updateWatchlistStatus(watchlistItemId, {
                    season_progress: newS,
                    episode_progress: newE,
                    status: newStatus as any
                });
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="glass-morphism p-6 flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    // If not in watchlist, show a message or just hidden? 
    // For now let's show it but explain it won't save without being in watchlist
    if (!watchlistItemId) {
        return (
            <div className="glass-morphism p-6 flex flex-col items-center text-center gap-4">
                <Clock className="w-8 h-8 text-gray-600" />
                <p className="text-sm text-gray-400">
                    Aggiungi questa serie alla tua watchlist per tracciare il progresso degli episodi.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-morphism p-6 flex flex-col gap-6 w-full">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Il tuo progresso</h3>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        status === 'watching' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                    {status === 'completed' ? 'Completato' : status === 'watching' ? 'In corso' : 'Da vedere'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Season Tracker */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 uppercase font-bold">Stagione</label>
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/10">
                        <button
                            onClick={() => handleUpdate(Math.max(1, season - 1), episode, status)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center font-bold text-white text-lg">{season}</span>
                        <button
                            onClick={() => handleUpdate(season + 1, episode, status)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Episode Tracker */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 uppercase font-bold">Episodio</label>
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/10">
                        <button
                            onClick={() => handleUpdate(season, Math.max(1, episode - 1), status)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center font-bold text-white text-lg">{episode}</span>
                        <button
                            onClick={() => handleUpdate(season, episode + 1, status)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => handleUpdate(season, episode, 'watching')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${status === 'watching' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <Play className="w-4 h-4" /> In corso
                </button>
                <button
                    onClick={() => handleUpdate(season, episode, 'completed')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${status === 'completed' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <CheckCircle className="w-4 h-4" /> Completato
                </button>
            </div>
        </div>
    );
}
