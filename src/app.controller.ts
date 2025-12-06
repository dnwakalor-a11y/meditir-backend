import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Homepage / Health check' })
  @ApiResponse({ status: 200, description: 'Homepage or API health status' })
  getHello(@Req() request: Request): any {
    const host = request.get('host');
    const tenantSubdomain = request.headers['x-tenant-subdomain'] as string;

    // If accessing from www.meditir.com or meditir.com (no tenant subdomain)
    if (!tenantSubdomain || tenantSubdomain === '') {
      return {
        status: 'OK',
        message: 'Welcome to Meditir Telehealth Platform',
        platform: {
          name: 'Meditir',
          description:
            'Multitenant Telehealth Platform for Healthcare Organizations',
          version: '1.0.0',
        },
        endpoints: {
          api: `https://${host}/api/v1`,
          documentation: `https://${host}/api/v1/docs`,
          adminPanel: `https://admin.meditir.com`,
          tenantExample: `https://your-hospital.meditir.com`,
        },
        features: [
          'Multi-tenant architecture',
          'Secure patient data management',
          'Video consultations',
          'Appointment scheduling',
          'Electronic health records',
          'Prescription management',
        ],
        timestamp: new Date().toISOString(),
      };
    }

    // For tenant subdomains, return basic API info
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  getHealth() {
    return {
      status: 'OK',
      message: 'Meditir API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
