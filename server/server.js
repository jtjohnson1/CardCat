// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const basicRoutes = require("./routes/index");
const { connectDB } = require("./config/database");
const cors = require("cors");

console.log('=== CardCataloger Server Starting ===');
console.log('Environment variables check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PORT:', process.env.PORT || '3000 (default)');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('- OLLAMA_URL:', process.env.OLLAMA_URL || 'http://localhost:11434 (default)');

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variables in .env missing.");
  console.error("Please create a .env file in the server directory with:");
  console.error("DATABASE_URL=mongodb://localhost:27017/cardcataloger");
  console.error("OLLAMA_URL=http://localhost:11434");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(cors({}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
console.log('Attempting to connect to database...');
connectDB();

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Basic Routes
app.use(basicRoutes);

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`=== Server running at http://localhost:${port} ===`);
  console.log('Ready to accept requests!');
  console.log('Frontend should be available at: http://localhost:5173');
  console.log('API endpoints available at: http://localhost:3000/api/*');
});