const express = require("express");
const router = express.Router();

// Import route modules
const processingRoutes = require('./processing');

// Home route
router.get("/", (req, res) => {
  res.json({ message: "CardCat API Server" });
});

// API routes
router.use('/api/processing', processingRoutes);

module.exports = router;