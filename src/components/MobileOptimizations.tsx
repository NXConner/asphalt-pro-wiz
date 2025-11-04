import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';

import { useToast } from '@/hooks/use-toast';

export function MobileOptimizations() {
  const { toast } = useToast();

  useEffect(() => {
    // Configure status bar
    const configureStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Light });
      } catch (error) {
        console.log('Status bar not available:', error);
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
