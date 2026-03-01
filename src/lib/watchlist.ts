// src/lib/watchlist.ts
import { supabase } from './supabase';
import { Database } from '@/types/database';

export type WatchlistItem = Database['public']['Tables']['watchlist']['Row'];

export async function addToWatchlist(item: Omit<Database['public']['Tables']['watchlist']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('watchlist')
        .insert([item])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function removeFromWatchlist(userId: string, tmdbId: number, mediaType: 'movie' | 'tv') {
    const { error } = await supabase
        .from('watchlist')
        .delete()
        .match({ user_id: userId, tmdb_id: tmdbId, media_type: mediaType });

    if (error) throw error;
}

export async function updateWatchlistStatus(id: string, updates: Partial<WatchlistItem>) {
    const { data, error } = await supabase
        .from('watchlist')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getUserWatchlist(userId: string) {
    const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getWatchlistItem(userId: string, tmdbId: number, mediaType: 'movie' | 'tv') {
    const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .match({ user_id: userId, tmdb_id: tmdbId, media_type: mediaType })
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is code for "no rows found"
    return data || null;
}
