#!/bin/bash

# Check if MongoDB is running
if pgrep mongod > /dev/null; then
  echo "MongoDB is running."
else
  echo "MongoDB is not running. Please start MongoDB and rerun this script."
  exit 1
fi

# Check if Ollama is running
OLLAMA_URL=${OLLAMA_URL:-"http://localhost:11434"}
response=$(curl --write-out "%{http_code}\n" --silent --output /dev/null "$OLLAMA_URL/api/status")
if [ "$response" -eq 200 ]; then
    echo "Ollama is running and accessible."
else
    echo "Ollama is not running. Please start Ollama and rerun this script."
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
status=$?
if [ $status -ne 0 ]; then
    echo "Failed to install backend dependencies."
    exit $status
fi
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd client
npm install
status=$?
if [ $status -ne 0 ]; then
    echo "Failed to install frontend dependencies."
    exit $status
fi
cd ..

# Pull LLaVA model for Ollama
ollama pull llava

# Set up environment variables
export OLLAMA_URL=${OLLAMA_URL:-"http://localhost:11434"}
export OLLAMA_MODEL=${OLLAMA_MODEL:-"llava"}

# Start the application
read -p "Do you want to start the application now? (y/n): " start_app
if [[ "$start_app" == "y" || "$start_app" == "Y" ]]; then
    echo "Starting application..."
    npm start
else
    echo "Setup completed without starting the application."
fi

echo "Setup completed successfully!"