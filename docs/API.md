# CFD Brokerage API Documentation

## Authentication

All API endpoints except `/auth/register` and `/auth/login` require JWT authentication.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "balance": "0",
      "leverage": 100
    },
    "token": "jwt_token"
  }
}
```

#### POST /auth/login

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Trading

#### POST /trading/positions/open

Open a new trading position.

**Request Body:**

```json
{
  "symbol": "EURUSD",
  "side": "buy",
  "volume": 1.0,
  "leverage": 100,
  "stopLoss": 1.08,
  "takeProfit": 1.09
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "position_uuid",
    "symbol": "EURUSD",
    "side": "buy",
    "volume": "1.0",
    "openPrice": "1.0850",
    "margin": "1085.00",
    "status": "open"
  }
}
```

#### POST /trading/positions/:id/close

Close an existing position.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "position_uuid",
    "pnl": "25.50",
    "closePrice": "1.0875",
    "status": "closed"
  }
}
```

### Positions

#### GET /positions

Get user's positions.

**Query Parameters:**

- `status` (optional): "open" | "closed"

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "position_uuid",
      "symbol": "EURUSD",
      "side": "buy",
      "volume": "1.0",
      "openPrice": "1.0850",
      "currentPrice": "1.0875",
      "pnl": "25.00",
      "margin": "1085.00",
      "status": "open"
    }
  ]
}
```

### Orders

#### POST /orders

Create a new order (limit/stop).

**Request Body:**

```json
{
  "symbol": "EURUSD",
  "type": "limit",
  "side": "buy",
  "volume": 1.0,
  "price": 1.08,
  "stopLoss": 1.075,
  "takeProfit": 1.09
}
```

#### GET /orders

Get user's orders.

### Market Data

#### GET /market/symbols

Get available trading symbols.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "symbol": "EURUSD",
      "description": "Euro vs US Dollar",
      "type": "forex",
      "minVolume": 0.01,
      "maxVolume": 100,
      "leverage": 500
    }
  ]
}
```

#### GET /market/prices/:symbol

Get current bid/ask prices for a symbol.

**Response:**

```json
{
  "success": true,
  "data": {
    "symbol": "EURUSD",
    "bid": 1.0849,
    "ask": 1.0851,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Account Management

#### GET /account/balance

Get account balance and equity.

**Response:**

```json
{
  "success": true,
  "data": {
    "balance": 10000.0,
    "equity": 10025.5,
    "margin": 1085.0,
    "freeMargin": 8940.5,
    "marginLevel": 925.23
  }
}
```

#### POST /account/deposit

Process a deposit.

**Request Body:**

```json
{
  "amount": 1000.0,
  "method": "card",
  "reference": "payment_ref_123"
}
```

### Risk Management

#### GET /risk/margin-level

Get current margin level and risk status.

**Response:**

```json
{
  "success": true,
  "data": {
    "marginLevel": 925.23,
    "marginCall": false,
    "stopOut": false
  }
}
```

## WebSocket API

Connect to `ws://localhost:8080` for real-time updates.

### Authentication

```json
{
  "type": "auth",
  "token": "jwt_token"
}
```

### Subscribe to Price Updates

```json
{
  "type": "subscribe",
  "channel": "price:EURUSD"
}
```

### Price Update Message

```json
{
  "type": "update",
  "channel": "price:EURUSD",
  "data": {
    "symbol": "EURUSD",
    "bid": 1.0849,
    "ask": 1.0851,
    "timestamp": 1641038400000
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
