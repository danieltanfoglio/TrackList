// src/types/tmdb.ts

export type MediaType = 'movie' | 'tv';

export interface TMDBMedia {
    id: number;
    title?: string; // for movies
    name?: string; // for tv shows
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date?: string; // for movies
    first_air_date?: string; // for tv shows
    media_type: MediaType;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
}

export interface TMDBSearchResponse {
    page: number;
    results: TMDBMedia[];
    total_pages: number;
    total_results: number;
}

export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
    display_priority: number;
}

export interface WatchProvidersResponse {
    link: string;
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
}
