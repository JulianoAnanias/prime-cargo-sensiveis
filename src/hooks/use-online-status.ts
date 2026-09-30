'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastOnline, setLastOnline] = useState<Date>(new Date());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      // Aqui você poderia acionar um toast de notificação global usando sua biblioteca preferida (ex: sonner)
      console.log('Conexão restabelecida');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Você está offline. Alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastOnline };
}
