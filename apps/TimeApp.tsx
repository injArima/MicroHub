
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Flag, Plus } from 'lucide-react';

interface TimeAppProps {
    onBack: () => void;
    initialMode: 'timer' | 'stopwatch';
}

const TimeApp: React.FC<TimeAppProps> = ({ onBack, initialMode }) => {
    const [mode, setMode] = useState<'timer' | 'stopwatch'>(initialMode);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [initialTime, setInitialTime] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    
    const [swTime, setSwTime] = useState(0);
    const [isSwRunning, setIsSwRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);

    const timerRef = useRef<number | null>(null);
    const swRef = useRef<number | null>(null);

    useEffect(() => {
        if (isTimerRunning && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) { setIsTimerRunning(false); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) clearInterval(timerRef.current);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isTimerRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const adjustTimer = (amount: number) => {
        if (isTimerRunning) return;
        const newTime = Math.max(60, Math.min(359940, timeLeft + amount)); 
        setTimeLeft(newTime);
        setInitialTime(newTime);
    };

    const setPreset = (mins: number) => {
        setIsTimerRunning(false);
        setTimeLeft(mins * 60);
        setInitialTime(mins * 60);
    };

    useEffect(() => {
        if (isSwRunning) {
            const startTime = Date.now() - swTime;
            swRef.current = window.setInterval(() => { setSwTime(Date.now() - startTime); }, 10);
        } else if (swRef.current) clearInterval(swRef.current);
        return () => { if (swRef.current) clearInterval(swRef.current); };
    }, [isSwRunning]);

    const formatSw = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        const centis = Math.floor((ms % 1000) / 10);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
    };

    const handleLap = () => setLaps(prev => [swTime, ...prev]);

    return (
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col pb-32 pt-10 px-6 bg-[var(--bg-color)] text-[var(--text-color)]">
            
            <div className="flex justify-between items-center mb-12">
                <button onClick={onBack} className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--secondary)] hover:text-[var(--text-inverted)] transition-colors">
                    <ArrowLeft size={20} strokeWidth={2.5}/>
                </button>
                
                <div className="border-2 border-[var(--border-color)] p-1 rounded-full flex gap-1 bg-[var(--bg-color)]">
                    <button 
                        onClick={() => setMode('timer')}
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all ${mode === 'timer' ? 'bg-[var(--secondary)] text-[var(--text-inverted)]' : 'text-gray-400 hover:text-[var(--text-color)]'}`}
                    >
                        Timer
                    </button>
                    <button 
                        onClick={() => setMode('stopwatch')}
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase transition-all ${mode === 'stopwatch' ? 'bg-[var(--secondary)] text-[var(--text-inverted)]' : 'text-gray-400 hover:text-[var(--text-color)]'}`}
                    >
                        Stopwatch
                    </button>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start relative">
                
                {mode === 'timer' ? (
                    <div className="flex flex-col items-center w-full animate-in zoom-in duration-300">
                        {/* Box Display */}
                        <div className="contra-card p-8 mb-10 w-full text-center relative overflow-hidden bg-[var(--bg-secondary)]">
                             <div className="absolute top-2 left-2 text-[10px] font-black uppercase tracking-widest text-gray-400">T-MINUS</div>
                             <div className="text-7xl font-black font-mono tracking-tighter tabular-nums text-[var(--text-color)]">
                                {formatTime(timeLeft)}
                             </div>
                             <div className="h-2 w-full bg-[var(--bg-color)] mt-4 border border-[var(--border-color)] rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-[var(--secondary)] transition-all duration-1000 ease-linear"
                                    style={{ width: `${(timeLeft / initialTime) * 100}%` }}
                                 />
                             </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6 mb-12">
                            <button 
                                onClick={() => { setIsTimerRunning(false); setTimeLeft(initialTime); }}
                                className="w-12 h-12 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-gray-400 hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)] transition-all"
                            >
                                <RotateCcw size={20} />
                            </button>

                            <button 
                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                                className="w-20 h-20 rounded-full bg-[var(--secondary)] text-[var(--text-inverted)] flex items-center justify-center shadow-[4px_4px_0px_0px_var(--border-color)] hover:scale-105 active:scale-95 transition-all border-4 border-[var(--bg-color)] ring-2 ring-[var(--border-color)]"
                            >
                                {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <button onClick={() => adjustTimer(60)} className="w-12 h-12 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--bg-secondary)] active:scale-95">
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Presets */}
                        <div className="flex gap-3">
                            {[5, 15, 25, 45].map(min => (
                                <button 
                                    key={min}
                                    onClick={() => setPreset(min)}
                                    className="w-12 h-12 rounded-lg border-2 border-[var(--border-color)] text-xs font-bold hover:bg-[var(--secondary)] hover:text-[var(--text-inverted)] text-[var(--text-color)] transition-all shadow-[2px_2px_0px_0px_var(--border-color)]"
                                >
                                    {min}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in zoom-in duration-300">
                        <div className="mb-12 text-center">
                            <div className="text-7xl font-black font-mono tracking-tighter tabular-nums text-[var(--text-color)]">
                                {formatSw(swTime)}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-8">
                            <button 
                                onClick={() => { setIsSwRunning(false); setSwTime(0); setLaps([]); }}
                                className="w-14 h-14 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--bg-secondary)] active:scale-95 transition-all"
                            >
                                <RotateCcw size={20} />
                            </button>

                            <button 
                                onClick={() => setIsSwRunning(!isSwRunning)}
                                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_var(--border-color)] border-2 border-[var(--border-color)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--border-color)] active:translate-y-[2px] transition-all ${isSwRunning ? 'bg-[var(--bg-color)] text-[var(--text-color)]' : 'bg-[#bef264] text-black'}`}
                            >
                                {isSwRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <button 
                                onClick={handleLap}
                                disabled={!isSwRunning}
                                className="w-14 h-14 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--bg-secondary)] active:scale-95 disabled:opacity-30"
                            >
                                <Flag size={20} />
                            </button>
                        </div>

                        {/* Laps */}
                        <div className="w-full max-h-[30vh] overflow-y-auto contra-card p-0">
                             <div className="sticky top-0 bg-[var(--bg-secondary)] border-b-2 border-[var(--border-color)] p-2 flex justify-between text-[10px] font-black uppercase text-[var(--text-color)]">
                                <span>Lap</span>
                                <span>Time</span>
                             </div>
                             <div className="p-2 space-y-1">
                                {laps.map((lapTime, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 border-b border-[var(--bg-secondary)] last:border-0 font-mono text-sm">
                                        <span className="text-gray-500">#{laps.length - idx}</span>
                                        <span className="font-bold text-[var(--text-color)]">{formatSw(lapTime)}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeApp;
