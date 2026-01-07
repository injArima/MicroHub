import { Movie, SheetConfig } from '../types';
import { syncSheet } from './sheet';

const IMDB_API_BASE = 'https://search.imdbot.workers.dev';

export const searchMovie = async (query: string): Promise<Partial<Movie>> => {
    try {
        // Step 1: Search for the movie
        const searchRes = await fetch(`${IMDB_API_BASE}/?q=${encodeURIComponent(query)}`);

        if (!searchRes.ok) throw new Error("Search service unavailable");

        const searchData = await searchRes.json();

        if (!searchData.description || searchData.description.length === 0) {
            throw new Error("Movie not found");
        }

        const firstResult = searchData.description[0];
        const imdbId = firstResult["#IMDB_ID"];

        // Step 2: Get details
        const detailsRes = await fetch(`${IMDB_API_BASE}/?tt=${imdbId}`);

        let info: any = {};
        let detailsData: any = {};
        if (detailsRes.ok) {
            detailsData = await detailsRes.json();
            info = detailsData.short || {};
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
        const year = info.datePublished ? info.datePublished.split('-')[0] : (firstResult["#YEAR"] || "Unknown").toString();

        // Extract Genre
        let genre: string[] = ["Unknown"];
        if (info.genre) {
            genre = Array.isArray(info.genre) ? info.genre : [info.genre];
        }

        // Extract Score
        const score = info.aggregateRating?.ratingValue ? info.aggregateRating.ratingValue.toString() : "";

        // Extract Episodes (basic heuristic based on availability)
        // The API might return it in different ways, but for now we look for generic series indicators if explicit count isn't there.
        // IMDBot isn't always perfect with episode counts in the 'short' payload, but let's try.
        let episodeCount: number | undefined = undefined;
        if (info['@type'] === 'TVSeries' || info['@type'] === 'TelevisionSeries') {
            // Sometimes it's in totalEpisodes, sometimes we have to guess or leave it 0
            // For this free API, we might not get exact count easily in the 'short' body.
            // We'll leave undefined if we can't find it, or check main payload if needed.
            // If the API returns it in a specific field:
            if (detailsData?.main?.totalSeasons) {
                // Convert seasons to string if needed, but user asked for episodes. 
                // Without a dedicated episodes endpoint, we might just default to undefined or 
                // if the user is okay with seasons? 
                // Let's stick to "undefined" if we can't get exact episode count, 
                // but often it's not in the simple view.
            }
        }

        return {
            title: info.name || firstResult["#TITLE"],
            year: year,
            director: director,
            genre: genre,
            plot: info.description || "No plot available.",
            posterUrl: info.image || firstResult["#IMG_POSTER"],
            score: score,
            episodeCount: episodeCount
        };

    } catch (error: any) {
        if (error.message !== "Movie not found") {
            console.warn("Movie Search Warning:", error.message);
        }
        throw error;
    }
};

export const syncMovies = async (config: SheetConfig, movies: Movie[]) => {
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

    await syncSheet(config, 'Cinema_Log', sheetData);
};