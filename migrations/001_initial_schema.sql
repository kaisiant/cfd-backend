-- Initial CFD Brokerage Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    equity DECIMAL(15,2) DEFAULT 0,
    margin DECIMAL(15,2) DEFAULT 0,
    free_margin DECIMAL(15,2) DEFAULT 0,
    leverage INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Insert sample data
INSERT INTO users (email, password, first_name, last_name, balance, equity, free_margin) 
VALUES ('demo@cfdtrading.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU5bUNKVhq5R9XF2', 'Demo', 'User', 10000.00, 10000.00, 10000.00)
ON CONFLICT (email) DO NOTHING;
