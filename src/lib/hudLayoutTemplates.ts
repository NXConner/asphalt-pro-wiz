import type { HudLayoutPreset, HudPosition, HudSize } from './theme';

/**
 * HUD Layout Template definitions
 */
export interface HudLayoutTemplate {
  id: string;
  name: string;
  description: string;
  preset: HudLayoutPreset;
  position: HudPosition;
  size: HudSize;
  pinned: boolean;
  miniMode: boolean;
  category: 'tactical' | 'minimal' | 'immersive' | 'custom';
}

/**
 * Predefined HUD Layout Templates
 */
export const HUD_LAYOUT_TEMPLATES: HudLayoutTemplate[] = [
  // Tactical Templates
  {
    id: 'tactical-top-right',
    name: 'Tactical Command',
    description: 'Classic top-right tactical overlay for mission control',
    preset: 'top-right',
    position: { x: 0, y: 0 }, // Will be calculated based on viewport
    size: { width: 400, height: 650 },
    pinned: false,
    miniMode: false,
    category: 'tactical',
  },
  {
    id: 'tactical-bottom-right',
    name: 'Tactical Operations',
    description: 'Bottom-right placement for workflow-focused operations',
    preset: 'bottom-right',
    position: { x: 0, y: 0 },
    size: { width: 400, height: 600 },
    pinned: false,
    miniMode: false,
    category: 'tactical',
  },
  {
    id: 'tactical-center',
    name: 'Command Center',
    description: 'Centered HUD for maximum visibility and focus',
    preset: 'center',
    position: { x: 0, y: 0 },
    size: { width: 500, height: 700 },
    pinned: true,
    miniMode: false,
    category: 'tactical',
  },
  
  // Minimal Templates
  {
    id: 'minimal-top-right',
    name: 'Minimal Overlay',
    description: 'Compact top-right overlay for minimal distraction',
    preset: 'top-right',
    position: { x: 0, y: 0 },
    size: { width: 320, height: 450 },
    pinned: false,
    miniMode: false,
    category: 'minimal',
  },
  {
    id: 'minimal-bottom-left',
    name: 'Minimal Bottom',
    description: 'Discrete bottom-left placement',
    preset: 'bottom-left',
    position: { x: 0, y: 0 },
    size: { width: 300, height: 400 },
    pinned: false,
    miniMode: true,
    category: 'minimal',
  },
  
  // Immersive Templates
  {
    id: 'immersive-full',
    name: 'Immersive Full',
    description: 'Large immersive HUD for detailed mission data',
    preset: 'center',
    position: { x: 0, y: 0 },
    size: { width: 600, height: 800 },
    pinned: true,
    miniMode: false,
    category: 'immersive',
  },
  {
    id: 'immersive-wide',
    name: 'Immersive Wide',
    description: 'Wide format for multi-monitor setups',
    preset: 'top-right',
    position: { x: 0, y: 0 },
    size: { width: 700, height: 500 },
    pinned: false,
    miniMode: false,
    category: 'immersive',
  },
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): HudLayoutTemplate | undefined {
  return HUD_LAYOUT_TEMPLATES.find(template => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: HudLayoutTemplate['category']): HudLayoutTemplate[] {
  return HUD_LAYOUT_TEMPLATES.filter(template => template.category === category);
}

/**
 * Apply template to viewport, calculating actual position
 */
export function applyTemplateToViewport(
  template: HudLayoutTemplate,
  viewportWidth: number,
  viewportHeight: number,
): { position: HudPosition; size: HudSize } {
  let position: HudPosition = { x: 0, y: 0 };
  
  // Calculate position based on preset
  switch (template.preset) {
    case 'top-right':
      position = {
        x: viewportWidth - template.size.width - 20,
        y: 20,
      };
      break;
    case 'bottom-right':
      position = {
        x: viewportWidth - template.size.width - 20,
        y: viewportHeight - template.size.height - 20,
      };
      break;
    case 'bottom-left':
      position = {
        x: 20,
        y: viewportHeight - template.size.height - 20,
      };
      break;
    case 'center':
      position = {
        x: (viewportWidth - template.size.width) / 2,
        y: (viewportHeight - template.size.height) / 2,
      };
      break;
    case 'custom':
      position = template.position;
      break;
  }

  // Clamp to viewport
  position.x = Math.max(0, Math.min(position.x, viewportWidth - template.size.width));
  position.y = Math.max(0, Math.min(position.y, viewportHeight - template.size.height));

  return {
    position,
    size: template.size,
  };
}

