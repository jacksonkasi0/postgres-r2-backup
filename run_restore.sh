#!/bin/bash

# Set variables
IMAGE_NAME="restore-r2-image"
CONTAINER_NAME="restore-r2-container"
DOCKERFILE="Dockerfile.restore"

# Load environment variables from .env file
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found. Exiting..."
  exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME -f $DOCKERFILE .

# Run the container with environment variables
echo "Running restore container..."
docker run --name $CONTAINER_NAME \
  --env-file .env \
  $IMAGE_NAME

# Check if the container exists and remove it
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "Removing the completed container..."
  docker rm -f $CONTAINER_NAME
else
  echo "Container not found or already removed."
fi

# Completion message
echo "Restore process completed and container cleaned up."
