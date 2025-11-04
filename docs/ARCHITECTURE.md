# Architecture Documentation

## Overview

Asphalt OverWatch OS is a modern React application built with TypeScript, Vite, and Supabase. The application follows a modular architecture with clear separation of concerns.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state, React Context for global state
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Routing**: React Router v6
- **UI Components**: Radix UI + custom components
- **Testing**: Vitest + Testing Library + Playwright

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components (buttons, cards, etc.)
│   ├── common/       # Shared components (LoadingSpinner, EmptyState)
│   └── ErrorBoundary/ # Error handling components
├── contexts/         # Global React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── PerformanceContext.tsx
├── hooks/            # Custom React hooks
│   ├── useAuth.ts
│   ├── useSupabaseQuery.ts
│   ├── useRealtime.ts
│   └── useOnlineStatus.ts
├── lib/              # Utility libraries
│   ├── supabase.ts   # Supabase helpers
│   ├── analytics.ts  # Analytics tracking
│   ├── performance.ts # Performance monitoring
│   └── cache.ts      # Caching utilities
├── modules/          # Feature modules
│   ├── estimate/     # Estimation feature
│   ├── analytics/    # Analytics dashboard
│   └── layout/       # Layout components
├── pages/            # Route pages
├── types/            # TypeScript type definitions
└── integrations/     # External integrations
    └── supabase/     # Supabase client & types
```

## Key Design Patterns

### 1. Component Architecture

- **Atomic Design**: Components are organized from atoms to organisms
- **Composition over Inheritance**: Use composition patterns for flexibility
- **Single Responsibility**: Each component has one clear purpose

### 2. State Management

- **Server State**: React Query for API data, caching, and synchronization
- **Global State**: React Context for auth, theme, performance tracking
- **Local State**: useState/useReducer for component-specific state
- **Form State**: React Hook Form with Zod validation

### 3. Data Flow

```
User Action → Hook → Supabase Client → Database
                ↓
         React Query Cache
                ↓
         Component Re-render
```

### 4. Authentication Flow

```
User → Login Form → useAuth hook → Supabase Auth → Session
                                         ↓
                                  AuthContext Provider
                                         ↓
                                  Protected Routes
```

## Performance Optimizations

1. **Code Splitting**: Route-based lazy loading
2. **Image Optimization**: Lazy loading and optimization hooks
3. **Caching**: Multi-layer caching (IDB, React Query, Memory)
4. **Memoization**: React.memo, useMemo, useCallback for expensive operations
5. **Web Vitals**: Performance monitoring and tracking

## Security

1. **Row Level Security (RLS)**: Database-level access control
2. **Environment Variables**: Sensitive data in .env files
3. **Input Validation**: Zod schemas for all user inputs
4. **XSS Protection**: React's built-in escaping + DOMPurify for rich content
5. **CORS**: Configured at Supabase level

## Error Handling

1. **Error Boundaries**: Catch React component errors
2. **API Error Handling**: Centralized error responses
3. **Toast Notifications**: User-friendly error messages
4. **Logging**: Structured logging with context

## Testing Strategy

1. **Unit Tests**: Components, hooks, utilities (Vitest)
2. **Integration Tests**: Feature flows (Testing Library)
3. **E2E Tests**: Critical user paths (Playwright)
4. **Coverage Targets**: 85% lines, 85% functions, 70% branches

## Deployment

- **Platform**: Vercel / Netlify / Self-hosted
- **CI/CD**: GitHub Actions
- **Environments**: Development, Staging, Production
- **Monitoring**: Web Vitals, Error tracking, Analytics

## Best Practices

1. **TypeScript First**: Strict mode enabled
2. **Accessibility**: ARIA labels, keyboard navigation
3. **Responsive Design**: Mobile-first approach
4. **SEO**: Meta tags, semantic HTML, structured data
5. **Documentation**: Code comments, API docs, architecture docs
