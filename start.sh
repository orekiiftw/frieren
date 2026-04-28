#!/bin/bash

# MedChain AI — Start Script
# Ensures MongoDB is running before starting the backend

echo "🏥 Starting MedChain AI..."

# Check if MongoDB Docker container is running
if ! docker ps --format '{{.Names}}' | grep -q "medchain-mongo"; then
    echo "🐳 Starting MongoDB container..."
    docker start medchain-mongo 2>/dev/null || docker run -d --name medchain-mongo -p 27017:27017 -v medchain-mongo-data:/data/db mongo:7
fi

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
for i in {1..30}; do
    if nc -z localhost 27017 2>/dev/null; then
        echo "✅ MongoDB is ready"
        break
    fi
    sleep 1
done

# Start Backend
echo "🚀 Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Start Frontend
echo "🚀 Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================="
echo "MedChain AI is running!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo "MongoDB:  localhost:27017"
echo "=================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C to kill both processes
trap "echo ''; echo '🛑 Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait
