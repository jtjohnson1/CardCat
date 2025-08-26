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
const findCardPairs = (files) => {
  const pairs = [];
  const frontFiles = files.filter(f => f.includes('-front.'));
  
  frontFiles.forEach(frontFile => {
    const baseName = frontFile.replace('-front.', '-back.');
    const backFile = files.find(f => f === baseName);
    
    if (backFile) {
      const id = frontFile.replace('-front.', '').replace(/\.[^/.]+$/, '');
      pairs.push({
        id: id,
        frontImage: frontFile,
        backImage: backFile,
        filename: frontFile,
        valid: true,
        selected: false
      });
    }
  });
  
  return pairs;
};

// Helper function to scan directory recursively
const scanDirectory = async (dirPath, includeSubdirectories = false) => {
  let allFiles = [];
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory() && includeSubdirectories) {
        const subFiles = await scanDirectory(fullPath, true);
        allFiles = allFiles.concat(subFiles);
      } else if (item.isFile() && isImageFile(item.name)) {
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
      return res.status(404).json({ 
        error: 'Directory not found or not accessible' 
      });
    }
    
    // Scan directory for image files
    const files = await scanDirectory(directory, includeSubdirectories === 'true');
    console.log(`Found ${files.length} image files in directory`);
    
    // Find card pairs (front/back combinations)
    const cardPairs = findCardPairs(files);
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
    
    // TODO: Implement actual card processing with Ollama
    // For now, simulate processing
    console.log(`Processing ${fileIds.length} card files...`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      processedCount: fileIds.length,
      errors: []
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