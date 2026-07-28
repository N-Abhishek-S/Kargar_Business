/**
 * useNetworkStatus — Online/offline detection
 */

import { useState, useEffect, useCallback } from 'react';
import type { UseNetworkStatusReturn } from '../types/video-recorder.types';

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState(() => Date.now());

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastOnlineAt(Date.now());
    if (wasOffline) {
      // Brief "back online" state — consumer can show a green banner
      setTimeout(() => { setWasOffline(false); }, 3000);
    }
  }, [wasOffline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline, lastOnlineAt };
}
