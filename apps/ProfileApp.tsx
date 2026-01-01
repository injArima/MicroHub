import React, { useState } from 'react';
import { ArrowLeft, Database, CheckCircle, XCircle, Loader2, Link, FileSpreadsheet, Key, Server } from 'lucide-react';
import { SheetConfig } from '../types';
import { initializeConnection, verifyConnection, saveConfig, disconnectSheet } from '../services/sheet.ts';

interface ProfileAppProps {
    config: SheetConfig | null;
    onConnect: (config: SheetConfig) => void;
    onDisconnect: () => void;
    onBack: () => void;
}

const ProfileApp: React.FC<ProfileAppProps> = ({ config, onConnect, onDisconnect, onBack }) => {
    // Form State
    const [scriptUrl, setScriptUrl] = useState('');
    const [sheetId, setSheetId] = useState('');
    const [authKey, setAuthKey] = useState('');
    
    // UI State
    const [step, setStep] = useState<'INPUT' | 'SHOW_KEY' | 'ENTER_KEY'>('INPUT');
    const [generatedKey, setGeneratedKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInitialize = async () => {
        if (!scriptUrl.trim() || !sheetId.trim()) {
            setError('Please enter both Script URL and Sheet ID');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            const result = await initializeConnection(scriptUrl, sheetId);
            
            if (result.status === 'created' && result.authKey) {
                setGeneratedKey(result.authKey);
                setStep('SHOW_KEY');
            } else if (result.status === 'existing') {
                setStep('ENTER_KEY');
            } else {
                setError(result.message || 'Connection failed');
            }
        } catch (e) {
            setError('Could not connect. Verify Script URL permissions.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const isValid = await verifyConnection(scriptUrl, sheetId, authKey);
            if (isValid) {
                const newConfig: SheetConfig = {
                    scriptUrl,
                    sheetId,
                    authKey,
                    connectedAt: new Date().toISOString()
                };
                saveConfig(newConfig);
                onConnect(newConfig);
            } else {
                setError('Invalid Authenticator Key');
            }
        } catch (e) {
            setError('Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeySaved = () => {
        // User confirmed they saved the new key
        const newConfig: SheetConfig = {
            scriptUrl,
            sheetId,
            authKey: generatedKey,
            connectedAt: new Date().toISOString()
        };
        saveConfig(newConfig);
        onConnect(newConfig);
    };

    const handleDisconnect = () => {
        disconnectSheet();
        onDisconnect();
        // Reset local state
        setScriptUrl('');
        setSheetId('');
        setAuthKey('');
        setStep('INPUT');
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
                    {config ? 'Database Connected' : 'Connect Storage'}
                </h2>
                <p className="text-gray-400 text-center text-sm mb-10 leading-relaxed">
                    {config 
                        ? 'Your app is currently syncing data with your Google Sheet.' 
                        : 'Link a Google Sheet to store your tasks, journal entries, and app data in the cloud.'}
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
                                        Active Sync <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-[#18181b] p-3 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Sheet ID</p>
                                    <p className="text-white font-mono text-xs truncate">{config.sheetId}</p>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                                    <span>Connected</span>
                                    <span>{new Date(config.connectedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleDisconnect}
                            disabled={isLoading}
                            className="w-full py-4 rounded-[24px] border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                            Disconnect Database
                        </button>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        
                        {step === 'INPUT' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-wider">Web App Script URL</label>
                                    <div className="bg-[#27272a] p-2 rounded-[24px] border border-white/5 focus-within:border-green-500/50 transition-colors flex items-center">
                                        <div className="w-10 h-10 flex items-center justify-center text-gray-500">
                                            <Server size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={scriptUrl}
                                            onChange={(e) => setScriptUrl(e.target.value)}
                                            placeholder="https://script.google.com/..."
                                            className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-gray-600 h-10 pr-4"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-600 ml-4">The Web App URL from your deployed Google Apps Script.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-wider">Google Sheet ID</label>
                                    <div className="bg-[#27272a] p-2 rounded-[24px] border border-white/5 focus-within:border-green-500/50 transition-colors flex items-center">
                                        <div className="w-10 h-10 flex items-center justify-center text-gray-500">
                                            <Link size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={sheetId}
                                            onChange={(e) => setSheetId(e.target.value)}
                                            placeholder="Spreadsheet ID"
                                            className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-gray-600 h-10 pr-4"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleInitialize}
                                    disabled={isLoading}
                                    className="w-full h-14 bg-white text-black font-bold rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Connect & Initialize"}
                                </button>
                            </>
                        )}

                        {step === 'SHOW_KEY' && (
                            <div className="bg-[#27272a] p-6 rounded-[24px] border border-green-500/20 flex flex-col items-center text-center animate-in zoom-in-95">
                                <Key size={32} className="text-green-500 mb-4" />
                                <h3 className="text-white font-bold text-lg mb-2">Authenticator Key</h3>
                                <p className="text-gray-400 text-xs mb-6">Save this key immediately. You will need it to connect other devices to this database.</p>
                                
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

                        {step === 'ENTER_KEY' && (
                            <div className="space-y-4 animate-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 ml-4 uppercase tracking-wider">Enter Authenticator Key</label>
                                    <div className="bg-[#27272a] p-2 rounded-[24px] border border-white/5 focus-within:border-green-500/50 transition-colors flex items-center">
                                        <div className="w-10 h-10 flex items-center justify-center text-gray-500">
                                            <Key size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={authKey}
                                            onChange={(e) => setAuthKey(e.target.value)}
                                            placeholder="6-digit key"
                                            className="flex-1 bg-transparent text-white outline-none text-sm placeholder:text-gray-600 h-10 pr-4"
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleLogin}
                                    disabled={isLoading || !authKey}
                                    className="w-full h-14 bg-white text-black font-bold rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Authenticate"}
                                </button>
                            </div>
                        )}

                        {error && (
                            <p className="text-red-400 text-xs text-center flex items-center justify-center gap-1 mt-4">
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