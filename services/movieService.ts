import { Movie } from '../types';

const IMDB_API_BASE = 'https://search.imdbot.workers.dev';

export interface SearchResult {
    id: string;
    title: string;
    year: string;
    poster: string;
}

export const searchMovies = async (query: string): Promise<SearchResult[]> => {
    try {
        const searchRes = await fetch(`${IMDB_API_BASE}/?q=${encodeURIComponent(query)}`);

        if (!searchRes.ok) throw new Error("Search service unavailable");

        const searchData = await searchRes.json();

        if (!searchData.description || searchData.description.length === 0) {
            return [];
        }

        return searchData.description.map((item: any) => ({
            id: item["#IMDB_ID"],
            title: item["#TITLE"],
            year: item["#YEAR"] ? item["#YEAR"].toString() : "Unknown",
            poster: item["#IMG_POSTER"]
        }));

    } catch (error: any) {
        console.warn("Movie Search Warning:", error.message);
        return [];
    }
};

export const getMovieDetails = async (imdbId: string): Promise<Partial<Movie>> => {
    try {
        const detailsRes = await fetch(`${IMDB_API_BASE}/?tt=${imdbId}`);

        let info: any = {};
        if (detailsRes.ok) {
            const detailsData = await detailsRes.json();
            info = detailsData.short || {};
        } else {
            throw new Error("Details service unavailable");
        }

        // Extract Director
        let director = "Unknown";
        if (info.director) {
            if (Array.isArray(info.director)) {
                director = info.director[0]?.name || "Unknown";
            } else {
                director = info.director?.name || "Unknown";
            }
        }

        // Extract Year
        const year = info.datePublished ? info.datePublished.split('-')[0] : "Unknown";

        // Extract Genre
        let genre: string[] = ["Unknown"];
        if (info.genre) {
            genre = Array.isArray(info.genre) ? info.genre : [info.genre];
        }

        return {
            title: info.name,
            year: year,
            director: director,
            genre: genre,
            plot: info.description || "No plot available.",
            posterUrl: info.image
        };

    } catch (error: any) {
        console.warn("Movie Details Warning:", error.message);
        throw error;
    }
};

// Deprecated: kept for backward compatibility if needed, but we should move to the new flow
export const searchMovie = async (query: string): Promise<Partial<Movie>> => {
    const results = await searchMovies(query);
    if (results.length === 0) throw new Error("Movie not found");
    return getMovieDetails(results[0].id);
};