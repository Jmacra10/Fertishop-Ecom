#!/bin/bash

echo "Starting FertiShop Application..."
echo ""

echo "Starting Python backend..."
cd backend
python run.py &
BACKEND_PID=$!
cd ..

echo "Starting Next.js frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "FertiShop is running!"
echo "- Backend: http://localhost:5000"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

wait 