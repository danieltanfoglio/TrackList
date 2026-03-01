// src/components/media/MediaCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Film, Tv, Star } from 'lucide-react';
import { TMDBMedia } from '@/types/tmdb';
import { getTMDBImageUrl } from '@/lib/tmdb';

interface MediaCardProps {
    media: TMDBMedia;
}

export default function MediaCard({ media }: MediaCardProps) {
    const title = media.title || media.name;
    const date = media.release_date || media.first_air_date;
    const year = date ? new Date(date).getFullYear() : 'N/D';
    const typeIcon = media.media_type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />;
    const typeLabel = media.media_type === 'movie' ? 'Film' : 'Serie TV';

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
                <p className="text-xs text-gray-500">{year}</p>
            </div>
        </Link>
    );
}
