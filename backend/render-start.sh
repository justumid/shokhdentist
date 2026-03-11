#!/usr/bin/env bash
# Render start script for backend

set -o errexit

echo "Starting ShokDentist Backend..."
echo "Environment: ${DEBUG:-false}"
echo "Log Level: ${LOG_LEVEL:-INFO}"

# Start the application
exec python main.py
