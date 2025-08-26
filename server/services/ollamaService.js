const axios = require('axios');

class OllamaService {
  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llava';
  }

  /**
   * Convert image file to base64
   */
  imageToBase64(imagePath) {
    try {
      console.log(`Converting image to base64: ${imagePath}`);
      const fs = require('fs');
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      console.log(`✅ Image converted to base64, size: ${base64Image.length} characters`);
      return base64Image;
    } catch (error) {
      console.error(`❌ Error converting image to base64: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze card image using Ollama
   */
  async analyzeCardImage(imagePath, isBack = false) {
    console.log(`\n=== OLLAMA ANALYSIS START ===`);
    console.log(`Analyzing ${isBack ? 'back' : 'front'} image: ${imagePath}`);

    try {
      // Check if Ollama is accessible
      await this.checkOllamaHealth();

      // Convert image to base64
      const base64Image = this.imageToBase64(imagePath);

      // Create prompt based on front or back image
      const prompt = isBack
        ? `Analyze this trading card back image. Extract any visible information including:
- Card number or ID
- Copyright year
- Manufacturer/brand
- Set name or series
- Any statistics or biographical information
- Card condition notes
Return the information in a structured format.`
        : `Analyze this trading card front image. Extract the following information:
- Player name
- Team name
- Sport (baseball, football, basketball, etc.)
- Card manufacturer (Topps, Panini, Upper Deck, etc.)
- Year or season
- Card number
- Set name or series
- Any special designations (rookie card, autograph, etc.)
- Estimated condition
Return the information in a structured format.`;

      console.log(`Making Ollama API request...`);
      console.log(`Model: ${this.model}`);
      console.log(`Prompt: ${prompt.substring(0, 100)}...`);

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        images: [base64Image],
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9
        }
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Ollama response received`);
      console.log(`Response length: ${response.data.response?.length || 0} characters`);
      console.log(`Response preview: ${response.data.response?.substring(0, 200) || 'No response'}...`);

      return {
        success: true,
        analysis: response.data.response,
        model: this.model,
        isBack: isBack
      };

    } catch (error) {
      console.error(`❌ Ollama analysis failed: ${error.message}`);

      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama service is not running or not accessible');
      } else if (error.response?.status === 404) {
        throw new Error(`Ollama model '${this.model}' not found. Please pull the model first.`);
      } else if (error.code === 'ENOTFOUND') {
        throw new Error('Cannot connect to Ollama service. Check if it\'s running.');
      } else {
        throw new Error(`Ollama analysis failed: ${error.message}`);
      }
    } finally {
      console.log(`=== OLLAMA ANALYSIS END ===\n`);
    }
  }

  /**
   * Check if Ollama service is healthy
   */
  async checkOllamaHealth() {
    try {
      console.log(`Checking Ollama health at: ${this.baseUrl}`);
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      console.log(`✅ Ollama is healthy, available models: ${response.data.models?.length || 0}`);
      return true;
    } catch (error) {
      console.error(`❌ Ollama health check failed: ${error.message}`);
      throw new Error(`Ollama service is not accessible: ${error.message}`);
    }
  }

  /**
   * Parse Ollama response into structured card data
   */
  parseCardAnalysis(frontAnalysis, backAnalysis = null) {
    console.log(`\n=== PARSING CARD ANALYSIS ===`);
    console.log(`Front analysis: ${frontAnalysis?.substring(0, 100)}...`);
    console.log(`Back analysis: ${backAnalysis?.substring(0, 100) || 'None'}...`);

    try {
      // This is a simplified parser - in a real implementation you'd want more sophisticated parsing
      const cardData = {
        manufacturer: this.extractField(frontAnalysis, ['manufacturer', 'brand', 'company']) || 'Unknown',
        sport: this.extractField(frontAnalysis, ['sport']) || 'Unknown',
        setName: this.extractField(frontAnalysis, ['set', 'series']) || 'Unknown Set',
        cardNumber: this.extractField(frontAnalysis, ['number', 'card number', '#']) || 'Unknown',
        playerName: this.extractField(frontAnalysis, ['player', 'name', 'athlete']) || 'Unknown Player',
        team: this.extractField(frontAnalysis, ['team']) || 'Unknown Team',
        year: this.extractYear(frontAnalysis, backAnalysis) || new Date().getFullYear(),
        condition: this.extractField(frontAnalysis, ['condition']) || 'Unknown',
        specialFeatures: this.extractSpecialFeatures(frontAnalysis),
        estimatedValue: 0, // Will be set by price lookup service
        analysisRaw: {
          front: frontAnalysis,
          back: backAnalysis
        }
      };

      console.log(`✅ Parsed card data:`, cardData);
      return cardData;

    } catch (error) {
      console.error(`❌ Error parsing card analysis: ${error.message}`);
      throw error;
    } finally {
      console.log(`=== END PARSING CARD ANALYSIS ===\n`);
    }
  }

  /**
   * Extract specific field from analysis text
   */
  extractField(text, keywords) {
    if (!text) return null;

    const lines = text.toLowerCase().split('\n');
    for (const keyword of keywords) {
      for (const line of lines) {
        if (line.includes(keyword.toLowerCase())) {
          // Try to extract value after colon or similar
          const match = line.match(new RegExp(`${keyword.toLowerCase()}[:\\s-]*([^\\n\\r,]+)`, 'i'));
          if (match && match[1]) {
            return match[1].trim();
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract year from analysis
   */
  extractYear(frontAnalysis, backAnalysis) {
    const text = `${frontAnalysis || ''} ${backAnalysis || ''}`;
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }

  /**
   * Extract special features
   */
  extractSpecialFeatures(text) {
    if (!text) return [];

    const features = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('rookie')) features.push('Rookie Card');
    if (lowerText.includes('autograph') || lowerText.includes('auto')) features.push('Autograph');
    if (lowerText.includes('jersey') || lowerText.includes('relic')) features.push('Game-Used');
    if (lowerText.includes('serial') || lowerText.includes('numbered')) features.push('Serial Numbered');
    if (lowerText.includes('parallel')) features.push('Parallel');

    return features;
  }
}

module.exports = new OllamaService();