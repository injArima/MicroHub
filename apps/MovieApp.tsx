
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Plus, Loader2 } from 'lucide-react';
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
                posterUrl: movieData.posterUrl || `https://placehold.co/400x600/FFF/000?text=${encodeURIComponent(searchQuery)}`
            };

            setMovies(prev => [newMovie, ...prev]);
            setSearchQuery('');
            
            setTimeout(() => {
                 gsap.fromTo(".movie-card-new", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 });
            }, 50);

        } catch (e) {
            alert("Movie not found.");
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
    }, { scope: container, dependencies: [activeTab] });

    return (
        <div ref={container} className="w-full max-w-6xl mx-auto min-h-screen pb-32 pt-10 px-6 flex flex-col bg-white">
            <div className="flex justify-between items-center mb-6">
                 <button onClick={onBack} className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors">
                    <ArrowLeft size={20} strokeWidth={2.5}/>
                </button>
                <div className="border-2 border-black px-3 py-1 rounded-full bg-[#bef264]">
                    <span className="text-[10px] font-black text-black uppercase tracking-wider">Cinema DB</span>
                </div>
            </div>

            <div className="contra-card p-1 pl-4 flex items-center gap-2 mb-6 max-w-2xl mx-auto w-full rounded-full">
                <Search size={16} className="text-black" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMovie()}
                    placeholder="SEARCH DATABASE..."
                    className="flex-1 bg-transparent text-black outline-none text-sm h-10 font-bold uppercase placeholder:text-gray-400"
                />
                <button 
                    onClick={handleAddMovie}
                    disabled={isSearching}
                    className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:scale-105 transition-transform"
                >
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
                </button>
            </div>

            <div className="flex mb-6 max-w-md mx-auto w-full border-b-2 border-black">
                {['watchlist', 'watched'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'text-black border-b-4 border-black' : 'text-gray-400'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMovies.map((movie, idx) => (
                    <div key={movie.id} className={`movie-card contra-card p-3 flex gap-4 ${idx === 0 ? 'movie-card-new' : ''}`}>
                        <div className="w-20 h-28 bg-gray-200 border-2 border-black rounded-lg flex-shrink-0 overflow-hidden relative">
                            <img src={movie.posterUrl} className="w-full h-full object-cover grayscale contrast-125" alt="Poster" />
                            <div className="absolute inset-0 mix-blend-multiply bg-gray-100/20"></div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                            <h3 className="font-black text-black text-lg leading-none mb-1 truncate uppercase">{movie.title}</h3>
                            <p className="text-[10px] font-mono text-gray-600 mb-3 truncate">
                                {movie.year} // {movie.director}
                            </p>
                            <div className="flex gap-2 mt-auto">
                                <button onClick={() => setMovies(prev => prev.map(m => m.id === movie.id ? {...m, status: m.status === 'watchlist' ? 'watched' : 'watchlist'} : m))} className="text-[10px] font-bold border border-black px-2 py-1 rounded hover:bg-black hover:text-white transition-colors">
                                    {movie.status === 'watchlist' ? 'MARK SEEN' : 'REWATCH'}
                                </button>
                                <button onClick={() => setMovies(prev => prev.filter(m => m.id !== movie.id))} className="text-[10px] font-bold text-red-500 hover:underline px-2 py-1">DELETE</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieApp;
