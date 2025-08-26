const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Import route modules
const processingRoutes = require('./processing');

// Home route
router.get("/", (req, res) => {
  res.json({ message: "CardCat API Server" });
});

// Image serving endpoint
router.get('/api/images/*', (req, res) => {
  try {
    // Extract the file path from the URL
    const filePath = req.params[0];
    console.log(`Image request for: ${filePath}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Image file not found: ${filePath}`);
      return res.status(404).json({ error: 'Image not found' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      console.error(`Path is not a file: ${filePath}`);
      return res.status(404).json({ error: 'Path is not a file' });
    }

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

    console.log(`Serving image: ${filePath} (${contentType})`);

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error(`Error streaming file ${filePath}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });

  } catch (error) {
    console.error(`Error serving image:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API routes
router.use('/api/processing', processingRoutes);

module.exports = router;