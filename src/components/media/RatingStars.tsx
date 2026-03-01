// src/components/media/RatingStars.tsx
'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import { getWatchlistItem, updateWatchlistStatus } from '@/lib/watchlist';

interface RatingStarsProps {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
}

export default function RatingStars({ tmdbId, mediaType }: RatingStarsProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState<number | null>(null);
    const [hover, setHover] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchRating();
        } else {
            setLoading(false);
        }
    }, [user, tmdbId, mediaType]);

    const fetchRating = async () => {
        try {
            const item = await getWatchlistItem(user!.id, tmdbId, mediaType);
            if (item) {
                setRating(item.rating);
                setWatchlistItemId(item.id);
            }
        } catch (error) {
            console.error('Error fetching rating:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (value: number) => {
        if (!user || !watchlistItemId) return;

        setRating(value);
        try {
            await updateWatchlistStatus(watchlistItemId, { rating: value });
        } catch (error) {
            console.error('Error saving rating:', error);
        }
    };

    if (loading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (!watchlistItemId) return null;

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 uppercase font-bold">Il tuo voto</label>
            <div className="flex items-center gap-1">
                {[...Array(10)].map((_, i) => {
                    const value = i + 1;
                    return (
                        <button
                            key={value}
                            onMouseEnter={() => setHover(value)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => handleRate(value)}
                            className="p-0.5 focus:outline-none transition-transform hover:scale-125"
                        >
                            <Star
                                className={`w-5 h-5 ${(hover || rating || 0) >= value
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-gray-600'
                                    } transition-colors`}
                            />
                        </button>
                    );
                })}
                {rating && <span className="ml-2 text-sm font-bold text-white">{rating}/10</span>}
            </div>
        </div>
    );
}
