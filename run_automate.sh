#!/bin/bash

# Source environment variables
source /etc/environment

# Set the working directory explicitly
cd /app || { echo "Directory /app not found. Exiting."; exit 1; }

# Run the Deno task
echo "⏳ Starting run deno automate service..."
deno task automate
