# API Reference

## Hooks

### useAuth

Manages user authentication state and operations.

```typescript
const {
  user,           // Current user object or null
  session,        // Current session or null
  loading,        // Loading state
  isAuthenticated, // Boolean if user is logged in
  signIn,         // Sign in method
  signUp,         // Sign up method
  signOut,        // Sign out method
} = useAuth();
```

**Example**:
```typescript
function LoginForm() {
  const { signIn, loading } = useAuth();
  
  const handleSubmit = async (email: string, password: string) => {
    await signIn(email, password);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### useSupabaseQuery

Query data from Supabase with React Query integration.

```typescript
const { data, isLoading, error } = useSupabaseQuery<Type>({
  queryKey: ['key'],
  table: 'table_name',
  select: 'column1,column2',
  filters: { column: 'value' },
  orderBy: { column: 'created_at', ascending: false },
  limit: 10,
});
```

**Example**:
```typescript
function JobsList() {
  const { data: jobs, isLoading } = useSupabaseQuery<Job>({
    queryKey: ['jobs'],
    table: 'jobs',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
  });
  
  if (isLoading) return <LoadingSpinner />;
  return <div>{jobs?.map(job => <JobCard key={job.id} job={job} />)}</div>;
}
```

### useSupabaseInsert

Insert data into Supabase table.

```typescript
const { mutate, isPending } = useSupabaseInsert<Type>({
  table: 'table_name',
  invalidateQueries: [['query-key']],
  successMessage: 'Created successfully',
});
```

**Example**:
```typescript
function CreateJobForm() {
  const { mutate: createJob } = useSupabaseInsert<Job>({
    table: 'jobs',
    invalidateQueries: [['jobs']],
    successMessage: 'Job created',
  });
  
  const handleSubmit = (data: Partial<Job>) => {
    createJob(data);
  };
}
```

### useSupabaseUpdate

Update data in Supabase table.

```typescript
const { mutate, isPending } = useSupabaseUpdate<Type>({
  table: 'table_name',
  invalidateQueries: [['query-key']],
  successMessage: 'Updated successfully',
});
```

### useSupabaseDelete

Delete data from Supabase table.

```typescript
const { mutate, isPending } = useSupabaseDelete({
  table: 'table_name',
  invalidateQueries: [['query-key']],
  successMessage: 'Deleted successfully',
});
```

### useRealtime

Subscribe to realtime updates from Supabase.

```typescript
const { isConnected } = useRealtime({
  table: 'table_name',
  event: 'INSERT', // or 'UPDATE', 'DELETE', '*'
  filter: 'column=eq.value',
  invalidateQueries: [['query-key']],
});
```

**Example**:
```typescript
function LiveJobsList() {
  const { data: jobs } = useSupabaseQuery<Job>({
    queryKey: ['jobs'],
    table: 'jobs',
  });
  
  // Auto-refresh when new jobs are inserted
  useRealtime({
    table: 'jobs',
    event: 'INSERT',
    invalidateQueries: [['jobs']],
  });
  
  return <div>{jobs?.map(job => <JobCard job={job} />)}</div>;
}
```

### useOnlineStatus

Track online/offline status.

```typescript
const isOnline = useOnlineStatus();
```

### useServiceWorker

Manage service worker lifecycle.

```typescript
const {
  isSupported,
  isRegistered,
  updateAvailable,
  registration,
  update,
} = useServiceWorker();
```

### useDebounce

Debounce a value.

```typescript
const debouncedValue = useDebounce(value, delay);
```

**Example**:
```typescript
function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  useEffect(() => {
    // API call with debounced value
    searchAPI(debouncedSearch);
  }, [debouncedSearch]);
  
  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

## Utility Functions

### Analytics

```typescript
// Track custom event
trackEvent('button_click', { button_name: 'submit' });

// Track page view
trackPageView('/dashboard');

// Track error
trackError(new Error('Something went wrong'), { context: 'checkout' });

// Track timing
trackTiming('api_response', 1250);

// Track user action
trackUserAction('click', 'button', 'submit_form');
```

### Performance

```typescript
// Mark performance point
mark('feature-start');

// Measure between marks
measure('feature-duration', 'feature-start', 'feature-end');

// Get performance rating
const rating = getRating('LCP', 2500); // 'good' | 'needs-improvement' | 'poor'

// Wrap function with monitoring
const monitoredFn = withPerformanceMonitoring(myFunction, 'MyComponent');
```

### Supabase Utilities

```typescript
// Safe query wrapper
const { data, error } = await safeQuery(() => 
  supabase.from('table').select('*')
);

// Check permissions
const hasAccess = await checkPermission('jobs', jobId, userId);

// Upload file
const { url, error } = await uploadFile('bucket', 'path/file.jpg', file);

// Delete file
await deleteFile('bucket', 'path/file.jpg');

// Batch insert
await batchInsert('jobs', [job1, job2, job3]);

// Get current user
const { user, error } = await getCurrentUser();

// Subscribe to table changes
const unsubscribe = subscribeToTable('jobs', (payload) => {
  console.log('New job:', payload);
});
```

### Caching

```typescript
// Get from cache
const value = await getCached('key');

// Set cache
await setCached('key', value, { ttl: 3600 });

// Invalidate cache
await invalidateCache('key');

// Clear all cache
await clearCache();
```

## Type Definitions

### Common Types

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface BaseRecord {
  id: string | number;
  created_at?: string;
  updated_at?: string;
}
```

### Estimator Types

```typescript
type AreaShape = 'rectangle' | 'triangle' | 'circle' | 'drawn' | 'manual' | 'image';
type JobStatus = 'pending' | 'inProgress' | 'completed' | 'archived';

interface JobData {
  name: string;
  address: string;
  coords: [number, number] | null;
  status: JobStatus;
  // ... more fields
}

interface MaterialData {
  numCoats: number;
  sandAdded: boolean;
  sealerType: SealerType;
  // ... more fields
}
```
