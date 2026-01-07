
import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ImageGenProps {
    onBack: () => void;
}

const ImageGen: React.FC<ImageGenProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const container = useRef(null);

    const handleGenerate = async () => {
        if(!prompt) return;
        setIsGenerating(true);
        setTimeout(() => {
            const seed = encodeURIComponent(prompt);
            setGeneratedUrl(`https://picsum.photos/seed/${seed}/800/800`); 
            setIsGenerating(false);
        }, 2000);
    };
    
    // Pulse animation while generating
    useGSAP(() => {
        if(isGenerating) {
            gsap.to('.generating-pulse', {
                scale: 1.05,
                opacity: 0.8,
                duration: 0.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }, { scope: container, dependencies: [isGenerating] });

    return (
        <div ref={container} className="w-full max-w-2xl mx-auto min-h-screen flex flex-col pb-32 pt-8 px-6">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#fca5a5] animate-pulse"></span>
                    <span className="text-xs font-bold text-[#fca5a5] uppercase tracking-wider">Studio</span>
                </div>
            </div>

            <div className="generating-pulse glass-card rounded-[32px] p-2 border border-white/10 relative overflow-hidden aspect-square flex items-center justify-center mb-6 group transition-all duration-500">
                {generatedUrl ? (
                        <img src={generatedUrl} alt="Generated" className="w-full h-full object-cover rounded-[28px] animate-in fade-in zoom-in duration-500" />
                ) : (
                    <div className="text-center p-8">
                        <div className="w-16 h-16 bg-[#fca5a5]/10 rounded-full mx-auto mb-4 flex items-center justify-center text-[#fca5a5]">
                            <ImageIcon size={24} />
                        </div>
                        <p className="text-gray-500 text-sm">Visualize your ideas.</p>
                    </div>
                )}
                
                {isGenerating && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10 rounded-[28px]">
                        <Sparkles className="text-[#fca5a5] w-8 h-8 animate-spin mb-2" />
                        <p className="text-[#fca5a5] text-xs font-bold tracking-widest uppercase">Dreaming...</p>
                    </div>
                )}
            </div>

            <div className="mt-auto">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A futuristic city..."
                        className="w-full glass-card rounded-[24px] p-5 bg-transparent text-white outline-none resize-none h-32 text-sm mb-4 focus:border-[#fca5a5]/50 transition-colors focus:ring-1 ring-[#fca5a5]/20"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full py-4 rounded-full bg-[#fca5a5] text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_20px_rgba(252,165,165,0.3)]"
                    >
                        Generate Art
                    </button>
            </div>
        </div>
    );
};

export default ImageGen;
