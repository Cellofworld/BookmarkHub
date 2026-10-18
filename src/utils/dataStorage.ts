import { Bookmark, Category, Table } from '../types';

export interface AppData {
  categories: Category[];
  bookmarks: Bookmark[];
  tables: Table[];
}

const STORAGE_KEY = 'bookmarkhub-data';

// Load initial data from JSON file
export async function loadInitialData(): Promise<AppData> {
  try {
    const response = await fetch('/data.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }
  return getDefaultData();
}

// Load data from localStorage (with changes)
export function loadData(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
  return null;
}

// Save data to localStorage
export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

// Export data as JSON file
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

// Import data from JSON file
export async function importData(file: File): Promise<AppData> {
  const text = await file.text();
  const data = JSON.parse(text) as AppData;
  return data;
}

function getDefaultData(): AppData {
  return {
    categories: [
      { id: '1', name: 'Работа', icon: '💼', color: '#6366f1' },
      { id: '2', name: 'Развлечения', icon: '🎮', color: '#a855f7' },
      { id: '3', name: 'Обучение', icon: '📚', color: '#10b981' },
      { id: '4', name: 'Новости', icon: '📰', color: '#f59e0b' },
    ],
    bookmarks: [],
    tables: [],
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
