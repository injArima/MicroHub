
import { Movie } from '../types';

const DB_URL = 'https://raw.githubusercontent.com/theapache64/movie_db/master/data/movies.json';

export const searchMovie = async (query: string): Promise<Partial<Movie>> => {
    try {
        const res = await fetch(DB_URL);
        if (!res.ok) throw new Error("Database unavailable");
        
        const data: any[] = await res.json();
        // Simple case-insensitive search
        const found = data.find((m: any) => m.title.toLowerCase().includes(query.toLowerCase()));
        
        if (!found) throw new Error("Movie not found");

        return {
            title: found.title,
            year: found.year ? found.year.toString() : 'Unknown',
            director: found.director || 'Unknown',
            genre: found.genre || [],
            plot: found.plot || 'No description available',
            posterUrl: found.posterUrl
        };
    } catch (error: any) {
        console.warn("Search Error:", error);
        throw error;
    }
};
