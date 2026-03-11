#!/bin/bash

# Start backend API
echo "Starting backend API..."
python main.py &
BACKEND_PID=$!

# Start Telegram bot
echo "Starting Telegram bot..."
python bot.py &
BOT_PID=$!

echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Bot is running..."

# Wait for both processes
wait $BACKEND_PID $BOT_PID
