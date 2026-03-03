// src/components/media/MediaCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Film, Tv, Star, CheckCircle } from 'lucide-react';
import { TMDBMedia } from '@/types/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';
import { WatchlistItem } from '@/lib/watchlist';

interface MediaCardProps {
    media: TMDBMedia;
    watchlistItem?: WatchlistItem;
}

export default function MediaCard({ media, watchlistItem }: MediaCardProps) {
    const title = media.title || media.name;
    const date = media.release_date || media.first_air_date;
    const year = date ? new Date(date).getFullYear() : 'N/D';
    const typeIcon = media.media_type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />;
    const typeLabel = media.media_type === 'movie' ? 'Film' : 'Serie TV';

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed': return { label: 'Finito', color: 'bg-green-500/90 text-white border-green-400' };
            case 'watching': return { label: 'In corso', color: 'bg-blue-500/90 text-white border-blue-400/50' };
            case 'to_watch': return { label: 'Da vedere', color: 'bg-purple-500/90 text-white border-purple-400/50' };
            default: return null;
        }
    };

    const statusConfig = watchlistItem ? getStatusConfig(watchlistItem.status) : null;

    return (
        <Link
            href={`/media/${media.id}?type=${media.media_type}`}
            className="group relative flex flex-col glass-morphism overflow-hidden hover:ring-2 hover:ring-blue-500/50 transition-all duration-300"
        >
            <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                    src={getTMDBImageUrl(media.poster_path)}
                    alt={title || 'Poster'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Watchlist Status Badge */}
                {statusConfig && (
                    <div className={`absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-bold shadow-lg border ${statusConfig.color} z-10 transition-transform group-hover:scale-105`}>
                        {statusConfig.label}
                    </div>
                )}

                {/* Badge Media Type */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white">
                    {typeIcon}
                    {typeLabel}
                </div>

                {/* Rating Badge */}
                {media.vote_average > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/90 backdrop-blur-md text-[10px] font-bold text-black border border-yellow-400">
                        <Star className="w-3 h-3 fill-black" />
                        {media.vote_average.toFixed(1)}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col gap-1">
                <h3 className="font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{year}</p>
                    {watchlistItem && (
                        <div className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-blue-400 border border-blue-500/20">
                            {watchlistItem.media_type === 'tv' ? (
                                watchlistItem.status === 'completed' ? (
                                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Completato</span>
                                ) : (
                                    `S${watchlistItem.season_progress || 1} E${watchlistItem.episode_progress || 1}`
                                )
                            ) : (
                                watchlistItem.status === 'completed' ? (
                                    <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Visto</span>
                                ) : 'Da vedere'
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
