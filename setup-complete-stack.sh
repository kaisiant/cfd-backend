#!/bin/bash
# setup-complete-stack.sh

echo "🚀 Setting up Complete CFD Brokerage Stack..."

# Create all required directories
echo "📁 Creating directory structure..."
mkdir -p monitoring/prometheus/rules
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/alertmanager
mkdir -p monitoring/postgres-exporter
mkdir -p logs
mkdir -p migrations

# Create Prometheus config
echo "⚙️ Creating Prometheus configuration..."
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'cfd-brokerage'
    environment: 'production'

rule_files:
  - "/etc/prometheus/rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'cfd-brokerage-api'
    static_configs:
      - targets: ['cfd-api:3000']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
    scrape_interval: 10s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
    scrape_interval: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 15s

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 30s
EOF

# Create AlertManager config
echo "🚨 Creating AlertManager configuration..."
cat > monitoring/alertmanager/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@cfdtrading.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://127.0.0.1:5001/'
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF

# Create Grafana datasource
echo "📊 Creating Grafana configuration..."
cat > monitoring/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF

# Create dashboard provisioning
cat > monitoring/grafana/provisioning/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'CFD Trading Dashboards'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Create PostgreSQL exporter queries
echo "🗄️ Creating PostgreSQL exporter queries..."
cat > monitoring/postgres-exporter/queries.yaml << 'EOF'
pg_database:
  query: "SELECT pg_database.datname, pg_database_size(pg_database.datname) as size FROM pg_database"
  master: true
  cache_seconds: 30
  metrics:
    - datname:
        usage: "LABEL"
        description: "Name of the database"
    - size:
        usage: "GAUGE"
        description: "Disk space used by the database"

pg_stat_user_tables:
  query: "SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables"
  master: true
  cache_seconds: 30
  metrics:
    - schemaname:
        usage: "LABEL"
        description: "Name of the schema"
    - tablename:
        usage: "LABEL"
        description: "Name of the table"
    - seq_scan:
        usage: "COUNTER"
        description: "Number of sequential scans initiated on this table"
    - seq_tup_read:
        usage: "COUNTER"
        description: "Number of live rows fetched by sequential scans"
    - idx_scan:
        usage: "COUNTER"
        description: "Number of index scans initiated on this table"
    - idx_tup_fetch:
        usage: "COUNTER"
        description: "Number of live rows fetched by index scans"
    - n_tup_ins:
        usage: "COUNTER"
        description: "Number of rows inserted"
    - n_tup_upd:
        usage: "COUNTER"
        description: "Number of rows updated"
    - n_tup_del:
        usage: "COUNTER"
        description: "Number of rows deleted"
EOF

# Create alert rules
echo "⚠️ Creating alert rules..."
cat > monitoring/prometheus/rules/trading-alerts.yml << 'EOF'
groups:
  - name: cfd-brokerage.rules
    rules:
      # Application Alerts
      - alert: CFDAPIDown
        expr: up{job="cfd-brokerage-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "CFD API is down"
          description: "CFD Brokerage API has been down for more than 1 minute"

      - alert: HighTradeFailureRate
        expr: rate(trades_total{status="failed"}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High trade failure rate detected"
          description: "Trade failure rate is {{ $value }} trades/sec"

      - alert: APIHighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API response time is high"
          description: "95th percentile latency is {{ $value }}s"

      # Database Alerts
      - alert: PostgreSQLDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL database has been down for more than 1 minute"

      - alert: PostgreSQLHighConnections
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL high connection usage"
          description: "PostgreSQL connection usage is above 80%"

      # Redis Alerts
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis cache has been down for more than 1 minute"

      - alert: RedisHighMemoryUsage
        expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis high memory usage"
          description: "Redis memory usage is above 90%"

      # System Alerts
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is above 80% for more than 5 minutes"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Disk space is running low"
          description: "Disk space is below 10%"
EOF

# Create basic database migration
echo "🗃️ Creating basic database schema..."
cat > migrations/001_initial_schema.sql << 'EOF'
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
EOF

echo "✅ Complete setup finished!"
echo ""
echo "🚀 To start the complete stack:"
echo "   docker-compose up -d"
echo ""
echo "🌐 Access URLs:"
echo "   CFD API:      http://localhost:3000"
echo "   API Health:   http://localhost:3000/health"
echo "   API Metrics:  http://localhost:3000/metrics"
echo "   Grafana:      http://localhost:3001 (admin/admin123)"
echo "   Prometheus:   http://localhost:9090"
echo "   AlertManager: http://localhost:9093"
echo ""
echo "🗄️ Database:"
echo "   PostgreSQL:   localhost:5432 (postgres/password)"
echo "   Redis:        localhost:6379 (password: redispassword)"
echo ""
echo "📊 Monitoring:"
echo "   Node Exporter:     http://localhost:9100"
echo "   PostgreSQL Metrics: http://localhost:9187"
echo "   Redis Metrics:     http://localhost:9121"
EOF

chmod +x setup-complete-stack.sh