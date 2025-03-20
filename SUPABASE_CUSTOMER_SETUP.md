# Supabase Customer Functionality Setup Guide

This guide will help you set up your Supabase database to properly support the customer management functionality in the application.

## Issue and Solution

The customer management functionality requires the ability to store custom fields for customers in the database. The current schema includes the `custom_fields` column in the `users` table, but we need to make sure it can store JSON data.

## Setup Steps

Follow these steps to ensure your Supabase database is correctly configured:

### 1. Check Your Schema

First, make sure your database has the `users` table with the necessary columns. The schema should include a `custom_fields` column that can store JSON data.

Run the following SQL statement in the Supabase SQL Editor:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS custom_fields JSONB;
```

This will add the `custom_fields` column with JSONB type if it doesn't already exist.

### 2. Verify Environment Variables

Ensure you have the correct Supabase environment variables set in your `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

You can find these values in your Supabase dashboard under Project Settings > API.

### 3. Test the Customer Creation

After making these changes, test the customer creation functionality in your application. The system should now correctly store and retrieve customer data, including the custom fields.

## Troubleshooting

If you're still experiencing issues:

1. **Check Supabase Logs**: Go to your Supabase dashboard and check the logs for any errors.

2. **Verify Permissions**: Make sure your Supabase policies allow insertion and updating of the `users` table. You can modify Row Level Security (RLS) policies in the Supabase dashboard.

3. **Database Inspection**: Use the Supabase Table Editor to directly view the `users` table and verify that data is being stored correctly.

4. **API Errors**: Check your browser console or server logs for specific error messages when adding or updating customers.

## Additional Schema Changes

If you plan to add more custom fields or functionality to your customer management, consider these optional schema changes:

```sql
-- Add a customer_notes column for longer text notes
ALTER TABLE users
ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- Add a last_booking_date column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_booking_date TIMESTAMP WITH TIME ZONE;

-- Add a total_spent column to track customer lifetime value
ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0.00;
```

## Summary of Changes Made

The following changes have been implemented in the codebase:

1. Updated the customer creation logic to properly stringify JSON data for the `custom_fields` column
2. Updated the customer update logic to properly handle custom fields data
3. Fixed data type handling for proper Supabase integration

These changes ensure that the custom fields data (like preferred contact method, appointment preferences, marketing opt-ins, etc.) are properly stored in the database.