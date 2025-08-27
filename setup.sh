#!/bin/bash

# CardCat Application Setup and Launch Script
# This script configures and launches the CardCat application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a service is running
check_service() {
    local service_name=$1
    local check_command=$2
    
    log_info "Checking $service_name..."
    if eval "$check_command" >/dev/null 2>&1; then
        log_success "$service_name is running"
        return 0
    else
        log_error "$service_name is not running or not accessible"
        return 1
    fi
}

# Function to setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    if [ ! -f "server/.env" ]; then
        log_info "Creating server/.env file..."
        cat > server/.env << EOF
# Port to listen on
PORT=3000

# MongoDB database URL
DATABASE_URL=mongodb://localhost:27017/CardCat

# JWT Secrets (generated automatically)
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)

# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llava

# eBay API Configuration (to be configured later)
EBAY_APP_ID=
EBAY_CERT_ID=
EBAY_DEV_ID=
EBAY_USER_TOKEN=
EOF
        log_success "Created server/.env file"
    else
        log_info "server/.env file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    if [ -f "package.json" ]; then
        log_info "Installing root dependencies..."
        npm install
        log_success "Root dependencies installed"
    fi
    
    # Install server dependencies
    if [ -f "server/package.json" ]; then
        log_info "Installing server dependencies..."
        cd server
        npm install
        cd ..
        log_success "Server dependencies installed"
    fi
    
    # Install client dependencies
    if [ -f "client/package.json" ]; then
        log_info "Installing client dependencies..."
        cd client
        npm install
        cd ..
        log_success "Client dependencies installed"
    fi
}

# Function to check MongoDB connection
check_mongodb() {
    log_info "Checking MongoDB connection..."
    
    # Try to connect to MongoDB
    if command_exists mongosh; then
        if mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
            log_success "MongoDB is accessible via mongosh"
            return 0
        fi
    elif command_exists mongo; then
        if mongo --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
            log_success "MongoDB is accessible via mongo"
            return 0
        fi
    fi
    
    # Try alternative check using netstat or ss
    if netstat -ln 2>/dev/null | grep -q ":27017" || ss -ln 2>/dev/null | grep -q ":27017"; then
        log_success "MongoDB appears to be running on port 27017"
        return 0
    fi
    
    log_error "MongoDB is not running or not accessible"
    log_error "Please start MongoDB service before running this script"
    return 1
}

# Function to check Ollama
check_ollama() {
    log_info "Checking Ollama service..."
    
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        log_success "Ollama is running and accessible"
        
        # Check if llava model is available
        if curl -s http://localhost:11434/api/tags | grep -q "llava"; then
            log_success "Llava model is available"
        else
            log_warning "Llava model not found. You may need to pull it with: ollama pull llava"
        fi
        return 0
    else
        log_error "Ollama is not running or not accessible on port 11434"
        log_error "Please start Ollama service before running this script"
        return 1
    fi
}

# Function to start the application
start_application() {
    log_info "Starting CardCat application..."
    
    # Check if we're in development or production mode
    if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
        log_info "Starting in development mode..."
        npm run dev
    else
        log_info "Starting in production mode..."
        npm start
    fi
}

# Main execution
main() {
    echo "=================================================="
    echo "       CardCat Application Setup Script"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    log_info "Checking prerequisites..."
    
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    log_success "Node.js is available ($(node --version))"
    
    if ! command_exists npm; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    log_success "npm is available ($(npm --version))"
    
    # Check services
    if ! check_mongodb; then
        log_error "MongoDB check failed. Please ensure MongoDB is running."
        echo ""
        echo "To start MongoDB:"
        echo "  - On Ubuntu/Debian: sudo systemctl start mongod"
        echo "  - On macOS: brew services start mongodb-community"
        echo "  - On Windows: net start MongoDB"
        exit 1
    fi
    
    if ! check_ollama; then
        log_error "Ollama check failed. Please ensure Ollama is running."
        echo ""
        echo "To start Ollama:"
        echo "  - Run: ollama serve"
        echo "  - Then pull the llava model: ollama pull llava"
        exit 1
    fi
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    echo ""
    log_success "Setup completed successfully!"
    echo ""
    
    # Ask user if they want to start the application
    read -p "Do you want to start the application now? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        log_info "Starting CardCat application..."
        echo ""
        echo "The application will be available at:"
        echo "  - Frontend: http://localhost:5173"
        echo "  - Backend API: http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop the application"
        echo ""
        
        start_application "$1"
    else
        echo ""
        log_info "Setup complete. To start the application later, run:"
        echo "  npm start              # Production mode"
        echo "  npm run dev            # Development mode"
        echo ""
        log_info "The application will be available at:"
        echo "  - Frontend: http://localhost:5173"
        echo "  - Backend API: http://localhost:3000"
    fi
}

# Handle script arguments
case "$1" in
    "help"|"-h"|"--help")
        echo "CardCat Application Setup Script"
        echo ""
        echo "Usage: $0 [mode]"
        echo ""
        echo "Modes:"
        echo "  (no argument)  Setup and optionally start in production mode"
        echo "  dev            Setup and start in development mode"
        echo "  help           Show this help message"
        echo ""
        echo "Prerequisites:"
        echo "  - Node.js and npm installed"
        echo "  - MongoDB running on localhost:27017"
        echo "  - Ollama running on localhost:11434"
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac