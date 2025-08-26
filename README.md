# CardCat - Card Cataloging Application

CardCat is a web-based application for managing and cataloging sports and non-sports card collections. The app processes scanned card images (front and back pairs), extracts card details using AI image recognition, and provides price comparisons from online marketplaces.

## Prerequisites

Before running CardCat, ensure you have the following installed:

1. **Node.js** (v16 or higher) and npm
2. **MongoDB** (running on localhost:27017)
3. **Ollama** (running on localhost:11434 with llava model)

## Quick Start

1. **Clone the repository** (if not already done)
2. **Make the setup script executable:**
   ```bash
   chmod +x setup.sh
   ```

3. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

The setup script will:
- Check all prerequisites
- Install dependencies
- Configure environment variables
- Optionally start the application

## Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment

Create `server/.env` file:
```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/CardCat
JWT_SECRET=your-jwt-secret-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llava
```

### 3. Start Services

Ensure MongoDB and Ollama are running:

**MongoDB:**
- Ubuntu/Debian: `sudo systemctl start mongod`
- macOS: `brew services start mongodb-community`
- Windows: `net start MongoDB`

**Ollama:**
```bash
# Start Ollama service
ollama serve

# Pull the required model (in another terminal)
ollama pull llava
```

### 4. Start the Application

```bash
# Development mode (recommended for development)
npm run dev

# Production mode
npm start
```

## Application URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## Features

- **Dashboard:** Overview of your card collection with statistics
- **File Processing:** Upload and process card images with AI recognition
- **Card Database:** Browse, search, and manage your cataloged cards
- **Settings:** Configure eBay API, Ollama settings, and preferences

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check if port 27017 is available: `netstat -ln | grep 27017`
- Verify database URL in `server/.env`

### Ollama Connection Issues
- Ensure Ollama is running: `curl http://localhost:11434/api/tags`
- Check if llava model is installed: `ollama list`
- Pull the model if missing: `ollama pull llava`

### Port Conflicts
- Frontend runs on port 5173 (Vite dev server)
- Backend runs on port 3000
- Ensure these ports are available

### Dependencies Issues
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Clear client dependencies: `cd client && rm -rf node_modules package-lock.json && npm install`
- Clear server dependencies: `cd server && rm -rf node_modules package-lock.json && npm install`

## Development

### Project Structure
```
CardCat/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── setup.sh         # Setup script
├── package.json     # Root package configuration
└── README.md        # This file
```

### Available Scripts
- `npm start` - Start both frontend and backend in production mode
- `npm run dev` - Start both frontend and backend in development mode
- `npm run client` - Start only frontend
- `npm run server` - Start only backend

## API Configuration

### eBay API (Optional)
To enable price comparisons, configure eBay API credentials in the Settings page:
1. Get eBay Developer credentials
2. Go to Settings → eBay Configuration
3. Enter your API credentials

### Ollama Models
The application uses the `llava` model by default for image recognition. You can configure different models in the Settings page.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are properly installed
3. Check the application logs for error messages
4. Verify environment configuration in `server/.env`