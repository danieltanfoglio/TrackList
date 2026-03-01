// src/lib/tmdb.ts - TMDB API Client
import { TMDBMedia, TMDBSearchResponse } from "@/types/tmdb";

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

/**
 * Common fetcher for TMDB API
 */
async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
    if (!TMDB_API_KEY) {
        console.error("TMDB_API_KEY is missing in environment variables!");
    }

    const urlParams = new URLSearchParams({
        api_key: TMDB_API_KEY || '',
        language: 'it-IT',
        ...params,
    });

    const url = `${TMDB_API_BASE_URL}${endpoint}?${urlParams.toString()}`;
    console.log(`Fetching from TMDB: ${endpoint}`);

    try {
        const response = await fetch(url, {
            next: { revalidate: 3600 }, // Cache results for 1 hour
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TMDB API Error (${response.status}): ${errorText}`);
            throw new Error(`TMDB API Error: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

/**
 * search/multi - Search for movies, TV shows, and people
 */
export async function searchMulti(query: string, page = 1) {
    return fetchTMDB('/search/multi', { query, page: page.toString() });
}

/**
 * get details for a specific movie or TV show
 */
export async function getMediaDetails(type: 'movie' | 'tv', id: string) {
    return fetchTMDB(`/${type}/${id}`, { append_to_response: 'videos,credits,watch/providers' });
}

/**
 * watch/providers - Get streaming platforms (filtered for IT)
 */
export async function getWatchProviders(type: 'movie' | 'tv', id: string) {
    const data = await fetchTMDB(`/${type}/${id}/watch/providers`);
    return data.results?.IT || null;
}

/**
 * recommendations - Get recommended content based on ID
 */
export async function getRecommendations(type: 'movie' | 'tv', id: string, page = 1) {
    return fetchTMDB(`/${type}/${id}/recommendations`, { page: page.toString() });
}

/**
 * Helper to get full image URL from TMDB path
 */
export function getTMDBImageUrl(path: string | null, size: 'w500' | 'original' = 'w500') {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Get trending movies or TV shows
 */
export async function getTrending(type: 'movie' | 'tv' | 'all', timeWindow: 'day' | 'week' = 'day') {
    return fetchTMDB(`/trending/${type}/${timeWindow}`);
}
