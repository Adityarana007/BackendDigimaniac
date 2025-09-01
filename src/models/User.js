const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    userId: { type: Number, unique: true },
    profileImage: { type: String }, // Add profile image field
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
