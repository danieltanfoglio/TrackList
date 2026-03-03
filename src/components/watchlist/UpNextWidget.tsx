// src/components/watchlist/UpNextWidget.tsx
import { useEffect, useState } from 'react';
import { WatchlistItem, updateWatchlistStatus } from '@/lib/watchlist';
import { getTVSeasonDetails, getTMDBImageUrl, getMediaDetails } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Loader2, Plus } from 'lucide-react';

interface UpNextWidgetProps {
    watchlist: WatchlistItem[];
    onProgressUpdated?: () => void;
}

interface EpisodeData {
    watchlistItem: WatchlistItem;
    episodeDetails: any;
    showDetails: any;
    seasonEpisodeCount: number;
    displaySeason: number; // the actual season of the episode shown (may differ from watchlistItem.season_progress)
}

export default function UpNextWidget({ watchlist, onProgressUpdated }: UpNextWidgetProps) {
    const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchNextEpisodes = async () => {
            const watchingTV = watchlist.filter(
                (item) => item.media_type === 'tv' && item.status === 'watching'
            );

            if (watchingTV.length === 0) {
                setEpisodes([]);
                setLoading(false);
                return;
            }

            const data = await Promise.all(
                watchingTV.map(async (item) => {
                    const currentSeason = item.season_progress || 1;
                    // episode_progress = 0 means "starting the season, next ep is 1"
                    const nextEpisodeNum = (item.episode_progress || 0) + 1;

                    try {
                        const showDetails = await getMediaDetails('tv', item.tmdb_id.toString()).catch(() => null);
                        const totalSeasons: number = showDetails?.number_of_seasons ?? 1;

                        // Fetch current season details
                        const seasonData = await getTVSeasonDetails(item.tmdb_id, currentSeason);
                        const seasonEpisodes: any[] = seasonData?.episodes ?? [];
                        const episodeCount = seasonEpisodes.length;

                        // Try to find the next episode in the current season
                        let epDetails = seasonEpisodes.find((e: any) => e.episode_number === nextEpisodeNum);
                        let displaySeason = currentSeason;
                        let displaySeasonEpisodeCount = episodeCount;

                        // If not found (we're past the last episode), try the next season
                        if (!epDetails && currentSeason < totalSeasons) {
                            const nextSeasonData = await getTVSeasonDetails(item.tmdb_id, currentSeason + 1);
                            const nextSeasonEps: any[] = nextSeasonData?.episodes ?? [];
                            epDetails = nextSeasonEps.find((e: any) => e.episode_number === 1);
                            displaySeason = currentSeason + 1;
                            displaySeasonEpisodeCount = nextSeasonEps.length;
                        }

                        if (!epDetails) return null;

                        return {
                            watchlistItem: item,
                            episodeDetails: epDetails,
                            showDetails,
                            seasonEpisodeCount: displaySeasonEpisodeCount,
                            displaySeason,
                        };
                    } catch {
                        return null;
                    }
                })
            );

            setEpisodes(data.filter(Boolean) as EpisodeData[]);
            setLoading(false);
        };

        fetchNextEpisodes();
    }, [watchlist]);

    const handleIncrement = async (
        item: WatchlistItem,
        markedSeason: number,
        markedEpisode: number,
        seasonEpisodeCount: number,
        totalSeasons: number
    ) => {
        try {
            setUpdatingId(item.id);

            let newSeason = markedSeason;
            // Use 0 to mean "starting the new season, no episode watched yet"
            // so the widget calculates: 0 + 1 = episode 1
            let newEpisode: number = markedEpisode;

            // If we just marked the last episode of the season, advance to next season
            if (markedEpisode >= seasonEpisodeCount) {
                if (markedSeason < totalSeasons) {
                    newSeason = markedSeason + 1;
                    newEpisode = 0; // ← 0 means "ep1 is next"
                }
                // If it's also the last season, just record the episode as-is
            }

            await updateWatchlistStatus(item.id, {
                season_progress: newSeason,
                episode_progress: newEpisode,
            });
            if (onProgressUpdated) onProgressUpdated();
        } catch (error) {
            console.error('Error updating progress:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="mb-12">
                <h2 className="text-xl font-bold text-white mb-4">Continua a guardare</h2>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex-none w-64 h-36 bg-white/5 animate-pulse rounded-xl border border-white/10" />
                    ))}
                </div>
            </div>
        );
    }

    if (episodes.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-xl flex items-center gap-2 font-bold text-white mb-4">
                <Play className="w-5 h-5 text-blue-500 fill-blue-500" />
                Continua a guardare
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {episodes.map(({ watchlistItem, episodeDetails, showDetails, seasonEpisodeCount, displaySeason }) => {
                    const epImage = episodeDetails.still_path;
                    const isUpdating = updatingId === watchlistItem.id;
                    const totalSeasons = showDetails?.number_of_seasons ?? 999;

                    return (
                        <div
                            key={watchlistItem.id}
                            className="flex-none w-72 lg:w-80 relative group glass-morphism rounded-xl overflow-hidden snap-start hover:ring-2 hover:ring-blue-500/50 transition-all"
                        >
                            <Link href={`/media/${watchlistItem.tmdb_id}?type=tv`} className="relative block aspect-video">
                                <Image
                                    src={getTMDBImageUrl(epImage, 'w500')}
                                    alt={episodeDetails.name || 'Episode Image'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                                <div className="absolute bottom-0 left-0 p-4 w-full">
                                    <div className="flex justify-between items-end gap-2">
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-blue-400 font-bold mb-0.5 uppercase tracking-wider line-clamp-1">
                                                {showDetails?.name || 'Serie TV'} • S{displaySeason} E{episodeDetails.episode_number}
                                            </p>
                                            <h3 className="text-white font-semibold line-clamp-1 text-sm lg:text-base" title={episodeDetails.name}>
                                                {episodeDetails.name || `Episodio ${episodeDetails.episode_number}`}
                                            </h3>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleIncrement(
                                                    watchlistItem,
                                                    displaySeason,
                                                    episodeDetails.episode_number,
                                                    seasonEpisodeCount,
                                                    totalSeasons
                                                );
                                            }}
                                            disabled={isUpdating}
                                            className="flex-none bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2.5 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 relative z-10"
                                            title="Segna come visto"
                                        >
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
