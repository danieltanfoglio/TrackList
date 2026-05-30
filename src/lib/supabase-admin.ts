import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export interface AdminStats {
  totalUsers: number;
  totalWatchlistItems: number;
  totalRatings: number;
  recentUsers: { id: string; email: string | null; created_at: string }[];
}

export interface AdminUser {
  id: string;
  username: string | null;
  created_at: string | null;
  watchlist_count: number;
}

export interface PopularContent {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  count: number;
  title?: string;
  poster_path?: string | null;
  vote_average?: number;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  username: string | null;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  status: string;
  rating: number | null;
  created_at: string;
}

function getAdminClient(): SupabaseClient<Database> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export async function getAdminStats(): Promise<AdminStats | null> {
  const client = getAdminClient();
  if (!client) return null;

  const [userCount, watchlistCount, ratingCount, recentUsers] = await Promise.all([
    client.from('profiles').select('*', { count: 'exact', head: true }).then(r => r.count),
    client.from('watchlist').select('*', { count: 'exact', head: true }).then(r => r.count),
    client.from('watchlist').select('*', { count: 'exact', head: true }).not('rating', 'is', null).then(r => r.count),
    client.from('profiles').select('*').order('updated_at', { ascending: false }).limit(10).then(r => r.data as Database['public']['Tables']['profiles']['Row'][] | null),
  ]);

  return {
    totalUsers: userCount ?? 0,
    totalWatchlistItems: watchlistCount ?? 0,
    totalRatings: ratingCount ?? 0,
    recentUsers: (recentUsers || []).map((p) => ({
      id: p.id,
      email: p.username,
      created_at: p.updated_at || '',
    })),
  };
}

export async function getUsers(search?: string): Promise<AdminUser[]> {
  const client = getAdminClient();
  if (!client) return [];

  let query = client.from('profiles').select('id, username, updated_at').order('updated_at', { ascending: false });
  if (search) {
    query = query.ilike('username', `%${search}%`);
  }
  const { data: profiles } = await query.limit(100) as unknown as { data: { id: string; username: string | null; updated_at: string | null }[] | null };
  if (!profiles) return [];

  const usersWithCounts = await Promise.all(
    profiles.map(async (p) => {
      const { count } = await client
        .from('watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', p.id);
      return {
        id: p.id,
        username: p.username,
        created_at: p.updated_at,
        watchlist_count: count ?? 0,
      };
    })
  );

  return usersWithCounts;
}

export async function getPopularContent(): Promise<PopularContent[]> {
  const client = getAdminClient();
  if (!client) return [];

  const { data: items } = await client
    .from('watchlist')
    .select('tmdb_id, media_type')
    .limit(5000) as unknown as { data: { tmdb_id: number; media_type: 'movie' | 'tv' }[] | null };

  if (!items) return [];

  const counts = new Map<string, { tmdb_id: number; media_type: 'movie' | 'tv'; count: number }>();
  for (const item of items) {
    const key = `${item.media_type}-${item.tmdb_id}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, { tmdb_id: item.tmdb_id, media_type: item.media_type, count: 1 });
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

export async function getActivity(limit = 50): Promise<ActivityItem[]> {
  const client = getAdminClient();
  if (!client) return [];

  const { data: watchlistItems } = await client
    .from('watchlist')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit) as unknown as { data: Database['public']['Tables']['watchlist']['Row'][] | null };

  if (!watchlistItems) return [];

  const userIds = [...new Set(watchlistItems.map((w) => w.user_id))];
  const { data: profiles } = await client
    .from('profiles')
    .select('id, username')
    .in('id', userIds) as unknown as { data: { id: string; username: string | null }[] | null };

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.username]));

  return watchlistItems.map((w) => ({
    id: w.id,
    user_id: w.user_id,
    username: profileMap.get(w.user_id) ?? null,
    tmdb_id: w.tmdb_id,
    media_type: w.media_type,
    status: w.status,
    rating: w.rating,
    created_at: w.updated_at,
  }));
}
