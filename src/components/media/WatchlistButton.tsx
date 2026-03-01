// src/components/media/WatchlistButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { addToWatchlist, removeFromWatchlist, getWatchlistItem, updateWatchlistStatus } from '@/lib/watchlist';
import { Bookmark, BookmarkCheck, Loader2, Plus, Check, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WatchlistButtonProps {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    className?: string;
}

export default function WatchlistButton({ tmdbId, mediaType, className }: WatchlistButtonProps) {
    const { user } = useAuth();
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            checkWatchlist();
        } else {
            setLoading(false);
        }
    }, [user, tmdbId, mediaType]);

    const checkWatchlist = async () => {
        try {
            const item = await getWatchlistItem(user!.id, tmdbId, mediaType);
            setIsInWatchlist(!!item);
            setIsFavorite(item?.is_favorite || false);
            setWatchlistItemId(item?.id || null);
        } catch (error) {
            console.error('Error checking watchlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            setActionLoading(true);
            if (isInWatchlist) {
                await removeFromWatchlist(user.id, tmdbId, mediaType);
                setIsInWatchlist(false);
                setIsFavorite(false); // Reset favorite status when removed from watchlist
                setWatchlistItemId(null);
            } else {
                await addToWatchlist({
                    user_id: user.id,
                    tmdb_id: tmdbId,
                    media_type: mediaType,
                    status: 'to_watch'
                });
                setIsInWatchlist(true);
            }
            router.refresh();
        } catch (error) {
            console.error('Error toggling watchlist:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user || !watchlistItemId) return;

        try {
            const newFav = !isFavorite;
            setIsFavorite(newFav);
            await updateWatchlistStatus(watchlistItemId, { is_favorite: newFav });
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    if (loading) {
        return (
            <button disabled className={`bg-white/5 text-gray-400 py-3 px-6 rounded-xl flex items-center justify-center gap-2 ${className}`}>
                <Loader2 className="w-5 h-5 animate-spin" /> Controllo...
            </button>
        );
    }

    return (
        <div className="flex gap-2 w-full">
            <button
                onClick={handleToggle}
                disabled={actionLoading}
                className={`flex-1 font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group ${isInWatchlist
                        ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                        : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500'
                    } ${className}`}
            >
                {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isInWatchlist ? (
                    <>
                        <BookmarkCheck className="w-5 h-5 text-blue-400" /> In Watchlist
                    </>
                ) : (
                    <>
                        <Plus className="w-5 h-5" /> Aggiungi
                    </>
                )}
            </button>

            {isInWatchlist && (
                <button
                    onClick={handleFavorite}
                    className={`px-4 rounded-xl border transition-all flex items-center justify-center ${isFavorite
                            ? 'bg-red-500/10 border-red-500/50 text-red-500'
                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                        }`}
                >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>
            )}
        </div>
    );
}
