# Dog Services SaaS Platform

A comprehensive platform for booking and managing dog-related services, including grooming, boarding, training, and daycare.

## Features

- **User Roles**: Pet owners, service providers, and admins
- **Booking System**: Real-time availability and booking management
- **Payments**: Integrated payment processing
- **User Profiles**: Profile management for users and pets
- **Messaging**: In-app communication
- **Service Management**: List and manage services with pricing
- **Reviews**: Verified reviews and ratings
- **Widget Integration**: Embed a booking widget on your existing website

## Widget Integration

One of the key features of this platform is the ability for service providers to embed a booking widget directly into their existing websites. This allows them to maintain their brand presence while leveraging our booking infrastructure.

### How It Works

1. Service providers generate an API key from their dashboard
2. They add a simple code snippet to their website
3. The widget loads and displays their services, availability, and booking options
4. Customers can book and pay for services without leaving the provider's website

### Widget Features

- Fully customizable to match the provider's website design
- Responsive for all device sizes
- Real-time availability checking
- Secure payment processing
- Booking confirmation with email notifications

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