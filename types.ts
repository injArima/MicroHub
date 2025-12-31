export enum AppRoute {
  HOME = 'HOME',
  TASKS = 'TASKS',
  AI_CHAT = 'AI_CHAT',
  IMAGE_GEN = 'IMAGE_GEN',
  JOURNAL = 'JOURNAL',
}

export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
  team: string[];
  colorTheme: 'lime' | 'yellow' | 'red' | 'blue';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  isError?: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}
