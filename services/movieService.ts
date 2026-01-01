import { Movie } from '../types';

const IMDB_API_BASE = 'https://search.imdbot.workers.dev';

export const searchMovie = async (query: string): Promise<Partial<Movie>> => {
    try {
        // Step 1: Search for the movie
        const searchRes = await fetch(`${IMDB_API_BASE}/?q=${encodeURIComponent(query)}`);
        const searchData = await searchRes.json();
        
        if (!searchData.description || searchData.description.length === 0) {
            throw new Error("Movie not found");
        }

        const firstResult = searchData.description[0];
        const imdbId = firstResult["#IMDB_ID"];

        // Step 2: Get details
        const detailsRes = await fetch(`${IMDB_API_BASE}/?tt=${imdbId}`);
        const detailsData = await detailsRes.json();
        const info = detailsData.short || {};

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

        return {
            title: info.name || firstResult["#TITLE"],
            year: year,
            director: director,
            genre: genre,
            plot: info.description || "No plot available.",
            posterUrl: info.image || firstResult["#IMG_POSTER"]
        };

    } catch (error) {
        console.error("Movie Service Error:", error);
        throw error;
    }
};