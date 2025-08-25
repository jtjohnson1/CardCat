# CardCataloger Setup Without Docker

This guide explains how to run CardCataloger without Docker containers, using native installations of MongoDB and Ollama.

## Prerequisites

### 1. Node.js and npm
- Install Node.js (version 16 or higher)
- npm will be installed automatically with Node.js

### 2. MongoDB
Install MongoDB Community Edition for your operating system:

#### Ubuntu/Debian:
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

#### macOS:
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Verify MongoDB is running
brew services list | grep mongodb
```

#### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service

### 3. Ollama
Install Ollama for AI image processing:

#### Linux:
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# In another terminal, pull a vision model
ollama pull llava
```

#### macOS:
```bash
# Download and install from https://ollama.ai/download
# Or use Homebrew
brew install ollama

# Start Ollama
ollama serve

# In another terminal, pull a vision model
ollama pull llava
```

#### Windows:
1. Download Ollama from https://ollama.ai/download
2. Run the installer
3. Open Command Prompt and run:
```cmd
ollama serve
```
4. In another Command Prompt, pull a vision model:
```cmd
ollama pull llava
```

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd cardcataloger

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Return to root directory
cd ..
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

Add the following content to `server/.env`:
```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/cardcataloger

# Ollama Configuration
OLLAMA_URL=http://localhost:11434

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Verify Services are Running

#### Check MongoDB:
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Test MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

#### Check Ollama:
```bash
# Test Ollama connection
curl http://localhost:11434/api/tags

# Should return JSON with available models
```

### 4. Start the Application
From the root directory:

```bash
# Start both frontend and backend
npm run start
```

This will start:
- Backend server on http://localhost:3000
- Frontend development server on http://localhost:5173

### 5. Access the Application
Open your web browser and navigate to:
```
http://localhost:5173
```

You should see the CardCataloger dashboard with system status indicators showing:
- **Ollama**: Connected (green badge)
- **Database**: Connected (green badge)

## Troubleshooting

### MongoDB Issues
If the database status shows "disconnected":

1. **Check if MongoDB is running:**
   ```bash
   sudo systemctl status mongod  # Linux
   brew services list | grep mongodb  # macOS
   ```

2. **Start MongoDB if not running:**
   ```bash
   sudo systemctl start mongod  # Linux
   brew services start mongodb/brew/mongodb-community  # macOS
   ```

3. **Check MongoDB logs:**
   ```bash
   sudo tail -f /var/log/mongodb/mongod.log  # Linux
   tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
   ```

4. **Verify connection:**
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```

### Ollama Issues
If the Ollama status shows "disconnected":

1. **Check if Ollama is running:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Start Ollama if not running:**
   ```bash
   ollama serve
   ```

3. **Check available models:**
   ```bash
   ollama list
   ```

4. **Pull required models if missing:**
   ```bash
   ollama pull llava
   ```

### Port Conflicts
If you get port conflicts:

1. **Check what's using the ports:**
   ```bash
   lsof -i :3000  # Backend port
   lsof -i :5173  # Frontend port
   lsof -i :27017  # MongoDB port
   lsof -i :11434  # Ollama port
   ```

2. **Kill conflicting processes or change ports in configuration**

### Application Logs
Check the server console output for detailed error messages. The enhanced logging will show:
- Connection attempts to MongoDB and Ollama
- Detailed error messages for failed connections
- Environment variable status
- Service availability checks

### Common Error Messages

1. **"Database is not connected"**
   - MongoDB service is not running
   - Incorrect DATABASE_URL in .env file
   - MongoDB not installed

2. **"Ollama service is not running"**
   - Ollama service is not started
   - Incorrect OLLAMA_URL in .env file
   - Ollama not installed

3. **"Cannot connect to MongoDB"**
   - MongoDB service stopped
   - Network connectivity issues
   - Firewall blocking connection

4. **"Connection to Ollama timed out"**
   - Ollama service is starting up (wait a moment)
   - Ollama is overloaded
   - Network connectivity issues

## Development Workflow

1. **Start services:**
   ```bash
   # Terminal 1: Start MongoDB (if not running as service)
   mongod

   # Terminal 2: Start Ollama
   ollama serve

   # Terminal 3: Start the application
   npm run start
   ```

2. **Monitor logs:**
   - Backend logs will show in the terminal
   - Frontend logs will show in browser developer console
   - Check system status at the top of the application

3. **Testing connectivity:**
   - The system status badges update every 30 seconds
   - You can manually refresh the page to check status immediately
   - Use browser developer tools to see API requests

## Next Steps

Once everything is running:
1. Visit http://localhost:5173 to access the application
2. Check that both status badges show "connected"
3. Configure eBay API credentials in Settings (optional)
4. Start processing card images in the File Processing section

For production deployment, consider using process managers like PM2 for the Node.js application and proper service configurations for MongoDB and Ollama.