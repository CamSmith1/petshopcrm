# Supabase Migration Guide

This guide covers how to migrate the Dog Services SaaS application from MongoDB to Supabase.

## Overview

The Dog Services SaaS application has been migrated from a MongoDB backend to Supabase to leverage serverless architecture, PostgreSQL databases, built-in authentication, and additional services like Storage and Edge Functions.

## Migration Steps

### 1. Schema Design

The MongoDB document schema has been converted to a relational PostgreSQL schema:

- Document collections → PostgreSQL tables
- Nested objects → Separate related tables with foreign keys
- Flexible schemas → Defined table structures with proper relationships
- MongoDB ObjectIds → UUID primary keys

The schema is defined in `backend/models/supabase/schema.sql`.

### 2. Auth System Changes

- JWT-based authentication → Supabase Auth
- Manual user management → Supabase user management
- Token verification → Supabase session management
- Password hashing → Handled by Supabase Auth

### 3. API Compatibility Layer

To maintain compatibility with the frontend, we've:

- Kept the same API routes and endpoints
- Created a data access layer that translates between the API and Supabase
- Maintained the same response formats
- Implemented Row Level Security for data access control

### 4. Data Access Layer

The `supabaseClient.js` file provides:

- Auth methods (register, login, getSession, etc.)
- User operations (getProfile, updateProfile, etc.)
- Pet operations (create, get, update, delete)
- Service operations (create, get, update, delete)
- Booking operations (create, get, update, cancel, complete)
- Storage operations (upload, download, delete)

### 5. Frontend Changes

The frontend has been updated to work with Supabase:

- Added Supabase client initialization
- Updated authentication context to use Supabase Auth
- Implemented file uploads to Supabase Storage
- Updated protected routes to work with Supabase sessions

## Configuration

### Backend Configuration

Create a `.env` file based on `.env.example` with:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Frontend Configuration

Create a `.env` file based on `.env.example` with:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Project Setup

1. Create a new Supabase project
2. Navigate to the SQL Editor
3. Run the SQL schema from `backend/models/supabase/schema.sql`
4. Set up Storage buckets:
   - `profiles` - For user avatars
   - `pet-photos` - For pet photos
   - `services` - For service images

## Key Migration Benefits

- **Serverless Architecture**: No need to manage MongoDB servers
- **PostgreSQL Database**: Powerful relational database with ACID compliance
- **Built-in Auth**: User management, sessions, social auth
- **Storage**: File management for avatars and pet photos
- **Row Level Security**: Fine-grained access control at the database level
- **Real-time**: Subscribe to database changes
- **Edge Functions**: Serverless functions for background processing

## API Changes

The API structure remains largely the same, but the implementation has been updated:

1. `/api/auth/*` - Now uses Supabase Auth for authentication
2. `/api/users/*` - Now uses Supabase User Management
3. `/api/pets/*` - Now uses the Supabase Pets table
4. `/api/services/*` - Now uses the Supabase Services table
5. `/api/bookings/*` - Now uses the Supabase Bookings table

## Testing

After migration, test all key functionality:

1. Authentication (register, login, password reset)
2. User management (update profile, avatar upload)
3. Pet management (create, view, update, delete)
4. Service management (create, view, update, delete)
5. Booking management (create, update, cancel, complete)
6. Widget integration (generate API key, embed code)

## Troubleshooting

If you encounter issues, check:

1. Supabase configuration is correct
2. SQL schema has been applied correctly
3. RLS policies are properly configured
4. Storage bucket permissions are set correctly
5. Environmental variables are properly set

For additional help, consult the Supabase documentation:
https://supabase.com/docs