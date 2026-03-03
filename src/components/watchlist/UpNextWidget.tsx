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
    episodeDetails: any;   // the episode object from the season
    showDetails: any;
    seasonEpisodeCount: number;
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
                    const nextEpisodeNum = (item.episode_progress || 0) + 1;

                    try {
                        // Fetch season details to get episode list and count
                        const seasonData = await getTVSeasonDetails(item.tmdb_id, currentSeason);
                        const episodes: any[] = seasonData?.episodes ?? [];
                        const episodeCount = episodes.length;

                        // Find the next episode in the season
                        const epDetails = episodes.find((e: any) => e.episode_number === nextEpisodeNum);

                        if (!epDetails) {
                            // No next episode in this season – skip from widget
                            return null;
                        }

                        const showDetails = await getMediaDetails('tv', item.tmdb_id.toString()).catch(() => null);

                        return {
                            watchlistItem: item,
                            episodeDetails: epDetails,
                            showDetails,
                            seasonEpisodeCount: episodeCount,
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
        currentSeason: number,
        markedEpisode: number,
        seasonEpisodeCount: number,
        totalSeasons: number
    ) => {
        try {
            setUpdatingId(item.id);

            let newSeason = currentSeason;
            let newEpisode = markedEpisode;

            // If we just watched the last episode, auto-advance to next season ep 1
            if (markedEpisode >= seasonEpisodeCount) {
                if (currentSeason < totalSeasons) {
                    newSeason = currentSeason + 1;
                    newEpisode = 1;
                }
                // If last season too, just record the episode as-is
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
                {episodes.map(({ watchlistItem, episodeDetails, showDetails, seasonEpisodeCount }) => {
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
                                                {showDetails?.name || 'Serie TV'} • S{episodeDetails.season_number} E{episodeDetails.episode_number}
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
                                                    episodeDetails.season_number,
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
