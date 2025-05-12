#!/bin/bash
set -x # Enable debug output

# Check if the server is running on port 3000 with a 5-second timeout
# Redirect stdout and stderr of nc to /dev/null to keep output clean
if nc -z -w 5 localhost 3000 > /dev/null 2>&1; then
  echo "Freewrite is already running on http://localhost:3000"
  # If you also want to open the browser if it's already running, you can add:
  # echo "Opening it in your browser..."
  # open http://localhost:3000
else
  echo "Freewrite is not running."
  echo "Navigating to project directory: /Users/edu/Desktop/Projects/writing-app"
  cd /Users/edu/Desktop/Projects/writing-app || { echo "Error: Could not navigate to project directory. Freewrite not started."; exit 1; }
  
  echo "Starting Freewrite and opening in browser via '''npm run open-prod'''..."
  npm run open-prod
fi

exit 0 