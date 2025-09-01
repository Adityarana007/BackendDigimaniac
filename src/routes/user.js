const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get user by ID
router.get("/profile/:id", async (req, res) => {
  try {
    const existingUser = await User.findOne({ userId: req.params.id });
    if (!existingUser) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.json(existingUser);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users
router.get("/getusers", async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      return res.status(404).json({ error: "users not found" });
    }
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
