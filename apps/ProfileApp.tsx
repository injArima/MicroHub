
import React, { useState } from 'react';
import { Database, Loader2, FileSpreadsheet, Server, User as UserIcon, Key, CheckCircle, AlertTriangle, RotateCcw, Trash2, ArrowRight, Palette, Moon, Sun } from 'lucide-react';
import { SheetConfig, ThemeConfig } from '../types';
import { saveConfig, disconnectSheet, setupNewUser, checkSheetStatus, loginUser, resetSheet } from '../services/sheet';

interface ProfileAppProps {
    config: SheetConfig | null;
    onConnect: (config: SheetConfig) => void;
    onDisconnect: () => void;
    theme: ThemeConfig;
    onUpdateTheme: (theme: ThemeConfig) => void;
}

type ConnectionStep = 'input' | 'auth_returning' | 'auth_new_success' | 'onboarding';

const ProfileApp: React.FC<ProfileAppProps> = ({ config, onConnect, onDisconnect, theme, onUpdateTheme }) => {
    // State
    const [step, setStep] = useState<ConnectionStep>('input');
    const [scriptUrl, setScriptUrl] = useState('');
    const [sheetId, setSheetId] = useState('');
    const [accessKey, setAccessKey] = useState('');
    const [generatedKey, setGeneratedKey] = useState('');
    const [userName, setUserName] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // ... (Keep existing logic functions: handleCheckConnection, performSetup, handleLogin, handleReset, finishSetup) ...
    const handleCheckConnection = async () => {
        if (!scriptUrl.trim() || !sheetId.trim()) { setErrorMsg("Enter URL and ID"); return; }
        setIsLoading(true); setErrorMsg('');
        try {
            const statusRes = await checkSheetStatus(scriptUrl, sheetId);
            if (statusRes.status === 'returning_user') {
                if (statusRes.userName) localStorage.setItem('microhub_username', statusRes.userName);
                setStep('auth_returning');
            } else if (statusRes.status === 'new_user') {
                setStep('onboarding');
            } else {
                setErrorMsg(statusRes.message || "Connection failed");
            }
        } catch (e: any) { setErrorMsg(e.message); } finally { setIsLoading(false); }
    };

    const performSetup = async () => {
        if (!userName.trim()) { setErrorMsg("Enter name"); return; }
        setIsLoading(true);
        try {
            const setupRes = await setupNewUser(scriptUrl, sheetId, userName);
            if (setupRes.status === 'success' && setupRes.rawKey) {
                localStorage.setItem('microhub_username', userName);
                setGeneratedKey(setupRes.rawKey);
                setStep('auth_new_success');
                const newConfig: SheetConfig = { scriptUrl, sheetId, authKey: setupRes.rawKey, connectedAt: new Date().toISOString() };
                saveConfig(newConfig);
            } else { setErrorMsg(setupRes.message || "Setup Failed"); }
        } catch (e: any) { setErrorMsg(e.message); } finally { setIsLoading(false); }
    };

    const handleLogin = async () => {
        if (!accessKey.trim()) return;
        setIsLoading(true);
        try {
            const loginRes = await loginUser(scriptUrl, sheetId, accessKey);
            if (loginRes.status === 'success') {
                const newConfig: SheetConfig = { scriptUrl, sheetId, authKey: accessKey, connectedAt: new Date().toISOString() };
                saveConfig(newConfig);
                onConnect(newConfig);
            } else { setErrorMsg(loginRes.message || "Invalid Key"); }
        } catch (e: any) { setErrorMsg(e.message); } finally { setIsLoading(false); }
    };

    const handleReset = async () => {
        setIsLoading(true);
        try {
            const resetRes = await resetSheet(scriptUrl, sheetId);
            if (resetRes.status === 'success') {
                setShowResetConfirm(false); setAccessKey(''); setUserName(''); setStep('onboarding');
            } else { setErrorMsg(resetRes.message || "Reset failed"); }
        } catch (e: any) { setErrorMsg(e.message); } finally { setIsLoading(false); }
    };

    const finishSetup = () => {
        if (generatedKey) {
            const newConfig: SheetConfig = { scriptUrl, sheetId, authKey: generatedKey, connectedAt: new Date().toISOString() };
            onConnect(newConfig);
        }
    };

    const handleColorChange = (key: keyof ThemeConfig, value: string | boolean) => {
        onUpdateTheme({ ...theme, [key]: value });
    };

    return (
        <div className="w-full max-w-md mx-auto min-h-screen pb-32 pt-12 px-6 flex flex-col bg-[var(--bg-color)]">
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full border-2 border-[var(--border-color)] flex items-center justify-center mb-4 bg-[var(--bg-secondary)] shadow-[4px_4px_0px_0px_var(--border-color)]">
                    {config ? <CheckCircle size={40} className="text-[var(--text-color)]" /> : <UserIcon size={40} className="text-[var(--text-color)]" />}
                </div>
                <h1 className="text-3xl font-black text-[var(--text-color)] uppercase tracking-tighter">System<br/>Config</h1>
            </div>

            {/* Customization */}
            <div className="contra-card p-6 mb-6">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-[var(--border-color)] pb-2">
                    <Palette size={16} className="text-[var(--text-color)]" />
                    <h2 className="text-sm font-black text-[var(--text-color)] uppercase">Appearance</h2>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[var(--text-color)] uppercase">Accent</span>
                    <div className="relative w-8 h-8 rounded-full border-2 border-[var(--border-color)] overflow-hidden shadow-[2px_2px_0px_0px_var(--border-color)]">
                        <input 
                            type="color" 
                            value={theme.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-[var(--text-color)] uppercase">Dark Mode</span>
                     <button 
                        onClick={() => handleColorChange('isDarkMode', !theme.isDarkMode)}
                        className={`w-12 h-6 rounded-full border-2 border-[var(--border-color)] relative transition-colors ${theme.isDarkMode ? 'bg-[var(--primary)]' : 'bg-[var(--bg-secondary)]'}`}
                     >
                         <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--text-color)] transition-all ${theme.isDarkMode ? 'left-[26px]' : 'left-[2px]'} flex items-center justify-center`}>
                             {theme.isDarkMode ? <Moon size={8} className="text-[var(--bg-color)]"/> : <Sun size={8} className="text-[var(--bg-color)]"/>}
                         </div>
                     </button>
                </div>
            </div>

            <div className="contra-card p-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-[var(--border-color)] pb-2">
                    <Database size={16} className="text-[var(--text-color)]" />
                    <h2 className="text-sm font-black text-[var(--text-color)] uppercase">Data Link</h2>
                </div>

                {errorMsg && (
                    <div className="bg-red-100 border-2 border-red-500 p-2 rounded-lg mb-4 flex items-center gap-2 text-red-600 text-xs font-bold">
                        <AlertTriangle size={14} />
                        {errorMsg}
                    </div>
                )}

                {!config ? (
                    <>
                        {step === 'input' && (
                            <div className="space-y-4 animate-in fade-in">
                                <p className="text-left text-[var(--text-color)] text-xs font-bold uppercase">Connect Google Sheet</p>
                                <div className="space-y-3">
                                    <div className="contra-input flex items-center gap-2">
                                        <Server size={14} className="text-[var(--text-color)]" />
                                        <input 
                                            value={scriptUrl} 
                                            onChange={e => setScriptUrl(e.target.value)}
                                            className="bg-transparent outline-none text-xs w-full font-mono placeholder:text-gray-400"
                                            placeholder="SCRIPT URL..." 
                                        />
                                    </div>
                                    <div className="contra-input flex items-center gap-2">
                                        <FileSpreadsheet size={14} className="text-[var(--text-color)]" />
                                        <input 
                                            value={sheetId} 
                                            onChange={e => setSheetId(e.target.value)}
                                            className="bg-transparent outline-none text-xs w-full font-mono placeholder:text-gray-400"
                                            placeholder="SHEET ID..." 
                                        />
                                    </div>
                                    <button onClick={handleCheckConnection} disabled={isLoading} className="contra-btn w-full h-12 text-sm uppercase">
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Check Connection'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'onboarding' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="text-center mb-4">
                                    <h3 className="text-[var(--text-color)] font-black uppercase">Init Protocol</h3>
                                </div>
                                
                                <div className="contra-input flex items-center gap-2">
                                    <UserIcon size={14} className="text-[var(--text-color)]" />
                                    <input 
                                        value={userName} 
                                        onChange={e => setUserName(e.target.value)}
                                        className="bg-transparent outline-none text-sm w-full font-bold uppercase placeholder:text-gray-400"
                                        placeholder="USER ID..." 
                                    />
                                </div>
                                
                                <button onClick={performSetup} disabled={isLoading} className="contra-btn w-full h-12 text-sm uppercase">
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Create Database'}
                                </button>
                                
                                <button onClick={() => setStep('input')} className="w-full text-xs font-bold underline text-[var(--text-color)]">Cancel</button>
                            </div>
                        )}

                        {step === 'auth_returning' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="text-center mb-4">
                                    <h3 className="text-[var(--text-color)] font-black uppercase">{showResetConfirm ? 'HARD RESET' : 'SECURITY CHECK'}</h3>
                                </div>
                                
                                {!showResetConfirm && (
                                    <div className="contra-input flex items-center gap-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
                                        <Key size={14} className="text-[var(--text-color)]" />
                                        <input 
                                            type="text" 
                                            maxLength={6}
                                            value={accessKey} 
                                            onChange={e => setAccessKey(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="bg-transparent outline-none text-lg w-full font-mono tracking-[0.5em] text-center text-[var(--text-color)]"
                                            placeholder="000000" 
                                        />
                                    </div>
                                )}
                                
                                {showResetConfirm ? (
                                    <div className="space-y-3">
                                        <div className="bg-red-500 text-white p-3 rounded-lg border-2 border-[var(--border-color)] text-xs font-bold uppercase">
                                            Warning: Irreversible data loss imminent.
                                        </div>
                                        <button onClick={handleReset} disabled={isLoading} className="w-full h-12 bg-red-600 text-white border-2 border-[var(--border-color)] rounded-full font-black text-sm shadow-[4px_4px_0px_0px_var(--border-color)]">
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'CONFIRM WIPE'}
                                        </button>
                                        <button onClick={() => setShowResetConfirm(false)} className="w-full h-12 font-bold text-sm text-[var(--text-color)]">Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={handleLogin} disabled={isLoading} className="contra-btn w-full h-12 text-sm uppercase">
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'Unlock & Sync'}
                                        </button>
                                        
                                        <div className="pt-2 flex justify-between items-center px-1">
                                            <button onClick={() => setStep('input')} className="text-xs font-bold underline text-[var(--text-color)]">Back</button>
                                            <button onClick={() => setShowResetConfirm(true)} className="text-red-600 text-[10px] font-black uppercase flex items-center gap-1">
                                                <Trash2 size={10} /> Lost Key?
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {step === 'auth_new_success' && (
                            <div className="space-y-6 text-center animate-in zoom-in">
                                <h3 className="text-[var(--text-color)] font-black uppercase">Access Granted</h3>
                                <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border-2 border-[var(--border-color)] shadow-[4px_4px_0px_0px_var(--border-color)]">
                                    <p className="text-3xl font-mono text-[var(--text-color)] tracking-widest font-bold">{generatedKey}</p>
                                </div>
                                <p className="text-xs font-bold text-red-500 uppercase">Save this key securely.</p>
                                <button onClick={finishSetup} className="contra-btn w-full h-12 text-sm uppercase">Continue</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="mb-6 w-full bg-[var(--bg-secondary)] p-4 rounded-xl border-2 border-[var(--border-color)]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-[var(--text-color)] uppercase">Status</span>
                                <span className="text-[10px] bg-[#bef264] border border-black px-2 py-0.5 rounded-full font-black text-black">ONLINE</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--text-color)] w-full animate-pulse"></div>
                            </div>
                        </div>
                        
                        <button onClick={() => { disconnectSheet(); onDisconnect(); setStep('input'); }} className="w-full h-12 border-2 border-red-500 text-red-600 rounded-full font-black text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900 transition-colors uppercase">
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileApp;
