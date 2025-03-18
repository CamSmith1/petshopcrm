# QLDC Venues Booking System - Local Development Setup Guide

This guide will help you set up and run the QLDC Venues Booking system locally for development.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- [Supabase](https://supabase.com) account (free tier is sufficient)
- Git

## Setup Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd qldc-venues
```

### 2. Supabase Setup

1. Create a new Supabase project from the [Supabase Dashboard](https://app.supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run the schema SQL from `backend/models/supabase/schema.sql` to set up the database structure
4. Save your Supabase URL and keys from the API section of your project settings

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PORT=5000
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   EMAIL_FROM=venues@qldc.govt.nz
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
   
   The backend should be running at http://localhost:5000

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your API and Supabase credentials:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm start
   ```
   
   The frontend should be running at http://localhost:3000

## Initial Data Setup

The system includes a demo data script that will automatically create sample users, venues, and equipment when the backend starts for the first time. The demo data includes:

- Admin user (email: admin@qldc.example.com, password: admin123)
- Venue manager (email: venues@qldc.example.com, password: manager123)
- Sample customers
- 5 demo venues with different configurations
- Equipment items
- Document types

You can log in with these credentials to explore the system.

## Additional Configuration

### Email Configuration

For email notifications to work properly, configure the email settings in the backend `.env` file with a valid SMTP server.

### Payment Processing

To enable payment processing:

1. Create a Stripe account
2. Add your Stripe keys to the backend `.env` file:
   ```
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

## Common Issues and Troubleshooting

- **CORS Issues**: Ensure that the backend CORS settings are properly configured if you change the default ports
- **Supabase Connection Errors**: Verify your Supabase credentials and check that your IP is not restricted
- **Database Schema**: If you encounter database errors, verify that the schema was correctly applied
- **Node Version**: If you encounter unexpected errors, ensure your Node.js version is 16 or higher

## Development Workflow

1. The backend uses Node.js/Express and connects to Supabase for database operations
2. The frontend is built with React and communicates with both the backend API and directly with Supabase for authentication
3. Any changes to the database schema should be made via SQL updates and then applied to your Supabase instance