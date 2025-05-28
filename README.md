# CFD Brokerage Backend

A professional-grade CFD (Contract for Difference) brokerage backend built with ElysiaJS, featuring B-book trading model, real-time market data, risk management, and scalable architecture.

## 🚀 Features

- **B-Book Trading Model**: Act as counterparty to client trades
- **Real-time Market Data**: WebSocket-based price feeds
- **Risk Management**: Margin calls, stop-out levels, position monitoring
- **Scalable Architecture**: Redis clustering, database sharding ready
- **API Documentation**: Swagger/OpenAPI integration
- **Comprehensive Trading**: Forex, commodities, cryptocurrencies
- **Production Ready**: Docker, Kubernetes, monitoring setup

## 🛠 Tech Stack

- **Runtime**: Bun (ultra-fast JavaScript runtime)
- **Framework**: ElysiaJS (high-performance web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Cache/Sessions**: Redis with clustering support
- **WebSocket**: Native WebSocket with horizontal scaling
- **Monitoring**: Prometheus + Grafana
- **Container**: Docker with multi-stage builds

## 📋 Prerequisites

- Bun 1.0+ or Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (for easy setup)

## 🏗 Installation

### Quick Start (Docker)

```bash
# Clone the repository
git clone <repository-url>
cd cfd-brokerage-backend

# Start all services
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start the application
bun run dev
```

### Manual Setup

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start PostgreSQL and Redis
docker-compose -f docker/docker-compose.yml up -d postgres redis

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

## 🔧 Configuration

### Environment Variables

```env
# Server
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

# JWT Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES=24h

# Trading Configuration
MAX_LEVERAGE=500
MIN_MARGIN=0.002
MAX_POSITION_SIZE=1000000
```

## 🏃‍♂️ Running the System

### Development Mode

```bash
# Start with hot reload
bun run dev

# Run tests
bun run test

# Database operations
bun run db:generate  # Generate migrations
bun run db:migrate   # Apply migrations
bun run db:studio    # Open Drizzle Studio
```

### Production Mode

```bash
# Build for production
bun run build

# Start production server
bun run start

# Docker deployment
bun run docker:up

# Kubernetes deployment
kubectl apply -f k8s/
```

## 📊 Monitoring & Health

- **API Health**: `GET /health`
- **Metrics**: `http://localhost:9090` (Prometheus)
- **Dashboard**: `http://localhost:3001` (Grafana)
- **API Docs**: `http://localhost:3000/docs`

## 🔐 Security Features

- JWT-based authentication
- Rate limiting (1000 req/min default)
- Input validation with Zod schemas
- SQL injection protection (Drizzle ORM)
- CORS configuration
- Request logging and monitoring

## 🎯 API Endpoints

### Core Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /trading/positions/open` - Open trading position
- `GET /positions` - Get user positions
- `GET /market/prices/:symbol` - Get current prices
- `GET /account/balance` - Account information

### WebSocket

- `ws://localhost:8080` - Real-time price feeds
- Authentication via JWT token
- Subscribe to specific symbols

## 🧪 Testing

```bash
# Run API tests
./scripts/test-api.sh

# Unit tests
bun test

# Load testing
./scripts/load-test.sh
```

## 📈 Performance

The system is designed to handle:

- **1M+ requests per day**
- **10K+ concurrent WebSocket connections**
- **Sub-100ms API response times**
- **99.9% uptime with proper deployment**

### Optimization Features

- Connection pooling (PostgreSQL)
- Redis caching for market data
- Horizontal scaling support
- Database indexing strategy
- Memory-efficient WebSocket handling

## 🚢 Deployment

### Docker Compose (Simple)

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Kubernetes (Scalable)

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/deployment.yaml
```

### Cloud Providers

- AWS: ECS/EKS ready
- GCP: Cloud Run/GKE compatible
- Azure: Container Instances/AKS support

## 📝 API Documentation

Complete API documentation is available at `/docs` when running the server. The documentation includes:

- Interactive API explorer
- Request/response schemas
- Authentication examples
- WebSocket documentation
- Error code references

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration project for educational purposes. For production financial systems, ensure compliance with relevant financial regulations and implement additional security measures.

---

**Built with ❤️ using ElysiaJS and Bun**
# cfd-backend
