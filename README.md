# MedZen Backend

MedZen Multitenant Telehealth Platform Backend built with NestJS, TypeORM, and PostgreSQL.

## Features

- 🏥 **Multi-tenant Architecture**: Support for multiple hospitals/clinics
- 🔐 **JWT Authentication**: Secure authentication with role-based access control
- 👥 **User Management**: Patients, Providers, Admins, and Platform Admins
- 📅 **Appointment System**: Booking and management of teleconsultations
- 📋 **Medical Records**: Electronic health records management
- 💬 **Messaging**: In-app messaging between patients and providers
- 🔔 **Notifications**: Multi-channel notification system
- 📊 **API Documentation**: Swagger/OpenAPI documentation

## Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Package Manager**: Yarn

## Prerequisites

- Node.js 20.11+
- Yarn
- Docker & Docker Compose (for local database)

## Quick Start

1. **Install dependencies**:

   ```bash
   yarn install
   ```

2. **Start the database services**:

   ```bash
   docker-compose up -d
   ```

3. **Copy environment variables**:

   ```bash
   cp .env.example .env
   ```

4. **Run database migrations**:

   ```bash
   yarn migration:run
   ```

5. **Start the development server**:
   ```bash
   yarn start:dev
   ```

The API will be available at:

- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/v1/docs

## Available Scripts

- `yarn start:dev` - Start development server with hot reload
- `yarn start:prod` - Start production server
- `yarn build` - Build the application
- `yarn test` - Run tests
- `yarn test:e2e` - Run end-to-end tests
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn migration:generate` - Generate new migration
- `yarn migration:run` - Run pending migrations
- `yarn migration:revert` - Revert last migration

## Project Structure

```
src/
├── auth/                 # Authentication module
├── common/               # Shared utilities and decorators
├── database/             # Database configuration and migrations
└── modules/
    ├── tenants/          # Tenant management
    ├── users/            # User management
    ├── patients/         # Patient profiles
    ├── providers/        # Healthcare provider profiles
    ├── appointments/     # Appointment scheduling
    ├── medical-records/  # Medical records management
    ├── messages/         # Messaging system
    └── notifications/    # Notification system
```

## Multi-tenant Usage

Each API request should include the tenant context:

- **Header**: `x-tenant-subdomain: hospital-subdomain`
- **JWT Token**: Contains `tenantId` for automatic tenant filtering
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
