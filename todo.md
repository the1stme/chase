# Supabase Implementation Todo List

## Setup Tasks
- [ ] Create Supabase project
- [ ] Install Supabase client: `bun add @supabase/supabase-js`
- [ ] Create `src/lib/supabase.ts` with hardcoded Supabase keys:
  ```typescript
  export const supabaseUrl = 'your-project-url'
  export const supabaseKey = 'your-anon-key'
  ```
- [ ] Create basic database schema
- [ ] Create initial migration SQL file

## Authentication Tasks
- [ ] Create `src/lib/auth.ts` for simple authentication with plain text passwords
- [ ] Modify `Login.tsx` to use username/password from database
- [ ] Implement database-based session management:
  - [ ] Create session table in database
  - [ ] Store session data in database
  - [ ] Sync session state with database
  - [ ] Handle database session updates
- [ ] Create protected route wrapper
- [ ] Add basic input validation
- [ ] Create admin authentication check using normal Supabase auth
- [ ] Disable RLS for all tables (only auth users can create accounts)

## Admin Tasks
- [ ] Create `/admin` route and layout
- [ ] Create admin dashboard component
- [ ] Implement account creation interface
- [ ] Add balance management interface
- [ ] Create transaction management interface
- [ ] Add user management interface
- [ ] Implement admin-only API endpoints

## Database Tasks
- [ ] Create SQL migration files for all tables
- [ ] Create database indexes
- [ ] Write data seeding scripts
- [ ] Create database types from schema
- [ ] Add initial admin user data
- [ ] Create balance history triggers

## API Integration Tasks
- [ ] Create `src/lib/api.ts` for data access layer
- [ ] Implement user authentication logic
- [ ] Implement account CRUD operations
- [ ] Implement transaction CRUD operations
- [ ] Implement transfer CRUD operations
- [ ] Add error handling and loading states
- [ ] Create admin API endpoints

## Component Updates
- [ ] Update `App.tsx` to use simple auth
- [ ] Modify `Dashboard.tsx` to fetch real data
- [ ] Update `Transactions.tsx` to use real data
- [ ] Update `Transfers.tsx` to use real data with deposit chunking
- [ ] Add deposit chunking UI in Transfers component
- [ ] Generate random reference codes for transfers
- [ ] Update `Settings.tsx` to use real data
- [ ] Add loading states to all components
- [ ] Create admin components

## Real-time Features
- [ ] Set up real-time subscriptions in `Dashboard.tsx`
- [ ] Add real-time updates to `Transactions.tsx`
- [ ] Implement real-time transfer status updates
- [ ] Add real-time balance updates
- [ ] Add admin notification system
- [ ] Optimize subscription management

## Testing Tasks
- [ ] Write authentication tests
- [ ] Create API integration tests
- [ ] Add component tests
- [ ] Test real-time features
- [ ] Add error handling tests
- [ ] Test admin functionality

## Optimization Tasks
- [ ] Implement query caching
- [ ] Add request debouncing
- [ ] Optimize real-time subscriptions
- [ ] Add error boundaries
- [ ] Implement retry logic
- [ ] Optimize balance calculations

## Documentation Tasks
- [ ] Update README with Supabase setup
- [ ] Document API endpoints
- [ ] Add authentication flow documentation
- [ ] Create database schema documentation
- [ ] Document real-time features
- [ ] Add admin documentation

## Migration Tasks
- [ ] Create data migration scripts
- [ ] Add feature flags for gradual rollout
- [ ] Create rollback procedures
- [ ] Document migration process
- [ ] Test migration scripts
- [ ] Create admin data migration

## Security Tasks
- [ ] Add basic input validation
- [ ] Implement user rights querying:
  - [ ] Create API endpoint to fetch user permissions
  - [ ] Store permissions in database
  - [ ] Sync permissions with database changes
  - [ ] Update UI components to query and display user-specific data
  - [ ] Implement role-based access control
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Review authentication flow
- [ ] Add basic error handling
- [ ] Implement admin access control

## Performance Tasks
- [ ] Add database indexes
- [ ] Optimize queries
- [ ] Implement caching strategy
- [ ] Add performance monitoring
- [ ] Optimize bundle size
- [ ] Optimize balance calculations 