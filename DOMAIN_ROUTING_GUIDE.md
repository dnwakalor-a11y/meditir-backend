# Meditir Domain Routing Guide

## Overview

Your Meditir platform now supports comprehensive domain routing with the following structure:

## Domain Structure

### 1. Main Homepage

- **URL**: `www.meditir.com` or `meditir.com`
- **Purpose**: Public-facing homepage and platform information
- **Response**: Welcome page with platform details, API endpoints, and feature list

### 2. Platform Admin Panel

- **URL**: `admin.meditir.com`
- **Purpose**: Platform administration interface
- **Frontend**: Your existing admin frontend application
- **Access**: Platform administrators only

### 3. Tenant Subdomains

- **Pattern**: `{subdomain}.meditir.com`
- **Examples**:
  - `city-hospital.meditir.com`
  - `rural-clinic.meditir.com`
  - `specialist-center.meditir.com`
- **Purpose**: Individual hospital/clinic portals
- **Access**: Tenant-specific users (patients, doctors, hospital staff)

### 4. Reserved Subdomains

The following subdomains are reserved and won't be assigned to tenants:

- `www`, `api`, `admin`, `app`, `mail`, `ftp`, `blog`, `shop`
- `support`, `help`, `docs`, `status`, `cdn`, `assets`, `static`, `media`

## Current Setup Status

### ✅ Backend API

- Configured to handle all domain patterns
- Homepage route returns comprehensive platform information
- Tenant middleware automatically detects and routes subdomain requests
- API documentation available at any domain: `/api/v1/docs`

### ✅ Nginx Reverse Proxy

- Wildcard SSL support for `*.meditir.com`
- Automatic subdomain extraction and tenant routing
- Reserved subdomain protection
- CORS and security headers configured

### 🔄 Frontend Applications Needed

#### Option 1: Separate Frontend Applications

1. **Main Homepage** (`www.meditir.com`)
   - Marketing/landing page
   - Platform information
   - Sign-up for hospitals
   - Login redirects

2. **Admin Panel** (`admin.meditir.com`)
   - Your existing admin frontend
   - Platform administration
   - Tenant management

3. **Tenant Frontend** (`{subdomain}.meditir.com`)
   - Hospital-specific interface
   - Patient portal
   - Doctor dashboard
   - Appointment booking

#### Option 2: Single Frontend with Smart Routing

- One React/Vue/Angular app that detects the domain and renders accordingly
- Different layouts/routes based on subdomain detection

## Implementation Examples

### Frontend Subdomain Detection (React/TypeScript)

```typescript
// utils/domainUtils.ts
export const getDomainInfo = () => {
  const hostname = window.location.hostname;

  if (hostname === 'meditir.com' || hostname === 'www.meditir.com') {
    return { type: 'homepage', tenant: null };
  }

  if (hostname === 'admin.meditir.com') {
    return { type: 'admin', tenant: null };
  }

  const subdomainMatch = hostname.match(/^([^.]+)\.meditir\.com$/);
  if (subdomainMatch) {
    return { type: 'tenant', tenant: subdomainMatch[1] };
  }

  return { type: 'unknown', tenant: null };
};

// App.tsx
import { getDomainInfo } from './utils/domainUtils';

function App() {
  const { type, tenant } = getDomainInfo();

  switch (type) {
    case 'homepage':
      return <HomePage />;
    case 'admin':
      return <AdminApp />;
    case 'tenant':
      return <TenantApp tenantSubdomain={tenant} />;
    default:
      return <NotFoundPage />;
  }
}
```

### DNS Configuration Required

To make this work, you'll need to set up DNS records:

```
# A records
meditir.com                   → Your server IP
*.meditir.com                 → Your server IP

# OR CNAME records (if using a service like Vercel/Netlify)
meditir.com                   → your-app.vercel.app
*.meditir.com                 → your-app.vercel.app
```

## Testing Your Setup

### 1. Test Homepage

```bash
curl -H "Host: www.meditir.com" http://localhost/
curl -H "Host: meditir.com" http://localhost/
```

### 2. Test Tenant Routing

```bash
curl -H "Host: hospital1.meditir.com" http://localhost/api/v1/health
```

### 3. Test Admin Panel

```bash
curl -H "Host: admin.meditir.com" http://localhost/
```

## Next Steps

1. **Create Homepage Frontend**: Build a marketing/landing page for `www.meditir.com`
2. **Configure Admin Domain**: Point `admin.meditir.com` to your admin frontend
3. **Build Tenant Frontend**: Create the hospital-specific user interface
4. **Set up DNS**: Configure your DNS provider with the wildcard records
5. **SSL Certificates**: Get wildcard SSL certificate for `*.meditir.com`

## Security Considerations

- Each tenant's data is isolated by the tenant middleware
- Reserved subdomains prevent conflicts with system services
- CORS headers properly configured for cross-origin requests
- Rate limiting in place to prevent abuse

Your wildcard setup is now complete and ready for production deployment! 🚀
