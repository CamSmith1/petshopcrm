# Dog Services SaaS Platform - Comprehensive Documentation

This document provides a detailed overview of the Dog Services SaaS Platform project, including its purpose, architecture, implementation details, and deployment instructions.

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Key Features](#key-features)
4. [Codebase Structure](#codebase-structure)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Frontend Implementation](#frontend-implementation)
8. [Hosting and Deployment](#hosting-and-deployment)
9. [Local Development Setup](#local-development-setup)
10. [Supabase Migration](#supabase-migration)
11. [Project Evolution](#project-evolution)

## Project Overview

The Dog Services SaaS Platform is a comprehensive solution designed for pet service businesses to manage bookings and services. The platform has evolved from a simple pet service booking system to a more robust venue management system, particularly focused on QLDC (Queenstown Lakes District Council) venues booking and events management.

### Target Users
- **Service Providers**: Pet service businesses, venue owners
- **Clients**: Pet owners, event organizers
- **Admin Users**: Platform administrators

### Business Value
- Streamlined booking management
- Improved client experience
- Centralized service and venue management
- Integrated payment processing
- Comprehensive reporting and analytics

## System Architecture

The application follows a modern web application architecture:

### Backend
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for documents, images, and floor plans
- **API**: RESTful API design
- **Background Processing**: Node-cron for scheduled tasks

### Frontend
- **Framework**: React.js
- **Routing**: React Router v6
- **State Management**: React Context API
- **UI Components**: Custom components with CSS
- **HTTP Client**: Axios
- **Notifications**: React-Toastify
- **Calendar**: React-Calendar

### Third-Party Integrations
- **Payments**: Stripe
- **Email Notifications**: Nodemailer
- **Cloud Storage**: Supabase Storage

## Key Features

### 1. Venues Management
- Detailed venue profiles with capacity, amenities, and accessibility features
- Multiple layout options per venue with capacity details
- Flexible pricing tiers (commercial, community, standard)
- Bond management
- Equipment management
- Availability settings
- Venue images and floor plans

### 2. Booking System
- Online calendar showing venue availability
- Self-service booking for customers
- Admin booking on behalf of customers
- Approval workflow with optional auto-confirmation
- Setup and teardown time allocation
- Equipment add-ons
- Custom forms based on event type
- Document upload and approval

### 3. Payment Processing
- Online payments via Stripe integration
- Invoice generation
- Bond collection and refund tracking
- Partial payment tracking
- In-person payment recording

### 4. User Management
- Multi-role user system (clients, business owners, admins)
- Profile management
- Role-based permissions
- Authentication and authorization

### 5. Business Dashboard
- Centralized management of bookings, services, and customers
- Analytics and reporting
- Calendar view of all bookings
- Revenue tracking

## Codebase Structure

The project follows a standard client-server architecture with separate frontend and backend codebases.

### Backend Structure
```
backend/
├── config/           # Configuration files and environment setup
├── controllers/      # Request handlers (bookingController.js, authController.js, etc.)
├── middlewares/      # Custom middlewares (auth.js)
├── models/           # Database models and schema
│   └── supabase/     # Supabase schema and migration files
├── routes/           # API routes definition
├── utils/            # Utility functions
├── index.js          # Main application entry point
├── demo-data.js      # Demo data generation script
└── package.json      # Dependencies and scripts
```

### Frontend Structure
```
frontend/
├── public/           # Static assets and index.html
├── src/
│   ├── components/   # Reusable UI components
│   │   ├── auth/     # Authentication related components
│   │   ├── common/   # Common UI elements (buttons, cards, etc.)
│   │   ├── layout/   # Layout components (sidebar, header, etc.)
│   │   └── widget/   # Booking widget components
│   ├── context/      # React context providers
│   ├── pages/        # Page components
│   │   ├── admin/    # Admin-specific pages
│   │   └── auth/     # Authentication pages
│   ├── services/     # API service connectors
│   ├── styles/       # CSS stylesheets
│   ├── utils/        # Utility functions
│   ├── App.js        # Main application component
│   └── index.js      # Entry point
└── package.json      # Dependencies and scripts
```

## Database Schema

The database is implemented in PostgreSQL via Supabase and includes the following key tables:

### Core Tables
- **users**: User accounts with role-based permissions
- **venues**: Venue information including capacity and features
- **venue_layouts**: Different layout configurations for venues
- **venue_pricing**: Pricing tiers for venues (standard, commercial, community)
- **venue_equipment**: Equipment available for venue bookings
- **venue_bonds**: Bond requirements for venues
- **venue_availability**: Availability settings for venues
- **bookings**: Booking records with venue, client, and timing details
- **booking_reminders**: Tracking for reminder notifications
- **reviews**: User reviews for venues and services

### Relationships
- Venues belong to users (owners)
- Bookings are linked to venues, layouts, and users
- Equipment and bonds are linked to venues
- Reviews are linked to bookings and users

## API Documentation

The backend provides a RESTful API with the following endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/verify-email` - Verify user email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Endpoints
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Venue Endpoints
- `GET /api/venues` - Get all venues (with filtering options)
- `GET /api/venues/:id` - Get venue by ID
- `POST /api/venues` - Create a new venue
- `PUT /api/venues/:id` - Update venue
- `DELETE /api/venues/:id` - Delete venue
- Various nested endpoints for layouts, pricing, equipment, bonds, and images

### Booking Endpoints
- `GET /api/bookings` - Get all bookings (with filtering options)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/complete` - Complete booking

### Payment Endpoints
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Handle Stripe webhooks

## Frontend Implementation

The frontend is a React single-page application with the following key components:

### Core Components
- **App.js**: Main application component with routing
- **AuthProvider**: Authentication context provider
- **BusinessProvider**: Business context provider
- **ThemeProvider**: Theme customization provider

### Key Pages
- **Dashboard**: Overview of bookings and business metrics
- **ScheduleCalendar**: Calendar view of all bookings
- **ManageVenues**: Venue management interface
- **AppointmentsList**: List of all bookings
- **AppointmentForm**: Create and edit bookings
- **CustomersList**: Customer management
- **SettingsPages**: Various settings pages for profile, notifications, etc.

### Route Protection
- Protected routes ensure users can only access authorized pages
- Role-based route protection for admin, business, and client users

### API Integration
- Central API service in `services/api.js` using Axios
- Token-based authentication with interceptors for error handling
- Concurrent requests using Promise.all when needed

## Hosting and Deployment

The application can be deployed in several ways:

### Cloud Hosting Options
1. **Frontend**:
   - Netlify or Vercel for static site hosting
   - AWS Amplify
   - Firebase Hosting

2. **Backend**:
   - Heroku
   - AWS Elastic Beanstalk
   - Digital Ocean App Platform
   - Railway or Render

3. **Database**:
   - Supabase (hosted PostgreSQL with additional features)

### Deployment Process
1. **Backend Deployment**:
   ```bash
   # Build and deploy to Heroku
   git subtree push --prefix backend heroku main
   ```

2. **Frontend Deployment**:
   ```bash
   # Build the React application
   cd frontend
   npm run build
   
   # Deploy to hosting provider
   # (specific commands depend on the provider)
   ```

3. **Environment Variables**:
   - Set up environment variables in hosting platforms
   - Configure CORS for production domains
   - Set up proper security headers

### Continuous Integration
The repository can be configured with CI/CD pipelines using GitHub Actions, GitLab CI, or similar services to automate testing and deployment.

## Local Development Setup

To set up the project locally:

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account

### Backend Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dog-services-saas
   ```

2. Navigate to backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a Supabase project and run the schema SQL:
   - Create a new Supabase project
   - Run the SQL script in `backend/models/supabase/schema.sql`

5. Create a `.env` file with Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PORT=5000
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   EMAIL_FROM=venues@example.com
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application should now be running at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Supabase Migration

The application was migrated from MongoDB to Supabase to leverage serverless architecture and additional services.

### Migration Process
1. **Schema Design**: Converting MongoDB document schema to PostgreSQL relational schema
2. **Auth System**: Migrating from custom JWT auth to Supabase Auth
3. **Data Migration**: Moving data from MongoDB to Supabase
4. **API Compatibility**: Maintaining the same API structure while switching database systems
5. **Frontend Updates**: Updating frontend to work with Supabase Auth and Storage

### Benefits of Migration
- **Serverless Architecture**: No need to manage database servers
- **Built-in Auth**: Comprehensive authentication and authorization system
- **Row Level Security**: Database-level security policies
- **Storage**: Integrated file storage solution
- **Real-time**: Real-time database subscriptions
- **Reduced Maintenance**: Less infrastructure to manage

## Project Evolution

The project has evolved from a pet services booking platform to a more comprehensive venue management system.

### Major Changes
1. **Focus Shift**: From pet services to general venue management
2. **New Features**: 
   - Venue management with layouts, bonds, and equipment
   - Advanced booking workflow with approval process
   - Document requirements and management
   - Map-based venue selection
   
3. **Removed Features**:
   - Pet management functionality
   - Widget embedding for external websites
   - Staff scheduling
   
4. **Technology Changes**:
   - Migration from MongoDB to Supabase
   - Enhanced authentication and permission system
   - Improved calendar and booking interface

### Future Roadmap
- Mobile application development
- Advanced reporting and analytics
- Additional payment gateway integrations
- Enhanced map features for outdoor venues
- API for third-party integrations

---

This documentation is comprehensive but not exhaustive. For specific implementation details, refer to the codebase and comments within the source files.