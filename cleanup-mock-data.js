const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    let databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/cardcat';
    
    // Force lowercase database name to prevent case conflicts
    if (databaseUrl.includes('/CardCat')) {
      databaseUrl = databaseUrl.replace('/CardCat', '/cardcat');
    }

    console.log('Connecting to MongoDB:', databaseUrl);
    await mongoose.connect(databaseUrl);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Card schema (same as in server/models/Card.js)
const cardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  manufacturer: { type: String, default: 'Unknown' },
  sport: { type: String, default: 'Unknown' },
  setName: { type: String, default: 'Unknown Set' },
  cardNumber: { type: String, default: 'Unknown' },
  playerName: { type: String, default: 'Unknown Player' },
  team: { type: String, default: 'Unknown Team' },
  year: { type: Number, default: new Date().getFullYear() },
  condition: { type: String, default: 'Unknown' },
  specialFeatures: [{ type: String }],
  estimatedValue: { type: Number, default: 0 },
  frontImagePath: { type: String, required: true },
  backImagePath: { type: String },
  frontImageUrl: { type: String },
  backImageUrl: { type: String },
  processedAt: { type: Date, default: Date.now },
  analysisRaw: {
    front: String,
    back: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Card = mongoose.model('Card', cardSchema);

const cleanupMockData = async () => {
  try {
    console.log('\n=== REMOVING ALL MOCK PRICE DATA ===');
    
    // Get all cards in database
    const allCards = await Card.find({});
    console.log(`Found ${allCards.length} cards in database`);

    if (allCards.length === 0) {
      console.log('✅ No cards found - database is already clean');
      return;
    }

    // Show cards with non-zero prices (these contain mock data)
    const cardsWithPrices = allCards.filter(card => card.estimatedValue > 0);
    console.log(`\n🚫 Found ${cardsWithPrices.length} cards with mock pricing data:`);
    
    cardsWithPrices.slice(0, 5).forEach((card, index) => {
      console.log(`${index + 1}. ${card.playerName} - ${card.manufacturer} - $${card.estimatedValue} (MOCK DATA)`);
    });

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(`\n⚠️  DELETE ALL ${allCards.length} cards with mock pricing? Only cards with $0.00 should remain. (yes/no): `, resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Cleanup cancelled by user');
      return;
    }

    // Delete ALL cards (they all have mock data)
    console.log('\n🗑️  Deleting ALL cards with mock pricing data...');
    const deleteResult = await Card.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} cards with mock pricing`);

    // Verify cleanup
    const remainingCards = await Card.countDocuments();
    console.log(`✅ Verification: ${remainingCards} cards remaining in database`);

    if (remainingCards === 0) {
      console.log('✅ Database cleanup completed successfully!');
      console.log('✅ ALL mock pricing data has been removed');
      console.log('✅ Future cards will have $0.00 until eBay/TCGPlayer APIs are configured');
      console.log('🔧 Configure eBay API credentials in Settings to get real pricing');
    } else {
      console.log('⚠️  Warning: Some cards may still remain in database');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await cleanupMockData();
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

// Run the cleanup
main();