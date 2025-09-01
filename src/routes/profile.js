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

module.exports = router;
