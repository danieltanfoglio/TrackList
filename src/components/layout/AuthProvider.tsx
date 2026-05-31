// src/components/layout/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    const loadingRef = useRef(false);

    useEffect(() => {
        let mounted = true;
        const timer = setTimeout(() => { if (mounted) setLoading(false); }, 8000);

        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    try {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('banned, ban_reason')
                            .eq('id', session.user.id)
                            .single();
                        if (profile?.banned) {
                            await supabase.auth.signOut();
                            const reason = encodeURIComponent(profile.ban_reason || 'Account sospeso');
                            window.location.href = `/banned?reason=${reason}`;
                            return;
                        }
                    } catch {
                        // Profile might not exist yet; ignore
                    }
                }
            } catch (err) {
                console.error('Auth session error:', err);
            } finally {
                if (mounted && !loadingRef.current) {
                    loadingRef.current = true;
                    setLoading(false);
                }
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (!loadingRef.current) {
                loadingRef.current = true;
                setLoading(false);
            }
            if (_event === 'SIGNED_IN') router.refresh();
            if (_event === 'SIGNED_OUT') {
                if (typeof window !== 'undefined' && window.location.pathname !== '/banned') {
                    router.push('/');
                }
                router.refresh();
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, [router]);

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
