import { SheetConfig, AppData } from '../types';

const STORAGE_KEY = 'microhub_sheet_config';

export const getSheetConfig = (): SheetConfig | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
};

interface InitResponse {
    status: 'created' | 'existing' | 'error';
    authKey?: string;
    message?: string;
}

// Step 1: Initialize connection
export const initializeConnection = async (scriptUrl: string, sheetId: string): Promise<InitResponse> => {
    try {
        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify({ action: 'init', sheetId })
        });
        return await response.json();
    } catch (e) {
        throw new Error("Failed to connect to script. Check URL.");
    }
};

// Step 2: Login / Verify
export const verifyConnection = async (scriptUrl: string, sheetId: string, authKey: string): Promise<boolean> => {
    try {
        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', sheetId, authKey })
        });
        const data = await response.json();
        return data.status === 'success';
    } catch (e) {
        return false;
    }
};

export const saveConfig = (config: SheetConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const disconnectSheet = () => {
    localStorage.removeItem(STORAGE_KEY);
};

// Data Operations
export const fetchCloudData = async (config: SheetConfig): Promise<Partial<AppData>> => {
    try {
        const url = `${config.scriptUrl}?sheetId=${config.sheetId}&authKey=${config.authKey}`;
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.status === 'success') {
            return json.data;
        }
        return {};
    } catch (e) {
        console.error("Fetch Error", e);
        return {};
    }
};

export const syncToCloud = async (config: SheetConfig, data: Partial<AppData>) => {
    // Fire and forget, don't block UI
    try {
        fetch(config.scriptUrl, {
            method: 'POST',
            body: JSON.stringify({
                action: 'sync',
                sheetId: config.sheetId,
                authKey: config.authKey,
                data: data
            })
        });
    } catch (e) {
        console.error("Sync Error", e);
    }
};