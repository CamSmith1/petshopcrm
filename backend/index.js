const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const customerRoutes = require('./routes/customers');

// Initialize environment variables
dotenv.config();

// Initialize Supabase connection
const supabase = require('./config/supabase');
const supabaseClient = require('./utils/supabaseClient');
const { sendEmail } = require('./utils/emailService');
const { addDemoData } = require('./demo-data');

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (customize in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Verify Supabase connection and add demo data
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('Supabase connection successful');
    
    // Add demo data
    await addDemoData();
  } catch (err) {
    console.error('Supabase connection error:', err.message);
  }
})();

// Set up scheduled tasks
// Schedule reminders for upcoming bookings (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running scheduled task: sending booking reminders');
    
    // Get bookings that are happening within the next 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    const today = new Date();
    
    // Get confirmed bookings between now and tomorrow
    const { data: upcomingBookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services(title)
      `)
      .eq('status', 'confirmed')
      .gte('start_time', today.toISOString())
      .lte('start_time', tomorrow.toISOString());
    
    if (error) {
      console.error('Error fetching upcoming bookings:', error.message);
      return;
    }
    
    // Check if already reminded
    for (const booking of upcomingBookings) {
      // Check if reminder already sent
      const { data: reminderSent, error: reminderError } = await supabase
        .from('booking_reminders')
        .select('id')
        .eq('booking_id', booking.id)
        .eq('type', 'email')
        .single();
      
      if (reminderError && reminderError.code !== 'PGRST116') {
        console.error(`Error checking reminder for booking ${booking.id}:`, reminderError.message);
        continue;
      }
      
      // Send reminder if not already sent
      if (!reminderSent) {
        // Get client details
        const { data: client, error: clientError } = await supabase
          .from('users')
          .select('email')
          .eq('id', booking.client_id)
          .single();
        
        if (clientError) {
          console.error(`Error fetching client for booking ${booking.id}:`, clientError.message);
          continue;
        }
        
        if (client && client.email) {
          // Send reminder email
          try {
            await sendEmail.sendBookingReminder({
              to: client.email,
              booking: booking,
              service: booking.services
            });
            
            // Record that reminder was sent
            await supabase
              .from('booking_reminders')
              .insert({
                booking_id: booking.id,
                type: 'email',
                sent_at: new Date().toISOString()
              });
            
            console.log(`Reminder sent for booking ${booking.id}`);
          } catch (emailError) {
            console.error(`Error sending reminder email for booking ${booking.id}:`, emailError.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error running scheduled task:', err.message);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);


// Base route
app.get('/', (req, res) => {
  res.send('Dog Services API is running (Supabase Edition)');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;