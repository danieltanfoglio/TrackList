// src/app/profile/page.tsx
'use client';

import { useAuth } from '@/components/layout/AuthProvider';
import { User, Mail, Calendar, LogOut, Loader2, Clock, Film, Tv, Trophy, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserWatchlist } from '@/lib/watchlist';
import { getMediaDetails } from '@/lib/tmdb';

interface UserStats {
    totalMinutes: number;
    movieCount: number;
    tvCount: number;
    topGenres: { name: string; count: number }[];
}

export default function ProfilePage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            fetchUserStats();
        }
    }, [user, loading, router]);

    const fetchUserStats = async () => {
        try {
            setStatsLoading(true);
            const watchlist = await getUserWatchlist(user!.id);

            let totalMinutes = 0;
            let movieCount = 0;
            let tvCount = 0;
            const genreCounts: Record<string, number> = {};

            // Fetch details for all items to get runtime and genres
            const details = await Promise.all(
                watchlist.map(item => getMediaDetails(item.media_type, item.tmdb_id.toString()).catch(() => null))
            );

            watchlist.forEach((item, index) => {
                const detail = details[index];
                if (!detail) return;

                // Analytics counts
                if (item.media_type === 'movie') movieCount++;
                else if (item.media_type === 'tv') tvCount++;

                // Genres
                if (detail.genres) {
                    detail.genres.forEach((g: any) => {
                        genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
                    });
                }

                // Time tracking
                if (item.media_type === 'movie' && item.status === 'completed' && detail.runtime) {
                    totalMinutes += detail.runtime;
                } else if (item.media_type === 'tv' && item.episode_progress && item.episode_progress > 0) {
                    // Approximate runtime using average episode run time or fallback to 45 mins
                    const epLength = (detail.episode_run_time && detail.episode_run_time.length > 0)
                        ? detail.episode_run_time[0]
                        : 45;
                    totalMinutes += (epLength * item.episode_progress);
                }
            });

            // Calculate top genres
            const topGenres = Object.entries(genreCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

            setStats({ totalMinutes, movieCount, tvCount, topGenres });
        } catch (error) {
            console.error("Error calculating stats:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="glass-morphism p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-blue-500/20">
                        {user.email?.[0].toUpperCase()}
                    </div>

                    <div className="flex-1 flex flex-col gap-6 w-full">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {user.user_metadata?.username || 'Utente'}
                            </h1>
                            <p className="text-gray-400">Gestisci il tuo account e le tue preferenze</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                                <Mail className="w-5 h-5 text-blue-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-bold">Email</span>
                                    <span className="text-white text-sm">{user.email}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-bold">Membro da</span>
                                    <span className="text-white text-sm">
                                        {new Date(user.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* STATS WRAPPED */}
                        <div className="mt-8">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-6">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                Il tuo Wrapped
                            </h2>

                            {statsLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/10" />)}
                                </div>
                            ) : stats ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-4 rounded-xl border border-blue-500/20 flex flex-col justify-center items-center text-center">
                                        <Clock className="w-6 h-6 text-blue-400 mb-2" />
                                        <div className="text-2xl font-bold text-white">
                                            {stats.totalMinutes > 60 * 24
                                                ? `${(stats.totalMinutes / (60 * 24)).toFixed(1)} G`
                                                : `${Math.round(stats.totalMinutes / 60)} Ore`}
                                        </div>
                                        <span className="text-xs text-blue-200">Tempo Visivo</span>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-4 rounded-xl border border-purple-500/20 flex flex-col justify-center items-center text-center">
                                        <Trophy className="w-6 h-6 text-purple-400 mb-2" />
                                        <div className="text-2xl font-bold text-white">{stats.movieCount + stats.tvCount}</div>
                                        <span className="text-xs text-purple-200">Titoli Salvati</span>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 p-4 rounded-xl border border-green-500/20 flex flex-col justify-center items-center text-center">
                                        <Film className="w-6 h-6 text-green-400 mb-2" />
                                        <div className="text-2xl font-bold text-white">{stats.movieCount}</div>
                                        <span className="text-xs text-green-200">Film</span>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 p-4 rounded-xl border border-orange-500/20 flex flex-col justify-center items-center text-center">
                                        <Tv className="w-6 h-6 text-orange-400 mb-2" />
                                        <div className="text-2xl font-bold text-white">{stats.tvCount}</div>
                                        <span className="text-xs text-orange-200">Serie TV</span>
                                    </div>

                                    {stats.topGenres.length > 0 && (
                                        <div className="col-span-2 md:col-span-4 bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-3">Generi Preferiti</p>
                                            <div className="flex flex-wrap gap-2">
                                                {stats.topGenres.map((g, i) => (
                                                    <div key={g.name} className="flex-1 bg-black/40 text-center rounded-lg py-2 px-3 border border-white/5">
                                                        <span className="text-gray-500 mr-2">#{i + 1}</span>
                                                        <span className="text-white font-medium">{g.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        <div className="pt-6 border-t border-white/10 mt-4">
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-medium"
                            >
                                <LogOut className="w-5 h-5" /> Esci dall'account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
