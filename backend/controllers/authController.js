const supabaseClient = require('../utils/supabaseClient');
const { sendEmail } = require('../utils/emailService');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role, businessName, businessCategory, phone, address } = req.body;

    // Create metadata for the user
    const userData = {
      name,
      role: role || 'client',
      phone,
      businessName,
      businessCategory
    };

    // Register user with Supabase Auth
    const { user, session, error } = await supabaseClient.auth.signUp({
      email,
      password,
      userData
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Prepare response object
    const responseData = {
      message: 'User registered successfully. Please verify your email.',
      user: {
        id: user.id,
        name,
        email: user.email,
        role: role || 'client',
      },
      session
    };

    // Add business-specific updates
    if (role === 'business') {
      // Update the user record with business details
      await supabaseClient.users.update(user.id, {
        business_name: businessName,
        business_category: businessCategory,
        business_description: req.body.businessDescription,
        website: req.body.website,
      });

      // Generate API key for business accounts
      const apiKey = await supabaseClient.users.generateApiKey(user.id, 'Default API Key');
      
      responseData.apiKey = apiKey;
      responseData.user.businessName = businessName;
    }

    // Add address if provided
    if (address) {
      await supabaseClient.users.update(user.id, {
        street: address.street,
        city: address.city,
        state: address.state,
        zip_code: address.zipCode,
        country: address.country
      });
    }

    res.status(201).json(responseData);
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase
    const { data, error } = await supabaseClient.auth.signIn(email, password);

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile information
    const userData = await supabaseClient.users.getById(data.user.id);

    res.status(200).json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isVerified: userData.is_verified,
      },
      session: data.session
    });
  } catch (error) {
    next(error);
  }
};

// Verify email - Handled by Supabase Auth
exports.verifyEmail = async (req, res, next) => {
  try {
    // This should not be needed with Supabase as they handle email verification
    // This endpoint can be kept for custom verification flows if needed
    const { token } = req.body;

    // Manually update is_verified in our users table
    const { data: tokenData, error: tokenError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (tokenError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Update user verification status in our table
    await supabaseClient.users.update(tokenData.user.id, { 
      is_verified: true 
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Use Supabase's password reset functionality
    await supabaseClient.auth.resetPassword(email);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Update user password via Supabase
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};