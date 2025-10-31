import { useEffect } from 'react';

export function useAutoRefresh(callback, delay = 60000) {
  useEffect(() => {
    if (!callback) return;
    const interval = setInterval(() => {
      callback();
    }, delay);

    return () => clearInterval(interval); // cleanup when component unmounts
  }, [callback, delay]);
}
