
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Plus, Trash2, Check, RotateCcw, Film, Loader2 } from 'lucide-react';
import { Movie, SheetConfig } from '../types';
import { searchMovie } from '../services/movieService';
import { syncSheet } from '../services/sheet';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface MovieAppProps {
    onBack: () => void;
    sheetConfig: SheetConfig | null;
}

const MovieApp: React.FC<MovieAppProps> = ({ onBack, sheetConfig }) => {
    const [movies, setMovies] = useState<Movie[]>([]); 
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState<'watchlist' | 'watched'>('watchlist');

    const container = useRef(null);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('microhub_movies');
            if (saved) setMovies(JSON.parse(saved));
        } catch {}
    }, []);

    useEffect(() => {
        localStorage.setItem('microhub_movies', JSON.stringify(movies));
        if (sheetConfig && movies.length > 0) {
            const timeout = setTimeout(() => syncSheet(sheetConfig, 'Cinema_Log', movies).catch(console.error), 2000);
            return () => clearTimeout(timeout);
        }
    }, [movies, sheetConfig]);

    const handleAddMovie = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        
        try {
            const movieData = await searchMovie(searchQuery);
            
            const newMovie: Movie = {
                id: Date.now().toString(),
                title: movieData.title || searchQuery,
                year: movieData.year || 'Unknown',
                director: movieData.director || 'Unknown',
                genre: movieData.genre || [],
                plot: movieData.plot || '',
                status: 'watchlist',
                posterUrl: movieData.posterUrl || `https://placehold.co/400x600/111/FFF?text=${encodeURIComponent(searchQuery)}`
            };

            setMovies(prev => [newMovie, ...prev]);
            setSearchQuery('');
            
            // Animate new item
            setTimeout(() => {
                 gsap.fromTo(".movie-card-new", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 });
            }, 50);

        } catch (e) {
            alert("Movie not found in database. Try another title.");
        } finally {
            setIsSearching(false);
        }
    };

    const filteredMovies = movies.filter(m => m.status === activeTab);

    useGSAP(() => {
        gsap.from('.movie-card', {
            y: 30,
            opacity: 0,
            stagger: 0.05,
            duration: 0.4,
            ease: 'power2.out',
            clearProps: 'all'
        });
    }, { scope: container, dependencies: [activeTab] }); // Re-animate on tab switch

    return (
        <div ref={container} className="w-full max-w-6xl mx-auto min-h-screen pb-32 pt-8 px-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                 <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
                    <ArrowLeft size={20} />
                </button>
                <div className="bg-[var(--secondary)]/10 px-3 py-1 rounded-full border border-[var(--secondary)]/20">
                    <span className="text-[10px] font-bold text-[var(--secondary)] uppercase tracking-wider">Cinema Log</span>
                </div>
            </div>

            <div className="glass-card rounded-full p-2 pl-4 flex items-center gap-2 mb-6 focus-within:border-[var(--secondary)]/50 transition-colors max-w-2xl mx-auto w-full">
                <Search size={16} className="text-gray-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMovie()}
                    placeholder="Search movie..."
                    className="flex-1 bg-transparent text-white outline-none text-sm h-8"
                />
                <button 
                    onClick={handleAddMovie}
                    disabled={isSearching}
                    className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center text-black hover:scale-105 transition-transform"
                >
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                </button>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMovies.map((movie, idx) => (
                    <div key={movie.id} className={`movie-card glass-card rounded-[24px] p-4 flex gap-4 hover:bg-white/10 transition-colors ${idx === 0 ? 'movie-card-new' : ''}`}>
                        <div className="w-16 h-24 bg-black/50 rounded-xl flex-shrink-0 overflow-hidden">
                            <img src={movie.posterUrl} className="w-full h-full object-cover" alt="Poster" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                            <h3 className="font-bold text-white leading-tight mb-1 truncate">{movie.title}</h3>
                            <p className="text-xs text-gray-500 mb-3 truncate">{movie.year} • {movie.director}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setMovies(prev => prev.map(m => m.id === movie.id ? {...m, status: m.status === 'watchlist' ? 'watched' : 'watchlist'} : m))} className="text-[var(--secondary)] text-xs font-bold hover:underline">
                                    {movie.status === 'watchlist' ? 'Mark Watched' : 'Rewatch'}
                                </button>
                                <button onClick={() => setMovies(prev => prev.filter(m => m.id !== movie.id))} className="text-red-400 text-xs font-bold hover:underline">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieApp;
