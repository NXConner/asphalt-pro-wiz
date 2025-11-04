import { Home, BarChart3, Settings, FileText, Search, Moon, Sun, LogOut } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Command palette for quick navigation and actions
 * Accessible via Ctrl+K or Cmd+K
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { preferences, setMode } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    // Listen for custom event
    const handleCustomEvent = () => setOpen(true);
    window.addEventListener('openCommandPalette', handleCustomEvent);

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openCommandPalette', handleCustomEvent);
    };
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/command-center'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Command Center</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/portal'))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Portal</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => setMode(preferences.mode === 'dark' ? 'light' : 'dark'))
            }
          >
            {preferences.mode === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Toggle Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                supabase.auth.signOut();
                navigate('/auth');
              })
            }
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
