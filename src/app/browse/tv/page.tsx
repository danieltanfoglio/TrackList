// src/app/browse/tv/page.tsx
import { getTrending } from "@/lib/tmdb";
import MediaCard from "@/components/media/MediaCard";
import { TMDBMedia } from "@/types/tmdb";
import { Tv } from "lucide-react";

export default async function BrowseTVPage() {
    let shows: TMDBMedia[] = [];
    let error = null;

    try {
        const data = await getTrending('tv', 'week');
        shows = data.results;
    } catch (e) {
        error = "Errore durante il caricamento delle serie TV.";
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-12">
                <div className="bg-indigo-600 p-2 rounded-xl">
                    <Tv className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Serie TV in tendenza</h1>
                    <p className="text-gray-400">Le serie più chiacchierate della settimana</p>
                </div>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-red-500 text-center">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {shows.map((show) => (
                        <MediaCard key={show.id} media={{ ...show, media_type: 'tv' }} />
                    ))}
                </div>
            )}
        </div>
    );
}
