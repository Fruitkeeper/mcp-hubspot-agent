#!/bin/bash

# GTM Compass AI - Local Development Startup Script

echo "🚀 Starting GTM Compass AI - MCP HubSpot Agent"
echo "============================================="

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Missing environment configuration!"
    echo ""
    echo "📝 Please create backend/.env file with:"
    echo "echo 'HUBSPOT_ACCESS_TOKEN=your_hubspot_private_app_token_here' > backend/.env"
    echo ""
    echo "🔑 Get your HubSpot Private App token from:"
    echo "   https://app.hubspot.com/developer/YOUR_ACCOUNT/applications"
    echo ""
    read -p "Press Enter after creating the .env file to continue..."
fi

# Check if virtual environment exists for backend
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd frontend
if command -v bun &> /dev/null; then
    echo "Using Bun package manager..."
    bun install
else
    echo "Using npm package manager..."
    npm install
fi
cd ..

# Start backend server in the background
echo "🖥️  Starting backend server (http://localhost:8000)..."
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server (http://localhost:8080)..."
cd frontend
if command -v bun &> /dev/null; then
    bun run dev &
else
    npm run dev &
fi
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting up!"
echo "📖 Backend API docs: http://localhost:8000/docs"
echo "🎯 Frontend app: http://localhost:8080"
echo "💬 MCP Chat: http://localhost:8080/mcp-chat"
echo ""
echo "🎉 Now you can have natural conversations with your HubSpot data!"
echo "Try asking: 'Hello', 'Show me my recent leads', or 'How is my sales pipeline?'"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 