# Mobile Development Guide

## Overview

This application supports native mobile deployment using Capacitor, with optimizations for iOS and Android platforms.

## Setup

### Prerequisites

- Node.js 18+ installed
- For iOS: macOS with Xcode 14+
- For Android: Android Studio with SDK 33+

### Initial Setup

1. **Install Dependencies**:
```bash
npm install
```

2. **Build Web Assets**:
```bash
npm run build
```

3. **Add Platforms**:
```bash
# Add iOS (macOS only)
npx cap add ios

# Add Android
npx cap add android
```

4. **Sync Changes**:
```bash
npx cap sync
```

## Running on Devices

### iOS

1. Open Xcode:
```bash
npx cap open ios
```

2. Select your device/simulator
3. Click the Run button in Xcode

### Android

1. Open Android Studio:
```bash
npx cap open android
```

2. Select your device/emulator
3. Click the Run button in Android Studio

## Mobile Optimizations

### Touch Interactions

The `MobileOptimizations` component provides:
- Optimized touch targets
- Disabled pull-to-refresh
- Proper tap highlight removal
- Touch action optimizations

### Status Bar

Status bar automatically adapts to theme:
- Light theme: Light status bar
- Dark theme: Dark status bar

### Back Button Handling

Android back button behavior:
- Navigates back in history when possible
- Exits app when at root

### Deep Linking

Configure deep links in `capacitor.config.ts`:

```typescript
{
  appId: 'app.lovable.yourapp',
  plugins: {
    App: {
      customURLScheme: 'yourapp',
    },
  },
}
```

## Performance Tips

### 1. Image Optimization

- Use WebP format when possible
- Implement lazy loading
- Optimize image sizes for mobile screens

### 2. Bundle Size

- Code splitting for routes
- Tree shaking unused code
- Minification enabled

### 3. Network Optimization

- Enable HTTP caching
- Implement offline support
- Use compression

### 4. Memory Management

- Clean up subscriptions
- Avoid memory leaks in useEffect
- Optimize large lists with virtualization

## Offline Support

The app includes offline capabilities:

1. **Service Worker**: Caches static assets
2. **IndexedDB**: Local data storage
3. **Sync Queue**: Deferred operations

### Testing Offline Mode

1. Build the app
2. Open DevTools
3. Enable offline mode
4. Test functionality

## Push Notifications (Optional)

To enable push notifications:

1. Install plugin:
```bash
npm install @capacitor/push-notifications
```

2. Configure in `capacitor.config.ts`:
```typescript
{
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}
```

3. Implement notification handling in your app

## App Store Deployment

### iOS App Store

1. **Configure**: Update `Info.plist` with required permissions
2. **Icons**: Add app icons in `ios/App/App/Assets.xcassets`
3. **Screenshots**: Prepare screenshots for all device sizes
4. **Build**: Archive in Xcode
5. **Upload**: Use Xcode or Application Loader

### Google Play Store

1. **Configure**: Update `AndroidManifest.xml`
2. **Icons**: Add icons in `android/app/src/main/res`
3. **Screenshots**: Prepare screenshots for all device types
4. **Build**: Generate signed APK/AAB
5. **Upload**: Via Google Play Console

## Common Issues

### iOS Build Fails

- Update Xcode to latest version
- Run `pod install` in `ios/App` directory
- Clean build folder in Xcode

### Android Build Fails

- Update Android Studio and SDK
- Sync Gradle files
- Clean and rebuild project

### Hot Reload Not Working

- Ensure dev server is running
- Check `capacitor.config.ts` server URL
- Verify device is on same network

## Testing Checklist

- [ ] App launches successfully
- [ ] Authentication works
- [ ] Navigation functions correctly
- [ ] Offline mode works
- [ ] Camera/photo permissions work
- [ ] Status bar adapts to theme
- [ ] Back button works properly
- [ ] Deep links function
- [ ] Performance is acceptable
- [ ] App works on different screen sizes

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Development Guide](https://developer.apple.com/documentation)
- [Android Development Guide](https://developer.android.com/docs)
- [Progressive Web Apps](https://web.dev/progressive-web-apps)
