
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Trash2, Check, RotateCcw, Film, Loader2 } from 'lucide-react';
import { Movie, SheetConfig } from '../types';
import { searchMovieCandidates, getMovieDetails, syncMovies } from '../services/movieService';

interface MovieAppProps {
    onBack: () => void;
    sheetConfig: SheetConfig | null;
}

const MovieApp: React.FC<MovieAppProps> = ({ onBack, sheetConfig }) => {
    const [movies, setMovies] = useState<Movie[]>([]); // Simplified init for brevity
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'watched'>('watchlist');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedMovies, setSelectedMovies] = useState<Set<string>>(new Set());
    const [isManageMode, setIsManageMode] = useState(false);

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
            // Use the specialized sync function
            const timeout = setTimeout(() => syncMovies(sheetConfig, movies).catch(console.error), 2000);
            return () => clearTimeout(timeout);
        }
    }, [movies, sheetConfig]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setShowResults(false);
        try {
            const results = await searchMovieCandidates(searchQuery);
            setSearchResults(results);
            setShowResults(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    }

    const handleSelectMovie = async (imdbId: string) => {
        setIsSearching(true);
        setShowResults(false);
        try {
            const result = await getMovieDetails(imdbId);
            const newMovie: Movie = {
                id: Date.now().toString(),
                title: result.title || "Unknown",
                year: result.year || "Unknown",
                director: result.director || "Unknown",
                genre: result.genre || ["Unknown"],
                plot: result.plot || "",
                status: 'watchlist',
                posterUrl: result.posterUrl,
                score: result.score,
                episodeCount: result.episodeCount
            };
            setMovies(prev => [newMovie, ...prev]);
            setSearchQuery('');
        } catch (e) {
            console.error(e);
            alert("Failed to load movie details");
        } finally {
            setIsSearching(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedMovies);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedMovies(newSet);
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Delete ${selectedMovies.size} movies?`)) {
            setMovies(prev => prev.filter(m => !selectedMovies.has(m.id)));
            setSelectedMovies(new Set());
            setIsManageMode(false);
        }
    };

    const handleBulkStatus = (status: 'watchlist' | 'watched') => {
        setMovies(prev => prev.map(m => selectedMovies.has(m.id) ? { ...m, status } : m));
        setSelectedMovies(new Set());
        setIsManageMode(false);
    };

    const filteredMovies = movies.filter(m => m.status === activeTab);

    return (
        <div className="w-full max-w-6xl mx-auto min-h-screen pb-32 pt-8 px-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
                    <ArrowLeft size={20} />
                </button>

                {isManageMode ? (
                    <div className="flex gap-2">
                        <button onClick={() => setIsManageMode(false)} className="px-4 py-2 rounded-full glass-card text-xs font-bold hover:bg-white/10">Cancel</button>
                        <button onClick={handleBulkDelete} disabled={selectedMovies.size === 0} className="px-4 py-2 rounded-full bg-red-500/20 text-red-500 border border-red-500/50 text-xs font-bold hover:bg-red-500/30 disabled:opacity-50">Delete ({selectedMovies.size})</button>
                        <button onClick={() => handleBulkStatus(activeTab === 'watchlist' ? 'watched' : 'watchlist')} disabled={selectedMovies.size === 0} className="px-4 py-2 rounded-full bg-[var(--secondary)] text-black text-xs font-bold hover:opacity-90 disabled:opacity-50">
                            Move to {activeTab === 'watchlist' ? 'Watched' : 'Watchlist'}
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2 items-center">
                        <div className="bg-[var(--secondary)]/10 px-3 py-1 rounded-full border border-[var(--secondary)]/20">
                            <span className="text-[10px] font-bold text-[var(--secondary)] uppercase tracking-wider">Cinema Log</span>
                        </div>
                        <button onClick={() => setIsManageMode(true)} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10">
                            <Check size={18} />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative max-w-2xl mx-auto w-full z-20 mb-6">
                <div className="glass-card rounded-full p-2 pl-4 flex items-center gap-2 mb-2 focus-within:border-[var(--secondary)]/50 transition-colors w-full">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search movie..."
                        className="flex-1 bg-transparent text-white outline-none text-sm h-8"
                        disabled={isManageMode}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || isManageMode}
                        className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                    </button>
                </div>

                {/* Dropdown Results */}
                {showResults && searchResults.length > 0 && !isManageMode && (
                    <div className="absolute top-14 left-0 right-0 glass-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto z-50">
                        <div className="p-2">
                            <div className="flex justify-between items-center px-2 py-1 mb-2">
                                <span className="text-xs font-bold text-gray-400">Select a title</span>
                                <button onClick={() => setShowResults(false)} className="text-xs text-gray-500 hover:text-white">Close</button>
                            </div>
                            {searchResults.map((item) => (
                                <button
                                    key={item.imdbId}
                                    onClick={() => handleSelectMovie(item.imdbId)}
                                    className="w-full text-left flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-colors group"
                                >
                                    <div className="w-10 h-14 bg-black/50 rounded overflow-hidden flex-shrink-0">
                                        {item.posterUrl ? (
                                            <img src={item.posterUrl} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">N/A</div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-white truncate group-hover:text-[var(--secondary)] transition-colors">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.year} • {item.type}</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[var(--secondary)] group-hover:bg-[var(--secondary)] transition-colors">
                                        <Plus size={12} className="text-transparent group-hover:text-black" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex glass-card p-1 rounded-full mb-6 max-w-md mx-auto w-full">
                {['watchlist', 'watched'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        disabled={isManageMode}
                        className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${activeTab === tab ? 'bg-[var(--secondary)] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMovies.map(movie => {
                    const isSelected = selectedMovies.has(movie.id);
                    return (
                        <div
                            key={movie.id}
                            onClick={() => isManageMode && toggleSelection(movie.id)}
                            className={`glass-card rounded-[24px] p-3 flex flex-col gap-3 transition-all relative group cursor-pointer ${isSelected ? 'ring-2 ring-[var(--secondary)]' : 'hover:bg-white/5'}`}
                        >
                            <div className="w-full aspect-[2/3] bg-black/50 rounded-xl overflow-hidden relative">
                                <img src={movie.posterUrl} className="w-full h-full object-cover" alt="Poster" />
                                {movie.score && (
                                    <div className="absolute top-2 right-2 bg-black/70 text-[var(--secondary)] text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border border-[var(--secondary)]/30">
                                        ★ {movie.score}
                                    </div>
                                )}
                                {isManageMode && (
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[var(--secondary)] border-[var(--secondary)]' : 'border-white'}`}>
                                            {isSelected && <Check size={16} className="text-black" />}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2" title={movie.title}>{movie.title}</h3>
                                    <p className="text-[10px] text-gray-500">
                                        {movie.year}
                                        {movie.episodeCount && (
                                            <span className="ml-1 text-[var(--secondary)]">• {movie.episodeCount} eps</span>
                                        )}
                                    </p>
                                </div>
                                {!isManageMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMovies(prev => prev.map(m => m.id === movie.id ? { ...m, status: m.status === 'watchlist' ? 'watched' : 'watchlist' } : m));
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${movie.status === 'watched' ? 'bg-[var(--secondary)] border-[var(--secondary)] text-black' : 'border-gray-600 text-gray-400 hover:border-white hover:text-white'}`}
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MovieApp;
