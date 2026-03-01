// src/types/database.ts

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    avatar_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
            }
            watchlist: {
                Row: {
                    id: string
                    user_id: string
                    tmdb_id: number
                    media_type: 'movie' | 'tv'
                    status: 'to_watch' | 'watching' | 'completed'
                    season_progress: number | null
                    episode_progress: number | null
                    rating: number | null
                    is_favorite: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tmdb_id: number
                    media_type: 'movie' | 'tv'
                    status?: 'to_watch' | 'watching' | 'completed'
                    season_progress?: number | null
                    episode_progress?: number | null
                    rating?: number | null
                    is_favorite?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tmdb_id?: number
                    media_type?: 'movie' | 'tv'
                    status?: 'to_watch' | 'watching' | 'completed'
                    season_progress?: number | null
                    episode_progress?: number | null
                    rating?: number | null
                    is_favorite?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
