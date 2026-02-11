
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Eye, Edit2, Loader2, PenTool } from 'lucide-react';
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
        title: 'Initial Log',
        content: '# System Start\n\nAll systems nominal.',
        date: '28 Feb',
        tags: ['LOG']
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
            title: title || 'UNTITLED',
            content: content,
            date: activeEntry?.date || new Date().toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}),
            tags: activeEntry?.tags || ['NOTE']
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
        setIsPreview(false);
        setView('editor');
    };

    if (view === 'editor') {
        return (
            <div className="w-full max-w-4xl mx-auto min-h-screen pb-6 flex flex-col pt-8 px-6 bg-[var(--bg-color)]">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setView('list')} className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--secondary)] hover:text-[var(--text-inverted)] transition-colors">
                        <ArrowLeft size={20} strokeWidth={2.5}/>
                    </button>
                    
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setIsPreview(!isPreview)} 
                            className={`w-10 h-10 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center transition-all ${isPreview ? 'bg-[var(--secondary)] text-[var(--text-inverted)]' : 'bg-[var(--bg-color)] text-[var(--text-color)]'}`}
                        >
                            {isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={handleSave} className="contra-btn px-6 py-2 h-10 text-xs">
                            <Save size={14} className="mr-2"/> SAVE
                        </button>
                    </div>
                </div>
                
                <input 
                    className="bg-transparent text-3xl font-black text-[var(--text-color)] placeholder:text-gray-400 outline-none w-full mb-6 uppercase tracking-tight"
                    placeholder="TITLE..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                
                <div className="flex-1 contra-card p-0 overflow-hidden relative flex flex-col min-h-[50vh]">
                    {isPreview ? (
                        <div className="flex-1 p-6 overflow-y-auto prose prose-neutral max-w-none">
                            <ReactMarkdown>{content}</ReactMarkdown>
                            {!content && <p className="text-gray-400 italic">No content...</p>}
                        </div>
                    ) : (
                        <textarea 
                            className="flex-1 w-full h-full p-6 bg-transparent text-[var(--text-color)] outline-none resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400"
                            placeholder="START TYPING..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto min-h-screen pb-32 pt-10 px-6 flex flex-col bg-[var(--bg-color)]">
            <div className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="w-10 h-10 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center text-[var(--text-color)] hover:bg-[var(--secondary)] hover:text-[var(--text-inverted)] transition-colors">
                    <ArrowLeft size={20} strokeWidth={2.5}/>
                </button>
                {saveStatus === 'saving' && <Loader2 size={16} className="animate-spin text-[var(--text-color)]" />}
            </div>

            <div className="mb-8 border-b-2 border-[var(--border-color)] pb-4">
                <h1 className="text-4xl font-black text-[var(--text-color)] uppercase tracking-tighter">Daily<br/>Log</h1>
            </div>

            <div onClick={() => openEditor()} className="contra-btn-outline w-full py-4 mb-8 flex items-center justify-center gap-2 cursor-pointer bg-[var(--secondary)] text-[var(--text-inverted)] border-[var(--border-color)] hover:opacity-90">
                <Plus size={20} /> <span className="font-black">NEW ENTRY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map(entry => (
                    <div key={entry.id} onClick={() => openEditor(entry)} className="contra-card contra-card-hover p-5 cursor-pointer flex flex-col h-full min-h-[200px]">
                        <div className="flex justify-between mb-4 border-b-2 border-[var(--bg-secondary)] pb-2">
                            <span className="text-[10px] bg-[var(--secondary)] text-[var(--text-inverted)] px-2 py-0.5 rounded-sm uppercase font-bold">{entry.tags[0]}</span>
                            <span className="text-xs font-mono font-bold text-gray-500">{entry.date}</span>
                        </div>
                        <h3 className="text-[var(--text-color)] font-black mb-2 text-xl leading-tight uppercase truncate">{entry.title}</h3>
                        <div className="text-gray-600 text-xs line-clamp-4 leading-relaxed font-mono opacity-80 flex-1">
                             <ReactMarkdown allowedElements={['p', 'strong', 'em']} unwrapDisallowed={true}>
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
