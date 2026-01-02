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

// Check if user is New or Returning
export const checkSheetStatus = async (scriptUrl: string, sheetId: string): Promise<{status: 'new_user' | 'returning_user', userName?: string}> => {
    try {
        const response = await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify({ action: 'check_status', sheetId })
        });
        return await response.json();
    } catch (e) {
        throw new Error("Failed to connect to script.");
    }
};

// Setup New User
export const setupNewUser = async (scriptUrl: string, sheetId: string, userName: string): Promise<{status: 'success', rawKey: string}> => {
    const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'setup_new_user', sheetId, userName })
    });
    return await response.json();
};

// Login Returning User
export const loginUser = async (scriptUrl: string, sheetId: string, authKey: string): Promise<boolean> => {
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

// Wipe and Reset
export const wipeAndReset = async (scriptUrl: string, sheetId: string, userName: string): Promise<{status: 'success', rawKey: string}> => {
    const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'wipe_and_reset', sheetId, userName })
    });
    return await response.json();
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
    try {
        fetch(config.scriptUrl, {
            method: 'POST',
            body: JSON.stringify({
                action: 'sync_push',
                sheetId: config.sheetId,
                authKey: config.authKey,
                data: data
            })
        });
    } catch (e) {
        console.error("Sync Error", e);
    }
};