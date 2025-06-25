#!/bin/bash

# Start development servers for Voice Command Platform
echo "Starting Voice Command Platform development servers..."

# Start the backend API server
echo "Starting Voice Command API..."
cd voice-command-api
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start the frontend UI server
echo "Starting Voice Command UI..."
cd ../voice-command-ui
npm run dev &
FRONTEND_PID=$!

# Wait for both servers to be killed
echo "Development servers started successfully!"
echo "Voice Command API running at http://localhost:3000"
echo "Voice Command UI running at http://localhost:5173"
echo "Press Ctrl+C to stop both servers"

wait $BACKEND_PID $FRONTEND_PID
