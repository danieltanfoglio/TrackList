// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { Search, Film, Tv, Bookmark, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useState } from 'react';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
                        <Film className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        MovieTracker <span className="text-blue-500">AI</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link href="/browse/movies" className="hover:text-white transition-colors flex items-center gap-1.5">
                        <Film className="w-4 h-4" /> Film
                    </Link>
                    <Link href="/browse/tv" className="hover:text-white transition-colors flex items-center gap-1.5">
                        <Tv className="w-4 h-4" /> Serie TV
                    </Link>
                    <Link href="/watchlist" className="hover:text-white transition-colors flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4" /> Watchlist
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors md:hidden">
                        <Search className="w-5 h-5" />
                    </button>

                    <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

                    {user ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase italic">
                                    {user.email?.[0] || 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-300 hidden sm:block">
                                    {user.user_metadata?.username || 'Profilo'}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-48 glass-morphism border border-white/10 rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                    <User className="w-4 h-4" /> Il mio profilo
                                </Link>
                                <Link href="/watchlist" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                    <Bookmark className="w-4 h-4" /> Watchlist
                                </Link>
                                <div className="h-[1px] bg-white/10 my-1 mx-2" />
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Esci
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white px-4 py-2 transition-colors">
                                Accedi
                            </Link>
                            <Link href="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all">
                                Inizia
                            </Link>
                        </div>
                    )}

                    <button
                        className="p-2 text-gray-400 hover:text-white md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
