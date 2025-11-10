# Cache Clearing Guide

If you're seeing errors from old builds (like `charts-BhSLOjVu.js` or `radix-BjuaRE2t.js`), follow these steps to clear cached files:

## Quick Fix (Recommended)

1. **Hard Refresh** - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Clear Browser Cache** - Open DevTools (F12) → Application/Storage tab → Clear site data
3. **Unregister Service Worker** - DevTools → Application → Service Workers → Unregister

## Detailed Steps

### Chrome/Edge
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear storage** in the left sidebar
4. Check all boxes
5. Click **Clear site data**
6. Go to **Service Workers** in the left sidebar
7. Click **Unregister** for any registered workers
8. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Firefox
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Right-click on the site → **Delete All**
4. Go to **Service Workers** tab
5. Click **Unregister** for any registered workers
6. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Safari
1. Open DevTools (Cmd+Option+I)
2. Go to **Storage** tab
3. Clear all storage types
4. Hard refresh: `Cmd+Option+R`

## Programmatic Cache Clearing

The application includes automatic cache clearing for Lovable.dev preview environments. If you're on a different host, you can manually trigger cache clearing:

```javascript
// In browser console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
}

if ('caches' in window) {
  caches.keys().then(keys => {
    keys.forEach(k => caches.delete(k));
  });
}
```

## Verification

After clearing cache, verify the new build is loaded:

1. Open DevTools → Network tab
2. Check "Disable cache"
3. Reload the page
4. Look for `react-vendor-*.js` (should be ~983KB)
5. **Should NOT see** separate `charts-*.js` or `radix-*.js` chunks

## Common Issues

### Still seeing old chunk names
- The service worker might be serving cached files
- Unregister the service worker and hard refresh
- Wait a few seconds for the new service worker to register

### Build not updating
- Check that the new build has been deployed
- Verify the build timestamp in the chunk filenames
- Clear all browser storage, not just cache

### Service worker won't unregister
- Close all tabs with the site open
- Clear browser data completely
- Restart the browser

## Build Information

The current build structure:
- **react-vendor chunk**: Contains React, Radix UI, cmdk, and recharts (~983KB)
- **No separate chunks**: All React-dependent libraries are bundled together
- **Service Worker**: Auto-updates with `skipWaiting` and `clientsClaim` enabled

If you see separate `charts-*.js` or `radix-*.js` chunks, you're viewing an old cached build.

