// src/app/profile/page.tsx
'use client';

import { useAuth } from '@/components/layout/AuthProvider';
import { User, Mail, Calendar, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <div className="glass-morphism p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-blue-500/20">
                        {user.email?.[0].toUpperCase()}
                    </div>

                    <div className="flex-1 flex flex-col gap-6 w-full">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {user.user_metadata?.username || 'Utente'}
                            </h1>
                            <p className="text-gray-400">Gestisci il tuo account e le tue preferenze</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                                <Mail className="w-5 h-5 text-blue-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-bold">Email</span>
                                    <span className="text-white text-sm">{user.email}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase font-bold">Membro da</span>
                                    <span className="text-white text-sm">
                                        {new Date(user.created_at).toLocaleDateString('it-IT', { year: 'numeric', month: 'long' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <button
                                onClick={() => signOut()}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors font-medium"
                            >
                                <LogOut className="w-5 h-5" /> Esci dall'account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
