// src/app/search/page.tsx
import { searchMulti } from "@/lib/tmdb";
import MediaCard from "@/components/media/MediaCard";
import SearchBar from "@/components/search/SearchBar";
import { TMDBMedia } from "@/types/tmdb";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams.q || "";
    let results: TMDBMedia[] = [];
    let error = null;

    if (query) {
        try {
            const data = await searchMulti(query);
            // Filter out people (only movies and tv)
            results = data.results.filter(
                (item: any) => item.media_type === "movie" || item.media_type === "tv"
            );
        } catch (e) {
            error = "Errore durante la ricerca. Riprova più tardi.";
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white mb-2">Risultati della ricerca</h1>
                <p className="text-gray-400">Stai cercando: "{query}"</p>
                <div className="mt-8">
                    <SearchBar />
                </div>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-red-500 text-center">
                    {error}
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {results.map((item) => (
                        <MediaCard key={item.id} media={item} />
                    ))}
                </div>
            ) : query ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">Nessun risultato trovato per la tua ricerca.</p>
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">Inserisci un termine di ricerca per iniziare.</p>
                </div>
            )}
        </div>
    );
}
