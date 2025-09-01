const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// User registration
router.post("/register", async (req, res) => {
  const body = req.body;
  const email = body.email?.toLowerCase(); // Normalize to lowercase
  const name = body.name?.trim(); // Clean up extra spaces
  console.log("body__", body);

  try {
    // Validate required fields
    if (!name) {
      return res
        .status(400)
        .json({ error: "Name is required.", statusCode: 400 });
    }
    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is required.", statusCode: 400 });
    }
    if (!body.password || !body.confirmPassword) {
      return res
        .status(400)
        .json({
          error: "Password and confirm password are required.",
          statusCode: 400,
        });
    }
    if (body.password !== body.confirmPassword) {
      return res
        .status(400)
        .json({
          error: "Password and confirm password do not match.",
          statusCode: 400,
        });
    }

    // Check if the email already exists (case-insensitive)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists.", statusCode: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    const hashedConfirmPassword = await bcrypt.hash(body.confirmPassword, salt);

    // Find the highest userId in the database
    const lastUser = await User.findOne().sort({ userId: -1 });
    const newUserId = lastUser ? lastUser.userId + 1 : 1;

    // Create a new user with lowercase email and mandatory name
    const result = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedConfirmPassword,
      userId: newUserId,
    });

    console.log("resultCreate", result);
    return res.status(201).json({
      message: "User created successfully",
      statusCode: 201,
      user: result,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", statusCode: 500 });
  }
});

// Verify email in database
router.post("/verifyEmail", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ error: "Email is required", statusCode: 400 });
  }

  try {
    const normalizedEmail = email.toLowerCase(); // normalize to lowercase
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      return res
        .status(200)
        .json({ message: "Email verified", statusCode: 200 });
    } else {
      return res
        .status(404)
        .json({ error: "Email does not exist", statusCode: 404 });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", statusCode: 500 });
  }
});

// Update password
router.post("/updatepassword", async (req, res) => {
  let { email, password, confirmPassword } = req.body;
  console.log(email, password);
  if (!email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({
        error: "Email, password, and confirm password are required",
        statusCode: 400,
      });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({
        error: "Password and confirm password do not match",
        statusCode: 400,
      });
  }

  try {
    const normalizedEmail = email.toLowerCase(); // normalize to lowercase
    console.log("normalizedEmail__", normalizedEmail);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(404)
        .json({
          error: "User with this email does not exist",
          statusCode: 404,
        });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, salt);

    user.password = hashedPassword;
    user.confirmPassword = hashedConfirmPassword;
    await user.save();

    return res
      .status(200)
      .json({ message: "Password updated successfully", statusCode: 200 });
  } catch (error) {
    console.error("Error updating password:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", statusCode: 500 });
  }
});

module.exports = router;
