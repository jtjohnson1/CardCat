const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
        })
      )
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Error file transport
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Helper functions for structured logging
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  logger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    params: req.params,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`Request completed: ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

const logError = (error, context = '') => {
  logger.error(`Error ${context}: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    context
  });
};

const logDebug = (message, data = {}) => {
  logger.debug(message, data);
};

const logInfo = (message, data = {}) => {
  logger.info(message, data);
};

const logWarn = (message, data = {}) => {
  logger.warn(message, data);
};

const logDirectoryOperation = (operation, directory, result = null, error = null) => {
  if (error) {
    logger.error(`Directory ${operation} failed for ${directory}: ${error.message}`, {
      operation,
      directory,
      error: error.message,
      stack: error.stack
    });
  } else {
    logger.info(`Directory ${operation} successful for ${directory}`, {
      operation,
      directory,
      result
    });
  }
};

const logFileOperation = (operation, filePath, result = null, error = null) => {
  if (error) {
    logger.error(`File ${operation} failed for ${filePath}: ${error.message}`, {
      operation,
      filePath,
      error: error.message,
      stack: error.stack
    });
  } else {
    logger.info(`File ${operation} successful for ${filePath}`, {
      operation,
      filePath,
      result
    });
  }
};

const logProcessingOperation = (operation, data = {}, error = null) => {
  if (error) {
    logger.error(`Processing ${operation} failed: ${error.message}`, {
      operation,
      data,
      error: error.message,
      stack: error.stack
    });
  } else {
    logger.info(`Processing ${operation} completed`, {
      operation,
      data
    });
  }
};

const logImageServing = (imagePath, success = true, error = null, metadata = {}) => {
  if (error) {
    logger.error(`Image serving failed for ${imagePath}: ${error.message}`, {
      imagePath,
      error: error.message,
      stack: error.stack,
      metadata
    });
  } else {
    logger.info(`Image served successfully: ${imagePath}`, {
      imagePath,
      metadata
    });
  }
};

module.exports = {
  logger,
  logRequest,
  logError,
  logDebug,
  logInfo,
  logWarn,
  logDirectoryOperation,
  logFileOperation,
  logProcessingOperation,
  logImageServing
};