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
