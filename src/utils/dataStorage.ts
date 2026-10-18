import { AppData } from '../types';

export type { AppData } from '../types';

const STORAGE_KEY = 'bookmarkhub-data';
const SYNC_PATH_KEY = 'bookmarkhub-sync-path';

const DEFAULT_DATA: AppData = {
  categories: [
    { id: '1', name: 'Работа', icon: '💼', color: '#6366f1' },
    { id: '2', name: 'Развлечения', icon: '🎮', color: '#a855f7' },
    { id: '3', name: 'Обучение', icon: '📚', color: '#10b981' },
    { id: '4', name: 'Новости', icon: '📰', color: '#f59e0b' },
  ],
  bookmarks: [
    { id: '1', title: 'Google', url: 'https://google.com', description: 'Поисковая система', categoryId: '1', favicon: '', createdAt: 1704067200000 },
    { id: '2', title: 'GitHub', url: 'https://github.com', description: 'Платформа для разработки', categoryId: '1', favicon: '', createdAt: 1704153600000 },
    { id: '3', title: 'YouTube', url: 'https://youtube.com', description: 'Видеохостинг', categoryId: '2', favicon: '', createdAt: 1704240000000 },
  ],
  tables: [],
  tasks: [
    {
      id: '1',
      title: 'Пример задачи',
      description: 'Это пример задачи',
      status: 'todo' as const,
      priority: 'medium' as const,
      tags: ['пример'],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
};

export async function loadInitialData(): Promise<AppData> {
  try {
    const response = await fetch('/data.json');
    if (response.ok) {
      const data = await response.json();
      return ensureDataStructure(data);
    }
  } catch (error) {
    console.error('Failed to load initial ', error);
  }
  return DEFAULT_DATA;
}

export function loadData(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return ensureDataStructure(data);
    }
  } catch (error) {
    console.error('Failed to load ', error);
  }
  return null;
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save ', error);
  }
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookmarkhub-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<AppData> {
  const text = await file.text();
  const data = JSON.parse(text);
  return ensureDataStructure(data);
}

export async function loadFromPath(path: string): Promise<AppData> {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Failed to load file');
  const data = await response.json();
  return ensureDataStructure(data);
}

export function getSyncPath(): string | null {
  return localStorage.getItem(SYNC_PATH_KEY);
}

export function setSyncPath(path: string | null): void {
  if (path) {
    localStorage.setItem(SYNC_PATH_KEY, path);
  } else {
    localStorage.removeItem(SYNC_PATH_KEY);
  }
}

function ensureDataStructure(data: any): AppData {
  return {
    categories: Array.isArray(data?.categories) ? data.categories : DEFAULT_DATA.categories,
    bookmarks: Array.isArray(data?.bookmarks) ? data.bookmarks : [],
    tables: Array.isArray(data?.tables) ? data.tables : [],
    tasks: Array.isArray(data?.tasks) ? data.tasks : DEFAULT_DATA.tasks,
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
