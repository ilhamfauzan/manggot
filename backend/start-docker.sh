#!/bin/bash

echo "🚀 Starting Maggot Full Stack with Docker..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please edit it with your credentials!"
    echo ""
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."
echo ""

# Check Postgres
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Backend
if curl -s http://localhost:5001 > /dev/null 2>&1; then
    echo "✅ Backend is ready (Port 5001)"
else
    echo "❌ Backend is not ready"
fi

# Check Flask ML
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Flask ML API is ready (Port 5000)"
else
    echo "⏳ Flask ML API is starting... (may take 30s)"
fi

echo ""
echo "📊 Running database migrations..."
docker-compose exec -T backend npx prisma migrate dev --name init

echo ""
echo "✨ Setup complete!"
echo ""
echo "📍 Services running at:"
echo "   - Backend:       http://localhost:5001"
echo "   - Flask ML:      http://localhost:5000"
echo "   - Swagger Docs:  http://localhost:5001/api-docs"
echo "   - Prisma Studio: http://localhost:5555"
echo ""
echo "📝 View logs with: docker-compose logs -f"
echo "🛑 Stop with: docker-compose down"
echo ""
