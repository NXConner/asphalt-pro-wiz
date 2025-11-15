import { createContext, useContext, ReactNode } from 'react';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { ShortcutConfig } from '@/hooks/useKeyboardShortcuts';

interface KeyboardContextValue {
  shortcuts: ShortcutConfig[];
}

const KeyboardContext = createContext<KeyboardContextValue | undefined>(undefined);

const globalShortcuts: ShortcutConfig[] = [
  {
    key: 'k',
    ctrl: true,
    callback: () => {
      // Open command palette
      const event = new CustomEvent('openCommandPalette');
      window.dispatchEvent(event);
    },
    description: 'Open command palette',
  },
  {
    key: 'h',
    ctrl: true,
    callback: () => {
      // Toggle HUD overlay
      const event = new CustomEvent('toggleHud');
      window.dispatchEvent(event);
    },
    description: 'Toggle HUD overlay',
  },
  {
    key: '?',
    shift: true,
    callback: () => {
      // Open shortcuts modal
      const event = new CustomEvent('openShortcuts');
      window.dispatchEvent(event);
    },
    description: 'Show keyboard shortcuts',
  },
  {
    key: '/',
    callback: () => {
      // Focus search
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    },
    description: 'Focus search',
  },
  {
    key: 'Escape',
    callback: () => {
      // Close modals/dialogs
      const event = new CustomEvent('closeAll');
      window.dispatchEvent(event);
    },
    description: 'Close modals',
  },
  {
    key: '1',
    ctrl: true,
    callback: () => {
      const event = new CustomEvent('setHudLayout', { detail: 'top-right' });
      window.dispatchEvent(event);
    },
    description: 'HUD Layout: Top Right',
  },
  {
    key: '2',
    ctrl: true,
    callback: () => {
      const event = new CustomEvent('setHudLayout', { detail: 'bottom-right' });
      window.dispatchEvent(event);
    },
    description: 'HUD Layout: Bottom Right',
  },
  {
    key: '3',
    ctrl: true,
    callback: () => {
      const event = new CustomEvent('setHudLayout', { detail: 'bottom-left' });
      window.dispatchEvent(event);
    },
    description: 'HUD Layout: Bottom Left',
  },
  {
    key: '4',
    ctrl: true,
    callback: () => {
      const event = new CustomEvent('setHudLayout', { detail: 'center' });
      window.dispatchEvent(event);
    },
    description: 'HUD Layout: Center',
  },
    {
      key: 'ArrowUp',
      ctrl: true,
      callback: (event) => {
        const magnitude = event.shiftKey ? 2 : 1;
        window.dispatchEvent(new CustomEvent('nudgeHud', { detail: { dx: 0, dy: -1, magnitude } }));
      },
      description: 'HUD Nudge Up',
    },
    {
      key: 'ArrowDown',
      ctrl: true,
      callback: (event) => {
        const magnitude = event.shiftKey ? 2 : 1;
        window.dispatchEvent(new CustomEvent('nudgeHud', { detail: { dx: 0, dy: 1, magnitude } }));
      },
      description: 'HUD Nudge Down',
    },
    {
      key: 'ArrowLeft',
      ctrl: true,
      callback: (event) => {
        const magnitude = event.shiftKey ? 2 : 1;
        window.dispatchEvent(new CustomEvent('nudgeHud', { detail: { dx: -1, dy: 0, magnitude } }));
      },
      description: 'HUD Nudge Left',
    },
    {
      key: 'ArrowRight',
      ctrl: true,
      callback: (event) => {
        const magnitude = event.shiftKey ? 2 : 1;
        window.dispatchEvent(new CustomEvent('nudgeHud', { detail: { dx: 1, dy: 0, magnitude } }));
      },
      description: 'HUD Nudge Right',
    },
];

export function KeyboardProvider({ children }: { children: ReactNode }) {
  useKeyboardShortcuts(globalShortcuts);

  return (
    <KeyboardContext.Provider value={{ shortcuts: globalShortcuts }}>
      {children}
    </KeyboardContext.Provider>
  );
}

 
export function useKeyboard() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within KeyboardProvider');
  }
  return context;
}
