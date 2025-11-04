# Testing Guide

This guide covers testing strategies, running tests, and writing new tests for the Pavement Performance Suite.

## Table of Contents
1. [Testing Stack](#testing-stack)
2. [Running Tests](#running-tests)
3. [Writing Tests](#writing-tests)
4. [Test Coverage](#test-coverage)
5. [CI/CD Integration](#cicd-integration)

---

## Testing Stack

### Unit & Integration Tests
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks
- **Coverage**: V8

### E2E Tests
- **Framework**: Playwright
- **Browsers**: Chromium (can be extended)
- **Parallelization**: Supported

### Test Location
```
project/
├── tests/              # Unit and integration tests
│   ├── auth/          # Authentication tests
│   ├── hooks/         # Custom hooks tests
│   ├── lib/           # Utility function tests
│   ├── security/      # Security and RLS tests
│   └── db/            # Database tests
└── e2e/               # End-to-end tests
    ├── auth-flow.spec.ts
    ├── admin-panel.spec.ts
    └── basic.spec.ts
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- tests/auth/AuthContext.test.tsx

# Run tests with coverage
npm test -- --coverage

# Run tests in UI mode
npm test -- --ui
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run specific E2E test
npm run test:e2e -- e2e/auth-flow.spec.ts

# Debug E2E tests
npm run test:e2e -- --debug

# Generate test report
npm run test:e2e -- --reporter=html
```

---

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useYourHook } from '@/hooks/useYourHook';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useYourHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns expected initial state', () => {
    const { result } = renderHook(() => useYourHook());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('fetches data successfully', async () => {
    const mockData = { id: '1', name: 'Test' };
    const { supabase } = require('@/integrations/supabase/client');
    
    supabase.from.mockReturnValue({
      select: vi.fn(() => ({
        data: [mockData],
        error: null,
      })),
    });

    const { result } = renderHook(() => useYourHook());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([mockData]);
    });
  });
});
```

### Component Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from '@/components/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const handleClick = vi.fn();
    render(<YourComponent onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can complete main flow', async ({ page }) => {
    // Navigate
    await page.goto('/feature');
    
    // Interact
    await page.getByLabel('Input Label').fill('value');
    await page.getByRole('button', { name: /submit/i }).click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

---

## Test Coverage

### Current Coverage Targets

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 85,
    functions: 85,
    statements: 85,
    branches: 70,
  },
}
```

### Viewing Coverage Report

```bash
# Generate coverage report
npm test -- --coverage

# Open HTML coverage report
open coverage/index.html
```

### What to Test

**High Priority:**
- ✅ Authentication flows
- ✅ Authorization checks
- ✅ RLS policy enforcement
- ✅ Data mutations
- ✅ Critical user paths

**Medium Priority:**
- ✅ Form validation
- ✅ Error handling
- ✅ Navigation
- ✅ State management

**Low Priority:**
- UI styling
- Static content
- Third-party library wrappers

---

## Testing Best Practices

### 1. Test Structure (AAA Pattern)

```typescript
it('describes what is being tested', () => {
  // Arrange: Set up test data and conditions
  const input = 'test';
  
  // Act: Perform the action being tested
  const result = yourFunction(input);
  
  // Assert: Verify the expected outcome
  expect(result).toBe('expected');
});
```

### 2. Test Naming

```typescript
// Good ✅
it('redirects unauthenticated users to login page')
it('calculates total price with tax correctly')
it('validates email format before submission')

// Bad ❌
it('test 1')
it('works')
it('should do something')
```

### 3. Mocking

```typescript
// Mock external dependencies
vi.mock('@/integrations/supabase/client');

// Mock specific functions
const mockFn = vi.fn().mockResolvedValue({ data: [] });

// Restore mocks after each test
beforeEach(() => {
  vi.clearAllMocks();
});
```

### 4. Async Testing

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});

// Use findBy queries for async elements
const element = await screen.findByText('Loaded');
```

### 5. User-Centric Tests

```typescript
// Good ✅ - Test from user perspective
await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

// Bad ❌ - Test implementation details
fireEvent.click(wrapper.find('.btn-submit'));
```

---

## Security Testing

### Testing RLS Policies

```typescript
describe('RLS Policies', () => {
  it('prevents unauthorized access to jobs', async () => {
    // Set up user context
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', 'other-user-job');
    
    // Should return no data or error
    expect(data).toEqual([]);
  });
});
```

### Testing Authentication

```typescript
describe('Authentication', () => {
  it('requires authentication for protected routes', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/.*auth/);
  });
});
```

### Testing Authorization

```typescript
describe('Authorization', () => {
  it('blocks non-admin users from admin panel', async () => {
    // Authenticate as regular user
    await signIn('user@example.com');
    
    // Attempt to access admin panel
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'Administrator');
    
    // Should fail
    expect(error).toBeDefined();
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Debugging Tests

### Debugging Unit Tests

```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Use console.log
console.log('Debug:', result);

# Use debugger statement
debugger;

# View component output
screen.debug();
```

### Debugging E2E Tests

```bash
# Run in headed mode
npm run test:e2e -- --headed

# Run in debug mode
npm run test:e2e -- --debug

# Slow down execution
npm run test:e2e -- --slow-mo=1000

# Take screenshots on failure (enabled by default)
```

---

## Common Testing Patterns

### Testing Forms

```typescript
it('validates form inputs', async () => {
  render(<YourForm />);
  
  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });
  
  // Invalid input
  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.click(submitButton);
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  
  // Valid input
  await userEvent.clear(emailInput);
  await userEvent.type(emailInput, 'valid@example.com');
  await userEvent.click(submitButton);
  
  await waitFor(() => {
    expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
  });
});
```

### Testing API Calls

```typescript
it('fetches data from API', async () => {
  const mockData = [{ id: 1, name: 'Test' }];
  
  vi.spyOn(supabase, 'from').mockReturnValue({
    select: vi.fn(() => ({
      data: mockData,
      error: null,
    })),
  });
  
  const { result } = renderHook(() => useData());
  
  await waitFor(() => {
    expect(result.current.data).toEqual(mockData);
  });
});
```

### Testing Error Handling

```typescript
it('handles errors gracefully', async () => {
  const mockError = new Error('Network error');
  
  vi.spyOn(supabase, 'from').mockReturnValue({
    select: vi.fn(() => ({
      data: null,
      error: mockError,
    })),
  });
  
  const { result } = renderHook(() => useData());
  
  await waitFor(() => {
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeNull();
  });
});
```

---

## Continuous Improvement

### Regular Test Reviews
- Review test coverage monthly
- Update tests when features change
- Remove obsolete tests
- Improve flaky tests

### Test Metrics
- Track test execution time
- Monitor coverage trends
- Identify slow tests
- Measure test reliability

---

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [RLS Security](./RLS_SECURITY.md)
- [Architecture](./ARCHITECTURE.md)
