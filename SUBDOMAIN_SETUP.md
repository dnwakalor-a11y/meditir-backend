# Meditir Multi-Tenant Subdomain Setup Guide

This guide explains how to set up wildcard subdomain routing for the Meditir platform, enabling automatic tenant resolution based on subdomains like `hospital1.meditir.com`.

## 🌐 DNS Configuration

### Required DNS Record

Add this single DNS record to your domain registrar/DNS provider:

```
Type: CNAME
Name: *
Value: meditir.com (or your server IP as A record)
TTL: 300
```

**What this does:**

- Routes ALL subdomains (\*.meditir.com) to your server
- Examples: hospital1.meditir.com, clinic-abc.meditir.com, test.meditir.com

### DNS Provider Examples

#### Cloudflare

1. Go to DNS settings for your domain
2. Add record:
   - Type: CNAME
   - Name: \*
   - Target: meditir.com
   - TTL: Auto

#### AWS Route 53

1. Go to Hosted Zone for your domain
2. Create record:
   - Record name: \*
   - Record type: CNAME
   - Value: meditir.com

#### Google Cloud DNS

1. Go to Cloud DNS zones
2. Add record set:
   - DNS name: \*.meditir.com
   - Resource record type: CNAME
   - Canonical name: meditir.com

## 🚀 Backend Setup

### 1. Install Dependencies

```bash
cd medzen-backend
yarn install
```

### 2. Environment Configuration

Update your `.env` file:

```bash
# Domain configuration
MAIN_DOMAIN=meditir.com
NODE_ENV=development

# Database (existing)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=medzen_user
DATABASE_PASSWORD=medzen_password
DATABASE_NAME=medzen_dev_db

# JWT (existing)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION_TIME=24h

# API configuration
API_PREFIX=api/v1
PORT=3000
```

### 3. Database Migration

```bash
# Start database
docker-compose up -d postgres redis

# Run migrations and seed data
yarn db:migrate
yarn db:seed
```

### 4. Start the Application

#### Option A: Direct Development

```bash
yarn start:dev
```

#### Option B: Full Docker Setup (Recommended)

```bash
# Build and start all services
docker-compose up --build

# This starts:
# - Nginx (port 80/443)
# - Backend (port 3000)
# - PostgreSQL (port 5433)
# - Redis (port 6379)
```

## 🔧 How It Works

### 1. Request Flow

```
hospital1.meditir.com → Nginx → Backend with X-Tenant-Subdomain: hospital1
```

### 2. Tenant Resolution

The system automatically:

1. **Extracts subdomain** from the host header
2. **Validates subdomain** against reserved names
3. **Looks up tenant** by subdomain in database
4. **Injects tenant context** into the request
5. **Routes to appropriate endpoints**

### 3. Middleware Chain

```typescript
Request → TenantSubdomainMiddleware → TenantGuard → Your Controller
```

## 🛠️ API Endpoints

### Domain Management

```bash
# Check subdomain availability
GET /api/v1/domains/check/:subdomain

# Generate subdomain suggestions
POST /api/v1/domains/suggest
Body: { "baseName": "general-hospital" }

# Get reserved subdomains
GET /api/v1/domains/reserved

# Get current tenant info (requires subdomain)
GET /api/v1/domains/current
```

### Hospital Creation (Platform Admin)

```bash
POST /api/v1/platform-admin/hospitals
Authorization: Bearer <platform-admin-token>
Body: {
  "name": "General Hospital",
  "subdomain": "general-hospital",
  "adminEmail": "admin@generalhospital.com",
  "adminFirstName": "John",
  "adminLastName": "Doe"
}
```

## 🧪 Testing

### 1. Test Subdomain Resolution

```bash
# Test with curl (simulate subdomain)
curl -H "Host: hospital1.meditir.com" http://localhost/api/v1/domains/current

# Should return tenant info for hospital1
```

### 2. Test Hospital Creation

```bash
# 1. Login as platform admin
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@meditir.com",
    "password": "admin123",
    "tenantSubdomain": "meditir"
  }'

# 2. Create hospital (use token from step 1)
curl -X POST http://localhost/api/v1/platform-admin/hospitals \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "subdomain": "test-hospital",
    "adminEmail": "admin@testhospital.com",
    "adminFirstName": "Jane",
    "adminLastName": "Smith"
  }'

# 3. Test new tenant access
curl -H "Host: test-hospital.meditir.com" http://localhost/api/v1/domains/current
```

### 3. Local Development Testing

For local testing without DNS, you can:

1. **Modify hosts file** (optional):

```bash
# Add to /etc/hosts (macOS/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 hospital1.meditir.com
127.0.0.1 test-hospital.meditir.com
```

2. **Use curl with Host header** (recommended):

```bash
curl -H "Host: hospital1.meditir.com" http://localhost/api/v1/domains/current
```

## 🔒 Security Features

### 1. Reserved Subdomains

These subdomains are automatically blocked:

- `www`, `api`, `admin`, `app`
- `mail`, `ftp`, `blog`, `shop`
- `support`, `help`, `docs`, `status`
- `cdn`, `assets`, `static`, `media`
- `patient`, `doctor`, `medical`, `health`

### 2. Subdomain Validation

- 3-63 characters only
- Lowercase letters, numbers, and hyphens
- Cannot start or end with hyphen
- Automatic sanitization

### 3. Tenant Isolation

- Automatic tenant context injection
- Database queries scoped to tenant
- Cross-tenant access prevention

## 🚨 Production Considerations

### 1. SSL Certificate

Get wildcard SSL certificate:

```bash
# Using Let's Encrypt with Cloudflare
certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d "*.meditir.com" -d "meditir.com"
```

### 2. Nginx Configuration

Update nginx.conf for SSL:

- Uncomment HTTPS server block
- Add SSL certificate paths
- Enable HTTP → HTTPS redirect

### 3. Environment Variables

```bash
NODE_ENV=production
SSL_CERT_PATH=/etc/ssl/certs/meditir.com.crt
SSL_KEY_PATH=/etc/ssl/private/meditir.com.key
```

## 📋 Troubleshooting

### Common Issues

1. **Subdomain not resolving**
   - Check DNS propagation: `dig hospital1.meditir.com`
   - Verify nginx configuration
   - Check backend logs

2. **Tenant not found**
   - Verify tenant exists in database
   - Check subdomain spelling
   - Ensure tenant is active

3. **CORS errors**
   - Update nginx CORS headers
   - Check frontend domain configuration

### Debug Commands

```bash
# Check DNS resolution
dig hospital1.meditir.com

# Test nginx routing
curl -H "Host: hospital1.meditir.com" http://localhost/health

# Check backend logs
docker-compose logs backend

# Check tenant in database
docker-compose exec postgres psql -U medzen_user -d medzen_dev_db -c "SELECT * FROM tenants WHERE subdomain = 'hospital1';"
```

## 🎯 Next Steps

1. **Set up your DNS record** (`* CNAME meditir.com`)
2. **Run the backend setup** (`docker-compose up --build`)
3. **Create test hospital** via platform admin API
4. **Test subdomain routing** with curl
5. **Configure SSL for production**

Your wildcard subdomain multi-tenant system is now ready! 🚀
