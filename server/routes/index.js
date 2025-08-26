const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Import route modules
const processingRoutes = require('./processing');
const cardsRoutes = require('./cards');
const dashboardRoutes = require('./dashboard');

// Home route
router.get("/", (req, res) => {
  res.json({ message: "CardCat API Server" });
});

// Image serving endpoint with extensive logging
router.get('/api/images/*', (req, res) => {
  console.log('\n=== IMAGE SERVING DEBUG ===');
  console.log('Full request URL:', req.url);
  console.log('Request params:', req.params);
  console.log('Params[0] (file path):', req.params[0]);

  try {
    // Extract the file path from the URL
    let filePath = req.params[0];

    // Handle URL encoding
    filePath = decodeURIComponent(filePath);
    console.log('Decoded file path:', filePath);

    // Check if file exists
    console.log('Checking if file exists:', filePath);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Image file not found: ${filePath}`);
      return res.status(404).json({ error: 'Image not found', path: filePath });
    }
    console.log('✅ File exists');

    // Get file stats
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      console.error(`❌ Path is not a file: ${filePath}`);
      return res.status(404).json({ error: 'Path is not a file', path: filePath });
    }
    console.log('✅ Path is a valid file');
    console.log('File size:', stats.size, 'bytes');

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.tiff':
      case '.tif':
        contentType = 'image/tiff';
        break;
    }

    console.log('Content type determined:', contentType);
    console.log('✅ Starting to serve image...');

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream the file
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('open', () => {
      console.log('✅ File stream opened successfully');
    });

    fileStream.on('error', (error) => {
      console.error(`❌ Error streaming file ${filePath}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file', details: error.message });
      }
    });

    fileStream.on('end', () => {
      console.log('✅ File stream completed successfully');
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error(`❌ Error serving image:`, error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }

  console.log('=== END IMAGE SERVING DEBUG ===\n');
});

// API routes
router.use('/api/processing', processingRoutes);
router.use('/api/cards', cardsRoutes);
router.use('/api/dashboard', dashboardRoutes);

module.exports = router;