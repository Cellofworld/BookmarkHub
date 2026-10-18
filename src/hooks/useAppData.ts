import { useState, useEffect } from 'react';
import { AppData } from '../types';
import { loadInitialData, loadData, saveData } from '../utils/dataStorage';

function ensureDataStructure(data: any): AppData {
  return {
    categories: Array.isArray(data?.categories) ? data.categories : [],
    bookmarks: Array.isArray(data?.bookmarks) ? data.bookmarks : [],
    tables: Array.isArray(data?.tables) ? data.tables : [],
    tasks: Array.isArray(data?.tasks) ? data.tasks : [],
  };
}

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const storedData = loadData();
        if (storedData) {
          const normalizedData = ensureDataStructure(storedData);
          setData(normalizedData);
          setLoading(false);
          return;
        }

        const initialData = await loadInitialData();
        const normalizedData = ensureDataStructure(initialData);
        setData(normalizedData);
        saveData(normalizedData);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Не удалось загрузить данные');
        // Provide default data even on error
        const defaultData = ensureDataStructure({});
        setData(defaultData);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const updateData = (updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      try {
        const newData = updater(prev);
        saveData(newData);
        return newData;
      } catch (err) {
        console.error('Error updating data:', err);
        return prev;
      }
    });
  };

  return { data, loading, error, updateData };
}
