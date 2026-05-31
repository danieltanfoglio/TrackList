import { getTrending } from "@/lib/tmdb";
import MediaCard from "@/components/media/MediaCard";
import { TMDBMedia } from "@/types/tmdb";
import { Film } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Film in tendenza - TrackList",
  description: "Scopri i film più popolari e in tendenza del momento.",
};

export default async function BrowseMoviesPage() {
    let movies: TMDBMedia[] = [];
    let page2: TMDBMedia[] = [];
    let error = null;

    try {
        const data = await getTrending('movie', 'week');
        movies = data.results;

        const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
        const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
        const urlParams = new URLSearchParams({ api_key: TMDB_API_KEY || '', language: 'it-IT', page: '2' });
        const res = await fetch(`${TMDB_API_BASE_URL}/trending/movie/week?${urlParams}`, { next: { revalidate: 3600 } });
        const dataPage2 = await res.json();
        page2 = dataPage2.results || [];
    } catch (e) {
        error = "Errore durante il caricamento dei film.";
    }

    const allMovies = [...movies, ...page2];

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
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {allMovies.map((movie) => (
                            <MediaCard key={movie.id} media={{ ...movie, media_type: 'movie' }} />
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-xl transition-all"
                        >
                            <Film className="w-4 h-4" /> Cerca altri film
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
