import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto, ProviderDashboardStatsDto } from './dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get dashboard statistics',
    description: 'Returns appropriate dashboard statistics based on user role' 
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
  })
  async getDashboardStats(@Req() req: Request): Promise<DashboardStatsDto | ProviderDashboardStatsDto> {
    const user = req.user as any;
    const tenantId = user.tenantId;

    // If user is a provider (doctor/nurse), return provider-specific stats
    if (user.role === 'Doctor' || user.role === 'Nurse') {
      // Get provider ID from user's provider relationship
      const providerId = user.provider?.id || user.id;
      return this.dashboardService.getProviderStats(providerId, tenantId);
    }

    // For admin users, return hospital-wide stats
    return this.dashboardService.getHospitalStats(tenantId);
  }
}