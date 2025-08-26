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
  
  // File paths
  frontImagePath: {
    type: String,
    required: true
  },
  backImagePath: {
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
  next();
});

// Create indexes for better query performance
cardSchema.index({ id: 1 });
cardSchema.index({ playerName: 1 });
cardSchema.index({ manufacturer: 1 });
cardSchema.index({ sport: 1 });
cardSchema.index({ year: 1 });
cardSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Card', cardSchema);