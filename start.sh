#!/bin/bash

# Access Rides - Startup Script
echo "🚗♿ Starting Access Rides Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create uploads directory for backend
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads

# Copy environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📋 Creating environment file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your API keys before running the app."
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "1. Start the backend server:"
echo "   cd backend && npm start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm start"
echo ""
echo "3. Press 'i' for iOS simulator or 'a' for Android emulator"
echo "   Or scan the QR code with Expo Go app on your device"
echo ""
echo "📚 For more information, see README.md"

