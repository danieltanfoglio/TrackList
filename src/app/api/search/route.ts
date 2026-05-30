import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const urlParams = new URLSearchParams({
      api_key: TMDB_API_KEY || '',
      query,
      language: 'it-IT',
      page: '1',
    });
    const res = await fetch(`${TMDB_API_BASE_URL}/search/multi?${urlParams}`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return NextResponse.json({ results: data.results || [] });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
