#!/bin/bash

# This script installs dependencies and starts both frontend and backend services

# Create .env file from example if it doesn't exist
if [ ! -f "./audio-api-backend/.env" ]; then
  echo "Creating .env file for backend..."
  cp ./audio-api-backend/.env.example ./audio-api-backend/.env
  echo "Please update the OpenAI API key in ./audio-api-backend/.env"
fi

# Install dependencies
echo "Installing backend dependencies..."
cd audio-api-backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd audio-transcription-frontend
npm install
cd ..

# Start both services
echo "Starting services..."
echo "Backend will run on http://localhost:3000"
echo "Frontend will run on http://localhost:5173"

# Use concurrently if available, otherwise provide instructions
if command -v npx &> /dev/null; then
  npx concurrently "cd audio-api-backend && npm run dev" "cd audio-transcription-frontend && npm run dev"
else
  echo "Please open two terminal windows and run these commands:"
  echo "Terminal 1: cd audio-api-backend && npm run dev"
  echo "Terminal 2: cd audio-transcription-frontend && npm run dev"
fi
