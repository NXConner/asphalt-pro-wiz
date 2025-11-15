import { useEffect, useCallback } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: (event: KeyboardEvent) => void;
  description?: string;
}

/**
 * Hook for managing keyboard shortcuts
 * Supports modifier keys (ctrl, shift, alt, meta)
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Skip if event.key is undefined (can happen with some special keys)
      if (!event.key) return;

      const matchingShortcut = shortcuts.find(
        (shortcut) =>
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrl === event.ctrlKey &&
          !!shortcut.shift === event.shiftKey &&
          !!shortcut.alt === event.altKey &&
          !!shortcut.meta === event.metaKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.callback(event);
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  return shortcuts;
}

/**
 * Get list of all registered shortcuts with descriptions
 */
export function getShortcutList(shortcuts: ShortcutConfig[]) {
  return shortcuts
    .filter((s) => s.description)
    .map((s) => {
      const keys = [];
      if (s.ctrl) keys.push('Ctrl');
      if (s.shift) keys.push('Shift');
      if (s.alt) keys.push('Alt');
      if (s.meta) keys.push('Cmd');
      keys.push(s.key.toUpperCase());

      return {
        keys: keys.join(' + '),
        description: s.description,
      };
    });
}
