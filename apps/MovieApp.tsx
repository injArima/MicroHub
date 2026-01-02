import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Trash2, Check, RotateCcw, Film, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Movie, SheetConfig } from '../types';
import { searchMovie } from '../services/movieService';
import { syncToCloud } from '../services/sheet';

interface MovieAppProps {
    onBack: () => void;
    sheetConfig: SheetConfig | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const STORAGE_KEY = 'microhub_movies';

const MovieApp: React.FC<MovieAppProps> = ({ onBack, sheetConfig }) => {
    const [movies, setMovies] = useState<Movie[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'watched'>('watchlist');
    const [isDirty, setIsDirty] = useState(false);
    
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
        if (isDirty && sheetConfig) {
             const timeout = setTimeout(async () => {
                setSaveStatus('saving');
                setErrorMessage('');
                try {
                    const tasks = JSON.parse(localStorage.getItem('microhub_tasks') || '[]');
                    const journal = JSON.parse(localStorage.getItem('microhub_journal_entries') || '[]');
                    
                    await syncToCloud(sheetConfig, { movies, tasks, journal });
                    
                    setSaveStatus('saved');
                    setIsDirty(false);
                    setTimeout(() => setSaveStatus('idle'), 3000);
                } catch (e: any) {
                    setSaveStatus('error');
                    setErrorMessage(e.message || "Save failed");
                }
             }, 2000);
             return () => clearTimeout(timeout);
        }
    }, [movies, sheetConfig, isDirty]);

    const handleAddMovie = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);

        try {
            // Fetch structured data from free database
            const details = await searchMovie(searchQuery);
            
            const newMovie: Movie = {
                id: Date.now().toString(),
                title: details.title || searchQuery,
                year: details.year || 'Unknown',
                director: details.director || 'Unknown',
                genre: details.genre || ['Unknown'],
                plot: details.plot || 'No description available.',
                status: 'watchlist',
                posterUrl: details.posterUrl || `https://placehold.co/400x600/18181b/FFF?text=${encodeURIComponent(details.title || searchQuery)}`
            };

            setMovies(prev => [newMovie, ...prev]);
            setSearchQuery('');
            setIsDirty(true);
            setSaveStatus('idle');
        } catch (error) {
            console.error("Failed to fetch movie", error);
            // Fallback for offline or error
            const fallbackMovie: Movie = {
                id: Date.now().toString(),
                title: searchQuery,
                year: 'Unknown',
                director: 'Unknown',
                genre: ['Custom'],
                plot: 'Added manually.',
                status: 'watchlist',
                posterUrl: `https://placehold.co/400x600/18181b/FFF?text=${encodeURIComponent(searchQuery)}`
            };
            setMovies(prev => [fallbackMovie, ...prev]);
            setSearchQuery('');
            setIsDirty(true);
            setSaveStatus('idle');
        } finally {
            setIsSearching(false);
        }
    };

    const toggleStatus = (id: string) => {
        setMovies(movies.map(m => 
            m.id === id 
                ? { ...m, status: m.status === 'watchlist' ? 'watched' : 'watchlist' } 
                : m
        ));
        setIsDirty(true);
        setSaveStatus('idle');
    };

    const deleteMovie = (id: string) => {
        setMovies(movies.filter(m => m.id !== id));
        setIsDirty(true);
        setSaveStatus('idle');
    };

    const filteredMovies = movies.filter(m => m.status === activeTab);

    return (
        <div className="w-full min-h-screen bg-[#0f0f10] pb-24 pt-4 px-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white hover:bg-[#3f3f46] transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white">Cinema Log</h1>
                 </div>
                 <div className="flex items-center gap-2">
                    {saveStatus === 'saving' && (
                        <div className="flex items-center gap-2 bg-[#27272a] px-3 py-1 rounded-full border border-white/5">
                            <Loader2 size={12} className="animate-spin text-gray-400" />
                        </div>
                    )}
                    {saveStatus === 'saved' && (
                        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                            <CheckCircle size={12} className="text-green-500" />
                        </div>
                    )}
                    {saveStatus === 'error' && (
                         <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20" title={errorMessage}>
                            <AlertTriangle size={12} className="text-red-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Search Input */}
            <div className="bg-[#27272a] rounded-[24px] p-2 pl-4 flex items-center gap-2 border border-white/5 focus-within:border-[#22d3ee] transition-colors mb-6">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMovie()}
                    placeholder="Search movie to add..."
                    className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-gray-500 h-10"
                />
                <button 
                    onClick={handleAddMovie}
                    disabled={isSearching || !searchQuery.trim()}
                    className="w-10 h-10 rounded-full bg-[#22d3ee] flex items-center justify-center text-black disabled:opacity-50 hover:bg-[#06b6d4] transition-colors"
                >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#27272a] p-1 rounded-full mb-6">
                <button 
                    onClick={() => setActiveTab('watchlist')}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'watchlist' ? 'bg-[#22d3ee] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Watch List ({movies.filter(m => m.status === 'watchlist').length})
                </button>
                <button 
                    onClick={() => setActiveTab('watched')}
                    className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'watched' ? 'bg-[#22d3ee] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Watched ({movies.filter(m => m.status === 'watched').length})
                </button>
            </div>

            {/* Movie List */}
            <div className="flex-1 space-y-4">
                {filteredMovies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-3">
                        <Film size={40} className="opacity-20" />
                        <p className="text-sm">No movies in {activeTab === 'watchlist' ? 'watchlist' : 'history'}</p>
                    </div>
                ) : (
                    filteredMovies.map(movie => (
                        <div key={movie.id} className="bg-[#27272a] rounded-[24px] p-4 flex gap-4 border border-white/5 group relative overflow-hidden">
                            {/* Poster */}
                            <div className="w-20 h-28 bg-[#18181b] rounded-xl flex-shrink-0 overflow-hidden relative shadow-lg">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-tight mb-1 line-clamp-1">{movie.title}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{movie.year} • {movie.director}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {movie.genre.slice(0, 2).map((g, i) => (
                                            <span key={i} className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">{g}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 mt-3">
                                    <button 
                                        onClick={() => toggleStatus(movie.id)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                                            movie.status === 'watchlist' 
                                            ? 'bg-[#22d3ee]/10 text-[#22d3ee] hover:bg-[#22d3ee]/20' 
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                    >
                                        {movie.status === 'watchlist' ? <><Check size={14} /> Mark Watched</> : <><RotateCcw size={14} /> Rewatch</>}
                                    </button>
                                    <button 
                                        onClick={() => deleteMovie(movie.id)}
                                        className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
             {errorMessage && (
                <p className="text-red-400 text-center text-xs mt-4 pb-4">{errorMessage}</p>
            )}
        </div>
    );
};

export default MovieApp;