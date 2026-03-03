// src/app/watchlist/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { getUserWatchlist, WatchlistItem } from '@/lib/watchlist';
import { getMediaDetails } from '@/lib/tmdb';
import MediaCard from '@/components/media/MediaCard';
import UpNextWidget from '@/components/watchlist/UpNextWidget';
import { Bookmark, Loader2, ArrowUpDown, Check } from 'lucide-react';
import Link from 'next/link';

// Combined item: watchlist entry + resolved media data
interface ResolvedItem {
    watchlistItem: WatchlistItem;
    media: any;
}

// Status sort priority: watching first, then to_watch, then completed
const STATUS_PRIORITY: Record<string, number> = {
    watching: 0,
    to_watch: 1,
    completed: 2,
};

type SortKey = 'status' | 'rating_desc' | 'rating_asc' | 'name_az';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'status', label: 'Stato' },
    { key: 'rating_desc', label: 'Rating ↓' },
    { key: 'rating_asc', label: 'Rating ↑' },
    { key: 'name_az', label: 'Nome A→Z' },
];

export default function WatchlistPage() {
    const { user, loading: authLoading } = useAuth();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [resolved, setResolved] = useState<ResolvedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
    const [sortBy, setSortBy] = useState<SortKey>('status');
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!authLoading && user) {
            fetchWatchlist();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    // After watchlist loads, resolve media details for each item
    useEffect(() => {
        if (watchlist.length === 0) {
            setResolved([]);
            return;
        }
        let mounted = true;
        Promise.all(
            watchlist.map(async (item) => {
                try {
                    const media = await getMediaDetails(item.media_type, item.tmdb_id.toString());
                    return { watchlistItem: item, media: { ...media, media_type: item.media_type } };
                } catch {
                    return { watchlistItem: item, media: null };
                }
            })
        ).then((data) => {
            if (mounted) setResolved(data.filter((d) => d.media !== null) as ResolvedItem[]);
        });
        return () => { mounted = false; };
    }, [watchlist]);

    const fetchWatchlist = async () => {
        try {
            setLoading(true);
            const items = await getUserWatchlist(user!.id);
            setWatchlist(items);
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

    // --- Filter ---
    const filtered = resolved.filter(
        ({ watchlistItem }) => filter === 'all' || watchlistItem.media_type === filter
    );

    // --- Sort ---
    const sorted = [...filtered].sort((a, b) => {
        switch (sortBy) {
            case 'status':
                return (STATUS_PRIORITY[a.watchlistItem.status] ?? 99) - (STATUS_PRIORITY[b.watchlistItem.status] ?? 99);
            case 'rating_desc':
                return (b.media?.vote_average ?? 0) - (a.media?.vote_average ?? 0);
            case 'rating_asc':
                return (a.media?.vote_average ?? 0) - (b.media?.vote_average ?? 0);
            case 'name_az': {
                const nameA = (a.media?.title || a.media?.name || '').toLowerCase();
                const nameB = (b.media?.title || b.media?.name || '').toLowerCase();
                return nameA.localeCompare(nameB);
            }
            default:
                return 0;
        }
    });

    const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label ?? 'Ordina';

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <UpNextWidget watchlist={watchlist} onProgressUpdated={fetchWatchlist} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">La mia Watchlist</h1>
                    <p className="text-gray-400">Hai {watchlist.length} titoli salvati</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Type filter pills */}
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

                    {/* Sort dropdown */}
                    <div ref={sortRef} className="relative">
                        <button
                            onClick={() => setSortOpen((v) => !v)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${sortOpen ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            <ArrowUpDown className="w-4 h-4" />
                            {currentSortLabel}
                        </button>

                        {sortOpen && (
                            <div className="absolute right-0 mt-2 w-44 z-50 bg-[#13131f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                {SORT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${sortBy === opt.key ? 'text-blue-400 bg-blue-600/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        {opt.label}
                                        {sortBy === opt.key && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {sorted.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {sorted.map(({ watchlistItem, media }) => (
                        <MediaCard key={watchlistItem.id} media={media} watchlistItem={watchlistItem} />
                    ))}
                </div>
            ) : resolved.length === 0 && watchlist.length > 0 ? (
                // Media still loading for items we have
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {watchlist.slice(0, 12).map((item) => (
                        <div key={item.id} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse border border-white/10" />
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
