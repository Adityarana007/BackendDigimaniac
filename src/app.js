const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const configureMiddleware = require("./middlewares");
const configureRoutes = require("./routes");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Configure middleware
configureMiddleware(app);

// Configure routes
configureRoutes(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
