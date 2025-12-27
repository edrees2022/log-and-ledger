/**
 * Offline Indicator Component
 * Shows connection status and syncs when back online
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflineIndicator() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setShowReconnected(true);
      setIsSyncing(true);
      
      // Refetch important queries
      try {
        await queryClient.refetchQueries({ stale: true });
      } finally {
        setIsSyncing(false);
      }
      
      // Hide the reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await queryClient.refetchQueries({ stale: true });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-center p-2 bg-amber-500 text-white shadow-lg"
        >
          <WifiOff className="h-4 w-4 me-2" />
          <span className="text-sm font-medium">
            {t('offline.message', "You're offline. Some features may be limited.")}
          </span>
        </motion.div>
      )}

      {showReconnected && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-50 flex items-center justify-center p-2 bg-green-500 text-white shadow-lg"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 me-2 animate-spin" />
              <span className="text-sm font-medium">
                {t('offline.syncing', 'Syncing data...')}
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 me-2" />
              <span className="text-sm font-medium">
                {t('offline.reconnected', 'Back online! Data synced.')}
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to check online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
