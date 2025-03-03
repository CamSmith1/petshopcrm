const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth');

// User controllers will be imported here
// const userController = require('../controllers/userController');

// Get current user profile
router.get('/me', authenticate, (req, res) => {
  // Temporary placeholder until userController is implemented
  const user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isVerified: req.user.isVerified,
  };
  
  res.status(200).json({ user });
});

// Update user profile
router.put('/profile', authenticate, (req, res) => {
  // Temporary placeholder until userController is implemented
  res.status(200).json({ 
    message: 'Profile updated successfully',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    }
  });
});

// Get all users (admin only)
router.get('/', authenticate, isAdmin, (req, res) => {
  // Temporary placeholder until userController is implemented
  res.status(200).json({ 
    message: 'This endpoint will return all users (admin only)'
  });
});

module.exports = router;