'use client';

import Link from 'next/link';
import { Search, Film, Tv, Bookmark, User, LogOut, Menu, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, signOut, isImpersonating, exitImpersonation } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const navLinks = [
        { href: '/browse/movies', label: 'Film', icon: Film },
        { href: '/browse/tv', label: 'Serie TV', icon: Tv },
        { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
    ];

    return (
        <>
            {isImpersonating && (
                <div className="sticky top-0 z-[60] bg-yellow-600/20 border-b border-yellow-500/30 backdrop-blur-md px-4 py-2.5">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Stai operando come <strong>{user?.email || 'utente'}</strong></span>
                        </div>
                        <button
                            onClick={exitImpersonation}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium transition-colors"
                            aria-label="Torna alla modalità admin"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Torna all&apos;Admin
                        </button>
                    </div>
                </div>
            )}
            <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group" aria-label="Home">
                    <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-500 transition-colors">
                        <Film className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        TrackList
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`hover:text-white transition-colors flex items-center gap-1.5 ${pathname.startsWith(href) ? 'text-white' : ''}`}
                            aria-label={label}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/search"
                        className="p-2 text-gray-400 hover:text-white transition-colors md:hidden"
                        aria-label="Cerca"
                    >
                        <Search className="w-5 h-5" />
                    </Link>

                    <div className="h-8 w-[1px] bg-white/10 hidden md:block" />

                    {user ? (
                        <div className="relative group">
                            <button
                                className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                aria-label="Menu utente"
                            >
                                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase italic">
                                    {user.email?.[0] || 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-300 hidden sm:block">
                                    {user.user_metadata?.username || 'Profilo'}
                                </span>
                            </button>

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
                                    aria-label="Esci"
                                >
                                    <LogOut className="w-4 h-4" /> Esci
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white px-4 py-2 transition-colors" aria-label="Accedi">
                                Accedi
                            </Link>
                            <Link href="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all" aria-label="Registrati">
                                Inizia
                            </Link>
                        </div>
                    )}

                    <button
                        className="p-2 text-gray-400 hover:text-white md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-[#0a0a0f] border-l border-white/10 shadow-2xl overflow-y-auto">
                        <div className="p-6 flex flex-col gap-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Film className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold text-white">TrackList</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                {navLinks.map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith(href)
                                                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        aria-label={label}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {label}
                                    </Link>
                                ))}
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                {user ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                                                {user.email?.[0] || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm">{user.user_metadata?.username || 'Utente'}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </div>
                                        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                            <User className="w-5 h-5" /> Il mio profilo
                                        </Link>
                                        <Link href="/watchlist" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                            <Bookmark className="w-5 h-5" /> Watchlist
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                                            aria-label="Esci"
                                        >
                                            <LogOut className="w-5 h-5" /> Esci
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link href="/login" className="w-full text-center text-sm font-medium text-gray-400 hover:text-white py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all" aria-label="Accedi">
                                            Accedi
                                        </Link>
                                        <Link href="/register" className="w-full text-center text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl transition-all" aria-label="Registrati">
                                            Inizia
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
        </>
    );
}
