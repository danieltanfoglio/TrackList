import { getPopularContent } from '@/lib/supabase-admin';
import { getMediaDetails, getTMDBImageUrl } from '@/lib/tmdb';
import { Film, Tv, Star, Bookmark } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
    const popular = await getPopularContent();

    const withDetails = await Promise.all(
        popular.map(async (item) => {
            try {
                const details = await getMediaDetails(item.media_type, item.tmdb_id.toString());
                return {
                    ...item,
                    title: details.title || details.name || 'Sconosciuto',
                    poster_path: details.poster_path,
                    vote_average: details.vote_average,
                };
            } catch {
                return { ...item, title: 'Sconosciuto', poster_path: null, vote_average: 0 };
            }
        })
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Film className="w-7 h-7 text-purple-400" /> Contenuti Popolari
                </h1>
                <p className="text-gray-400">I 50 contenuti più salvati in watchlist</p>
            </div>

            {withDetails.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    Nessun contenuto ancora salvato dagli utenti.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {withDetails.map((item, i) => (
                        <div
                            key={`${item.media_type}-${item.tmdb_id}`}
                            className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-3 hover:bg-white/5 transition-colors"
                        >
                            <div className="relative w-14 h-20 rounded-lg overflow-hidden flex-none bg-white/5">
                                {item.poster_path ? (
                                    <Image
                                        src={getTMDBImageUrl(item.poster_path, 'w500')}
                                        alt={item.title}
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                        {item.media_type === 'movie' ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    {item.media_type === 'movie' ? (
                                        <Film className="w-3 h-3 text-blue-400" />
                                    ) : (
                                        <Tv className="w-3 h-3 text-indigo-400" />
                                    )}
                                    <span className="text-[10px] font-medium uppercase text-gray-500">
                                        {item.media_type === 'movie' ? 'Film' : 'Serie TV'}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                                        <Bookmark className="w-3 h-3" /> {item.count}
                                    </span>
                                    {item.vote_average > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-yellow-500">
                                            <Star className="w-3 h-3 fill-yellow-500" /> {item.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-gray-600 font-mono w-6 text-right">#{i + 1}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
