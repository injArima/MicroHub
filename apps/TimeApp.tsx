
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Flag, Timer, Watch, CheckCircle, Plus, Minus } from 'lucide-react';
import { ThemeConfig } from '../types';

interface TimeAppProps {
    onBack: () => void;
    initialMode: 'timer' | 'stopwatch';
}

const TimeApp: React.FC<TimeAppProps> = ({ onBack, initialMode }) => {
    const [mode, setMode] = useState<'timer' | 'stopwatch'>(initialMode);

    // --- TIMER STATE ---
    const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 min
    const [initialTime, setInitialTime] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    
    // --- STOPWATCH STATE ---
    const [swTime, setSwTime] = useState(0);
    const [isSwRunning, setIsSwRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);

    const timerRef = useRef<number | null>(null);
    const swRef = useRef<number | null>(null);

    // --- TIMER LOGIC ---
    useEffect(() => {
        if (isTimerRunning && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        // Play sound or vibrate here if strictly necessary
                        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isTimerRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const adjustTimer = (amount: number) => {
        if (isTimerRunning) return;
        const newTime = Math.max(60, Math.min(359940, timeLeft + amount)); // Min 1 min, Max 99 hours
        setTimeLeft(newTime);
        setInitialTime(newTime);
    };

    const setPreset = (mins: number) => {
        setIsTimerRunning(false);
        setTimeLeft(mins * 60);
        setInitialTime(mins * 60);
    };

    // --- STOPWATCH LOGIC ---
    useEffect(() => {
        if (isSwRunning) {
            const startTime = Date.now() - swTime;
            swRef.current = window.setInterval(() => {
                setSwTime(Date.now() - startTime);
            }, 10); // Update every 10ms for smooth display
        } else {
            if (swRef.current) clearInterval(swRef.current);
        }
        return () => { if (swRef.current) clearInterval(swRef.current); };
    }, [isSwRunning]);

    const formatSw = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        const centis = Math.floor((ms % 1000) / 10);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
    };

    const handleLap = () => {
        setLaps(prev => [swTime, ...prev]);
    };

    // Calculate Progress Ring
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / initialTime;
    const dashoffset = circumference - (progress * circumference);

    return (
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col pb-32 pt-8 px-6">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
                    <ArrowLeft size={20} />
                </button>
                
                {/* Toggle Pill */}
                <div className="glass-card p-1 rounded-full flex gap-1">
                    <button 
                        onClick={() => setMode('timer')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'timer' ? 'bg-[var(--primary)] text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Timer
                    </button>
                    <button 
                        onClick={() => setMode('stopwatch')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'stopwatch' ? 'bg-[var(--primary)] text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        Stopwatch
                    </button>
                </div>
                
                <div className="w-10"></div> {/* Spacer for balance */}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                
                {mode === 'timer' ? (
                    <div className="flex flex-col items-center w-full animate-in zoom-in duration-300">
                        {/* Circular Progress */}
                        <div className="relative w-72 h-72 flex items-center justify-center mb-8">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="144"
                                    cy="144"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-white/5"
                                />
                                <circle
                                    cx="144"
                                    cy="144"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashoffset}
                                    className="text-[var(--primary)] transition-all duration-1000 ease-linear"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-6xl font-light font-mono tracking-tighter text-white tabular-nums">
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="text-[var(--primary)] text-xs font-bold uppercase tracking-widest mt-2">
                                    {isTimerRunning ? 'Focusing' : 'Paused'}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6 mb-8">
                            <button 
                                onClick={() => { setIsTimerRunning(false); setTimeLeft(initialTime); }}
                                className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                            >
                                <RotateCcw size={20} />
                            </button>

                            <button 
                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                                className="w-20 h-20 rounded-full btn-lime flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all"
                            >
                                {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <div className="flex flex-col gap-2">
                                <button onClick={() => adjustTimer(60)} className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10 active:scale-95">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Presets */}
                        <div className="flex gap-3">
                            {[5, 15, 25, 45].map(min => (
                                <button 
                                    key={min}
                                    onClick={() => setPreset(min)}
                                    className="px-4 py-2 rounded-xl glass-card text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-[var(--primary)]/30 transition-all"
                                >
                                    {min}m
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in zoom-in duration-300 h-full">
                        {/* Digital Display */}
                        <div className="mt-8 mb-12">
                            <div className="text-7xl font-light font-mono tracking-tighter text-white tabular-nums">
                                {formatSw(swTime)}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6 mb-8">
                            <button 
                                onClick={() => { setIsSwRunning(false); setSwTime(0); setLaps([]); }}
                                className="w-14 h-14 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                            >
                                <RotateCcw size={20} />
                            </button>

                            <button 
                                onClick={() => setIsSwRunning(!isSwRunning)}
                                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all ${isSwRunning ? 'bg-red-500 text-white shadow-red-500/30' : 'btn-lime'}`}
                            >
                                {isSwRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <button 
                                onClick={handleLap}
                                disabled={!isSwRunning}
                                className="w-14 h-14 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <Flag size={20} />
                            </button>
                        </div>

                        {/* Laps List */}
                        <div className="w-full flex-1 min-h-0 overflow-hidden relative glass-card rounded-t-[32px] border-b-0">
                            <div className="absolute inset-0 overflow-y-auto p-4 space-y-2 no-scrollbar">
                                <div className="flex justify-between text-xs text-gray-500 px-4 mb-2 font-bold uppercase tracking-wider">
                                    <span>Lap</span>
                                    <span>Split</span>
                                </div>
                                {laps.map((lapTime, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 animate-in slide-in-from-bottom-2">
                                        <span className="text-sm font-mono text-gray-400">#{laps.length - idx}</span>
                                        <span className="text-sm font-mono text-white tabular-nums">{formatSw(lapTime)}</span>
                                    </div>
                                ))}
                                {laps.length === 0 && (
                                    <div className="text-center text-gray-600 text-xs mt-10 italic">
                                        No laps recorded
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeApp;
