const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Ensure we use lowercase database name to avoid case conflicts
    let databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/cardcat';
    
    // Force lowercase database name to prevent case conflicts
    if (databaseUrl.includes('/CardCat')) {
      databaseUrl = databaseUrl.replace('/CardCat', '/cardcat');
      console.log('Fixed database URL case sensitivity:', databaseUrl);
    }

    console.log('Connecting to MongoDB with URL:', databaseUrl);
    
    const conn = await mongoose.connect(databaseUrl);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);

    // Error handling after initial connection
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
};