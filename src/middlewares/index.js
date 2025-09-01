const express = require("express");
const path = require("path");

// Configure all middleware
const configureMiddleware = (app) => {
  // Body parsing middleware
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Serve static files from uploads directory
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
};

module.exports = configureMiddleware;
