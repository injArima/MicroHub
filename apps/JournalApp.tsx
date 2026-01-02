import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Plus, Save, Eye, Edit2, Calendar, ChevronLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { JournalEntry, SheetConfig } from '../types';
import { syncSheet } from '../services/sheet';

interface JournalAppProps {
    onBack: () => void;
    sheetConfig: SheetConfig | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const STORAGE_KEY = 'microhub_journal_entries';

const DEFAULT_ENTRIES: JournalEntry[] = [
    {
        id: '1',
        title: 'Learning React Hooks',
        content: '# React Hooks\n\nToday I learned about **useEffect** and **useState**.\n\n- They allow functional components to have state.\n- `useEffect` handles side effects.\n\n```javascript\nconst [count, setCount] = useState(0);\n```',
        date: '28 Feb',
        tags: ['React', 'Coding']
    }
];

const JournalApp: React.FC<JournalAppProps> = ({ onBack, sheetConfig }) => {
    // Initialize from localStorage
    const [entries, setEntries] = useState<JournalEntry[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_ENTRIES;
        } catch (e) {
            return DEFAULT_ENTRIES;
        }
    });

    const [view, setView] = useState<'list' | 'editor' | 'detail'>('list');
    const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
    const [editorTitle, setEditorTitle] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Sync Logic
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, [entries]);

    const saveToCloudNow = async () => {
        if (sheetConfig) {
             setSaveStatus('saving');
             setErrorMessage('');
             try {
                await syncSheet(sheetConfig, 'Journal_Notes', entries);
                
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 3000);
             } catch (e: any) {
                 setSaveStatus('error');
                 setErrorMessage(e.message || "Save failed");
             }
        }
    }

    const handleCreateNew = () => {
        setActiveEntry(null);
        setEditorTitle('');
        setEditorContent('');
        setPreviewMode(false);
        setView('editor');
    };

    const handleViewEntry = (entry: JournalEntry) => {
        setActiveEntry(entry);
        setView('detail');
    };

    const handleEditEntry = (entry: JournalEntry) => {
        setActiveEntry(entry);
        setEditorTitle(entry.title);
        setEditorContent(entry.content);
        setPreviewMode(false);
        setView('editor');
    };

    const handleSave = () => {
        if (!editorTitle.trim()) return;

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

        const newEntry: JournalEntry = {
            id: activeEntry ? activeEntry.id : Date.now().toString(),
            title: editorTitle,
            content: editorContent,
            date: activeEntry ? activeEntry.date : dateStr,
            tags: activeEntry ? activeEntry.tags : ['Journal']
        };

        if (activeEntry) {
            setEntries(prev => prev.map(e => e.id === activeEntry.id ? newEntry : e));
        } else {
            setEntries(prev => [newEntry, ...prev]);
        }
        
        // Wait for state to update then sync
        setTimeout(() => saveToCloudNow(), 100);

        setView('list');
    };

    // Styling for markdown content
    const markdownStyles = `
        prose prose-invert max-w-none
        [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-white
        [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:text-white
        [&>p]:text-gray-300 [&>p]:leading-relaxed [&>p]:mb-4
        [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul]:text-gray-300
        [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>ol]:text-gray-300
        [&>blockquote]:border-l-4 [&>blockquote]:border-violet-400 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-400 [&>blockquote]:mb-4
        [&>pre]:bg-[#18181b] [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:mb-4 [&>pre]:overflow-x-auto [&>pre]:border [&>pre]:border-white/10
        [&>code]:font-mono [&>code]:text-sm [&>code]:bg-[#18181b] [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-violet-300
        [&_a]:text-violet-400 [&_a]:underline
    `;

    if (view === 'editor') {
        return (
            <div className="w-full min-h-screen bg-[#0f0f10] flex flex-col pb-6">
                <div className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0f10] z-10 border-b border-white/5">
                     <button onClick={() => setView('list')} className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPreviewMode(!previewMode)} 
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${previewMode ? 'bg-[#a78bfa] text-black' : 'bg-[#27272a] text-white'}`}
                        >
                            {previewMode ? <Edit2 size={16} /> : <Eye size={16} />}
                            {previewMode ? 'Edit' : 'Preview'}
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="bg-[#fde047] text-black px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2"
                        >
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-4 flex flex-col gap-4">
                     <input 
                        type="text" 
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                        placeholder="Title your thought..."
                        className="bg-transparent text-3xl font-bold text-white placeholder:text-gray-600 outline-none w-full"
                     />
                     
                     <div className="flex-1 bg-[#27272a] rounded-[24px] border border-white/5 overflow-hidden flex flex-col relative">
                        {previewMode ? (
                            <div className={`p-6 overflow-y-auto h-full ${markdownStyles}`}>
                                <ReactMarkdown>{editorContent || '*No content yet...*'}</ReactMarkdown>
                            </div>
                        ) : (
                            <textarea 
                                value={editorContent}
                                onChange={(e) => setEditorContent(e.target.value)}
                                placeholder="Write in Markdown..."
                                className="w-full h-full bg-transparent text-gray-200 p-6 outline-none resize-none font-mono text-sm leading-relaxed"
                            />
                        )}
                        {!previewMode && (
                            <div className="absolute bottom-4 right-4 text-xs text-gray-500 pointer-events-none bg-[#0f0f10]/80 px-2 py-1 rounded">
                                Markdown Supported
                            </div>
                        )}
                     </div>
                </div>
            </div>
        );
    }

    if (view === 'detail' && activeEntry) {
        return (
            <div className="w-full min-h-screen bg-[#0f0f10] flex flex-col pb-24">
                <div className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0f10] z-10 border-b border-white/5">
                     <button onClick={() => setView('list')} className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => handleEditEntry(activeEntry)} className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white">
                        <Edit2 size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <span className="text-[#a78bfa] text-sm font-semibold mb-2 block">{activeEntry.date}</span>
                    <h1 className="text-3xl font-bold text-white mb-6 leading-tight">{activeEntry.title}</h1>
                    <div className={markdownStyles}>
                         <ReactMarkdown>{activeEntry.content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="w-full min-h-screen bg-[#0f0f10] pb-24 pt-4 px-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white">Journal</h1>
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

            <div className="bg-[#a78bfa] rounded-[32px] p-6 mb-8 relative overflow-hidden group cursor-pointer" onClick={handleCreateNew}>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-black mb-1">New Entry</h2>
                    <p className="text-black/70 font-medium">Capture your daily learnings.</p>
                </div>
                <div className="absolute right-4 bottom-4 w-12 h-12 bg-black/10 rounded-full flex items-center justify-center text-black">
                    <Plus size={24} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-white font-bold text-lg">Recent Entries</h3>
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Archive</span>
                </div>

                {entries.map(entry => (
                    <div key={entry.id} onClick={() => handleViewEntry(entry)} className="bg-[#27272a] p-5 rounded-[24px] border border-white/5 active:scale-95 transition-transform cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                             <div className="flex gap-2">
                                {entry.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-white/5 text-gray-300 px-2 py-1 rounded-full uppercase tracking-wide font-bold">{tag}</span>
                                ))}
                             </div>
                             <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar size={12} />
                                {entry.date}
                             </span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{entry.title}</h4>
                        <p className="text-gray-400 text-sm line-clamp-2">
                            {entry.content.replace(/[#*`>]/g, '')}
                        </p>
                    </div>
                ))}
            </div>
             {errorMessage && (
                <p className="text-red-400 text-center text-xs mt-4 pb-4">{errorMessage}</p>
            )}
        </div>
    );
};

export default JournalApp;