const express = require('express');
const router = express.Router();

/**
 * POST /api/processing/scan-directory
 * Scan directory for card images
 */
router.post('/scan-directory', async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  try {
    console.log(`[${requestId}] Scan directory endpoint called from ${req.ip}`);
    console.log(`[${requestId}] Request body:`, req.body);
    const startTime = Date.now();

    const { directoryPath, includeSubdirectories } = req.body;

    if (!directoryPath) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'directoryPath is required'
      });
    }

    console.log(`[${requestId}] Scanning directory: ${directoryPath}, includeSubdirectories: ${includeSubdirectories}`);

    // Mock data for now - this will be replaced with actual file system scanning later
    const files = [];

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Scan directory response sent (${duration}ms) - ${files.length} files found`);

    res.json({ files });
  } catch (error) {
    console.error(`[${requestId}] Error scanning directory:`, error.message);
    console.error(`[${requestId}] Stack trace:`, error.stack);

    res.status(500).json({
      error: 'Failed to scan directory',
      message: error.message
    });
  }
});

/**
 * POST /api/processing/process-files
 * Process selected card files
 */
router.post('/process-files', async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  try {
    console.log(`[${requestId}] Process files endpoint called from ${req.ip}`);
    console.log(`[${requestId}] Request body:`, req.body);
    const startTime = Date.now();

    const { selectedFiles } = req.body;

    if (!selectedFiles || !Array.isArray(selectedFiles)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'selectedFiles must be an array'
      });
    }

    console.log(`[${requestId}] Processing ${selectedFiles.length} files`);

    // Mock processing for now - this will be replaced with actual Ollama integration later
    const result = {
      success: true,
      processedCount: selectedFiles.length,
      message: `Successfully processed ${selectedFiles.length} files`
    };

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Process files response sent (${duration}ms) - ${selectedFiles.length} files processed`);

    res.json(result);
  } catch (error) {
    console.error(`[${requestId}] Error processing files:`, error.message);
    console.error(`[${requestId}] Stack trace:`, error.stack);

    res.status(500).json({
      error: 'Failed to process files',
      message: error.message
    });
  }
});

module.exports = router;