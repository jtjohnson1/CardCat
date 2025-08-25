const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      // Removed deprecated options: useNewUrlParser and useUnifiedTopology
      // These are no longer needed in MongoDB Driver v4.0.0+
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };