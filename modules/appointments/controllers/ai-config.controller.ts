import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { AIConfigService } from '../services/ai-config.service';

@ApiTags('AI Configuration')
@ApiBearerAuth()
@Controller('ai-config')
@UseGuards(JwtAuthGuard)
export class AIConfigController {
  constructor(private readonly aiConfigService: AIConfigService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get AI configuration status' })
  @ApiResponse({ 
    status: 200, 
    description: 'AI configuration status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            aiEnabled: { type: 'boolean' },
            openaiConfigured: { type: 'boolean' },
            awsConfigured: { type: 'boolean' },
            openaiModel: { type: 'string' },
            maxTokens: { type: 'number' },
            awsRegion: { type: 'string' },
            confidenceThreshold: { type: 'number' },
            autoUpdateEnabled: { type: 'boolean' },
            configurationErrors: { 
              type: 'array', 
              items: { type: 'string' } 
            },
          },
        },
      },
    },
  })
  getAIStatus() {
    const status = this.aiConfigService.getConfigurationStatus();
    const errors = this.aiConfigService.validateConfiguration();

    return {
      success: true,
      data: {
        ...status,
        configurationErrors: errors,
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check AI services health' })
  @ApiResponse({ 
    status: 200, 
    description: 'AI services health check completed',
  })
  async checkAIHealth() {
    const status = this.aiConfigService.getConfigurationStatus();
    const errors = this.aiConfigService.validateConfiguration();

    return {
      success: true,
      data: {
        status: errors.length === 0 ? 'healthy' : 'configuration_issues',
        timestamp: new Date(),
        services: {
          openai: {
            configured: status.openaiConfigured,
            status: status.openaiConfigured ? 'available' : 'not_configured',
          },
          aws: {
            configured: status.awsConfigured,
            status: status.awsConfigured ? 'available' : 'not_configured',
          },
        },
        errors,
      },
    };
  }
}