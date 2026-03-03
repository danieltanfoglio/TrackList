// src/components/media/EpisodeTracker.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, CheckCircle, Clock, Play, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { getWatchlistItem, updateWatchlistStatus } from '@/lib/watchlist';
import { getMediaDetails, getTVSeasonDetails } from '@/lib/tmdb';

interface EpisodeTrackerProps {
    tmdbId: number;
}

interface SeasonInfo {
    episodeCount: number;
}

export default function EpisodeTracker({ tmdbId }: EpisodeTrackerProps) {
    const { user } = useAuth();
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [status, setStatus] = useState<'to_watch' | 'watching' | 'completed'>('watching');
    const [loading, setLoading] = useState(true);
    const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);
    const [totalSeasons, setTotalSeasons] = useState<number>(999);
    const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);
    const [seasonInfoLoading, setSeasonInfoLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Show a temporary error popup
    const showError = (msg: string) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 2500);
    };

    useEffect(() => {
        if (user) {
            fetchProgress();
        } else {
            setLoading(false);
        }
    }, [user, tmdbId]);

    // Fetch show-level info (total seasons)
    useEffect(() => {
        getMediaDetails('tv', tmdbId.toString())
            .then((data: any) => {
                if (data?.number_of_seasons) setTotalSeasons(data.number_of_seasons);
            })
            .catch(() => { });
    }, [tmdbId]);

    // Fetch season info whenever season changes
    const fetchSeasonInfo = useCallback(async (s: number) => {
        setSeasonInfoLoading(true);
        try {
            const data = await getTVSeasonDetails(tmdbId, s);
            const episodeCount = data?.episodes?.length ?? 0;
            setSeasonInfo({ episodeCount });
        } catch {
            setSeasonInfo(null);
        } finally {
            setSeasonInfoLoading(false);
        }
    }, [tmdbId]);

    useEffect(() => {
        fetchSeasonInfo(season);
    }, [season, fetchSeasonInfo]);

    const fetchProgress = async () => {
        try {
            const item = await getWatchlistItem(user!.id, tmdbId, 'tv');
            if (item) {
                setSeason(item.season_progress || 1);
                // episode_progress=0 means "ready to watch ep1", display as 1
                setEpisode(item.episode_progress ?? 1);
                setStatus(item.status as any);
                setWatchlistItemId(item.id);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const persist = async (newS: number, newE: number, newStatus: string) => {
        if (user && watchlistItemId) {
            try {
                await updateWatchlistStatus(watchlistItemId, {
                    season_progress: newS,
                    episode_progress: newE,
                    status: newStatus as any,
                });
            } catch (error) {
                console.error('Error updating progress:', error);
            }
        }
    };

    const handleUpdate = (newS: number, newE: number, newStatus: string) => {
        setSeason(newS);
        setEpisode(newE);
        setStatus(newStatus as any);
        persist(newS, newE, newStatus);
    };

    // --- Season +/− ---
    const handleSeasonInc = () => {
        if (season >= totalSeasons) {
            showError('Hai raggiunto l\'ultima stagione disponibile');
            return;
        }
        // When manually jumping to next season, reset episode to 1
        handleUpdate(season + 1, 1, status);
    };

    const handleSeasonDec = () => {
        if (season <= 1) return;
        handleUpdate(season - 1, 1, status);
    };

    // --- Episode +/− ---
    const handleEpisodeInc = () => {
        const maxEp = seasonInfo?.episodeCount ?? null;

        if (maxEp !== null && episode >= maxEp) {
            // Last episode of the season — try to advance to next season
            if (season >= totalSeasons) {
                showError('Sei all\'ultimo episodio dell\'ultima stagione!');
            } else {
                // Auto-advance to next season; save 0 so widget shows ep1 as next
                handleUpdate(season + 1, 0, status);
            }
        } else {
            handleUpdate(season, episode + 1, status);
        }
    };

    const handleEpisodeDec = () => {
        if (episode <= 1) return;
        handleUpdate(season, episode - 1, status);
    };

    if (loading) {
        return (
            <div className="glass-morphism p-6 flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

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

    const maxEp = seasonInfo?.episodeCount ?? null;
    // episode_progress=0 means starting the season → display as 1
    const displayEpisode = episode === 0 ? 1 : episode;

    return (
        <div className="glass-morphism p-6 flex flex-col gap-6 w-full relative">
            {/* Error popup */}
            <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-900/90 border border-red-500/60 text-red-200 text-xs font-medium shadow-lg transition-all duration-300 whitespace-nowrap ${errorMsg ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-none" />
                {errorMsg}
            </div>

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
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500 uppercase font-bold">Stagione</label>
                        {totalSeasons < 999 && (
                            <span className="text-[10px] text-gray-600">/ {totalSeasons}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/10">
                        <button
                            onClick={handleSeasonDec}
                            disabled={season <= 1}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center font-bold text-white text-lg">{season}</span>
                        <button
                            onClick={handleSeasonInc}
                            disabled={season >= totalSeasons}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Episode Tracker */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-500 uppercase font-bold">Episodio</label>
                        {seasonInfoLoading ? (
                            <span className="text-[10px] text-gray-600">…</span>
                        ) : maxEp ? (
                            <span className="text-[10px] text-gray-600">/ {maxEp}</span>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2 border border-white/10">
                        <button
                            onClick={handleEpisodeDec}
                            disabled={episode <= 1}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className={`flex-1 text-center font-bold text-lg ${maxEp && displayEpisode >= maxEp ? 'text-yellow-400' : 'text-white'}`}>
                            {displayEpisode}
                        </span>
                        <button
                            onClick={handleEpisodeInc}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hint when at last episode */}
            {maxEp && displayEpisode >= maxEp && season < totalSeasons && (
                <p className="text-[11px] text-yellow-500/80 text-center -mt-2">
                    ✨ Premi + sull&apos;episodio per avanzare alla stagione {season + 1}
                </p>
            )}

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
