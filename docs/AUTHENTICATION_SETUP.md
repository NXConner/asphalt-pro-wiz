# Authentication Setup

## Overview
The application now includes a complete authentication system using Supabase Auth with email/password authentication.

## Components

### Auth Page (`/auth`)
- **Location**: `src/pages/Auth.tsx`
- **Features**:
  - Tabbed interface for Sign In and Sign Up
  - Email validation using Zod schema
  - Password validation (minimum 6 characters)
  - Error handling with user-friendly messages
  - Loading states during authentication
  - Automatic redirect to home page after successful authentication

### Auth Context
- **Location**: `src/contexts/AuthContext.tsx`
- **Provides**:
  - `user`: Current authenticated user
  - `session`: Current session with auth tokens
  - `loading`: Loading state
  - `isAuthenticated`: Boolean flag
  - `signIn(email, password)`: Sign in method
  - `signUp(email, password)`: Sign up method
  - `signOut()`: Sign out method

### useAuth Hook
- **Location**: `src/hooks/useAuth.ts`
- **Features**:
  - Manages authentication state
  - Listens to auth state changes
  - Handles session persistence
  - Includes email redirect URL for confirmation emails

### Protected Route Component
- **Location**: `src/components/ProtectedRoute.tsx`
- **Usage**: Wrap routes that require authentication
- **Behavior**: Redirects to `/auth` if user is not authenticated

### Sign In/Out Button
- **Location**: Added to `src/modules/layout/OperationsHeader.tsx`
- **Behavior**: 
  - Shows "Sign In" when not authenticated
  - Shows "Sign Out" with user email when authenticated
  - Handles navigation and sign out functionality

## Security Features

1. **Input Validation**: Email and password validation using Zod
2. **Session Management**: Automatic token refresh and session persistence
3. **Error Handling**: User-friendly error messages for common scenarios
4. **Secure Storage**: Uses localStorage for session persistence (configured in Supabase client)

## Configuration

### Email Confirmation (Optional for Development)

For faster testing during development, you can disable email confirmation:

1. Go to Supabase Dashboard: https://vodglzbgqsafghlihivy.supabase.co
2. Navigate to Authentication > Settings
3. Find "Enable email confirmations"
4. Disable it for development/testing
5. **Important**: Re-enable for production!

### Email Redirect URL

The sign-up process includes an `emailRedirectTo` option that redirects users back to the app after email confirmation:
- Development: Uses `window.location.origin`
- Automatically works across all environments

## Usage

### Basic Authentication Flow

```typescript
// Sign Up
await signUp('user@example.com', 'password123');
// User receives confirmation email (if enabled)

// Sign In
await signIn('user@example.com', 'password123');
// User is redirected to home page

// Sign Out
await signOut();
// User session is cleared
```

### Protecting Routes

To protect a route, wrap it with the `ProtectedRoute` component:

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route 
  path="/protected-page" 
  element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  } 
/>
```

### Accessing Auth State in Components

```tsx
import { useAuthContext } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuthContext();
  
  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <p>Please sign in</p>;
  }
  
  return <p>Welcome, {user.email}!</p>;
}
```

## Testing

1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Enter email and password (min 6 characters)
4. Check email for confirmation (if enabled)
5. Sign in with credentials
6. Verify redirect to home page
7. Check that Sign Out button appears in header
8. Click Sign Out to test logout

## Next Steps

### Critical (Before Production)
1. ✅ **Configure RLS Policies**: Set up Row Level Security for user-specific data (COMPLETED - see `RLS_SECURITY.md`)
2. **Enable Email Confirmation**: Re-enable for production
3. **Configure Email Templates**: Customize Supabase auth emails
4. **Add Password Reset**: Implement forgot password flow
5. **Add Profile Management**: Allow users to update their profile
6. **Configure URL Settings**: Set Site URL and Redirect URLs in Supabase Dashboard
   - Go to Authentication > URL Configuration
   - Set Site URL to your app URL
   - Add redirect URLs for all deployment environments

### Optional Enhancements
1. **Social Login**: Add Google, GitHub, etc.
2. **Multi-factor Authentication**: Add 2FA support
3. **Session Timeout**: Implement automatic logout after inactivity
4. **Remember Me**: Add persistent login option
5. **Email Change**: Allow users to change their email address
