
export enum AppRoute {
  HOME = 'HOME',
  TASKS = 'TASKS',
  JOURNAL = 'JOURNAL',
  MOVIES = 'MOVIES',
  PROFILE = 'PROFILE',
  TIMER = 'TIMER',
  STOPWATCH = 'STOPWATCH',
}

export interface SheetConfig {
  sheetId: string;
  authKey: string;
  scriptUrl: string;
  connectedAt: string;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
}

export interface ApiSettings {
  movieProvider: 'tmdb' | 'gemini';
  tmdbApiKey: string;
  geminiApiKey: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Backlog' | 'Active' | 'Archive';
  createdAt: string;
  completedAt?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

export interface Movie {
  id: string;
  title: string;
  year: string;
  director: string;
  genre: string[];
  plot: string;
  status: 'watchlist' | 'watched';
  posterUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// For full state sync
export interface AppData {
  tasks: Task[];
  journal: JournalEntry[];
  movies: Movie[];
  user?: { name: string };
}
