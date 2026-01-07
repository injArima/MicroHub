import { Movie, SheetConfig, SearchResult } from '../types';
import { syncSheet } from './sheet';

const IMDB_API_BASE = 'https://search.imdbot.workers.dev';

export const searchMovieCandidates = async (query: string): Promise<SearchResult[]> => {
    try {
        const searchRes = await fetch(`${IMDB_API_BASE}/?q=${encodeURIComponent(query)}`);
        if (!searchRes.ok) throw new Error("Search service unavailable");

        const searchData = await searchRes.json();
        if (!searchData.description || searchData.description.length === 0) {
            return [];
        }

        return searchData.description.map((item: any) => ({
            imdbId: item["#IMDB_ID"] || "",
            title: item["#TITLE"] || "Unknown",
            year: item["#YEAR"] ? item["#YEAR"].toString() : "",
            posterUrl: item["#IMG_POSTER"] || "",
            type: item["#RANK"] ? "Movie/TV" : "Unknown" // API doesn't always give clear type in search list
        }));
    } catch (e) {
        console.error("Search candidates error:", e);
        return [];
    }
};

export const getMovieDetails = async (imdbId: string): Promise<Partial<Movie>> => {
    try {
        // Step 1: Get Details directly by ID
        const detailsRes = await fetch(`${IMDB_API_BASE}/?tt=${imdbId}`);

        let info: any = {};
        let detailsData: any = {};
        if (detailsRes.ok) {
            detailsData = await detailsRes.json();
            info = detailsData.short || {};
        } else {
            throw new Error("Failed to fetch details");
        }

        // Refetch basic info if needed or rely on what we have. 
        // We use what we can from 'short' and 'main'.

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

        // Extract Score
        const score = info.aggregateRating?.ratingValue ? info.aggregateRating.ratingValue.toString() : "";

        // Extract Episodes
        let episodeCount: number | undefined = undefined;
        // Check both 'short' (schema.org) and 'main' (IMDB internal) if available
        if (detailsData.main?.episodes?.totalEpisodes?.total) {
            episodeCount = detailsData.main.episodes.totalEpisodes.total;
        } else if (detailsData.main?.episodes?.episodes?.total) {
            episodeCount = detailsData.main.episodes.episodes.total;
        }

        return {
            title: info.name || "Unknown",
            year: year,
            director: director,
            genre: genre,
            plot: info.description || "No plot available.",
            posterUrl: info.image || "",
            score: score,
            episodeCount: episodeCount
        };

    } catch (error: any) {
        console.warn("Get Movie Details Details:", error.message);
        throw error;
    }
};

// Deprecated or Wrapper for backward compatibility if needed, but we will switch MovieApp to use the above two.
export const searchMovie = async (query: string): Promise<Partial<Movie>> => {
    const candidates = await searchMovieCandidates(query);
    if (candidates.length === 0) throw new Error("Movie not found");
    return getMovieDetails(candidates[0].imdbId);
};

export const syncMovies = async (config: SheetConfig, movies: Movie[]) => {
    console.log("Starting Sync...");
    // Transform to Sheet Schema:
    // [ID, Title, Year, Director, Genre (String), Status, Poster URL, Score, Episodes]

    const sheetData = movies.map(m => [
        m.id,
        m.title,
        m.year,
        m.director,
        m.genre.join(', '),
        m.status,
        m.posterUrl || "",
        m.score || "",
        m.episodeCount ? m.episodeCount.toString() : ""
    ]);

    try {
        await syncSheet(config, 'Cinema_Log', sheetData);
        console.log("Sync Complete Success");
    } catch (e) {
        console.error("Sync Failed in service:", e);
        throw e;
    }
};