// src/app/browse/movies/page.tsx
import { getTrending } from "@/lib/tmdb";
import MediaCard from "@/components/media/MediaCard";
import { TMDBMedia } from "@/types/tmdb";
import { Film } from "lucide-react";

export default async function BrowseMoviesPage() {
    let movies: TMDBMedia[] = [];
    let error = null;

    try {
        const data = await getTrending('movie', 'week');
        movies = data.results;
    } catch (e) {
        error = "Errore durante il caricamento dei film.";
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-12">
                <div className="bg-blue-600 p-2 rounded-xl">
                    <Film className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Film in tendenza</h1>
                    <p className="text-gray-400">I titoli più visti di questa settimana</p>
                </div>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-red-500 text-center">
                    {error}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {movies.map((movie) => (
                        <MediaCard key={movie.id} media={{ ...movie, media_type: 'movie' }} />
                    ))}
                </div>
            )}
        </div>
    );
}
