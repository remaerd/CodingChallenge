#!/bin/bash

# Simple server launcher for the Design Challenge Editor
# This script starts a local HTTP server for better performance

PORT=8000

echo "Starting Design Challenge Editor..."
echo ""
echo "Server will be available at: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
# Otherwise try Python 2
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer $PORT
# Otherwise try Node.js http-server
elif command -v http-server &> /dev/null; then
    http-server -p $PORT
else
    echo "Error: No suitable server found."
    echo "Please install Python or Node.js http-server."
    exit 1
fi
