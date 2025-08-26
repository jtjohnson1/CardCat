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
  console.log(`\n=== CARD PAIRING DEBUG ===`);
  console.log(`Total files to analyze: ${files.length}`);
  console.log(`Files found:`, files);

  const pairs = [];

  // Look for files that contain 'front' in their name
  const frontFiles = files.filter(f => {
    const isFront = f.toLowerCase().includes('front');
    console.log(`File "${f}" contains 'front': ${isFront}`);
    return isFront;
  });

  console.log(`Found ${frontFiles.length} potential front files:`, frontFiles);

  frontFiles.forEach(frontFile => {
    console.log(`\n--- Processing front file: ${frontFile} ---`);

    // Try different patterns to find the matching back file
    let backFile = null;

    // Pattern 1: Replace 'front' with 'back' (case insensitive)
    const pattern1 = frontFile.replace(/front/gi, 'back');
    console.log(`Pattern 1 (replace front with back): ${pattern1}`);
    if (files.includes(pattern1)) {
      backFile = pattern1;
      console.log(`✓ Found back file using pattern 1: ${backFile}`);
    }

    // Pattern 2: Replace '-front.' with '-back.'
    if (!backFile) {
      const pattern2 = frontFile.replace(/-front\./gi, '-back.');
      console.log(`Pattern 2 (replace -front. with -back.): ${pattern2}`);
      if (files.includes(pattern2)) {
        backFile = pattern2;
        console.log(`✓ Found back file using pattern 2: ${backFile}`);
      }
    }

    // Pattern 3: Replace '_front.' with '_back.'
    if (!backFile) {
      const pattern3 = frontFile.replace(/_front\./gi, '_back.');
      console.log(`Pattern 3 (replace _front. with _back.): ${pattern3}`);
      if (files.includes(pattern3)) {
        backFile = pattern3;
        console.log(`✓ Found back file using pattern 3: ${backFile}`);
      }
    }

    // Pattern 4: Replace 'Front' with 'Back' (exact case)
    if (!backFile) {
      const pattern4 = frontFile.replace(/Front/g, 'Back');
      console.log(`Pattern 4 (replace Front with Back): ${pattern4}`);
      if (files.includes(pattern4)) {
        backFile = pattern4;
        console.log(`✓ Found back file using pattern 4: ${backFile}`);
      }
    }

    if (backFile) {
      // Extract ID from filename (remove front/back suffix and extension)
      const id = frontFile.replace(/[-_]?front.*$/gi, '').replace(/\.[^/.]+$/, '');
      const frontPath = path.join(directoryPath, frontFile);
      const backPath = path.join(directoryPath, backFile);

      console.log(`✓ Creating card pair:`);
      console.log(`  ID: ${id}`);
      console.log(`  Front path: ${frontPath}`);
      console.log(`  Back path: ${backPath}`);

      // Create image URLs for serving
      const frontImageUrl = `/api/images/${encodeURIComponent(frontPath)}`;
      const backImageUrl = `/api/images/${encodeURIComponent(backPath)}`;

      console.log(`  Front image URL: ${frontImageUrl}`);
      console.log(`  Back image URL: ${backImageUrl}`);

      pairs.push({
        id: id,
        frontImage: frontImageUrl,
        backImage: backImageUrl,
        filename: frontFile,
        valid: true,
        selected: false
      });
    } else {
      console.log(`✗ No matching back file found for: ${frontFile}`);
      console.log(`Available files for comparison:`, files);
    }
  });

  console.log(`\n=== PAIRING SUMMARY ===`);
  console.log(`Total pairs created: ${pairs.length}`);
  console.log(`Pairs:`, pairs.map(p => ({ id: p.id, front: path.basename(p.frontImage), back: path.basename(p.backImage) })));
  console.log(`=== END DEBUG ===\n`);

  return pairs;
};

// Helper function to scan directory recursively
const scanDirectory = async (dirPath, includeSubdirectories = false) => {
  let allFiles = [];

  try {
    console.log(`\n=== DIRECTORY SCANNING ===`);
    console.log(`Scanning directory: ${dirPath}`);
    console.log(`Include subdirectories: ${includeSubdirectories}`);

    const items = await fs.readdir(dirPath, { withFileTypes: true });
    console.log(`Found ${items.length} items in directory`);

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      console.log(`Processing item: ${item.name} (isDirectory: ${item.isDirectory()}, isFile: ${item.isFile()})`);

      if (item.isDirectory() && includeSubdirectories) {
        console.log(`Scanning subdirectory: ${item.name}`);
        const subFiles = await scanDirectory(fullPath, true);
        allFiles = allFiles.concat(subFiles);
      } else if (item.isFile()) {
        const isImage = isImageFile(item.name);
        console.log(`File ${item.name} is image: ${isImage}`);
        if (isImage) {
          allFiles.push(item.name);
        }
      }
    }

    console.log(`Final file list from ${dirPath}:`, allFiles);
    console.log(`=== END DIRECTORY SCANNING ===\n`);
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
    console.error(`Full error details:`, error);
    throw error;
  }

  return allFiles;
};

// GET /api/processing/directory - Get directory contents and card image pairs
router.get('/directory', async (req, res) => {
  console.log('\n=== PROCESSING DIRECTORY REQUEST START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request query params:', req.query);
  console.log('Request headers:', req.headers);

  try {
    const { directory, includeSubdirectories } = req.query;

    console.log('Extracted parameters:', { directory, includeSubdirectories });

    if (!directory) {
      console.log('❌ Directory parameter is missing');
      return res.status(400).json({
        error: 'Directory parameter is required'
      });
    }

    console.log(`✓ Directory parameter provided: ${directory}`);

    // Check if directory exists
    try {
      console.log(`Checking if directory exists: ${directory}`);
      const stats = await fs.stat(directory);
      console.log(`Directory stats:`, {
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
        mode: stats.mode
      });

      if (!stats.isDirectory()) {
        console.log('❌ Provided path is not a directory');
        return res.status(400).json({
          error: 'Provided path is not a directory'
        });
      }
      console.log(`✓ Directory ${directory} exists and is accessible`);
    } catch (error) {
      console.error(`❌ Directory access error:`, error);
      console.error(`Error code: ${error.code}`);
      console.error(`Error message: ${error.message}`);
      return res.status(404).json({
        error: 'Directory not found or not accessible',
        message: error.message,
        code: error.code
      });
    }

    // Scan directory for image files
    console.log('Starting directory scan...');
    const files = await scanDirectory(directory, includeSubdirectories === 'true');
    console.log(`✓ Scan complete. Found ${files.length} image files total`);

    // Find card pairs (front/back combinations)
    console.log('Starting card pairing...');
    const cardPairs = findCardPairs(files, directory);
    console.log(`✓ Pairing complete. Found ${cardPairs.length} card pairs`);

    const response = {
      files: cardPairs,
      totalCount: cardPairs.length
    };

    console.log('Final response structure:', {
      filesCount: response.files.length,
      totalCount: response.totalCount,
      sampleFile: response.files[0] || 'No files found'
    });

    console.log('✓ Sending successful response');
    console.log('=== PROCESSING DIRECTORY REQUEST END ===\n');

    res.json(response);

  } catch (error) {
    console.error('❌ Error processing directory request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to scan directory',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/processing/process - Process selected card files
router.post('/process', async (req, res) => {
  console.log('\n=== PROCESSING CARDS REQUEST START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);

  try {
    const { fileIds } = req.body;

    console.log('Extracted fileIds:', fileIds);

    if (!fileIds || !Array.isArray(fileIds)) {
      console.log('❌ Invalid fileIds parameter');
      return res.status(400).json({
        error: 'fileIds array is required'
      });
    }

    console.log(`✓ Starting to process ${fileIds.length} card files...`);

    const processedCards = [];
    const errors = [];

    // Process each card (simulate for now)
    for (let i = 0; i < fileIds.length; i++) {
      const fileId = fileIds[i];
      console.log(`\n--- Processing card ${i + 1}/${fileIds.length}: ${fileId} ---`);

      try {
        // Simulate processing time
        console.log('Simulating processing delay...');
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
        console.log(`✓ Successfully processed card: ${fileId}`);
        console.log(`Card data:`, mockCardData);

      } catch (error) {
        console.error(`❌ Error processing card ${fileId}:`, error);
        console.error(`Error stack:`, error.stack);
        errors.push(`Failed to process ${fileId}: ${error.message}`);
      }
    }

    console.log(`\n=== PROCESSING SUMMARY ===`);
    console.log(`✓ Processing completed. Success: ${processedCards.length}, Errors: ${errors.length}`);
    console.log(`Processed cards:`, processedCards);
    console.log(`Errors:`, errors);

    const response = {
      success: true,
      processedCount: processedCards.length,
      processedCards: processedCards,
      errors: errors
    };

    console.log('✓ Sending successful processing response');
    console.log('=== PROCESSING CARDS REQUEST END ===\n');

    res.json(response);

  } catch (error) {
    console.error('❌ Error processing cards:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to process cards',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;