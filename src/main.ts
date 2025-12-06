import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration - Allow all origins for development
  app.enableCors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'x-tenant-subdomain',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MedZen API')
    .setDescription('MedZen Multitenant Telehealth Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Users')
    .addTag('Tenants')
    .addTag('Patients')
    .addTag('Providers')
    .addTag('Appointments')
    .addTag('Medical Records')
    .addTag('Messages')
    .addTag('Notifications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(
    `🚀 MedZen API is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`,
  );
}
bootstrap();
