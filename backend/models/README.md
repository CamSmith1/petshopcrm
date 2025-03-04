# Supabase Schema Migration Scripts

This directory contains SQL schema definitions used for the Supabase PostgreSQL database.

## Files

- `supabase/schema.sql` - The main database schema definition with tables, functions, triggers and policies

## Usage

To set up your Supabase project with this schema:

1. Create a new Supabase project
2. Navigate to the SQL Editor in the Supabase dashboard
3. Copy and paste the content of `supabase/schema.sql`
4. Run the SQL script

This will create all necessary tables, functions, triggers, and policies required for the dog services SaaS platform.

## Database Schema Overview

The database includes the following key tables:

- `users` - User accounts (clients, businesses, admins)
- `pets` - Pets belonging to client users
- `services` - Services provided by businesses
- `bookings` - Booking records linking services, clients, and pets
- `reviews` - Service reviews from clients
- `api_keys` - API keys for widget integration

And several supporting tables for business hours, availability, and more.

## Row Level Security (RLS)

The schema includes Row Level Security policies to ensure that users can only access data they are authorized to see. These policies are automatically set up when you run the schema script.
