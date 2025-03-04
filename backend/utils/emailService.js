const supabase = require('../config/supabase');
const nodemailer = require('nodemailer');

/**
 * Send email using Supabase Edge Functions or Nodemailer fallback
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Email text content (optional)
 */
exports.sendEmail = async (options) => {
  try {
    // Check if we're using Supabase Edge Functions for email
    if (process.env.USE_SUPABASE_EMAIL === 'true') {
      // Call Supabase Edge Function for email
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        },
      });
      
      if (error) throw new Error(error.message);
      console.log('Email sent via Supabase Edge Function');
      return { success: true };
      
    } else {
      // Fallback to traditional nodemailer
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      const mailOptions = {
        from: `Dog Services <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent via Nodemailer: ', info.messageId);
      return info;
    }
  } catch (error) {
    console.error('Email error: ', error);
    throw new Error('Email could not be sent');
  }
};

/**
 * Send booking confirmation email
 * @param {Object} options - Email data
 * @param {string} options.to - Recipient email
 * @param {Object} options.booking - Booking details
 * @param {Object} options.service - Service details
 * @param {Object} options.pet - Pet details
 */
exports.sendBookingConfirmation = async (options) => {
  const { to, booking, service, pet } = options;

  const startDate = new Date(booking.start_time || booking.startTime).toLocaleString();
  const endDate = new Date(booking.end_time || booking.endTime).toLocaleString();
  const price = booking.total_price_amount || booking.totalPrice?.amount;
  const bookingId = booking.id || booking._id;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Confirmation</h2>
      <p>Your booking has been confirmed!</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Service:</strong> ${service.title}</li>
        <li><strong>Pet:</strong> ${pet.name}</li>
        <li><strong>Start Time:</strong> ${startDate}</li>
        <li><strong>End Time:</strong> ${endDate}</li>
        <li><strong>Total Price:</strong> $${price}</li>
      </ul>
      
      <p>You can view your booking details and make changes by <a href="${process.env.CLIENT_URL}/bookings/${bookingId}">clicking here</a>.</p>
      
      <p>Thank you for using our platform!</p>
    </div>
  `;

  return await exports.sendEmail({
    to,
    subject: 'Booking Confirmation',
    html,
  });
};

/**
 * Send booking reminder email
 * @param {Object} options - Email data
 * @param {string} options.to - Recipient email
 * @param {Object} options.booking - Booking details
 * @param {Object} options.service - Service details
 * @param {Object} options.pet - Pet details
 */
exports.sendBookingReminder = async (options) => {
  const { to, booking, service, pet } = options;

  const startDate = new Date(booking.start_time || booking.startTime).toLocaleString();
  const bookingId = booking.id || booking._id;
  const location = booking.location;
  const locationText = 
    location === 'at_provider' ? 'Service Provider Location' : 
    location === 'at_client' ? 'Your Location' :
    location === 'virtual' ? 'Virtual Meeting' : 'Other';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Reminder</h2>
      <p>This is a friendly reminder about your upcoming booking:</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Service:</strong> ${service.title}</li>
        <li><strong>Pet:</strong> ${pet.name}</li>
        <li><strong>Start Time:</strong> ${startDate}</li>
        <li><strong>Location:</strong> ${locationText}</li>
      </ul>
      
      <p>You can view your booking details and make changes by <a href="${process.env.CLIENT_URL}/bookings/${bookingId}">clicking here</a>.</p>
      
      <p>Thank you for using our platform!</p>
    </div>
  `;

  return await exports.sendEmail({
    to,
    subject: 'Reminder: Upcoming Booking',
    html,
  });
};