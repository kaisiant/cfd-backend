#!/bin/bash

echo "🚀 Setting up CFD Brokerage Backend..."

# Create directories
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Setup environment
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cat > .env << EOF
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cfd_brokerage
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES=24h

# Trading Configuration
MAX_LEVERAGE=500
MIN_MARGIN=0.002
MAX_POSITION_SIZE=1000000

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60000

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
GRAFANA_PASSWORD=admin
EOF
fi

# Start dependencies
echo "🐳 Starting Docker services..."
docker-compose -f docker/docker-compose.yml up -d postgres redis

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🗄️ Running database migrations..."
bun run db:migrate

echo "✅ Setup complete!"
echo ""
echo "🔗 Available endpoints:"
echo "   API: http://localhost:3000"
echo "   Docs: http://localhost:3000/docs"
echo "   WebSocket: ws://localhost:8080"
echo ""
echo "🚀 Start development server:"
echo "   bun run dev"