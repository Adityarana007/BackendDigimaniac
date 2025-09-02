const authRoute = require("./auth");
const profileRoute = require("./profile");
const userRoute = require("./user");
const accountRoute = require("./account");
const timeTrackingRoute = require("./timeTracking");

// Configure all routes
const configureRoutes = (app) => {
  // Auth routes
  app.use("/api/auth", authRoute);
  
  // Profile routes
  app.use("/api/profile", profileRoute);
  
  // User routes
  app.use("/api", userRoute);
  
  // Account routes (registration, email verification, password update)
  app.use("/api", accountRoute);
  
  // Time tracking routes
  app.use("/api/time", timeTrackingRoute);
};

module.exports = configureRoutes;
