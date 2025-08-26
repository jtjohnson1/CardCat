const axios = require('axios');

class OllamaService {
  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'; // INPUT_REQUIRED {Ollama server URL}
    this.model = process.env.OLLAMA_MODEL || 'llava'; // INPUT_REQUIRED {Ollama vision model name}
    this.timeout = 120000; // 2 minutes timeout for image analysis
  }

  async analyzeCardImage(imagePath, imageType = 'front') {
    console.log(`Starting Ollama analysis for ${imageType} image: ${imagePath}`);
    
    try {
      // Read image file and convert to base64
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      console.log(`Image loaded and converted to base64, size: ${imageBuffer.length} bytes`);

      // Create appropriate prompt based on image type and standard card dimensions
      const prompt = this.createAnalysisPrompt(imageType);
      
      console.log(`Sending request to Ollama API at ${this.baseUrl}`);
      
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          images: [base64Image],
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9
          }
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.response) {
        throw new Error('Invalid response from Ollama API');
      }

      console.log(`Ollama analysis completed for ${imageType} image`);
      console.log(`Raw response length: ${response.data.response.length} characters`);

      // Parse the response to extract structured data
      const analysisResult = this.parseAnalysisResponse(response.data.response, imageType);
      
      console.log(`Parsed analysis result:`, JSON.stringify(analysisResult, null, 2));
      
      return analysisResult;

    } catch (error) {
      console.error(`Error analyzing ${imageType} image with Ollama:`, error);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Ollama server. Please ensure Ollama is running and accessible.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Ollama analysis timed out. The image may be too large or complex.');
      } else if (error.response) {
        console.error('Ollama API error response:', error.response.data);
        throw new Error(`Ollama API error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        throw new Error(`Ollama analysis failed: ${error.message}`);
      }
    }
  }

  createAnalysisPrompt(imageType) {
    const baseContext = `You are analyzing a standard trading card image with dimensions 2.5" x 3.5" (aspect ratio 5:7). This is a professional sports trading card.`;
    
    if (imageType === 'front') {
      return `${baseContext}

This is the FRONT side of a trading card. Please analyze this image and extract the following information in JSON format:

{
  "playerName": "Full player name",
  "team": "Team name or abbreviation",
  "sport": "Sport type (baseball, basketball, football, etc.)",
  "manufacturer": "Card manufacturer (Topps, Panini, Upper Deck, etc.)",
  "year": "Year of the card (number)",
  "setName": "Set or series name",
  "cardNumber": "Card number",
  "condition": "Estimated condition (Mint, Near Mint, Excellent, Very Good, Good, Fair, Poor)",
  "specialFeatures": ["Array of special features like Rookie Card, Autograph, Jersey Card, etc."],
  "estimatedValue": "Estimated value in USD (number)"
}

Focus on:
- Player identification from the image
- Team logos and colors
- Card design elements that indicate manufacturer
- Any visible text or numbers
- Card condition based on visible wear, corners, edges
- Special features like holograms, autographs, or memorabilia pieces
- The standard trading card format (2.5" x 3.5")

Provide only the JSON response, no additional text.`;
    } else {
      return `${baseContext}

This is the BACK side of a trading card. Please analyze this image and extract additional information in JSON format:

{
  "backText": "Any readable text from the back",
  "statistics": "Player statistics if visible",
  "biography": "Brief player information if visible",
  "manufacturer": "Card manufacturer from back design",
  "year": "Year if visible on back",
  "setName": "Set name if different from front",
  "cardNumber": "Card number if visible",
  "condition": "Condition assessment from back",
  "additionalFeatures": ["Any additional features visible on back"]
}

Focus on:
- Copyright information and manufacturer details
- Player statistics and biographical information
- Card numbering and set information
- Condition assessment from the back side
- Any special features or design elements
- The standard trading card format (2.5" x 3.5")

Provide only the JSON response, no additional text.`;
    }
  }

  parseAnalysisResponse(response, imageType) {
    console.log(`Parsing Ollama response for ${imageType} image`);
    
    try {
      // Try to extract JSON from the response
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.warn('No JSON found in response, attempting to parse entire response');
        jsonMatch = [response];
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate and clean the parsed data
      const cleaned = this.cleanAnalysisData(parsed, imageType);
      
      return cleaned;

    } catch (parseError) {
      console.error('Failed to parse Ollama response as JSON:', parseError);
      console.log('Raw response:', response);
      
      // Return a default structure if parsing fails
      return this.getDefaultAnalysisResult(imageType);
    }
  }

  cleanAnalysisData(data, imageType) {
    console.log('Cleaning and validating analysis data');
    
    const cleaned = {};

    if (imageType === 'front') {
      cleaned.playerName = this.cleanString(data.playerName) || 'Unknown Player';
      cleaned.team = this.cleanString(data.team) || 'Unknown Team';
      cleaned.sport = this.cleanString(data.sport) || 'Unknown Sport';
      cleaned.manufacturer = this.cleanString(data.manufacturer) || 'Unknown Manufacturer';
      cleaned.year = this.cleanYear(data.year) || new Date().getFullYear();
      cleaned.setName = this.cleanString(data.setName) || 'Unknown Set';
      cleaned.cardNumber = this.cleanString(data.cardNumber) || 'Unknown';
      cleaned.condition = this.cleanCondition(data.condition) || 'Good';
      cleaned.specialFeatures = this.cleanArray(data.specialFeatures) || [];
      cleaned.estimatedValue = this.cleanValue(data.estimatedValue) || 1.00;
    } else {
      cleaned.backText = this.cleanString(data.backText) || '';
      cleaned.statistics = this.cleanString(data.statistics) || '';
      cleaned.biography = this.cleanString(data.biography) || '';
      cleaned.manufacturer = this.cleanString(data.manufacturer) || '';
      cleaned.year = this.cleanYear(data.year) || null;
      cleaned.setName = this.cleanString(data.setName) || '';
      cleaned.cardNumber = this.cleanString(data.cardNumber) || '';
      cleaned.condition = this.cleanCondition(data.condition) || '';
      cleaned.additionalFeatures = this.cleanArray(data.additionalFeatures) || [];
    }

    return cleaned;
  }

  cleanString(value) {
    if (typeof value !== 'string') return null;
    return value.trim().replace(/[^\w\s\-\.]/g, '').substring(0, 200);
  }

  cleanYear(value) {
    const year = parseInt(value);
    if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
      return null;
    }
    return year;
  }

  cleanCondition(value) {
    const validConditions = ['Mint', 'Near Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
    if (typeof value === 'string') {
      const found = validConditions.find(c => 
        c.toLowerCase() === value.toLowerCase().trim()
      );
      return found || null;
    }
    return null;
  }

  cleanArray(value) {
    if (!Array.isArray(value)) return [];
    return value
      .filter(item => typeof item === 'string')
      .map(item => this.cleanString(item))
      .filter(item => item && item.length > 0)
      .slice(0, 10); // Limit to 10 features
  }

  cleanValue(value) {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 1000000) {
      return null;
    }
    return Math.round(num * 100) / 100; // Round to 2 decimal places
  }

  getDefaultAnalysisResult(imageType) {
    console.log(`Returning default analysis result for ${imageType} image`);
    
    if (imageType === 'front') {
      return {
        playerName: 'Unknown Player',
        team: 'Unknown Team',
        sport: 'Unknown Sport',
        manufacturer: 'Unknown Manufacturer',
        year: new Date().getFullYear(),
        setName: 'Unknown Set',
        cardNumber: 'Unknown',
        condition: 'Good',
        specialFeatures: [],
        estimatedValue: 1.00
      };
    } else {
      return {
        backText: '',
        statistics: '',
        biography: '',
        manufacturer: '',
        year: null,
        setName: '',
        cardNumber: '',
        condition: '',
        additionalFeatures: []
      };
    }
  }

  async testConnection() {
    console.log('Testing connection to Ollama server');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      console.log('Ollama server connection successful');
      console.log('Available models:', response.data.models?.map(m => m.name) || []);
      
      return {
        connected: true,
        models: response.data.models || [],
        serverUrl: this.baseUrl
      };
      
    } catch (error) {
      console.error('Failed to connect to Ollama server:', error);
      
      return {
        connected: false,
        error: error.message,
        serverUrl: this.baseUrl
      };
    }
  }

  async mergeAnalysisResults(frontResult, backResult) {
    console.log('Merging front and back analysis results');
    
    try {
      // Start with front result as base
      const merged = { ...frontResult };
      
      // Enhance with back result data where available
      if (backResult.manufacturer && backResult.manufacturer !== '') {
        merged.manufacturer = backResult.manufacturer;
      }
      
      if (backResult.year && !merged.year) {
        merged.year = backResult.year;
      }
      
      if (backResult.setName && backResult.setName !== '') {
        merged.setName = backResult.setName;
      }
      
      if (backResult.cardNumber && backResult.cardNumber !== '') {
        merged.cardNumber = backResult.cardNumber;
      }
      
      // Merge condition - use worse condition if both available
      if (backResult.condition) {
        const conditions = ['Mint', 'Near Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
        const frontIndex = conditions.indexOf(merged.condition);
        const backIndex = conditions.indexOf(backResult.condition);
        
        if (backIndex > frontIndex) {
          merged.condition = backResult.condition;
        }
      }
      
      // Merge special features
      if (backResult.additionalFeatures && backResult.additionalFeatures.length > 0) {
        merged.specialFeatures = [
          ...merged.specialFeatures,
          ...backResult.additionalFeatures
        ].filter((feature, index, arr) => arr.indexOf(feature) === index); // Remove duplicates
      }
      
      // Add back-specific data
      merged.backAnalysis = {
        backText: backResult.backText || '',
        statistics: backResult.statistics || '',
        biography: backResult.biography || ''
      };
      
      console.log('Analysis results merged successfully');
      return merged;
      
    } catch (error) {
      console.error('Error merging analysis results:', error);
      throw new Error(`Failed to merge analysis results: ${error.message}`);
    }
  }
}

module.exports = new OllamaService();