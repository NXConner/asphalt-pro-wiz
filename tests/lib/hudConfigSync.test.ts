import { describe, expect, it, beforeEach } from 'vitest';

import { createHudConfigArchive, importHudConfigArchive } from '@/lib/hudConfigSync';
import { loadThemePreferences, saveThemePreferences } from '@/lib/theme';

describe('hudConfigSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('captures animation and gesture preferences when exporting', async () => {
    const prefs = loadThemePreferences();
    prefs.hudAnimationPreset = 'command';
    prefs.hudGestureSensitivity = 'aggressive';
    prefs.hudMultiMonitorStrategy = 'persist-latest';
    saveThemePreferences(prefs);

    const archive = await createHudConfigArchive({ includeLayouts: true });

    expect(archive.version).toBeDefined();
    expect(archive.hud.preferences.hudAnimationPreset).toBe('command');
    expect(archive.hud.preferences.hudGestureSensitivity).toBe('aggressive');
    expect(archive.hud.preferences.hudMultiMonitorStrategy).toBe('persist-latest');
    expect(archive.hud.displayLayouts).toBeDefined();
  });

  it('applies imported HUD preferences and persists them', async () => {
    const archive = await createHudConfigArchive();
    archive.hud.preferences.hudAnimationPreset = 'stealth';
    archive.hud.preferences.hudGestureSensitivity = 'conservative';
    archive.hud.preferences.hudMultiMonitorStrategy = 'auto';
    archive.hud.preferences.hudKeyboardNavigation = false;

    const updated = await importHudConfigArchive(archive);

    expect(updated.hudAnimationPreset).toBe('stealth');
    expect(updated.hudGestureSensitivity).toBe('conservative');
    expect(updated.hudMultiMonitorStrategy).toBe('auto');
    expect(updated.hudKeyboardNavigation).toBe(false);

    const persisted = loadThemePreferences();
    expect(persisted.hudAnimationPreset).toBe('stealth');
    expect(persisted.hudKeyboardNavigation).toBe(false);
  });
});
