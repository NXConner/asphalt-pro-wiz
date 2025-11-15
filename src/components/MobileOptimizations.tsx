import { App as CapacitorApp } from '@capacitor/app';
import { useEffect } from 'react';

import { useToast } from '@/hooks/use-toast';

function isDev(): boolean {
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.MODE === 'development') ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')
  );
}

export function MobileOptimizations() {
  const { toast } = useToast();

  useEffect(() => {
    // Configure status bar - only on native platforms (not web)
    // Use dynamic import to prevent StatusBar from being loaded on web
    const configureStatusBar = async () => {
      try {
        // Check if we're on a native platform before attempting to use Capacitor plugins
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) {
          // Skip status bar configuration on web - plugin not implemented
          return;
        }

        // Only import StatusBar on native platforms
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Light });
      } catch (error) {
        // Silently ignore status bar errors (expected on web and some platforms)
        // If Capacitor import fails or platform check fails, we're likely on web
      }
    };

    configureStatusBar();
  }, []);

  useEffect(() => {
    // Handle back button on Android
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapacitorApp.exitApp();
      } else {
        window.history.back();
      }
    });

    // Handle app state changes
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Active:', isActive);
    });

    // Handle URL opens (deep links)
    CapacitorApp.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data.url);
    });
  }, [toast]);

  // Add touch gesture optimizations
  useEffect(() => {
    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';

    // Optimize touch interactions
    const touchOptimizations = () => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        button, a {
          touch-action: manipulation;
        }
        
        input, textarea {
          touch-action: manipulation;
          -webkit-user-select: text;
          user-select: text;
        }
      `;
      document.head.appendChild(style);
    };

    touchOptimizations();
  }, []);

  return null;
}
