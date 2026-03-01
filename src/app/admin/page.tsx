'use client';

import { useState } from 'react';
import { adminLogin } from './actions';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const res = await adminLogin(formData);
            if (res?.error) {
                setError(res.error);
            }
        } catch (err) {
            // redirect throws an error so this might happen on success
            // or network error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-900">
            <div className="max-w-md w-full glass-morphism p-8 bg-black/40 rounded-2xl border border-white/10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-red-600 rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Area Admin</h1>
                    <p className="text-gray-400 mt-2">Accesso riservato agli amministratori</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Admin</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 focus:border-red-500/50 rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all"
                                placeholder="admin@admin.com"
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
                                className="w-full bg-white/5 border border-white/10 focus:border-red-500/50 rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entra nel Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
