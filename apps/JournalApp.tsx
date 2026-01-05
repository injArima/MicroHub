import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Eye, Edit2, Calendar, ChevronLeft, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { JournalEntry, SheetConfig } from '../types';
import { syncSheet } from '../services/sheet';

interface JournalAppProps {
    onBack: () => void;
    sheetConfig: SheetConfig | null;
}

const STORAGE_KEY = 'microhub_journal_entries';
const DEFAULT_ENTRIES: JournalEntry[] = [
    {
        id: '1',
        title: 'Reflections',
        content: '# Daily Reflection\n\nToday was a day of focus. I prioritized my mental clarity over noise.\n\n- [x] Morning meditation\n- [ ] Reading',
        date: '28 Feb',
        tags: ['Mindset']
    }
];

const JournalApp: React.FC<JournalAppProps> = ({ onBack, sheetConfig }) => {
    const [entries, setEntries] = useState<JournalEntry[]>(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '') || DEFAULT_ENTRIES; } 
        catch { return DEFAULT_ENTRIES; }
    });
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPreview, setIsPreview] = useState(false);

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, [entries]);

    const handleSave = async () => {
        const newEntry: JournalEntry = {
            id: activeEntry?.id || Date.now().toString(),
            title: title || 'Untitled',
            content: content,
            date: activeEntry?.date || new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}),
            tags: activeEntry?.tags || ['Note']
        };
        
        setEntries(prev => activeEntry ? prev.map(e => e.id === activeEntry.id ? newEntry : e) : [newEntry, ...prev]);
        setView('list');
        
        if(sheetConfig) {
            setSaveStatus('saving');
            try { await syncSheet(sheetConfig, 'Journal_Notes', [newEntry, ...entries.filter(e => e.id !== newEntry.id)]); setSaveStatus('saved'); }
            catch { setSaveStatus('idle'); }
        }
    };

    const openEditor = (entry?: JournalEntry) => {
        setActiveEntry(entry || null);
        setTitle(entry?.title || '');
        setContent(entry?.content || '');
        // Open in preview mode if entry exists, otherwise edit mode
        setIsPreview(!!entry);
        setView('editor');
    };

    if (view === 'editor') {
        return (
            <div className="w-full min-h-screen pb-6 flex flex-col pt-8 px-6">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setView('list')} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
                        <ArrowLeft size={20} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setIsPreview(!isPreview)} 
                            className={`w-10 h-10 rounded-full glass-card flex items-center justify-center transition-colors ${isPreview ? 'bg-[#d9f99d] text-black' : 'text-white hover:bg-white/10'}`}
                        >
                            {isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={handleSave} className="btn-lime px-6 py-2 rounded-full font-bold text-xs flex items-center gap-2 h-10">
                            <Save size={14} /> Save
                        </button>
                    </div>
                </div>
                
                <input 
                    className="bg-transparent text-3xl font-light text-white placeholder:text-gray-600 outline-none w-full mb-6"
                    placeholder="Title..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                
                <div className="flex-1 glass-card rounded-[24px] overflow-hidden relative flex flex-col">
                    {isPreview ? (
                        <div className="flex-1 p-6 overflow-y-auto prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{content}</ReactMarkdown>
                            {!content && <p className="text-gray-600 italic">Nothing to preview...</p>}
                        </div>
                    ) : (
                        <textarea 
                            className="flex-1 w-full h-full p-6 bg-transparent text-gray-300 outline-none resize-none font-light leading-relaxed text-sm placeholder:text-gray-700"
                            placeholder="Write your thoughts (Markdown supported)..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen pb-32 pt-8 px-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-white/10">
                    <ArrowLeft size={20} />
                </button>
                {saveStatus === 'saving' && <Loader2 size={16} className="animate-spin text-[#d9f99d]" />}
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-light text-white mb-2">Daily<br/><span className="font-bold text-[#d9f99d]">Journal</span></h1>
            </div>

            <div onClick={() => openEditor()} className="bg-[#d9f99d] rounded-[28px] p-6 mb-8 relative overflow-hidden group cursor-pointer transition-transform active:scale-95">
                <h2 className="text-xl font-bold text-black mb-1">New Entry</h2>
                <p className="text-black/70 text-xs font-medium">Write something for today.</p>
                <div className="absolute right-4 bottom-4 w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-black">
                    <Plus size={20} />
                </div>
            </div>

            <div className="space-y-3">
                {entries.map(entry => (
                    <div key={entry.id} onClick={() => openEditor(entry)} className="glass-card p-5 rounded-[24px] cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="flex justify-between mb-2">
                            <span className="text-[10px] bg-white/5 text-[#d9f99d] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">{entry.tags[0]}</span>
                            <span className="text-xs text-gray-500">{entry.date}</span>
                        </div>
                        <h3 className="text-white font-bold mb-1">{entry.title}</h3>
                        <div className="text-gray-400 text-xs line-clamp-2 leading-relaxed opacity-70">
                             <ReactMarkdown 
                                components={{
                                    p: ({node, ...props}) => <span className="mr-1" {...props} />,
                                    h1: ({node, ...props}) => <span className="font-bold mr-1" {...props} />,
                                    h2: ({node, ...props}) => <span className="font-bold mr-1" {...props} />,
                                    h3: ({node, ...props}) => <span className="font-bold mr-1" {...props} />,
                                    li: ({node, ...props}) => <span className="mr-1" {...props} />,
                                }}
                                allowedElements={['p', 'h1', 'h2', 'h3', 'li', 'strong', 'em', 'span']}
                                unwrapDisallowed={true}
                             >
                                {entry.content}
                             </ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JournalApp;