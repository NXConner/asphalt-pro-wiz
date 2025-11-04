import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * Hook to manage service worker lifecycle
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    updateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    if (!state.isSupported) return;

    // Check for existing registration
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        setState((prev) => ({ ...prev, isRegistered: true, registration }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState((prev) => ({ ...prev, updateAvailable: true }));
                toast.info('New version available! Refresh to update.', {
                  duration: 10000,
                  action: {
                    label: 'Refresh',
                    onClick: () => window.location.reload(),
                  },
                });
              }
            });
          }
        });
      }
    });
  }, [state.isSupported]);

  const update = () => {
    if (state.registration) {
      state.registration.update();
    }
  };

  return {
    ...state,
    update,
  };
}
