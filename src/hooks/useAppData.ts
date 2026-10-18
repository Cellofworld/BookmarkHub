import { useState, useEffect } from 'react';
import { AppData } from '../types';
import { loadInitialData, loadData, saveData } from '../utils/dataStorage';

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      const storedData = loadData();
      if (storedData) {
        setData(storedData);
        setLoading(false);
        return;
      }

      const initialData = await loadInitialData();
      setData(initialData);
      saveData(initialData);
      setLoading(false);
    };

    initializeData();
  }, []);

  const updateData = (updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      if (!prev) return prev;
      const newData = updater(prev);
      saveData(newData);
      return newData;
    });
  };

  return { data, loading, updateData };
}
