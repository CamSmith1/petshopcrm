const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const widgetRoutes = require('./routes/widget');

// Initialize environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for widget embed (customize in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve widget.js as a static file
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/widget', widgetRoutes);

// Widget documentation
app.get('/widget-docs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'widget-docs.html'));
});

// Base route
app.get('/', (req, res) => {
  res.send('Dog Services API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Widget script available at: http://localhost:${PORT}/widget.js`);
});

module.exports = app;