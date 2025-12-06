#!/bin/bash

echo "🚀 Starting MedZen Backend Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Start database services
echo "🐘 Starting PostgreSQL and Redis..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database seeding
echo "🌱 Seeding database with sample data..."
yarn db:seed

# Start the development server
echo "🏃 Starting development server..."
echo "API will be available at: http://localhost:3000/api/v1"
echo "Swagger docs at: http://localhost:3000/api/v1/docs"
echo ""
yarn start:dev
