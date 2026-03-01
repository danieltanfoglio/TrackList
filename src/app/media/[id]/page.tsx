// src/app/media/[id]/page.tsx
import Image from 'next/image';
import { getMediaDetails, getTMDBImageUrl, getRecommendations } from "@/lib/tmdb";
import StreamingProviders from "@/components/media/StreamingProviders";
import EpisodeTracker from "@/components/media/EpisodeTracker";
import MediaCard from "@/components/media/MediaCard";
import WatchlistButton from "@/components/media/WatchlistButton";
import RatingStars from "@/components/media/RatingStars";
import { Star, Clock, Calendar, Globe } from "lucide-react";
import { MediaType, TMDBMedia } from "@/types/tmdb";

export default async function MediaDetail({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ type: string }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const type = (resolvedSearchParams.type as MediaType) || 'movie';
    const id = resolvedParams.id;

    try {
        const media = await getMediaDetails(type, id);
        const recommendationsData = await getRecommendations(type, id);
        const recommendations = recommendationsData.results.slice(0, 6);

        const title = media.title || media.name;
        const date = media.release_date || media.first_air_date;
        const year = date ? new Date(date).getFullYear() : 'N/D';
        const backgroundImage = getTMDBImageUrl(media.backdrop_path, 'original');
        const posterImage = getTMDBImageUrl(media.poster_path);
        const watchProviders = media['watch/providers']?.results?.IT || null;

        return (
            <div className="min-h-screen pb-20">
                {/* Hero Section with Backdrop */}
                <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
                    <Image
                        src={backgroundImage}
                        alt={title}
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

                    <div className="absolute bottom-0 left-0 w-full p-4 md:p-12">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
                            <div className="hidden md:block w-64 aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                                <Image
                                    src={posterImage}
                                    alt={title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-widest text-white">
                                        {type === 'movie' ? 'Film' : 'Serie TV'}
                                    </span>
                                    {media.status && (
                                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gray-300">
                                            {media.status}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold text-white text-balance leading-tight">
                                    {title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-white text-lg font-bold">{media.vote_average.toFixed(1)}</span>
                                        <span className="text-gray-500 text-xs">({media.vote_count} voti)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                        {year}
                                    </div>
                                    {media.runtime && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-400" />
                                            {media.runtime} min
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {media.genres?.map((genre: any) => (
                                        <span key={genre.id} className="text-xs px-3 py-1 glass rounded-full border border-white/10 text-gray-300">
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 flex flex-col gap-12">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Sinossi</h2>
                            <p className="text-gray-400 leading-relaxed text-lg">
                                {media.overview || "Nessuna descrizione disponibile per questo titolo."}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6">Dove guardarlo</h2>
                            <StreamingProviders providers={watchProviders} />
                        </section>

                        {recommendations.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-white">Ti potrebbe piacere</h2>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    {recommendations.map((rec: TMDBMedia) => (
                                        <MediaCard key={rec.id} media={{ ...rec, media_type: type }} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-8">
                        <WatchlistButton tmdbId={parseInt(id)} mediaType={type} />

                        <RatingStars tmdbId={parseInt(id)} mediaType={type} />

                        {type === 'tv' && (
                            <EpisodeTracker
                                tmdbId={parseInt(id)}
                            />
                        )}

                        <div className="glass-morphism p-6 flex flex-col gap-4">
                            <h3 className="font-semibold text-white">Dettagli tecnici</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Titolo Originale</span>
                                    <span className="text-gray-300 font-medium text-right">{media.original_title || media.original_name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Lingua Originale</span>
                                    <span className="text-gray-300 font-medium uppercase">{media.original_language}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Produzione</span>
                                    <span className="text-gray-300 font-medium text-right">
                                        {media.production_companies?.[0]?.name || "N/D"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-white mb-4">Oops! Qualcosa è andato storto</h1>
                <p className="text-gray-400 mb-8">Non siamo riusciti a trovare i dettagli di questo contenuto.</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg" onClick={() => (window.location.href = "/")}>
                    Torna alla Home
                </button>
            </div>
        );
    }
}
