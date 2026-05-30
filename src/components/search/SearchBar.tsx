'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Film, Tv } from 'lucide-react';
import Link from 'next/link';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (!debounced.trim()) {
            setSuggestions([]);
            setSuggestOpen(false);
            return;
        }
        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
            .then((r) => r.json())
            .then((data) => {
                const items = (data.results || []).filter(
                    (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
                );
                setSuggestions(items.slice(0, 5));
                setSuggestOpen(items.length > 0);
            })
            .catch(() => setSuggestions([]))
            .finally(() => setLoading(false));
    }, [debounced]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setSuggestOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setSuggestOpen(false);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto" ref={wrapperRef}>
            <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/10 blur-xl group-focus-within:bg-blue-500/20 transition-all rounded-full" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
                    placeholder="Cerca film, serie TV..."
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-full py-4 pl-14 pr-6 text-lg outline-none transition-all placeholder:text-gray-500 relative z-10"
                    aria-label="Cerca film o serie TV"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors z-10" aria-hidden="true" />
            </div>

            {suggestOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 z-50 glass-morphism border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {loading && (
                        <div className="p-4 text-center text-sm text-gray-500">
                            <span className="animate-pulse">Ricerca in corso...</span>
                        </div>
                    )}
                    {suggestions.map((item: any) => {
                        const title = item.title || item.name;
                        const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                        return (
                            <Link
                                key={item.id}
                                href={`/media/${item.id}?type=${item.media_type}`}
                                onClick={() => setSuggestOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-none">
                                    {item.media_type === 'movie' ? (
                                        <Film className="w-4 h-4 text-blue-400" />
                                    ) : (
                                        <Tv className="w-4 h-4 text-indigo-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{title}</p>
                                    {year && <p className="text-xs text-gray-500">{year}</p>}
                                </div>
                            </Link>
                        );
                    })}
                    <Link
                        href={`/search?q=${encodeURIComponent(query)}`}
                        onClick={() => setSuggestOpen(false)}
                        className="block px-4 py-3 text-center text-sm text-blue-400 hover:bg-white/5 transition-colors font-medium border-t border-white/5"
                    >
                        Vedi tutti i risultati
                    </Link>
                </div>
            )}
        </form>
    );
}
