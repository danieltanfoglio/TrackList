'use client';

import { useState, useEffect } from 'react';
import { getUsers, AdminUser } from '@/lib/supabase-admin';
import { Users, Search, Bookmark, Clock, Ban, CheckCircle, Shield, Key, LogIn, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { banUserAction, unbanUserAction, updateUserRoleAction, resetUserPasswordAction, impersonateUserAction } from '../../actions';

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
    user: { label: 'Utente', color: 'text-gray-400 bg-white/5' },
    moderator: { label: 'Mod', color: 'text-green-400 bg-green-500/10' },
    admin: { label: 'Admin', color: 'text-red-400 bg-red-500/10' },
};

const ROLE_OPTIONS = [
    { value: 'user', label: 'Utente' },
    { value: 'moderator', label: 'Moderatore' },
    { value: 'admin', label: 'Admin' },
];

export default function AdminUsersPage() {
    const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [passwordResult, setPasswordResult] = useState<{ userId: string; password: string } | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [impersonating, setImpersonating] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        setLoading(true);
        const users = await getUsers();
        setAllUsers(users);
        setLoading(false);
    }

    const filteredUsers = search
        ? allUsers.filter((u) => u.username?.toLowerCase().includes(search.toLowerCase()))
        : allUsers;

    async function handleBan(userId: string) {
        const reason = prompt('Motivo del ban:');
        if (reason === null) return;
        setActionLoading(userId);
        setActionError(null);
        const formData = new FormData();
        formData.set('userId', userId);
        formData.set('reason', reason || 'Nessun motivo specificato');
        const result = await banUserAction(formData);
        if (result?.error) setActionError(result.error);
        await loadUsers();
        setActionLoading(null);
    }

    async function handleUnban(userId: string) {
        if (!confirm('Sbloccare questo utente?')) return;
        setActionLoading(userId);
        setActionError(null);
        const formData = new FormData();
        formData.set('userId', userId);
        const result = await unbanUserAction(formData);
        if (result?.error) setActionError(result.error);
        await loadUsers();
        setActionLoading(null);
    }

    async function handleRoleChange(userId: string, role: string) {
        setActionLoading(userId);
        setActionError(null);
        const formData = new FormData();
        formData.set('userId', userId);
        formData.set('role', role);
        const result = await updateUserRoleAction(formData);
        if (result?.error) setActionError(result.error);
        await loadUsers();
        setActionLoading(null);
    }

    async function handleResetPassword(userId: string) {
        if (!confirm('Resettare la password di questo utente? Verrà generata una password temporanea.')) return;
        setActionLoading(userId);
        setActionError(null);
        setPasswordResult(null);
        const formData = new FormData();
        formData.set('userId', userId);
        const result = await resetUserPasswordAction(formData);
        if (result?.error) {
            setActionError(result.error);
        } else if (result?.password) {
            setPasswordResult({ userId, password: result.password });
        }
        setActionLoading(null);
    }

    async function handleImpersonate(userId: string) {
        setActionLoading(userId);
        setActionError(null);
        setImpersonating(true);

        try {
            const result = await impersonateUserAction(userId);
            if (result?.error) {
                setActionError(result.error);
                setImpersonating(false);
                return;
            }
            if (result?.email && result?.otp) {
                const { error } = await supabase.auth.verifyOtp({
                    email: result.email,
                    token: result.otp,
                    type: 'magiclink',
                });
                if (error) {
                    setActionError(error.message);
                    setImpersonating(false);
                    return;
                }
                document.cookie = `impersonating_user=${result.email}; path=/; max-age=3600`;
                window.location.href = '/';
            }
        } catch {
            setActionError('Errore durante l\'impersonificazione');
            setImpersonating(false);
        }
        setActionLoading(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Users className="w-7 h-7 text-blue-400" /> Utenti
                    </h1>
                    <p className="text-gray-400">{allUsers.length} utenti registrati</p>
                </div>
            </div>

            {actionError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                    {actionError}
                </div>
            )}

            {passwordResult && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-yellow-400 text-sm font-medium mb-2">Password temporanea generata:</p>
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg px-4 py-2.5">
                        <code className="text-white font-mono text-sm flex-1 select-all">{passwordResult.password}</code>
                        <button
                            onClick={() => { navigator.clipboard.writeText(passwordResult.password); }}
                            className="text-yellow-400 hover:text-yellow-300 text-xs font-medium shrink-0"
                        >
                            COPIA
                        </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">L&apos;utente dovrà cambiarla al prossimo accesso.</p>
                </div>
            )}

            <form
                onSubmit={(e) => { e.preventDefault(); }}
                className="relative max-w-md"
            >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca per username..."
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl py-3 pl-11 pr-4 text-white outline-none transition-all text-sm"
                    aria-label="Cerca utenti"
                />
            </form>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    {search ? `Nessun utente trovato per "${search}".` : 'Nessun utente registrato.'}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="text-left py-4 px-4 font-medium text-gray-400">Utente</th>
                                <th className="text-left py-4 px-4 font-medium text-gray-400 hidden sm:table-cell">Ruolo</th>
                                <th className="text-left py-4 px-4 font-medium text-gray-400 hidden sm:table-cell">Stato</th>
                                <th className="text-left py-4 px-4 font-medium text-gray-400 hidden md:table-cell">Registrato</th>
                                <th className="text-right py-4 px-4 font-medium text-gray-400">Contenuti</th>
                                <th className="text-right py-4 px-4 font-medium text-gray-400">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => {
                                const isLoading = actionLoading === u.id;
                                return (
                                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                                                    {(u.username || '?')[0]}
                                                </div>
                                                <span className="font-medium text-white">{u.username || 'Anonimo'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 hidden sm:table-cell">
                                            <select
                                                defaultValue={(u as any).role || 'user'}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                disabled={isLoading}
                                                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 outline-none focus:border-blue-500/50 cursor-pointer disabled:opacity-50"
                                                aria-label={`Ruolo di ${u.username || 'utente'}`}
                                            >
                                                {ROLE_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-4 px-4 hidden sm:table-cell">
                                            {(u as any).banned ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                                                    <Ban className="w-3 h-3" /> Bannato
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                                    <CheckCircle className="w-3 h-3" /> Attivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-gray-400 hidden md:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-gray-600" />
                                                {u.created_at
                                                    ? new Date(u.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : '—'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-blue-400 text-xs font-medium">
                                                <Bookmark className="w-3 h-3" /> {u.watchlist_count}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <button
                                                    onClick={() => handleImpersonate(u.id)}
                                                    disabled={isLoading || impersonating}
                                                    className="p-2 rounded-lg hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-30"
                                                    aria-label={`Login as ${u.username || 'utente'}`}
                                                    title="Login As"
                                                >
                                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(u.id)}
                                                    disabled={isLoading}
                                                    className="p-2 rounded-lg hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-30"
                                                    aria-label={`Resetta password ${u.username || 'utente'}`}
                                                    title="Resetta Password"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                {(u as any).banned ? (
                                                    <button
                                                        onClick={() => handleUnban(u.id)}
                                                        disabled={isLoading}
                                                        className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-30"
                                                        aria-label={`Sblocca ${u.username || 'utente'}`}
                                                        title="Sblocca"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBan(u.id)}
                                                        disabled={isLoading}
                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors disabled:opacity-30"
                                                        aria-label={`Banna ${u.username || 'utente'}`}
                                                        title="Banna"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}