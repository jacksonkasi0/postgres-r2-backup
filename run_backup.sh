#!/bin/bash

# Set variables
IMAGE_NAME="backup-image"
CONTAINER_NAME="backup-container"
DOCKERFILE="Dockerfile.backup"

# Load environment variables from .env file
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found. Exiting..."
  exit 1
fi

# Build the Docker image
echo "Building Docker image from $DOCKERFILE..."
docker build -t $IMAGE_NAME -f $DOCKERFILE .

# Check if the container already exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "Removing existing container $CONTAINER_NAME..."
  docker rm -f $CONTAINER_NAME
fi

# Run the container with environment variables and volume mounts
echo "Running backup container..."
docker run --name $CONTAINER_NAME \
  --env-file .env \
  -v "${SOURCE_DIR:-/path/to/source}:/data" \
  -v "${BACKUP_DIR:-/path/to/backup}:/backup" \
  $IMAGE_NAME

# Check if the container exists and remove it
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "Removing the completed container..."
  docker rm -f $CONTAINER_NAME
else
  echo "Container not found or already removed."
fi

# Completion message
echo "Backup process completed and container cleaned up."