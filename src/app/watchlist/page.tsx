// src/app/watchlist/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { getUserWatchlist, WatchlistItem } from '@/lib/watchlist';
import { getMediaDetails } from '@/lib/tmdb';
import MediaCard from '@/components/media/MediaCard';
import { Bookmark, Loader2, Filter } from 'lucide-react';
import Link from 'next/link';

export default function WatchlistPage() {
    const { user, loading: authLoading } = useAuth();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [mediaDetails, setMediaDetails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

    useEffect(() => {
        if (!authLoading && user) {
            fetchWatchlist();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchWatchlist = async () => {
        try {
            setLoading(true);
            const items = await getUserWatchlist(user!.id);
            setWatchlist(items);

            // Fetch TMDB details for each item to show the cards correctly
            // In a real app, you might want to cache this or store essential info in the DB
            const details = await Promise.all(
                items.map(item => getMediaDetails(item.media_type, item.tmdb_id.toString()))
            );

            // Inject media_type into details for MediaCard
            const detailsWithTypes = details.map((d, i) => ({
                ...d,
                media_type: items[i].media_type
            }));

            setMediaDetails(detailsWithTypes);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <Bookmark className="w-16 h-16 text-gray-700 mb-6" />
                <h1 className="text-2xl font-bold text-white mb-2">La tua Watchlist</h1>
                <p className="text-gray-400 mb-8 text-center max-w-md">
                    Accedi per salvare i tuoi film e serie TV preferiti e tenere traccia del tuo progresso.
                </p>
                <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all">
                    Accedi Ora
                </Link>
            </div>
        );
    }

    const filteredMedia = mediaDetails.filter(m => filter === 'all' || m.media_type === filter);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">La mia Watchlist</h1>
                    <p className="text-gray-400">Hai {watchlist.length} titoli salvati</p>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Tutti
                    </button>
                    <button
                        onClick={() => setFilter('movie')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'movie' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Film
                    </button>
                    <button
                        onClick={() => setFilter('tv')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'tv' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Serie TV
                    </button>
                </div>
            </div>

            {filteredMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filteredMedia.map((media) => (
                        <MediaCard key={media.id} media={media} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass-morphism border-dashed border-2 border-white/5">
                    <p className="text-gray-500 text-lg">Non hai ancora aggiunto nulla alla tua watchlist.</p>
                    <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
                        Inizia a cercare contenuti
                    </Link>
                </div>
            )}
        </div>
    );
}
