const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role, businessName, businessCategory, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user with basic fields
    const user = new User({
      email,
      password,
      name,
      role: role || 'client',
      phone,
      address,
    });

    // Add business-specific fields if role is business
    if (role === 'business') {
      user.businessName = businessName;
      user.businessCategory = businessCategory;
      user.businessDescription = req.body.businessDescription;
      user.website = req.body.website;
      
      // Generate API key for business accounts
      const apiKey = generateApiKey();
      user.apiKeys = [{
        key: apiKey,
        name: 'Default API Key',
        createdAt: new Date(),
      }];
    }

    await user.save();

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: `Please click <a href="${verificationUrl}">here</a> to verify your email address.`,
    });

    // Generate auth token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Prepare response object
    const responseData = {
      message: 'User registered successfully. Please verify your email.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };

    // Add API key to response if business account
    if (role === 'business') {
      responseData.apiKey = user.apiKeys[0].key;
      responseData.user.businessName = user.businessName;
    }

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Helper function to generate API key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = 'bpro_';
  
  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return apiKey;
}

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Update user verification status
    await User.findByIdAndUpdate(decoded.userId, { isVerified: true });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset',
      html: `Please click <a href="${resetUrl}">here</a> to reset your password.`,
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find user and update password
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};