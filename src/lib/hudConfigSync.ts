import {
  applyThemePreferences,
  loadThemePreferences,
  saveThemePreferences,
  type ThemePreferences,
} from '@/lib/theme';

const ARCHIVE_VERSION = '1.0.0';

export interface HudConfigArchive {
  version: string;
  createdAt: string;
  environment: string;
  checksum?: string;
  hud: {
    preferences: Partial<ThemePreferences>;
    displayLayouts?: ThemePreferences['hudDisplayLayouts'];
  };
}

export interface ExportHudConfigOptions {
  fileName?: string;
  endpoint?: string;
  includeLayouts?: boolean;
  preferences?: ThemePreferences;
}

export async function createHudConfigArchive(
  options: ExportHudConfigOptions = {},
): Promise<HudConfigArchive> {
  const preferences = options.preferences ?? loadThemePreferences();
  const archive: HudConfigArchive = {
    version: ARCHIVE_VERSION,
    createdAt: new Date().toISOString(),
    environment: import.meta.env.VITE_ENVIRONMENT ?? import.meta.env.MODE ?? 'development',
    hud: {
      preferences: {
        hudOpacity: preferences.hudOpacity,
        hudBlur: preferences.hudBlur,
        showHud: preferences.showHud,
        hudPreset: preferences.hudPreset,
        hudAnimationsEnabled: preferences.hudAnimationsEnabled,
        hudLayoutPreset: preferences.hudLayoutPreset,
        hudSize: preferences.hudSize,
        hudPosition: preferences.hudPosition,
        hudPinned: preferences.hudPinned,
        hudTransitionPreset: preferences.hudTransitionPreset,
        hudMiniMode: preferences.hudMiniMode,
        hudAutoHide: preferences.hudAutoHide,
        hudAutoHideDelay: preferences.hudAutoHideDelay,
        hudThemeVariant: preferences.hudThemeVariant,
        hudProximityEffect: preferences.hudProximityEffect,
        hudProximityDistance: preferences.hudProximityDistance,
        hudAlertAnimation: preferences.hudAlertAnimation,
        hudQuickShortcuts: preferences.hudQuickShortcuts,
        hudAnimationPreset: preferences.hudAnimationPreset,
        hudGestureSensitivity: preferences.hudGestureSensitivity,
        hudMultiMonitorStrategy: preferences.hudMultiMonitorStrategy,
        hudKeyboardNavigation: preferences.hudKeyboardNavigation,
      },
      displayLayouts: options.includeLayouts ? preferences.hudDisplayLayouts : undefined,
    },
  };

  if (crypto?.subtle) {
    const checksum = await computeChecksum(archive);
    archive.checksum = checksum;
  }

  return archive;
}

export async function exportHudConfigArchive(options: ExportHudConfigOptions = {}): Promise<string> {
  const archive = await createHudConfigArchive(options);
  const serialized = JSON.stringify(archive, null, 2);

  if (options.fileName) {
    downloadArchive(options.fileName, serialized);
  }

  if (options.endpoint ?? import.meta.env.VITE_HUD_CONFIG_EXPORT_ENDPOINT) {
    const endpoint = options.endpoint ?? import.meta.env.VITE_HUD_CONFIG_EXPORT_ENDPOINT;
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialized,
      });
    } catch (error) {
      console.warn('Failed to push HUD config archive to endpoint', error);
    }
  }

  return serialized;
}

export async function importHudConfigArchive(source: File | string | HudConfigArchive): Promise<ThemePreferences> {
  let archive: HudConfigArchive;

  if (source instanceof File) {
    const text = await source.text();
    archive = JSON.parse(text) as HudConfigArchive;
  } else if (typeof source === 'string') {
    archive = JSON.parse(source) as HudConfigArchive;
  } else {
    archive = source;
  }

  validateArchive(archive);

  const current = loadThemePreferences();
  const merged: ThemePreferences = {
    ...current,
    ...archive.hud.preferences,
    hudDisplayLayouts: {
      ...current.hudDisplayLayouts,
      ...(archive.hud.displayLayouts ?? {}),
    },
  };

  saveThemePreferences(merged);
  applyThemePreferences(merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('hudPreferencesUpdated'));
  }
  return merged;
}

function validateArchive(archive: HudConfigArchive): void {
  if (!archive || typeof archive !== 'object') {
    throw new Error('Invalid HUD configuration archive.');
  }

  if (archive.version !== ARCHIVE_VERSION) {
    console.warn(
      `Importing HUD archive version ${archive.version ?? 'unknown'} (current ${ARCHIVE_VERSION}). Proceeding with best effort.`,
    );
  }

  if (!archive.hud || typeof archive.hud.preferences !== 'object') {
    throw new Error('Archive missing HUD preference payload.');
  }
}

async function computeChecksum(archive: HudConfigArchive): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(archive.hud));
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function appendJsonExtension(fileName: string): string {
  return fileName.toLowerCase().endsWith('.json') ? fileName : `${fileName}.json`;
}

function downloadArchive(fileName: string, content: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = appendJsonExtension(fileName);
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
