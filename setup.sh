#!/bin/bash

# CardCat Setup Script
# This script sets up the CardCat application by checking prerequisites,
# configuring environment variables, installing dependencies, and optionally starting the application.

set -e  # Exit on any error

echo "=== CardCat Setup Script ==="
echo

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "[WARNING] Running as root. This is not required but acceptable."
else
    echo "[INFO] Running as regular user."
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
service_running() {
    pgrep -f "$1" >/dev/null 2>&1
}

echo "[INFO] Checking prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "[SUCCESS] Node.js is installed: $NODE_VERSION"
else
    echo "[ERROR] Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "[SUCCESS] npm is installed: $NPM_VERSION"
else
    echo "[ERROR] npm is not installed. Please install npm first."
    exit 1
fi

# Check MongoDB
echo "[INFO] Checking MongoDB connection..."
if command_exists mongosh; then
    if mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
        echo "[SUCCESS] MongoDB is accessible via mongosh"
    else
        echo "[ERROR] MongoDB is not accessible. Please start MongoDB service."
        exit 1
    fi
elif command_exists mongo; then
    if mongo --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
        echo "[SUCCESS] MongoDB is accessible via mongo"
    else
        echo "[ERROR] MongoDB is not accessible. Please start MongoDB service."
        exit 1
    fi
else
    echo "[ERROR] MongoDB client (mongosh or mongo) is not installed."
    exit 1
fi

# Check Ollama
echo "[INFO] Checking Ollama service..."
if command_exists ollama; then
    echo "[INFO] Ollama command found. Testing model availability..."
    
    # Test if ollama can list models
    if ollama list >/dev/null 2>&1; then
        echo "[SUCCESS] Ollama CLI is working and can list models"
    else
        echo "[WARNING] Ollama CLI found but may not be properly configured"
    fi
    
    # Test API connectivity
    echo "[INFO] Testing Ollama API connectivity..."
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "[SUCCESS] Ollama API is responding at http://localhost:11434"
    else
        echo "[WARNING] Ollama API not responding. Ollama service may not be running."
        echo "[INFO] Attempting to start Ollama service..."
        # Try to start ollama in background
        ollama serve >/dev/null 2>&1 &
        sleep 3
        if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
            echo "[SUCCESS] Ollama service started successfully"
        else
            echo "[ERROR] Could not start Ollama service. Please start it manually with 'ollama serve'"
            exit 1
        fi
    fi
    
    # Check if ollama process is running
    if service_running "ollama"; then
        echo "[SUCCESS] Ollama process is running"
    else
        echo "[WARNING] Ollama process not detected, but API is responding"
    fi
    
    echo "[SUCCESS] Ollama is running and accessible"
else
    echo "[ERROR] Ollama is not installed. Please install Ollama first."
    echo "[INFO] Visit https://ollama.ai for installation instructions."
    exit 1
fi

# Check for required AI model
echo "[INFO] Checking for required AI model..."
if ollama list | grep -q "llava"; then
    echo "[SUCCESS] Llava model is available"
else
    echo "[INFO] Llava model not found. Attempting to pull..."
    if ollama pull llava; then
        echo "[SUCCESS] Llava model installed successfully"
    else
        echo "[ERROR] Failed to install Llava model. Please run 'ollama pull llava' manually."
        exit 1
    fi
fi

# Setup environment variables
echo "[INFO] Setting up environment variables..."

# Server environment file
if [ ! -f "server/.env" ]; then
    echo "[INFO] Creating server environment file..."
    cat > server/.env << EOF
# Port to listen on (example: 3000)
PORT=3000

# MongoDB database URL (example: mongodb://localhost/dbname)
DATABASE_URL=mongodb://localhost/cardcat
JWT_SECRET=your-jwt-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# Ollama configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llava

# eBay API configuration (optional - get from eBay Developer Program)
# EBAY_APP_ID=your-ebay-app-id
# EBAY_CERT_ID=your-ebay-cert-id  
# EBAY_DEV_ID=your-ebay-dev-id
EOF
    echo "[SUCCESS] Server environment file created"
else
    echo "[INFO] Server environment file already exists"
fi

# Install dependencies
echo "[INFO] Installing root dependencies..."
if npm install; then
    echo "[SUCCESS] Root dependencies installed"
else
    echo "[ERROR] Failed to install root dependencies"
    exit 1
fi

echo "[INFO] Installing server dependencies..."
cd server
if npm install; then
    echo "[SUCCESS] Server dependencies installed"
else
    echo "[ERROR] Failed to install server dependencies"
    exit 1
fi
cd ..

echo "[INFO] Installing client dependencies..."
cd client
if npm install; then
    echo "[SUCCESS] Client dependencies installed"
else
    echo "[ERROR] Failed to install client dependencies"
    exit 1
fi
cd ..

echo "[SUCCESS] Setup completed successfully!"
echo
echo "[INFO] CardCat is ready to run!"
echo "[INFO]"
echo "[INFO] The application will be available at:"
echo "[INFO]   - Frontend: http://localhost:5173"
echo "[INFO]   - Backend API: http://localhost:3000"
echo "[INFO]"

# Ask if user wants to start the application
read -p "Do you want to start the application now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "[INFO] Starting CardCat application..."
    
    # Check if we're in production mode
    if [ "$1" = "prod" ]; then
        echo "[INFO] Starting in production mode..."
        npm start
    else
        echo "[INFO] Starting in development mode..."
        npm start
    fi
else
    echo "[INFO] Setup complete. To start the application later, run:"
    echo "[INFO]   npm start"
fi