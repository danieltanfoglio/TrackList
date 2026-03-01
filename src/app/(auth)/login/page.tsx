// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Film, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full glass-morphism p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4">
                        <Film className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Bentornato</h1>
                    <p className="text-gray-400 mt-2">Accedi per gestire la tua watchlist</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all"
                                placeholder="nome@esempio.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accedi'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400 text-sm">
                    Non hai un account?{' '}
                    <Link href="/register" className="text-blue-500 hover:text-blue-400 font-medium">
                        Registrati ora
                    </Link>
                </p>
            </div>
        </div>
    );
}
