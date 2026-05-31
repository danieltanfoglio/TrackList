// src/components/layout/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isImpersonating: boolean;
    exitImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    isImpersonating: false,
    exitImpersonation: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const router = useRouter();

    const checkBanAndRedirect = useCallback(async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('banned, ban_reason')
                .eq('id', userId)
                .single();

            if (data?.banned) {
                await supabase.auth.signOut();
                const reason = encodeURIComponent(data.ban_reason || 'Account sospeso');
                window.location.href = `/banned?reason=${reason}`;
                return true;
            }
        } catch {
            // Profile might not exist yet; ignore
        }
        return false;
    }, []);

    useEffect(() => {
        let cancelled = false;
        let loadingSet = false;

        const done = () => {
            if (!loadingSet) {
                loadingSet = true;
                setLoading(false);
            }
        };

        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (cancelled) { done(); return; }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const banned = await checkBanAndRedirect(session.user.id);
                if (banned) { done(); return; }
            }

            done();
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (cancelled) { done(); return; }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const banned = await checkBanAndRedirect(session.user.id);
                if (banned) { done(); return; }
            }

            done();

            if (_event === 'SIGNED_IN') {
                router.refresh();
            }
            if (_event === 'SIGNED_OUT') {
                if (typeof window !== 'undefined' && window.location.pathname !== '/banned') {
                    router.push('/');
                }
                router.refresh();
            }
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            setIsImpersonating(document.cookie.includes('impersonating_user='));
        }
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const exitImpersonation = async () => {
        document.cookie = 'impersonating_user=; path=/; max-age=0';
        await supabase.auth.signOut();
        window.location.href = '/admin/dashboard';
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, isImpersonating, exitImpersonation }}>
            {children}
        </AuthContext.Provider>
    );
}
