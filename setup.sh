#!/bin/bash

# CardCat Setup Script
# This script configures and launches the CardCat application

set -e  # Exit on any error

echo "=== CardCat Setup Script ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (optional, but recommended for some operations)
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. This is not required but acceptable."
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18+ and rerun this script."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm and rerun this script."
    exit 1
fi

# Check MongoDB
print_info "Checking MongoDB connection..."
if command_exists mongosh; then
    # Try to connect to MongoDB
    if mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
        print_status "MongoDB is accessible via mongosh"
    else
        print_error "MongoDB is not accessible. Please start MongoDB and rerun this script."
        exit 1
    fi
elif command_exists mongo; then
    # Fallback to legacy mongo client
    if mongo --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
        print_status "MongoDB is accessible via mongo"
    else
        print_error "MongoDB is not accessible. Please start MongoDB and rerun this script."
        exit 1
    fi
else
    print_warning "MongoDB client (mongosh/mongo) not found. Assuming MongoDB is running..."
fi

# Check Ollama with multiple methods
print_info "Checking Ollama service..."

OLLAMA_RUNNING=false
OLLAMA_URL="http://localhost:11434"

# Method 1: Check if ollama command exists and list models
if command_exists ollama; then
    print_info "Ollama command found. Testing model availability..."
    if ollama list >/dev/null 2>&1; then
        print_status "Ollama CLI is working and can list models"
        OLLAMA_RUNNING=true
    else
        print_warning "Ollama CLI exists but cannot list models"
    fi
else
    print_warning "Ollama CLI command not found in PATH"
fi

# Method 2: Check if Ollama API is responding
print_info "Testing Ollama API connectivity..."
if command_exists curl; then
    # Test API endpoint with timeout
    if curl -s --connect-timeout 5 --max-time 10 "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
        print_status "Ollama API is responding at $OLLAMA_URL"
        OLLAMA_RUNNING=true
    else
        print_warning "Ollama API not responding at $OLLAMA_URL"
    fi
elif command_exists wget; then
    # Fallback to wget
    if wget -q --timeout=10 --tries=1 -O /dev/null "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
        print_status "Ollama API is responding at $OLLAMA_URL"
        OLLAMA_RUNNING=true
    else
        print_warning "Ollama API not responding at $OLLAMA_URL"
    fi
else
    print_warning "Neither curl nor wget available for API testing"
fi

# Method 3: Check for Ollama process
if pgrep -f "ollama" >/dev/null 2>&1; then
    print_status "Ollama process is running"
    OLLAMA_RUNNING=true
else
    print_warning "No Ollama process found"
fi

# Final Ollama validation
if [ "$OLLAMA_RUNNING" = true ]; then
    print_status "Ollama is running and accessible"
    
    # Check for required model
    print_info "Checking for required AI model..."
    if command_exists ollama; then
        if ollama list | grep -q "llava"; then
            print_status "Llava model is available"
        else
            print_warning "Llava model not found. You may need to run: ollama pull llava"
        fi
    fi
else
    print_error "Ollama is not running or not accessible."
    print_info "Please ensure Ollama is installed and running:"
    print_info "  1. Install Ollama: https://ollama.ai/"
    print_info "  2. Start Ollama service"
    print_info "  3. Pull required model: ollama pull llava"
    print_info "  4. Rerun this setup script"
    exit 1
fi

# Setup environment variables
print_info "Setting up environment variables..."

# Server environment
SERVER_ENV_FILE="server/.env"
if [ ! -f "$SERVER_ENV_FILE" ]; then
    print_info "Creating server environment file..."
    cat > "$SERVER_ENV_FILE" << EOF
# Port to listen on
PORT=3000

# MongoDB database URL
DATABASE_URL=mongodb://localhost/CardCat

# JWT secrets (generate your own in production)
JWT_SECRET=your-jwt-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# Ollama configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llava

# eBay API configuration (optional - configure in app settings)
EBAY_APP_ID=
EBAY_CERT_ID=
EBAY_DEV_ID=
EOF
    print_status "Server environment file created"
else
    print_info "Server environment file already exists"
fi

# Install dependencies
print_info "Installing server dependencies..."
cd server
if npm install; then
    print_status "Server dependencies installed"
else
    print_error "Failed to install server dependencies"
    exit 1
fi
cd ..

print_info "Installing client dependencies..."
cd client
if npm install; then
    print_status "Client dependencies installed"
else
    print_error "Failed to install client dependencies"
    exit 1
fi
cd ..

print_status "Setup completed successfully!"
echo ""
print_info "CardCat is ready to run!"
print_info ""
print_info "The application will be available at:"
print_info "  - Frontend: http://localhost:5173"
print_info "  - Backend API: http://localhost:3000"
print_info ""

# Ask if user wants to start the application
read -p "Do you want to start the application now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting CardCat application..."
    print_info "Starting in production mode..."
    exec npm start
else
    print_info "You can start the application later by running: npm start"
    print_info "Make sure MongoDB and Ollama are running before starting the application."
fi