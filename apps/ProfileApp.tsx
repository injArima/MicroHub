import React, { useState } from 'react';
import { ArrowLeft, Database, CheckCircle, XCircle, Loader2, Link, FileSpreadsheet, Key, Server, User, Trash2, AlertTriangle } from 'lucide-react';
import { SheetConfig } from '../types';
import { checkSheetStatus, setupNewUser, loginUser, wipeAndReset, saveConfig, disconnectSheet } from '../services/sheet';

interface ProfileAppProps {
    config: SheetConfig | null;
    onConnect: (config: SheetConfig) => void;
    onDisconnect: () => void;
    onBack: () => void;
}

type SetupState = 'INPUT_DETAILS' | 'CHECKING' | 'NEW_USER_FORM' | 'RETURNING_USER_LOGIN' | 'SHOW_NEW_KEY' | 'WIPE_CONFIRM';

const ProfileApp: React.FC<ProfileAppProps> = ({ config, onConnect, onDisconnect, onBack }) => {
    // Input State
    const [scriptUrl, setScriptUrl] = useState('');
    const [sheetId, setSheetId] = useState('');
    
    // Auth State
    const [userName, setUserName] = useState('');
    const [authKey, setAuthKey] = useState('');
    const [detectedUser, setDetectedUser] = useState('');
    
    // UI State
    const [viewState, setViewState] = useState<SetupState>('INPUT_DETAILS');
    const [generatedKey, setGeneratedKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInitialConnect = async () => {
        if (!scriptUrl.trim() || !sheetId.trim()) {
            setError('Please enter both Script URL and Sheet ID');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            const status = await checkSheetStatus(scriptUrl, sheetId);
            if (status.status === 'new_user') {
                setViewState('NEW_USER_FORM');
            } else {
                setDetectedUser(status.userName || 'Unknown User');
                setViewState('RETURNING_USER_LOGIN');
            }
        } catch (e) {
            setError('Connection failed. Check permissions or URL.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetup = async () => {
        if (!userName.trim()) return;
        setIsLoading(true);
        try {
            const res = await setupNewUser(scriptUrl, sheetId, userName);
            setGeneratedKey(res.rawKey);
            setViewState('SHOW_NEW_KEY');
        } catch (e) {
            setError('Setup failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!authKey.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const success = await loginUser(scriptUrl, sheetId, authKey);
            if (success) {
                completeConnection(authKey, detectedUser);
            } else {
                setError('Invalid Access Key.');
            }
        } catch (e) {
            setError('Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWipe = async () => {
        // Trigger wipe
        setIsLoading(true);
        try {
            // We reuse the new user setup flow but call the wipe endpoint
            // We need a name for the fresh start
            const res = await wipeAndReset(scriptUrl, sheetId, detectedUser || "Reset User");
            setGeneratedKey(res.rawKey);
            setViewState('SHOW_NEW_KEY');
        } catch (e) {
            setError('Wipe failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const completeConnection = (key: string, name?: string) => {
        const newConfig: SheetConfig = {
            scriptUrl,
            sheetId,
            authKey: key,
            connectedAt: new Date().toISOString()
        };
        saveConfig(newConfig);
        onConnect(newConfig);
    };

    const handleKeySaved = () => {
        completeConnection(generatedKey, userName || detectedUser);
    };

    const handleDisconnect = () => {
        disconnectSheet();
        onDisconnect();
        setScriptUrl('');
        setSheetId('');
        setAuthKey('');
        setUserName('');
        setViewState('INPUT_DETAILS');
    };

    return (
        <div className="w-full min-h-screen bg-[#0f0f10] flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-[#0f0f10] z-10 border-b border-white/5">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white hover:bg-[#3f3f46] transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Settings</h1>
                <div className="w-10" /> 
            </div>

            <div className="flex-1 p-6 flex flex-col items-center max-w-sm mx-auto w-full">
                
                {/* Hero Icon */}
                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mb-6 shadow-2xl transition-all ${config ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[#27272a] text-gray-400 border border-white/5'}`}>
                    <FileSpreadsheet size={40} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    {config ? 'Database Syncing' : 'Google Sheets DB'}
                </h2>
                <p className="text-gray-400 text-center text-sm mb-10 leading-relaxed">
                    {config 
                        ? 'Your app is actively syncing tasks, notes, and inventory to your spreadsheet.' 
                        : 'Connect a Google Sheet to enable multi-device sync and detailed data management.'}
                </p>

                {config ? (
                    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#27272a] p-5 rounded-[24px] border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <Database size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status</p>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        Online <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-[#18181b] p-3 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Sheet ID</p>
                                    <p className="text-white font-mono text-xs truncate">{config.sheetId}</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleDisconnect}
                            disabled={isLoading}
                            className="w-full py-4 rounded-[24px] border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <XCircle size={18} /> Disconnect
                        </button>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        
                        {/* 1. INITIAL CONNECTION FORM */}
                        {viewState === 'INPUT_DETAILS' && (
                            <>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 ml-4 uppercase tracking-wider">Web App URL</label>
                                        <div className="bg-[#27272a] p-3 rounded-[24px] border border-white/5 flex items-center gap-3">
                                            <Server size={18} className="text-gray-500" />
                                            <input 
                                                value={scriptUrl} 
                                                onChange={e => setScriptUrl(e.target.value)}
                                                className="bg-transparent text-white outline-none text-sm w-full"
                                                placeholder="https://script.google.com/..." 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 ml-4 uppercase tracking-wider">Sheet ID</label>
                                        <div className="bg-[#27272a] p-3 rounded-[24px] border border-white/5 flex items-center gap-3">
                                            <Link size={18} className="text-gray-500" />
                                            <input 
                                                value={sheetId} 
                                                onChange={e => setSheetId(e.target.value)}
                                                className="bg-transparent text-white outline-none text-sm w-full"
                                                placeholder="Spreadsheet ID" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleInitialConnect} disabled={isLoading} className="w-full h-14 bg-white text-black font-bold rounded-full flex items-center justify-center gap-2 hover:bg-gray-200">
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Connect'}
                                </button>
                            </>
                        )}

                        {/* 2. NEW USER SETUP */}
                        {viewState === 'NEW_USER_FORM' && (
                            <div className="animate-in slide-in-from-right-8">
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-2">
                                        <User size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold">New Database Detected</h3>
                                    <p className="text-xs text-gray-500">Let's set up your profile.</p>
                                </div>
                                <div className="space-y-4">
                                     <div className="bg-[#27272a] p-3 rounded-[24px] border border-white/5 flex items-center gap-3">
                                        <User size={18} className="text-gray-500" />
                                        <input 
                                            value={userName} 
                                            onChange={e => setUserName(e.target.value)}
                                            className="bg-transparent text-white outline-none text-sm w-full"
                                            placeholder="Enter your name" 
                                        />
                                    </div>
                                    <button onClick={handleSetup} disabled={isLoading} className="w-full h-14 bg-blue-500 text-white font-bold rounded-full flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Create Profile'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. RETURNING USER LOGIN OR WIPE */}
                        {viewState === 'RETURNING_USER_LOGIN' && (
                             <div className="animate-in slide-in-from-right-8">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-bold">Welcome Back, {detectedUser}</h3>
                                    <p className="text-xs text-gray-500">Enter your 6-digit key to sync.</p>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="bg-[#27272a] p-3 rounded-[24px] border border-white/5 flex items-center gap-3">
                                        <Key size={18} className="text-gray-500" />
                                        <input 
                                            value={authKey} 
                                            onChange={e => setAuthKey(e.target.value)}
                                            className="bg-transparent text-white outline-none text-sm w-full"
                                            placeholder="6-digit Master Key" 
                                            type="password"
                                        />
                                    </div>
                                    
                                    <button onClick={handleLogin} disabled={isLoading || !authKey} className="w-full h-14 bg-white text-black font-bold rounded-full flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Sync Data'}
                                    </button>

                                    <div className="pt-6 border-t border-white/5">
                                        <button onClick={() => setViewState('WIPE_CONFIRM')} className="w-full py-3 text-xs font-bold text-red-500 flex items-center justify-center gap-2 hover:bg-red-500/10 rounded-full transition-colors">
                                            <Trash2 size={14} /> Wipe Sheet & Start Fresh
                                        </button>
                                    </div>
                                </div>
                             </div>
                        )}

                         {/* 4. WIPE CONFIRMATION */}
                         {viewState === 'WIPE_CONFIRM' && (
                            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-[32px] text-center animate-in zoom-in-95">
                                <AlertTriangle size={32} className="text-red-500 mx-auto mb-4" />
                                <h3 className="text-red-400 font-bold text-lg mb-2">Are you sure?</h3>
                                <p className="text-gray-400 text-xs mb-6">This will delete ALL data in the Google Sheet and generate a new access key. This cannot be undone.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setViewState('RETURNING_USER_LOGIN')} className="flex-1 py-3 bg-[#27272a] rounded-full text-xs font-bold text-white">Cancel</button>
                                    <button onClick={handleWipe} className="flex-1 py-3 bg-red-500 rounded-full text-xs font-bold text-white hover:bg-red-600">Yes, Wipe It</button>
                                </div>
                            </div>
                         )}

                        {/* 5. DISPLAY GENERATED KEY (Success State) */}
                        {viewState === 'SHOW_NEW_KEY' && (
                            <div className="bg-[#27272a] p-6 rounded-[24px] border border-green-500/20 flex flex-col items-center text-center animate-in zoom-in-95">
                                <Key size={32} className="text-green-500 mb-4" />
                                <h3 className="text-white font-bold text-lg mb-2">Master Access Key</h3>
                                <p className="text-gray-400 text-xs mb-6">Write this down. You will need it to login from other devices. We do not store this key unhashed.</p>
                                
                                <div className="bg-black/40 p-4 rounded-xl w-full mb-6 border border-white/10">
                                    <span className="text-3xl font-mono text-green-400 font-bold tracking-widest">{generatedKey}</span>
                                </div>

                                <button 
                                    onClick={handleKeySaved}
                                    className="w-full h-12 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-colors"
                                >
                                    I have saved this key
                                </button>
                            </div>
                        )}

                        {error && (
                            <p className="text-red-400 text-xs text-center flex items-center justify-center gap-1 mt-4 animate-in slide-in-from-bottom-2">
                                <XCircle size={12} /> {error}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileApp;