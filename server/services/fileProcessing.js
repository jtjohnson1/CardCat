const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileProcessingService {
  constructor() {
    this.supportedImageExtensions = ['.jpg', '.jpeg', '.png', '.tiff', '.tif'];
    this.processingQueue = new Map();
  }

  /**
   * Get directory contents and identify card image pairs
   */
  async getDirectoryContents(directory, includeSubdirectories = false) {
    console.log('\n=== FILE PROCESSING SERVICE: getDirectoryContents ===');
    console.log('Directory:', directory);
    console.log('Include subdirectories:', includeSubdirectories);

    try {
      // Validate directory exists
      if (!fs.existsSync(directory)) {
        console.error('❌ Directory does not exist:', directory);
        throw new Error(`Directory does not exist: ${directory}`);
      }

      const stats = fs.statSync(directory);
      if (!stats.isDirectory()) {
        console.error('❌ Path is not a directory:', directory);
        throw new Error(`Path is not a directory: ${directory}`);
      }

      console.log('✅ Directory exists and is valid');

      // Get all image files
      const imageFiles = await this.getAllImageFiles(directory, includeSubdirectories);
      console.log('Found image files:', imageFiles.length);

      // Group files into card pairs
      const cardPairs = this.groupIntoCardPairs(imageFiles);
      console.log('Identified card pairs:', cardPairs.length);

      // Convert to FileItem format
      const files = cardPairs.map(pair => {
        const id = crypto.randomUUID();
        const frontImageUrl = `/api/images/${encodeURIComponent(pair.front)}`;
        const backImageUrl = `/api/images/${encodeURIComponent(pair.back)}`;
        
        console.log('Card pair:', {
          id,
          front: pair.front,
          back: pair.back,
          frontUrl: frontImageUrl,
          backUrl: backImageUrl
        });

        return {
          id,
          frontImage: frontImageUrl,
          backImage: backImageUrl,
          filename: path.basename(pair.front, path.extname(pair.front)),
          valid: this.validateCardPair(pair),
          selected: false
        };
      });

      console.log('✅ Successfully processed directory contents');
      console.log('Total files returned:', files.length);

      return {
        files,
        totalCount: files.length
      };

    } catch (error) {
      console.error('❌ Error in getDirectoryContents:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Get all image files from directory (recursively if specified)
   */
  async getAllImageFiles(directory, includeSubdirectories) {
    console.log('Scanning directory for images:', directory);
    const imageFiles = [];

    try {
      const items = fs.readdirSync(directory);
      console.log('Directory items found:', items.length);

      for (const item of items) {
        const fullPath = path.join(directory, item);
        
        try {
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory() && includeSubdirectories) {
            console.log('Scanning subdirectory:', fullPath);
            const subFiles = await this.getAllImageFiles(fullPath, true);
            imageFiles.push(...subFiles);
          } else if (stats.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (this.supportedImageExtensions.includes(ext)) {
              console.log('Found image file:', fullPath);
              imageFiles.push(fullPath);
            }
          }
        } catch (statError) {
          console.error('❌ Error getting stats for:', fullPath, statError.message);
          continue;
        }
      }

      console.log('Total image files found in', directory, ':', imageFiles.length);
      return imageFiles;

    } catch (error) {
      console.error('❌ Error reading directory:', directory, error);
      throw new Error(`Failed to read directory: ${error.message}`);
    }
  }

  /**
   * Group image files into front/back card pairs
   */
  groupIntoCardPairs(imageFiles) {
    console.log('Grouping files into card pairs...');
    const pairs = [];
    const processedFiles = new Set();

    for (const file of imageFiles) {
      if (processedFiles.has(file)) {
        continue;
      }

      const baseName = this.getCardBaseName(file);
      const dir = path.dirname(file);
      const ext = path.extname(file);

      // Look for matching front/back files
      let frontFile = null;
      let backFile = null;

      // Check if current file is front or back
      if (this.isFrontFile(file)) {
        frontFile = file;
        // Look for corresponding back file
        const backPatterns = [
          path.join(dir, `${baseName}_back${ext}`),
          path.join(dir, `${baseName}_rear${ext}`),
          path.join(dir, `${baseName}b${ext}`),
          path.join(dir, `${baseName}_2${ext}`)
        ];

        for (const pattern of backPatterns) {
          if (imageFiles.includes(pattern)) {
            backFile = pattern;
            break;
          }
        }
      } else if (this.isBackFile(file)) {
        backFile = file;
        // Look for corresponding front file
        const frontPatterns = [
          path.join(dir, `${baseName}_front${ext}`),
          path.join(dir, `${baseName}f${ext}`),
          path.join(dir, `${baseName}_1${ext}`),
          path.join(dir, `${baseName}${ext}`)
        ];

        for (const pattern of frontPatterns) {
          if (imageFiles.includes(pattern)) {
            frontFile = pattern;
            break;
          }
        }
      } else {
        // Try to find a pair for this file
        const backPatterns = [
          path.join(dir, `${baseName}_back${ext}`),
          path.join(dir, `${baseName}_rear${ext}`),
          path.join(dir, `${baseName}b${ext}`),
          path.join(dir, `${baseName}_2${ext}`)
        ];

        for (const pattern of backPatterns) {
          if (imageFiles.includes(pattern)) {
            frontFile = file;
            backFile = pattern;
            break;
          }
        }
      }

      if (frontFile && backFile) {
        console.log('Found card pair:', {
          front: frontFile,
          back: backFile
        });
        pairs.push({ front: frontFile, back: backFile });
        processedFiles.add(frontFile);
        processedFiles.add(backFile);
      } else {
        console.log('No pair found for file:', file);
      }
    }

    console.log('Total card pairs identified:', pairs.length);
    return pairs;
  }

  /**
   * Get base name for card pairing
   */
  getCardBaseName(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Remove common suffixes
    const suffixes = ['_front', '_back', '_rear', '_f', '_b', '_1', '_2'];
    for (const suffix of suffixes) {
      if (fileName.endsWith(suffix)) {
        return fileName.slice(0, -suffix.length);
      }
    }
    
    return fileName;
  }

  /**
   * Check if file appears to be a front image
   */
  isFrontFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName.includes('front') || fileName.includes('_f') || fileName.includes('_1');
  }

  /**
   * Check if file appears to be a back image
   */
  isBackFile(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName.includes('back') || fileName.includes('rear') || fileName.includes('_b') || fileName.includes('_2');
  }

  /**
   * Validate that a card pair is valid
   */
  validateCardPair(pair) {
    try {
      // Check if both files exist
      if (!fs.existsSync(pair.front) || !fs.existsSync(pair.back)) {
        return false;
      }

      // Check if both are files
      const frontStats = fs.statSync(pair.front);
      const backStats = fs.statSync(pair.back);
      
      if (!frontStats.isFile() || !backStats.isFile()) {
        return false;
      }

      // Check file sizes (should be > 0)
      if (frontStats.size === 0 || backStats.size === 0) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error validating card pair:', error);
      return false;
    }
  }

  /**
   * Process selected cards
   */
  async processSelectedCards(fileIds) {
    console.log('\n=== FILE PROCESSING SERVICE: processSelectedCards ===');
    console.log('File IDs to process:', fileIds);

    try {
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        throw new Error('No file IDs provided for processing');
      }

      const results = {
        success: true,
        processedCount: 0,
        errors: []
      };

      for (const fileId of fileIds) {
        console.log('Processing file ID:', fileId);
        
        try {
          // Here you would implement the actual card processing logic
          // For now, we'll simulate processing
          await this.processCard(fileId);
          results.processedCount++;
          console.log('✅ Successfully processed card:', fileId);
        } catch (error) {
          console.error('❌ Error processing card:', fileId, error);
          results.errors.push(`Failed to process ${fileId}: ${error.message}`);
        }
      }

      if (results.errors.length > 0) {
        results.success = false;
      }

      console.log('✅ Processing completed:', results);
      return results;

    } catch (error) {
      console.error('❌ Error in processSelectedCards:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Process individual card
   */
  async processCard(fileId) {
    console.log('Processing individual card:', fileId);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Here you would implement:
    // 1. Image analysis
    // 2. OCR text extraction
    // 3. Card identification
    // 4. Database storage
    // 5. Metadata extraction
    
    console.log('Card processing completed for:', fileId);
  }

  /**
   * Get processing status
   */
  getProcessingStatus(jobId) {
    return this.processingQueue.get(jobId) || null;
  }

  /**
   * Cancel processing job
   */
  cancelProcessing(jobId) {
    console.log('Cancelling processing job:', jobId);
    
    if (this.processingQueue.has(jobId)) {
      const job = this.processingQueue.get(jobId);
      job.cancelled = true;
      this.processingQueue.delete(jobId);
      return true;
    }
    
    return false;
  }
}

module.exports = new FileProcessingService();