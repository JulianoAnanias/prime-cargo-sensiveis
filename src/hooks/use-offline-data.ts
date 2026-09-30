'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDB } from '@/lib/offline/db';

export function useOfflineData<T>(storeName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDB();
      const items = await db.getAll(storeName as any);
      setData(items as any);
    } catch (error) {
      console.error(`Erro ao carregar dados de ${storeName}:`, error);
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async (item: T) => {
    const db = await getDB();
    await db.put(storeName as any, item);
    await refresh();
  };

  const remove = async (key: string | number) => {
    const db = await getDB();
    await db.delete(storeName as any, key);
    await refresh();
  };

  return { data, loading, save, remove, refresh };
}
