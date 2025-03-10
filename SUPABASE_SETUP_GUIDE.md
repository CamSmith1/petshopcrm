# Supabase Setup Guide for Dog Services SaaS

This comprehensive guide will walk you through setting up the Dog Services SaaS application with Supabase from scratch.

## 1. Create Supabase Account and Project

1. **Create a Supabase Account**:
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account (or log in if you already have one)

2. **Create a New Project**:
   - Click "New Project" button in the Supabase dashboard
   - Choose an organization (create one if needed)
   - Set a name for your project (e.g., "dog-services-saas")
   - Set a secure database password (save this somewhere safe!)
   - Choose a region closest to your users
   - Click "Create new project"
   - Wait for your project to be provisioned (this may take a few minutes)

3. **Get API Keys**:
   - Once your project is ready, navigate to "Project Settings" → "API"
   - Note down:
     - Project URL (e.g., https://your-project-id.supabase.co)
     - anon/public key (starts with "eyJ...")
     - service_role key (for backend admin functions)

## 2. Set Up Database Schema

1. **Access SQL Editor**:
   - In your Supabase dashboard, go to the "SQL Editor" tab
   - Click "New query"

2. **Create Database Schema**:
   - Copy the complete schema from `backend/models/supabase/schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the SQL and create all your tables and functions
   
   The schema includes:
   - Users table
   - Services table
   - Bookings table
   - Business hours
   - Reviews
   - API keys
   - Necessary triggers and functions

## 3. Set Up Storage Buckets

1. **Create Required Storage Buckets**:
   - Go to the "Storage" section in your Supabase dashboard
   - Create the following buckets:
     - `profiles` - For user profile avatars
     - `services` - For service images
   
2. **Configure Bucket Permissions**:
   - For each bucket, go to "Configuration" → "Policies"
   - Add the following policies for public access:
     
     For profiles bucket:
     ```sql
     -- Allow public reading of profile images
     CREATE POLICY "Allow public reading of profile images" 
     ON storage.objects FOR SELECT USING (
       bucket_id = 'profiles' AND auth.role() = 'anon'
     );
     
     -- Allow authenticated users to upload their own profile images
     CREATE POLICY "Allow authenticated users to upload their profile" 
     ON storage.objects FOR INSERT WITH CHECK (
       bucket_id = 'profiles' AND 
       auth.uid()::text = (storage.foldername(name))[1]
     );
     ```
     
     For services bucket:
     ```sql
     -- Allow public reading of service images
     CREATE POLICY "Allow public reading of service images" 
     ON storage.objects FOR SELECT USING (
       bucket_id = 'services' AND auth.role() = 'anon'
     );
     
     -- Allow business users to upload service images
     CREATE POLICY "Allow business users to upload service images" 
     ON storage.objects FOR INSERT WITH CHECK (
       bucket_id = 'services' AND EXISTS (
         SELECT 1 FROM auth.users
         WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'business'
       )
     );
     ```

## 4. Configure Authentication

1. **Set Up Auth Settings**:
   - Go to "Authentication" → "Settings"
   - Configure site URL: Your frontend URL (e.g., http://localhost:3000 for development)
   - Enable email confirmations (optional)
   - Configure password reset link redirect URI: `http://localhost:3000/reset-password`
   
2. **Add Email Templates** (Optional):
   - In "Authentication" → "Email Templates":
   - Customize the invitation, confirmation, and password reset emails

## 5. Set Up Environment Variables

1. **Backend Environment Variables**:
   - Create a `.env` file in the backend folder with:
   ```
   PORT=5000
   JWT_SECRET=your_secret_key_for_jwt
   CLIENT_URL=http://localhost:3000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Frontend Environment Variables**:
   - Create a `.env` file in the frontend folder with:
   ```
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## 6. Install Project Dependencies

1. **Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

## 7. Load Demo Data (Optional)

If you want to pre-populate your application with demo data:

1. **Run The Demo Data Loader**:
   ```bash
   cd backend
   node load-demo-data.js
   ```

This will create:
- A demo business user
- Sample services
- Sample business hours

## 8. Start the Application

1. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Development Server**:
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`
   - The login page should appear
   - You can create a new account or use the demo account:
     - Email: demo@dogservices.com
     - Password: demo1234 (if you ran the demo data script)

## 9. Key Application Features

Now that you have the application set up, you can use these key features:

1. **User Management**:
   - Register new users (clients or businesses)
   - User authentication and authorization
   - Profile management

2. **Business Management**:
   - Business profile customization
   - Service management
   - Availability settings

3. **Booking System**:
   - Online booking page
   - Appointment scheduling
   - Calendar management

4. **Customer Management**:
   - Client database
   - Booking history
   - Communication tools

## 10. Troubleshooting

If you encounter issues:

1. **Authentication Problems**:
   - Check that your Supabase URL and keys are correct
   - Verify redirect URIs are set correctly
   - Check browser console for errors

2. **Database Issues**:
   - Verify the schema was applied correctly
   - Check Supabase dashboard for any error logs
   - Ensure RLS policies are properly configured

3. **API Connection Problems**:
   - Make sure backend server is running
   - Check CORS settings if accessing from different domains
   - Verify environment variables are set correctly

4. **Missing UI Elements**:
   - Several features have been removed or simplified:
     - Widget functionality has been removed
     - Pet management has been removed
     - Staff management is simplified

## 11. Migration from MongoDB

This application was migrated from MongoDB to Supabase. Key changes include:

1. **Database Schema**:
   - MongoDB documents → PostgreSQL tables
   - Embedded documents → Related tables with foreign keys
   - ObjectIDs → UUIDs

2. **Authentication**:
   - Custom JWT auth → Supabase Auth
   - Password hashing → Managed by Supabase

3. **Data Access**:
   - Mongoose queries → Supabase queries
   - File uploads → Supabase Storage

See `docs/supabase-migration-guide.md` for more details on the migration.

## 12. Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [React Router Documentation](https://reactrouter.com/docs/en/v6)
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/introduction/)

---

If you encounter any other issues or need further assistance, please create an issue on the project repository.