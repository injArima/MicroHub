
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Trash2, Check, RotateCcw, Film, Loader2 } from 'lucide-react';
import { Movie, SheetConfig } from '../types';
import { searchMovies, getMovieDetails, SearchResult } from '../services/movieService';
import { syncSheet } from '../services/sheet';

interface MovieAppProps {
    onBack: () => void;
    sheetConfig: SheetConfig | null;
}

const MovieApp: React.FC<MovieAppProps> = ({ onBack, sheetConfig }) => {
    const [movies, setMovies] = useState<Movie[]>([]); // Simplified init for brevity
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'watched'>('watchlist');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState<string | null>(null);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('microhub_movies');
            if (saved) setMovies(JSON.parse(saved));
        } catch { }
    }, []);

    useEffect(() => {
        localStorage.setItem('microhub_movies', JSON.stringify(movies));
        if (sheetConfig && movies.length > 0) {
            const timeout = setTimeout(() => syncSheet(sheetConfig, 'Cinema_Log', movies).catch(console.error), 2000);
            return () => clearTimeout(timeout);
        }
    }, [movies, sheetConfig]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchResults([]);
        setShowResults(true);

        try {
            const results = await searchMovies(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectMovie = async (result: SearchResult) => {
        setIsLoadingDetails(result.id);
        try {
            const details = await getMovieDetails(result.id);

            const newMovie: Movie = {
                id: result.id,
                title: details.title || result.title,
                year: details.year || result.year,
                director: details.director || 'Unknown',
                genre: details.genre || ['Unknown'],
                plot: details.plot || 'No description available',
                status: 'watchlist',
                posterUrl: details.posterUrl || result.poster
            };

            setMovies(prev => [newMovie, ...prev]);
            setShowResults(false);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            alert("Failed to fetch movie details");
            console.error(error);
        } finally {
            setIsLoadingDetails(null);
        }
    };

    const filteredMovies = movies.filter(m => m.status === activeTab);

    return (
        <div className="w-full max-w-6xl mx-auto min-h-screen pb-32 pt-8 px-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
                    <ArrowLeft size={20} />
                </button>
                <div className="bg-[var(--secondary)]/10 px-3 py-1 rounded-full border border-[var(--secondary)]/20">
                    <span className="text-[10px] font-bold text-[var(--secondary)] uppercase tracking-wider">Cinema Log</span>
                </div>
            </div>

            <div className="glass-card rounded-full p-2 pl-4 flex items-center gap-2 mb-6 focus-within:border-[var(--secondary)]/50 transition-colors max-w-2xl mx-auto w-full relative z-50">
                <Search size={16} className="text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search movie..."
                    className="flex-1 bg-transparent text-white outline-none text-sm h-8"
                />
                <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center text-black hover:scale-105 transition-transform"
                >
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={16} />}
                </button>
            </div>

            {showResults && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-sm font-medium text-gray-400">Search Results</h3>
                        <button onClick={() => setShowResults(false)} className="text-xs text-red-400 hover:text-red-300">Close</button>
                    </div>
                    {searchResults.length === 0 && !isSearching ? (
                        <div className="text-center py-8 text-gray-500 text-sm">No movies found</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {searchResults.map(result => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelectMovie(result)}
                                    disabled={isLoadingDetails === result.id}
                                    className="glass-card p-2 rounded-xl text-left hover:bg-white/10 transition-all flex flex-col group relative overflow-hidden"
                                >
                                    <div className="aspect-[2/3] bg-black/50 rounded-lg mb-2 overflow-hidden relative">
                                        {result.poster && result.poster !== 'N/A' ? (
                                            <img src={result.poster} alt={result.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                <Film size={24} />
                                            </div>
                                        )}
                                        {isLoadingDetails === result.id && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                <Loader2 className="animate-spin text-[var(--secondary)]" />
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-bold text-xs text-white truncate w-full">{result.title}</h4>
                                    <p className="text-[10px] text-gray-500">{result.year}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!showResults && (
                <div className="flex glass-card p-1 rounded-full mb-6 max-w-md mx-auto w-full">
                    {['watchlist', 'watched'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[var(--secondary)] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {!showResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMovies.map(movie => (
                        <div key={movie.id} className="glass-card rounded-[24px] p-4 flex gap-4 hover:bg-white/10 transition-colors">
                            <div className="w-16 h-24 bg-black/50 rounded-xl flex-shrink-0 overflow-hidden">
                                <img src={movie.posterUrl} className="w-full h-full object-cover" alt="Poster" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                <h3 className="font-bold text-white leading-tight mb-1 truncate">{movie.title}</h3>
                                <p className="text-xs text-gray-500 mb-3 truncate">{movie.year} • {movie.director}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, status: m.status === 'watchlist' ? 'watched' : 'watchlist' } : m))} className="text-[var(--secondary)] text-xs font-bold hover:underline">
                                        {movie.status === 'watchlist' ? 'Mark Watched' : 'Rewatch'}
                                    </button>
                                    <button onClick={() => setMovies(prev => prev.filter(m => m.id !== movie.id))} className="text-red-400 text-xs font-bold hover:underline">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MovieApp;
