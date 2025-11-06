import { describe, expect, it } from 'vitest';

import {
  CANONICAL_DESIGN_TOKENS,
  CORE_COMPONENT_STYLES,
  flattenComponentTokenMeta,
  getComponentBaseClass,
  getComponentTokens,
  listCanonicalComponentTokens,
  type CoreComponentId,
} from '@/lib/designSystem';

const tokenMeta = flattenComponentTokenMeta(
  [
    ...CANONICAL_DESIGN_TOKENS.colors,
    ...CANONICAL_DESIGN_TOKENS.typography,
    ...CANONICAL_DESIGN_TOKENS.spacing,
    ...CANONICAL_DESIGN_TOKENS.radii,
    ...CANONICAL_DESIGN_TOKENS.shadows,
    ...CANONICAL_DESIGN_TOKENS.transitions,
  ],
);

describe('component token bindings', () => {
  it('exposes canonical base classes for every core component', () => {
    (Object.entries(CORE_COMPONENT_STYLES) as [CoreComponentId, typeof CORE_COMPONENT_STYLES[CoreComponentId]][]).forEach(
      ([id, definition]) => {
        const baseClass = getComponentBaseClass(id);
        expect(baseClass).toBe(definition.baseClass);
        expect(baseClass).not.toHaveLength(0);
        expect(baseClass).toMatch(/(?:bg-|text-|border-|ring-)/);

        const exportedTokens = getComponentTokens(id);
        expect(exportedTokens).toEqual(definition.tokens);

        exportedTokens.forEach((token) => {
          const meta = tokenMeta[token] ?? tokenMeta[`--${token}`];
          expect(meta, `Missing canonical token metadata for ${id}:${token}`).toBeDefined();
        });
      },
    );
  });

  it('lists canonical component token metadata', () => {
    const list = listCanonicalComponentTokens();
    expect(list).toHaveLength(Object.keys(CORE_COMPONENT_STYLES).length);
    list.forEach(({ id, tokens }) => {
      expect(CORE_COMPONENT_STYLES[id]).toBeDefined();
      tokens.forEach((token) => {
        const meta = tokenMeta[token] ?? tokenMeta[`--${token}`];
        expect(meta, `Missing meta for mapped token ${token}`).toBeDefined();
      });
    });
  });
});

