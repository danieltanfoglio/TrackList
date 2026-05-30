import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export interface AdminStats {
  totalUsers: number;
  totalWatchlistItems: number;
  totalRatings: number;
  recentUsers: { id: string; email: string | null; created_at: string }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const [userCount, watchlistCount, ratingCount, recentUsers] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).then(r => r.count),
    supabaseAdmin.from('watchlist').select('*', { count: 'exact', head: true }).then(r => r.count),
    supabaseAdmin.from('watchlist').select('*', { count: 'exact', head: true }).not('rating', 'is', null).then(r => r.count),
    supabaseAdmin.from('profiles').select('*').order('updated_at', { ascending: false }).limit(10).then(r => r.data as Database['public']['Tables']['profiles']['Row'][] | null),
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
