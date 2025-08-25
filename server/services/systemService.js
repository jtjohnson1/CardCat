const axios = require('axios');
const mongoose = require('mongoose');

// Cache for system status to reduce frequent checks
let statusCache = {
  timestamp: 0,
  data: null,
  ttl: 10000 // 10 seconds cache
};

// Track ongoing requests to prevent race conditions
let ongoingRequest = null;

/**
 * Check if Ollama service is running and accessible
 * @returns {Promise<{connected: boolean, error?: string}>}
 */
async function checkOllamaStatus() {
  const startTime = Date.now();

  try {
    console.log('Checking Ollama connectivity...');

    // Default Ollama endpoint - this can be made configurable later
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    console.log(`Attempting to connect to Ollama at: ${ollamaUrl}`);

    // Try to ping Ollama API
    const response = await axios.get(`${ollamaUrl}/api/tags`, {
      timeout: 5000 // 5 second timeout
    });

    const duration = Date.now() - startTime;

    if (response.status === 200) {
      console.log(`Ollama connectivity check: SUCCESS (${duration}ms)`);
      console.log(`Ollama response data:`, JSON.stringify(response.data, null, 2));
      return { connected: true };
    } else {
      console.log(`Ollama connectivity check: FAILED - Unexpected status code: ${response.status} (${duration}ms)`);
      return {
        connected: false,
        error: `Ollama returned status code: ${response.status}`
      };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`Ollama connectivity check: FAILED - ${error.message} (${duration}ms)`);
    console.log(`Error details:`, {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port
    });

    let errorMessage = error.message;
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Ollama service is not running or not accessible on port 11434. Please start Ollama service.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Cannot resolve Ollama hostname. Please check if Ollama is installed and running.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection to Ollama timed out. Service may be starting up or overloaded.';
    }

    return {
      connected: false,
      error: errorMessage
    };
  }
}

/**
 * Check if database is connected and accessible
 * @returns {Promise<{connected: boolean, error?: string}>}
 */
async function checkDatabaseStatus() {
  const startTime = Date.now();

  try {
    console.log('Checking database connectivity...');
    console.log(`Database URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@') : 'Not set'}`);
    console.log(`Mongoose connection state: ${mongoose.connection.readyState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);

    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      const duration = Date.now() - startTime;
      console.log(`Database connectivity check: FAILED - Not connected (${duration}ms)`);
      
      let errorMessage = 'Database is not connected';
      if (mongoose.connection.readyState === 0) {
        errorMessage = 'Database is disconnected. Please check if MongoDB is running and DATABASE_URL is correct.';
      } else if (mongoose.connection.readyState === 2) {
        errorMessage = 'Database is connecting. Please wait a moment and try again.';
      } else if (mongoose.connection.readyState === 3) {
        errorMessage = 'Database is disconnecting. Please check your connection.';
      }

      return {
        connected: false,
        error: errorMessage
      };
    }

    // Try to ping the database
    console.log('Attempting to ping database...');
    await mongoose.connection.db.admin().ping();

    const duration = Date.now() - startTime;
    console.log(`Database connectivity check: SUCCESS (${duration}ms)`);
    console.log(`Connected to database: ${mongoose.connection.name} on ${mongoose.connection.host}:${mongoose.connection.port}`);
    return { connected: true };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`Database connectivity check: FAILED - ${error.message} (${duration}ms)`);
    console.log(`Database error details:`, {
      name: error.name,
      code: error.code,
      codeName: error.codeName
    });

    let errorMessage = error.message;
    if (error.name === 'MongoNetworkError') {
      errorMessage = 'Cannot connect to MongoDB. Please check if MongoDB service is running.';
    } else if (error.name === 'MongoServerSelectionError') {
      errorMessage = 'MongoDB server selection failed. Please verify MongoDB is running and accessible.';
    } else if (error.name === 'MongoTimeoutError') {
      errorMessage = 'MongoDB connection timed out. Please check your network connection and MongoDB status.';
    }

    return {
      connected: false,
      error: errorMessage
    };
  }
}

/**
 * Get overall system status including Ollama and database
 * @returns {Promise<{ollama: string, database: string, ollamaDetails?: object, databaseDetails?: object}>}
 */
async function getSystemStatus() {
  const now = Date.now();

  // Check if we have cached data that's still valid
  if (statusCache.data && (now - statusCache.timestamp) < statusCache.ttl) {
    console.log('Returning cached system status...');
    return statusCache.data;
  }

  // If there's already an ongoing request, wait for it instead of making a new one
  if (ongoingRequest) {
    console.log('Waiting for ongoing system status request...');
    return await ongoingRequest;
  }

  console.log('Getting fresh system status...');
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    OLLAMA_URL_SET: !!process.env.OLLAMA_URL,
    OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434 (default)'
  });

  const overallStartTime = Date.now();

  // Create the promise and store it to prevent race conditions
  ongoingRequest = (async () => {
    try {
      console.log('Starting parallel checks for Ollama and Database...');
      const [ollamaStatus, databaseStatus] = await Promise.all([
        checkOllamaStatus(),
        checkDatabaseStatus()
      ]);

      const result = {
        ollama: ollamaStatus.connected ? 'connected' : 'disconnected',
        database: databaseStatus.connected ? 'connected' : 'disconnected'
      };

      // Add error details if there are any
      if (!ollamaStatus.connected) {
        result.ollamaDetails = { error: ollamaStatus.error };
        console.log('Ollama connection failed:', ollamaStatus.error);
      } else {
        console.log('Ollama connection successful');
      }

      if (!databaseStatus.connected) {
        result.databaseDetails = { error: databaseStatus.error };
        console.log('Database connection failed:', databaseStatus.error);
      } else {
        console.log('Database connection successful');
      }

      const totalDuration = Date.now() - overallStartTime;
      console.log(`System status result (${totalDuration}ms):`, result);

      // Cache the result with current timestamp (not the one from function start)
      const cacheTimestamp = Date.now();
      statusCache = {
        timestamp: cacheTimestamp,
        data: result,
        ttl: statusCache.ttl
      };

      console.log(`Cached result: timestamp=${statusCache.timestamp}, ttl=${statusCache.ttl}`);

      return result;
    } catch (error) {
      console.error('Error in getSystemStatus:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    } finally {
      // Clear the ongoing request when done
      ongoingRequest = null;
    }
  })();

  return await ongoingRequest;
}

module.exports = {
  checkOllamaStatus,
  checkDatabaseStatus,
  getSystemStatus
};