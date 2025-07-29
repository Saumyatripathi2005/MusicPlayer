#!/bin/bash

# Music Player Startup # Start the server
echo "🚀 Starting server on http://localhost:2050"

echo "🎵 Starting Music Player..."
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
fi

# Create music directory if it doesn't exist
if [ ! -d "music" ]; then
    echo "📁 Creating music directory..."
    mkdir music
fi

# Start the server
echo "🚀 Starting server on http://localhost:2050"
echo "   Add your music files to the 'music/' directory"
echo "   Press Ctrl+C to stop the server"
echo "================================"

npm start
