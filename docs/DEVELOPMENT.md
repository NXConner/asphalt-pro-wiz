# Development Guide

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone [repository-url]

# Install dependencies & developer tooling
scripts/install_dependencies.sh
# PowerShell users: scripts/install_dependencies.ps1

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Development Workflow

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test -- path/to/test.ts
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

### Git Hooks

This project uses Husky for git hooks:

- **pre-commit**: Runs lint-staged, `npm run lint`, `npm run typecheck`, and `npm run test:unit -- --run`
- **commit-msg**: Validates commit message format (Conventional Commits)

## Code Standards

### TypeScript

- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` or proper types
- Use type inference when possible

### React Components

```typescript
// ✅ Good: Typed props, clear structure
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: ReactNode;
}

export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return (
    <button 
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ❌ Bad: Untyped, unclear
export function Button(props: any) {
  return <button {...props} />;
}
```

### Hooks

```typescript
// ✅ Good: Typed, documented
/**
 * Hook to manage user authentication state
 * @returns Auth state and methods
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // ... implementation
  return { user, signIn, signOut };
}

// ❌ Bad: Untyped, no documentation
export function useAuth() {
  const [user, setUser] = useState(null);
  return { user };
}
```

### Styling

- Use Tailwind utility classes
- Use semantic tokens from design system (no hardcoded colors)
- Create component variants using `class-variance-authority`

```typescript
// ✅ Good: Semantic tokens, variants
const buttonVariants = cva(
  'btn-base',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
      },
    },
  }
);

// ❌ Bad: Hardcoded colors
<button className="bg-blue-500 text-white">Click</button>
```

## Supabase Development

### Local Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Generate types
npm run generate:types
```

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Rollback migration
supabase db reset
```

### Testing with Supabase

```typescript
// Mock Supabase in tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signIn: vi.fn(),
    },
  },
}));
```

## Performance Tips

1. **Code Splitting**: Use dynamic imports for large components
2. **Lazy Loading**: Load images and components on demand
3. **Memoization**: Use React.memo for expensive components
4. **Debouncing**: Debounce search inputs and API calls
5. **Virtual Lists**: Use virtualization for long lists

## Debugging

### Browser DevTools

- React DevTools: Component tree and props
- Network Tab: API calls and responses
- Performance Tab: Rendering performance
- Console: Logs and errors

### VS Code Extensions

- ESLint
- Prettier
- TypeScript + JavaScript
- Tailwind CSS IntelliSense
- Error Lens

### Common Issues

**Build fails with TypeScript errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Supabase connection issues**
```bash
# Check environment variables
cat .env

# Verify Supabase is running
supabase status
```

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test thoroughly
3. Commit with conventional format: `feat: add new feature`
4. Push and create pull request
5. Wait for review and approval

### Commit Message Format

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Users can now request password reset links.

Closes #123
```
