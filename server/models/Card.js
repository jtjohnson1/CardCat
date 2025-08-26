const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  // Basic card identification
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  // Card details from Ollama analysis
  manufacturer: {
    type: String,
    default: 'Unknown'
  },
  sport: {
    type: String,
    default: 'Unknown'
  },
  setName: {
    type: String,
    default: 'Unknown Set'
  },
  cardNumber: {
    type: String,
    default: 'Unknown'
  },
  playerName: {
    type: String,
    default: 'Unknown Player'
  },
  team: {
    type: String,
    default: 'Unknown Team'
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  },
  condition: {
    type: String,
    default: 'Unknown'
  },
  specialFeatures: [{
    type: String
  }],
  estimatedValue: {
    type: Number,
    default: 0
  },
  
  // File paths (store both file system paths and URL paths)
  frontImagePath: {
    type: String,
    required: true
  },
  backImagePath: {
    type: String
  },
  // Add URL versions for frontend consumption
  frontImageUrl: {
    type: String
  },
  backImageUrl: {
    type: String
  },
  
  // Processing metadata
  processedAt: {
    type: Date,
    default: Date.now
  },
  analysisRaw: {
    front: String,
    back: String
  },
  
  // Additional metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate URL versions of image paths for frontend consumption
  if (this.frontImagePath && !this.frontImageUrl) {
    this.frontImageUrl = `/api/images/${encodeURIComponent(this.frontImagePath)}`;
  }
  if (this.backImagePath && !this.backImageUrl) {
    this.backImageUrl = `/api/images/${encodeURIComponent(this.backImagePath)}`;
  }
  
  next();
});

// Create indexes for better query performance
cardSchema.index({ playerName: 1 });
cardSchema.index({ manufacturer: 1 });
cardSchema.index({ sport: 1 });
cardSchema.index({ year: 1 });
cardSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Card', cardSchema);