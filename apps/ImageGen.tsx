
import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ImageGenProps {
    onBack: () => void;
}

const ImageGen: React.FC<ImageGenProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if(!prompt) return;
        setIsGenerating(true);
        setTimeout(() => {
            const seed = encodeURIComponent(prompt);
            setGeneratedUrl(`https://picsum.photos/seed/${seed}/800/800`); 
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="w-full max-w-2xl mx-auto min-h-screen flex flex-col pb-32 pt-8 px-6 bg-white">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors">
                    <ArrowLeft size={20} strokeWidth={2.5}/>
                </button>
                <div className="flex items-center gap-2 border-2 border-black px-3 py-1 rounded-full bg-pink-300">
                    <span className="text-xs font-black text-black uppercase tracking-wider">Art Studio</span>
                </div>
            </div>

            <div className="contra-card p-2 relative overflow-hidden aspect-square flex items-center justify-center mb-6 bg-gray-50">
                {generatedUrl ? (
                        <img src={generatedUrl} alt="Generated" className="w-full h-full object-cover rounded-lg border-2 border-black grayscale contrast-125" />
                ) : (
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-white border-2 border-black rounded-full mx-auto mb-4 flex items-center justify-center text-black shadow-[4px_4px_0px_0px_#000]">
                            <ImageIcon size={32} />
                        </div>
                        <p className="text-black text-sm font-bold uppercase">Ready to visualize.</p>
                    </div>
                )}
                
                {isGenerating && (
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10">
                        <Sparkles className="text-black w-10 h-10 animate-spin mb-4" />
                        <span className="font-black text-black uppercase">Rendering...</span>
                    </div>
                )}
            </div>

            <div className="mt-auto">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="DESCRIBE SCENE..."
                        className="w-full contra-card p-5 bg-white text-black outline-none resize-none h-32 text-sm mb-4 font-bold uppercase placeholder:text-gray-300"
                    />
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full py-4 rounded-full bg-black text-white font-black text-sm border-2 border-black hover:shadow-[4px_4px_0px_0px_#ccc] transition-all disabled:opacity-50 uppercase"
                    >
                        Generate Output
                    </button>
            </div>
        </div>
    );
};

export default ImageGen;
