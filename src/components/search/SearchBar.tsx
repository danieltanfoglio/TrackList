// src/components/search/SearchBar.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto">
            <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/10 blur-xl group-focus-within:bg-blue-500/20 transition-all rounded-full" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cerca film, serie TV, attori..."
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-full py-4 pl-14 pr-6 text-lg outline-none transition-all placeholder:text-gray-500 relative z-10"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors z-10" />
            </div>
        </form>
    );
}
