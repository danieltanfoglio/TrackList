// src/components/media/MovieTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Eye, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { getWatchlistItem, updateWatchlistStatus } from '@/lib/watchlist';

interface MovieTrackerProps {
    tmdbId: number;
}

export default function MovieTracker({
    tmdbId
}: MovieTrackerProps) {
    const { user } = useAuth();
    const [status, setStatus] = useState<'to_watch' | 'watching' | 'completed'>('to_watch');
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
            const item = await getWatchlistItem(user!.id, tmdbId, 'movie');
            if (item) {
                setStatus(item.status as any);
                setWatchlistItemId(item.id);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (newStatus: string) => {
        setStatus(newStatus as any);

        if (user && watchlistItemId) {
            try {
                await updateWatchlistStatus(watchlistItemId, {
                    status: newStatus as any
                });
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="glass-morphism p-6 flex items-center justify-center min-h-[100px]">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!watchlistItemId) {
        return (
            <div className="glass-morphism p-6 flex flex-col items-center text-center gap-4">
                <Clock className="w-8 h-8 text-gray-600" />
                <p className="text-sm text-gray-400">
                    Aggiungi questo film alla tua watchlist per tracciarne lo stato di visione.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-morphism p-6 flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Stato di visione</h3>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                    {status === 'completed' ? 'Visto' : 'Da vedere'}
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => handleUpdate('to_watch')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${status === 'to_watch' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <Eye className="w-4 h-4" /> Da vedere
                </button>
                <button
                    onClick={() => handleUpdate('completed')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${status === 'completed' ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <CheckCircle className="w-4 h-4" /> Visto
                </button>
            </div>
        </div>
    );
}
