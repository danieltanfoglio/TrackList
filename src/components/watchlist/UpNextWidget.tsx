// src/components/watchlist/UpNextWidget.tsx
import { useEffect, useState } from 'react';
import { WatchlistItem, updateWatchlistStatus } from '@/lib/watchlist';
import { getTVEpisodeDetails, getTMDBImageUrl, getMediaDetails } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Check, Loader2, Plus } from 'lucide-react';

interface UpNextWidgetProps {
    watchlist: WatchlistItem[];
    onProgressUpdated?: () => void;
}

interface EpisodeData {
    watchlistItem: WatchlistItem;
    episodeDetails: any;
    showDetails: any;
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
                        const epDetails = await getTVEpisodeDetails(
                            item.tmdb_id.toString(),
                            currentSeason,
                            nextEpisodeNum
                        );

                        // If the episode fetch fails (e.g. season ended), we just ignore it for the widget for now
                        if (epDetails.success === false) {
                            return null;
                        }

                        // Also fetch the parent show details to get the show name
                        const showDetails = await getMediaDetails('tv', item.tmdb_id.toString()).catch(() => null);

                        return {
                            watchlistItem: item,
                            episodeDetails: epDetails,
                            showDetails: showDetails
                        };
                    } catch (error) {
                        return null;
                    }
                })
            );

            setEpisodes(data.filter(Boolean) as EpisodeData[]);
            setLoading(false);
        };

        fetchNextEpisodes();
    }, [watchlist]);

    const handleIncrement = async (item: WatchlistItem, currentSeason: number, nextEpisode: number) => {
        try {
            setUpdatingId(item.id);
            await updateWatchlistStatus(item.id, {
                season_progress: currentSeason,
                episode_progress: nextEpisode
            });
            if (onProgressUpdated) onProgressUpdated();
        } catch (error) {
            console.error("Error updating progress:", error);
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
                {episodes.map(({ watchlistItem, episodeDetails, showDetails }) => {
                    const epImage = episodeDetails.still_path;
                    const isUpdating = updatingId === watchlistItem.id;

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
                                                e.preventDefault(); // Prevent Link navigation
                                                handleIncrement(watchlistItem, episodeDetails.season_number, episodeDetails.episode_number);
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
