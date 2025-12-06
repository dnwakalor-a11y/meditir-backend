# MedZen Backend Setup

The MedZen multitenant telehealth platform backend has been successfully set up with the following components:

### 📁 Project Structure

```
medzen-backend/
├── src/
│   ├── auth/                     # JWT authentication with multi-tenancy
│   │   ├── auth.controller.ts    # Login, register, refresh endpoints
│   │   ├── auth.service.ts       # Authentication business logic
│   │   ├── auth.module.ts        # Auth module configuration
│   │   ├── jwt.strategy.ts       # JWT Passport strategy
│   │   ├── jwt-auth.guard.ts     # JWT authentication guard
│   │   ├── decorators.ts         # Custom decorators (@CurrentTenant, @CurrentUser)
│   │   ├── public.decorator.ts   # @Public decorator for public endpoints
│   │   └── dto/
│   │       └── auth.dto.ts       # Authentication DTOs
│   ├── database/
│   │   ├── data-source.ts        # TypeORM data source configuration
│   │   ├── database.module.ts    # Database module
│   │   └── seeds/
│   │       └── run-seeds.ts      # Database seeding script
│   ├── modules/
│   │   ├── tenants/              # Multi-tenant management
│   │   │   ├── tenant.entity.ts  # Tenant entity
│   │   │   ├── tenants.service.ts
│   │   │   └── tenants.module.ts
│   │   ├── users/                # User management
│   │   │   ├── user.entity.ts    # User entity with roles
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── patients/             # Patient profiles
│   │   │   ├── patient.entity.ts
│   │   │   ├── patients.service.ts
│   │   │   └── patients.module.ts
│   │   ├── providers/            # Healthcare provider profiles
│   │   │   └── provider.entity.ts
│   │   ├── appointments/         # Appointment scheduling
│   │   │   └── appointment.entity.ts
│   │   ├── medical-records/      # Medical records management
│   │   │   └── medical-record.entity.ts
│   │   ├── messages/             # In-app messaging
│   │   │   └── message.entity.ts
│   │   └── notifications/        # Notification system
│   │       └── notification.entity.ts
│   ├── app.module.ts             # Main application module
│   └── main.ts                   # Application bootstrap with Swagger
├── .env.example                  # Environment variables template
├── .env                          # Development environment variables
├── docker-compose.yml            # PostgreSQL and Redis services
├── setup.sh                     # Quick setup script
├── package.json                  # Project dependencies and scripts
└── README.md                     # Comprehensive documentation
```

### 🏗️ Architecture Features

#### ✅ Multi-Tenant Architecture

- **Tenant isolation** using `tenantId` in all database operations
- **Custom JWT tokens** with tenant context
- **Tenant-aware services** and controllers
- **Subdomain-based tenant resolution**

#### ✅ Authentication & Authorization

- **JWT-based authentication** with refresh tokens
- **Role-based access control (RBAC)**
- **Multi-tenant JWT strategy**
- **Public/Private endpoint protection**

#### ✅ Database Schema (PostgreSQL + TypeORM)

- **Tenants**: Hospital/clinic organizations
- **Users**: Base user accounts with roles (Patient, Doctor, Nurse, Admin, PlatformAdmin)
- **Patients**: Patient-specific profiles and medical data
- **Providers**: Healthcare provider profiles with specializations
- **Appointments**: Teleconsultation booking system
- **Medical Records**: Electronic health records
- **Messages**: In-app messaging system
- **Notifications**: Multi-channel notification system

#### ✅ API Documentation

- **Swagger/OpenAPI** documentation at `/api/v1/docs`
- **Comprehensive endpoint documentation**
- **Request/response schemas**

### 🔧 Technology Stack

- **Framework**: NestJS 10.x (Node.js)
- **Database**: PostgreSQL 15
- **ORM**: TypeORM 0.3.x
- **Cache**: Redis 7
- **Authentication**: JWT with Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Package Manager**: Yarn

### 🚀 Quick Start

1. **Start database services:**

   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**

   ```bash
   yarn install
   ```

3. **Seed sample data:**

   ```bash
   yarn db:seed
   ```

4. **Start development server:**

   ```bash
   yarn start:dev
   ```

5. **Or use the automated setup:**
   ```bash
   ./setup.sh
   ```

### 🌐 API Endpoints

#### Authentication (`/api/v1/auth`)

- `POST /login` - User login with tenant context
- `POST /register` - User registration
- `POST /refresh` - Refresh access token
- `GET /profile` - Get current user profile

#### Health Check

- `GET /api/v1/` - Basic health check
- `GET /api/v1/health` - Detailed health status

### 🔑 Sample Credentials

After running the seed script, you can use these credentials:

```
Platform Admin: admin@meditir.com / admin123
Hospital Admin: admin@medzen-hospital.com / hospital123
Doctor: doctor@medzen-hospital.com / doctor123
Patient: patient@example.com / patient123

Tenant Subdomain: medzen-hospital
```

### 🔗 URLs

- **API Base**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/v1/docs
- **Health Check**: http://localhost:3000/api/v1/health

### 📋 Next Steps for MVP Development

#### Milestone 2: Foundation & Core User Management ✅

- [x] Multi-tenant setup with Tenants table
- [x] JWT-based authentication & RBAC
- [x] Core user profile creation
- [x] Database schemas for tenants, users, roles & permissions
- [x] Basic API structure and documentation

#### Milestone 3: Patient & Provider Features (Next)

- [ ] Patient dashboard endpoints
- [ ] Appointment booking system
- [ ] Provider dashboard endpoints
- [ ] Basic medical records management
- [ ] WebRTC integration for teleconsultation
- [ ] In-app messaging system

#### Milestone 4: Enhanced Features

- [ ] Notification system (SMS, Email, WhatsApp)
- [ ] Advanced medical records
- [ ] Prescription management
- [ ] File upload and management

#### Milestone 5: Integrations

- [ ] EHR/EMR integration
- [ ] Pharmacy/Lab integration
- [ ] Analytics and reporting

### 🛠️ Development Commands

```bash
# Development
yarn start:dev          # Start with hot reload
yarn start:debug        # Start with debugging

# Database
yarn migration:generate # Generate new migration
yarn migration:run      # Run pending migrations
yarn db:seed           # Seed sample data

# Testing
yarn test              # Unit tests
yarn test:e2e          # End-to-end tests
yarn test:cov          # Test coverage

# Code Quality
yarn lint              # Run ESLint
yarn format            # Format with Prettier
```

The backend foundation is now ready for building the complete MedZen telehealth platform! 🎉
