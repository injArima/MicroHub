import { User } from '../types';

const STORAGE_KEY = 'microhub_user';

// Simulating a Standard User
const MOCK_USER: User = {
    id: 'user-12345',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
};

export const getUser = (): User | null => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
};

export const login = async (): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER));
    return MOCK_USER;
};

export const logout = async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem(STORAGE_KEY);
};