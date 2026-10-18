import { AppData } from '../types';

export type { AppData } from '../types';

const STORAGE_KEY = 'bookmarkhub-data';
const SYNC_PATH_KEY = 'bookmarkhub-sync-path';

export async function loadInitialData(): Promise<AppData> {
  try {
    const response = await fetch('/data.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to load initial ', error);
  }
  return getDefaultData();
}

export function loadData(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load data:', error);
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
  return JSON.parse(text) as AppData;
}

export async function loadFromPath(path: string): Promise<AppData> {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Failed to load file');
  return await response.json();
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

function getDefaultData(): AppData {
  return {
    categories: [],
    bookmarks: [],
    tables: [],
    tasks: [],
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
