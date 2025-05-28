#!/bin/bash

API_URL="http://localhost:3000"
EMAIL="test@example.com"
PASSWORD="testPassword123"

echo "🧪 Testing CFD Brokerage API..."

# Test registration
echo "📝 Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Register Response: $REGISTER_RESPONSE"

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" = "null" ]; then
  echo "❌ Registration failed, trying login..."
  
  # Test login
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
fi

if [ "$TOKEN" = "null" ]; then
  echo "❌ Authentication failed"
  exit 1
fi

echo "✅ Authentication successful"
echo "Token: $TOKEN"

# Test account balance
echo "💰 Testing account balance..."
curl -s -X GET "$API_URL/account/balance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test market data
echo "📊 Testing market data..."
curl -s -X GET "$API_URL/market/symbols" \
  -H "Content-Type: application/json" | jq '.'

curl -s -X GET "$API_URL/market/prices/EURUSD" \
  -H "Content-Type: application/json" | jq '.'

# Test deposit
echo "💳 Testing deposit..."
curl -s -X POST "$API_URL/account/deposit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": 1000,
    \"method\": \"card\",
    \"reference\": \"test_deposit_123\"
  }" | jq '.'

# Test opening position
echo "📈 Testing open position..."
POSITION_RESPONSE=$(curl -s -X POST "$API_URL/trading/positions/open" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"symbol\": \"EURUSD\",
    \"side\": \"buy\",
    \"volume\": 0.1,
    \"leverage\": 100,
    \"stopLoss\": 1.0800,
    \"takeProfit\": 1.0900
  }")

echo "Position Response: $POSITION_RESPONSE"

# Extract position ID
POSITION_ID=$(echo $POSITION_RESPONSE | jq -r '.data.id')

# Test get positions
echo "📋 Testing get positions..."
curl -s -X GET "$API_URL/positions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

# Test risk metrics
echo "⚠️ Testing risk metrics..."
curl -s -X GET "$API_URL/risk/margin-level" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo "✅ API testing complete!"