# BookingPro SaaS Platform

A comprehensive platform for businesses to manage bookings and services across any industry, including salons, consulting, training, events, and more.

## Features

- **Multi-Service Management**: Create and manage multiple service types with flexible parameters
- **Advanced Availability**: Calendar-based scheduling with custom hours and resource allocation
- **Comprehensive Booking Flow**: Service selection, intake forms, payments, and notifications
- **Business Dashboard**: Centralized management of bookings, services, and customers
- **Client Features**: Self-service booking, account management, and notifications
- **Admin Capabilities**: Multi-business management, templates, and custom integrations
- **Mobile Experience**: Responsive design for all devices with native mobile app
- **Widget Integration**: Embed a booking widget on your existing business website

## Widget Integration

The key feature of our platform is the ability for businesses to embed a customizable booking widget directly into their existing websites. This allows them to maintain brand consistency while leveraging our powerful booking infrastructure.

### How It Works

1. Businesses generate an API key from their dashboard
2. They add a simple JavaScript snippet to their website
3. The widget loads and displays their services, availability, and booking options
4. Customers can book and pay for services without leaving the business's website

### Widget Features

- Fully customizable to match your website design and branding
- Responsive for optimal experience on all device sizes
- Real-time availability display with dynamic time slots
- Secure payment processing integration
- Automated booking confirmations with email/SMS notifications

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based auth
- **Payments**: Stripe integration
- **Email**: Nodemailer for notifications

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd dog-services-saas/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and update with your values.

4. Start the development server:
   ```
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd dog-services-saas/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Project Structure

```
dog-services-saas/
├── backend/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middlewares/    # Custom middlewares
│   ├── config/         # Configuration files
│   └── utils/          # Utility functions
└── frontend/
    └── src/
        ├── components/ # Reusable components
        ├── pages/      # Page components
        ├── services/   # API services
        ├── context/    # Context providers
        └── utils/      # Utility functions
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/verify-email` - Verify user email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Endpoints

- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update user profile

### Pet Endpoints

- `GET /api/pets` - Get all pets for current user
- `GET /api/pets/:id` - Get pet by ID
- `POST /api/pets` - Create a new pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Service Endpoints

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Booking Endpoints

- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/complete` - Complete booking

### Widget Integration Endpoints

- `POST /api/widget/api-key` - Generate API key for widget integration
- `GET /api/widget/embed-code` - Get widget embed code
- `POST /api/widget/token` - Get widget session token 
- `GET /api/widget/verify-token` - Verify widget token
- `GET /api/widget/services` - Get available services for widget

## License

[MIT License](LICENSE)