const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Helper function to check if file is an image
const isImageFile = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.tiff', '.tif'];
  return imageExtensions.includes(path.extname(filename).toLowerCase());
};

// Helper function to find card pairs
const findCardPairs = (files, directoryPath) => {
  const pairs = [];
  const frontFiles = files.filter(f => f.includes('-front.'));

  console.log(`Looking for card pairs in ${frontFiles.length} front files`);

  frontFiles.forEach(frontFile => {
    const baseName = frontFile.replace('-front.', '-back.');
    const backFile = files.find(f => f === baseName);

    if (backFile) {
      const id = frontFile.replace('-front.', '').replace(/\.[^/.]+$/, '');
      const frontPath = path.join(directoryPath, frontFile);
      const backPath = path.join(directoryPath, backFile);
      
      pairs.push({
        id: id,
        frontImage: frontPath,  // Full path instead of just filename
        backImage: backPath,    // Full path instead of just filename
        filename: frontFile,
        valid: true,
        selected: false
      });
      
      console.log(`Found card pair: ${frontFile} & ${backFile}`);
    } else {
      console.log(`No back image found for: ${frontFile}`);
    }
  });

  return pairs;
};

// Helper function to scan directory recursively
const scanDirectory = async (dirPath, includeSubdirectories = false) => {
  let allFiles = [];

  try {
    console.log(`Scanning directory: ${dirPath}`);
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    console.log(`Found ${items.length} items in directory`);

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory() && includeSubdirectories) {
        console.log(`Scanning subdirectory: ${item.name}`);
        const subFiles = await scanDirectory(fullPath, true);
        allFiles = allFiles.concat(subFiles);
      } else if (item.isFile() && isImageFile(item.name)) {
        console.log(`Found image file: ${item.name}`);
        allFiles.push(item.name);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
    throw error;
  }

  return allFiles;
};

// GET /api/processing/directory - Get directory contents and card image pairs
router.get('/directory', async (req, res) => {
  try {
    const { directory, includeSubdirectories } = req.query;

    console.log('Processing directory request:', { directory, includeSubdirectories });

    if (!directory) {
      return res.status(400).json({
        error: 'Directory parameter is required'
      });
    }

    // Check if directory exists
    try {
      const stats = await fs.stat(directory);
      if (!stats.isDirectory()) {
        return res.status(400).json({
          error: 'Provided path is not a directory'
        });
      }
    } catch (error) {
      console.error(`Directory access error: ${error.message}`);
      return res.status(404).json({
        error: 'Directory not found or not accessible',
        message: error.message
      });
    }

    // Scan directory for image files
    const files = await scanDirectory(directory, includeSubdirectories === 'true');
    console.log(`Found ${files.length} image files in directory`);

    // Find card pairs (front/back combinations)
    const cardPairs = findCardPairs(files, directory);
    console.log(`Found ${cardPairs.length} card pairs`);

    res.json({
      files: cardPairs,
      totalCount: cardPairs.length
    });

  } catch (error) {
    console.error('Error processing directory request:', error);
    res.status(500).json({
      error: 'Failed to scan directory',
      message: error.message
    });
  }
});

// POST /api/processing/process - Process selected card files
router.post('/process', async (req, res) => {
  try {
    const { fileIds } = req.body;

    console.log('Processing cards request:', { fileIds });

    if (!fileIds || !Array.isArray(fileIds)) {
      return res.status(400).json({
        error: 'fileIds array is required'
      });
    }

    console.log(`Starting to process ${fileIds.length} card files...`);
    
    const processedCards = [];
    const errors = [];

    // Process each card (simulate for now)
    for (let i = 0; i < fileIds.length; i++) {
      const fileId = fileIds[i];
      console.log(`Processing card ${i + 1}/${fileIds.length}: ${fileId}`);
      
      try {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // TODO: Replace with actual Ollama processing
        // For now, create mock card data
        const mockCardData = {
          id: fileId,
          manufacturer: 'Topps',
          sport: 'Baseball',
          setName: '2023 Series 1',
          cardNumber: Math.floor(Math.random() * 500) + 1,
          playerName: 'Sample Player',
          year: 2023,
          estimatedValue: Math.floor(Math.random() * 100) + 10
        };
        
        processedCards.push(mockCardData);
        console.log(`Successfully processed card: ${fileId}`);
        
      } catch (error) {
        console.error(`Error processing card ${fileId}:`, error.message);
        errors.push(`Failed to process ${fileId}: ${error.message}`);
      }
    }

    console.log(`Processing completed. Success: ${processedCards.length}, Errors: ${errors.length}`);

    res.json({
      success: true,
      processedCount: processedCards.length,
      processedCards: processedCards,
      errors: errors
    });

  } catch (error) {
    console.error('Error processing cards:', error);
    res.status(500).json({
      error: 'Failed to process cards',
      message: error.message
    });
  }
});

module.exports = router;