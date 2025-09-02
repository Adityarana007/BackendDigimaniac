const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middlewares/authMiddleware');

// Get current user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select(
      "-password -confirmPassword"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ statusCode: 200, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile (name and email)
router.put('/edit', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;

    // Find the user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ 
        error: "User not found", 
        statusCode: 404 
      });
    }

    // Validate email if provided
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: normalizedEmail, 
        userId: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          error: "Email is already taken by another user", 
          statusCode: 400 
        });
      }
      
      user.email = normalizedEmail;
    }

    // Update name if provided
    if (name) {
      user.name = name.trim();
    }

    // Save the updated user
    await user.save();

    // Return updated user data (excluding sensitive fields)
    const updatedUser = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage ? `/uploads/${user.profileImage}` : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({
      message: "Profile updated successfully",
      statusCode: 200,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ 
      error: "Internal server error", 
      statusCode: 500 
    });
  }
});

module.exports = router;
