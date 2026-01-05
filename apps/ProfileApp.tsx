import React, { useState } from 'react';
import { Database, Loader2, FileSpreadsheet, Server, User as UserIcon, Lock, Key, CheckCircle, AlertTriangle, RefreshCw, Trash2, ArrowRight } from 'lucide-react';
import { SheetConfig } from '../types';
import { saveConfig, disconnectSheet, setupNewUser, checkSheetStatus, loginUser, resetSheet } from '../services/sheet';

interface ProfileAppProps {
    config: SheetConfig | null;
    onConnect: (config: SheetConfig) => void;
    onDisconnect: () => void;
}

type ConnectionStep = 'input' | 'auth_returning' | 'auth_new_success' | 'onboarding';

const ProfileApp: React.FC<ProfileAppProps> = ({ config, onConnect, onDisconnect }) => {
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

    // Step 1: Check Status
    const handleCheckConnection = async () => {
        if (!scriptUrl.trim() || !sheetId.trim()) {
            setErrorMsg("Enter URL and ID");
            return;
        }
        setIsLoading(true);
        setErrorMsg('');

        try {
            const statusRes = await checkSheetStatus(scriptUrl, sheetId);
            
            if (statusRes.status === 'returning_user') {
                if (statusRes.userName) {
                     localStorage.setItem('microhub_username', statusRes.userName);
                }
                setStep('auth_returning');
            } else if (statusRes.status === 'new_user') {
                setStep('onboarding');
            } else {
                setErrorMsg(statusRes.message || "Connection failed");
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const performSetup = async () => {
        if (!userName.trim()) {
            setErrorMsg("Please enter your name");
            return;
        }
        setIsLoading(true);
        try {
            const setupRes = await setupNewUser(scriptUrl, sheetId, userName);
            if (setupRes.status === 'success' && setupRes.rawKey) {
                // Save name immediately for instant UI update
                localStorage.setItem('microhub_username', userName);
                
                setGeneratedKey(setupRes.rawKey);
                setStep('auth_new_success');
                
                const newConfig: SheetConfig = { 
                    scriptUrl, sheetId, authKey: setupRes.rawKey, connectedAt: new Date().toISOString() 
                };
                saveConfig(newConfig);
            } else {
                setErrorMsg("Setup Failed: " + setupRes.message);
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Login Existing User
    const handleLogin = async () => {
        if (!accessKey.trim() || accessKey.length !== 6) {
            setErrorMsg("Invalid Key format");
            return;
        }
        setIsLoading(true);
        try {
            const loginRes = await loginUser(scriptUrl, sheetId, accessKey);
            if (loginRes.status === 'success') {
                const newConfig: SheetConfig = { 
                    scriptUrl, sheetId, authKey: accessKey, connectedAt: new Date().toISOString() 
                };
                saveConfig(newConfig);
                onConnect(newConfig);
            } else {
                setErrorMsg(loginRes.message || "Invalid Key");
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2.5: Wipe and Reset
    const handleReset = async () => {
        setIsLoading(true);
        try {
            const resetRes = await resetSheet(scriptUrl, sheetId);
            if (resetRes.status === 'success') {
                // After reset, go to onboarding to ask for name
                setShowResetConfirm(false);
                setAccessKey('');
                setUserName('');
                setStep('onboarding');
            } else {
                setErrorMsg(resetRes.message || "Reset failed");
            }
        } catch (e: any) {
            setErrorMsg(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Finish New User Setup
    const finishSetup = () => {
        if (generatedKey) {
            const newConfig: SheetConfig = { 
                scriptUrl, sheetId, authKey: generatedKey, connectedAt: new Date().toISOString() 
            };
            onConnect(newConfig);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto min-h-screen pb-32 pt-12 px-6 flex flex-col">
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center mb-4 border border-white/10 relative">
                    {config ? <CheckCircle size={40} className="text-[#d9f99d]" /> : <UserIcon size={40} className="text-gray-400" />}
                    {config && <div className="absolute inset-0 bg-[#d9f99d]/20 rounded-full blur-xl animate-pulse"></div>}
                </div>
                <h1 className="text-2xl font-light text-white">Cloud <span className="font-bold text-[#d9f99d]">Sync</span></h1>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{config ? 'Connected' : 'Disconnected'}</p>
            </div>

            <div className="glass-card rounded-[32px] p-6 relative overflow-hidden">
                {/* Error Banner */}
                {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4 flex items-center gap-2 text-red-300 text-xs">
                        <AlertTriangle size={14} />
                        {errorMsg}
                    </div>
                )}

                {!config ? (
                    <>
                        {/* Step 1: Inputs */}
                        {step === 'input' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <p className="text-center text-gray-400 text-xs mb-2">Connect Google Sheet</p>
                                <div className="space-y-3">
                                    <div className="bg-black/20 p-1 rounded-[20px] flex items-center gap-3 px-4 border border-white/5 focus-within:border-[#d9f99d]/30 transition-colors">
                                        <Server size={14} className="text-gray-500" />
                                        <input 
                                            value={scriptUrl} 
                                            onChange={e => setScriptUrl(e.target.value)}
                                            className="bg-transparent text-white outline-none text-xs w-full h-10 placeholder:text-gray-600"
                                            placeholder="Script URL" 
                                        />
                                    </div>
                                    <div className="bg-black/20 p-1 rounded-[20px] flex items-center gap-3 px-4 border border-white/5 focus-within:border-[#d9f99d]/30 transition-colors">
                                        <FileSpreadsheet size={14} className="text-gray-500" />
                                        <input 
                                            value={sheetId} 
                                            onChange={e => setSheetId(e.target.value)}
                                            className="bg-transparent text-white outline-none text-xs w-full h-10 placeholder:text-gray-600"
                                            placeholder="Sheet ID" 
                                        />
                                    </div>
                                    <button onClick={handleCheckConnection} disabled={isLoading} className="w-full h-12 btn-lime rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-2">
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Check Connection'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 1.5: Onboarding (Ask Name) */}
                        {step === 'onboarding' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                                <div className="text-center mb-4">
                                    <h3 className="text-white font-bold">Welcome</h3>
                                    <p className="text-gray-500 text-xs mt-1">Let's set up your database.</p>
                                </div>
                                
                                <div className="bg-black/20 p-1 rounded-[20px] flex items-center gap-3 px-4 border border-white/5 focus-within:border-[#d9f99d]/30 transition-colors">
                                    <UserIcon size={14} className="text-gray-500" />
                                    <input 
                                        value={userName} 
                                        onChange={e => setUserName(e.target.value)}
                                        className="bg-transparent text-white outline-none text-sm w-full h-10 placeholder:text-gray-600"
                                        placeholder="What should we call you?" 
                                    />
                                </div>
                                
                                <button onClick={performSetup} disabled={isLoading} className="w-full h-12 btn-lime rounded-full font-bold text-sm flex items-center justify-center gap-2">
                                    {isLoading ? <Loader2 className="animate-spin" /> : <>Create Database <ArrowRight size={14}/></>}
                                </button>
                                
                                <button onClick={() => setStep('input')} className="w-full py-2 text-gray-500 text-[10px] hover:text-white">
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Step 2: Returning User Auth */}
                        {step === 'auth_returning' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                                <div className="text-center mb-4">
                                    <h3 className="text-white font-bold">Welcome Back</h3>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {showResetConfirm ? 'This will ERASE ALL DATA to start fresh.' : 'This sheet is protected. Enter your key.'}
                                    </p>
                                </div>
                                
                                {/* Only show input if NOT in reset mode */}
                                {!showResetConfirm && (
                                    <div className="bg-black/20 p-1 rounded-[20px] flex items-center gap-3 px-4 border border-white/5 focus-within:border-[#d9f99d]/30 transition-colors">
                                        <Key size={14} className="text-[#d9f99d]" />
                                        <input 
                                            type="text" 
                                            maxLength={6}
                                            value={accessKey} 
                                            onChange={e => setAccessKey(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="bg-transparent text-white outline-none text-lg w-full h-12 placeholder:text-gray-700 tracking-[0.5em] font-mono text-center"
                                            placeholder="000000" 
                                        />
                                    </div>
                                )}
                                
                                {showResetConfirm ? (
                                    <div className="space-y-3">
                                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-red-300 text-[10px] leading-relaxed">
                                            Warning: This action cannot be undone. All tasks, journals, and logs will be permanently deleted from the Google Sheet.
                                        </div>
                                        <button onClick={handleReset} disabled={isLoading} className="w-full h-12 bg-red-500 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2">
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'Yes, Delete Everything'}
                                        </button>
                                        <button onClick={() => setShowResetConfirm(false)} className="w-full h-12 bg-white/5 rounded-full font-bold text-sm text-gray-400">
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={handleLogin} disabled={isLoading} className="w-full h-12 btn-lime rounded-full font-bold text-sm flex items-center justify-center gap-2">
                                            {isLoading ? <Loader2 className="animate-spin" /> : 'Unlock & Sync'}
                                        </button>
                                        
                                        <div className="pt-2 flex justify-between items-center px-1">
                                            <button onClick={() => setStep('input')} className="text-gray-500 text-[10px] hover:text-white">Back</button>
                                            <button onClick={() => setShowResetConfirm(true)} className="text-red-400/50 text-[10px] hover:text-red-400 flex items-center gap-1">
                                                <Trash2 size={10} /> Lost Key?
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 3: New User Success */}
                        {step === 'auth_new_success' && (
                            <div className="space-y-6 text-center animate-in zoom-in duration-300">
                                <div className="w-12 h-12 bg-[#d9f99d]/20 rounded-full flex items-center justify-center mx-auto text-[#d9f99d]">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Setup Complete!</h3>
                                    <p className="text-gray-400 text-xs mt-2 max-w-[200px] mx-auto">
                                        This is your Access Key. Save it to connect other devices.
                                    </p>
                                </div>
                                
                                <div className="bg-black/40 p-4 rounded-xl border border-[#d9f99d]/30">
                                    <p className="text-3xl font-mono text-[#d9f99d] tracking-widest font-bold">{generatedKey}</p>
                                </div>

                                <div className="bg-yellow-500/10 p-3 rounded-lg flex gap-2 text-left">
                                    <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-yellow-200/70">
                                        We will not show this key again. If you lose it, you may lose access to your data on other devices.
                                    </p>
                                </div>

                                <button onClick={finishSetup} className="w-full h-12 btn-lime rounded-full font-bold text-sm">
                                    I've Saved It, Continue
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    // Connected State
                    <div className="flex flex-col items-center">
                        <div className="mb-6 w-full bg-white/5 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500">Database Status</span>
                                <span className="text-[10px] bg-[#d9f99d]/20 text-[#d9f99d] px-2 py-1 rounded-full font-bold">ACTIVE</span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#d9f99d] w-full animate-pulse"></div>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2 text-right">Last sync: Just now</p>
                        </div>
                        
                        <button onClick={() => { disconnectSheet(); onDisconnect(); setStep('input'); }} className="w-full h-12 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                            Disconnect Database
                        </button>
                    </div>
                )}
            </div>
            
            <div className="mt-8 text-center px-4">
                 <p className="text-[10px] text-gray-600 leading-relaxed">
                    MicroHub stores data directly on your Google Sheet. No external servers are used.
                 </p>
            </div>
        </div>
    );
};

export default ProfileApp;