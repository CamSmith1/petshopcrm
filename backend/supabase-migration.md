# MongoDB to Supabase Migration Guide

This document outlines the process of migrating the Dog Services SaaS platform from MongoDB to Supabase.

## Migration Steps

1. **Schema Design**
   - Convert MongoDB document models to relational PostgreSQL tables
   - Create proper relationships with foreign keys
   - Define Row Level Security (RLS) policies for access control

2. **Authentication System Migration**
   - Replace JWT authentication with Supabase Auth
   - Update authentication middleware

3. **Data Access Layer Refactoring**
   - Create Supabase client utility for database operations
   - Update controllers to use Supabase instead of Mongoose

4. **Email Service Migration**
   - Update email service to use Supabase Edge Functions
   - Add fallback to traditional Nodemailer

5. **Scheduled Tasks**
   - Implement node-cron for scheduled tasks
   - Set up booking reminder system with Supabase

6. **Widget Integration**
   - Update API key management and validation with Supabase
   - Modify embed code generation

7. **Storage Integration**
   - Use Supabase Storage for file uploads

## Files Removed

- `models/User.js` - Mongoose model for users
- `models/Service.js` - Mongoose model for services
- `models/Pet.js` - Mongoose model for pets
- `models/Booking.js` - Mongoose model for bookings

## Dependencies Removed

- `mongoose` - MongoDB ORM
- `jsonwebtoken` - JWT authentication

## Dependencies Added

- `@supabase/supabase-js` - Supabase JavaScript client
- `node-cron` - Task scheduler

## API Compatibility

The API routes have been maintained for backward compatibility, but the implementation now uses Supabase for all database operations. This allows existing frontend code to continue working with minimal changes.

## Database Design Changes

- MongoDB's flexible schema has been converted to structured PostgreSQL tables
- Nested objects (like address) have been denormalized into table columns
- Arrays (like business hours) have been moved to separate tables with foreign keys
- Transactions now use Supabase's built-in support for PostgreSQL transactions

## Security Improvements

- Row Level Security (RLS) provides fine-grained access control at the database level
- Supabase Auth provides secure authentication with session management
- Database triggers enforce data integrity
- Edge Functions provide secure serverless execution for sensitive operations

## Performance Considerations

- PostgreSQL indexes have been added for common query patterns
- Foreign keys ensure data integrity
- Database functions handle complex operations efficiently
- Separate tables for related data improve query performance