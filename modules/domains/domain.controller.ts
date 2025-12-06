import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DomainValidationService } from '../../common/services/domain-validation.service';
import {
  CurrentTenant,
  CurrentTenantId,
  CurrentSubdomain,
} from '../../common/decorators/tenant.decorators';
import { Tenant } from '../tenants/tenant.entity';
import { Public } from '../../auth/public.decorator';

class SubdomainCheckDto {
  subdomain: string;
  available: boolean;
  suggestion?: string;
}

class SubdomainSuggestionDto {
  baseName: string;
}

@ApiTags('Domain Management')
@Controller('domains')
export class DomainController {
  constructor(
    private readonly domainValidationService: DomainValidationService,
  ) {}

  @Public()
  @Get('check/:subdomain')
  @ApiOperation({
    summary: 'Check subdomain availability',
    description: 'Check if a subdomain is available for registration',
  })
  @ApiParam({ name: 'subdomain', description: 'Subdomain to check' })
  @ApiResponse({
    status: 200,
    description: 'Subdomain availability status',
    type: SubdomainCheckDto,
  })
  async checkSubdomain(
    @Param('subdomain') subdomain: string,
  ): Promise<SubdomainCheckDto> {
    const sanitized = this.domainValidationService.sanitizeSubdomain(subdomain);
    const isValid = this.domainValidationService.validateSubdomain(sanitized);
    const isAvailable = isValid
      ? await this.domainValidationService.isSubdomainAvailable(sanitized)
      : false;

    const result: SubdomainCheckDto = {
      subdomain: sanitized,
      available: isAvailable,
    };

    // If not available and valid format, suggest alternative
    if (isValid && !isAvailable) {
      try {
        result.suggestion =
          await this.domainValidationService.generateAvailableSubdomain(
            sanitized,
          );
      } catch {
        // Ignore suggestion errors
      }
    }

    return result;
  }

  @Public()
  @Post('suggest')
  @ApiOperation({
    summary: 'Generate subdomain suggestions',
    description:
      'Generate available subdomain suggestions based on a base name',
  })
  @ApiResponse({
    status: 200,
    description: 'Available subdomain suggestion',
    schema: {
      type: 'object',
      properties: {
        suggestion: { type: 'string' },
        baseName: { type: 'string' },
      },
    },
  })
  async generateSubdomain(
    @Body() dto: SubdomainSuggestionDto,
  ): Promise<{ suggestion: string; baseName: string }> {
    const suggestion =
      await this.domainValidationService.generateAvailableSubdomain(
        dto.baseName,
      );
    return {
      suggestion,
      baseName: dto.baseName,
    };
  }

  @Public()
  @Get('reserved')
  @ApiOperation({
    summary: 'Get reserved subdomains',
    description: 'Get list of reserved subdomains that cannot be used',
  })
  @ApiResponse({
    status: 200,
    description: 'List of reserved subdomains',
    schema: {
      type: 'object',
      properties: {
        reserved: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  getReservedSubdomains(): { reserved: string[] } {
    return {
      reserved: this.domainValidationService.getReservedSubdomains(),
    };
  }

  @Get('current')
  @ApiOperation({
    summary: 'Get current tenant domain info',
    description: 'Get domain information for the current tenant context',
  })
  @ApiResponse({
    status: 200,
    description: 'Current tenant domain information',
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string' },
        subdomain: { type: 'string' },
        fullDomain: { type: 'string' },
        tenant: { type: 'object' },
      },
    },
  })
  getCurrentTenantDomain(
    @CurrentTenant() tenant: Tenant,
    @CurrentTenantId() tenantId: string,
    @CurrentSubdomain() subdomain: string,
  ): any {
    return {
      tenantId,
      subdomain,
      fullDomain: subdomain ? `${subdomain}.meditir.com` : null,
      tenant: tenant
        ? {
            tenantId: tenant.tenantId,
            name: tenant.name,
            status: tenant.status,
            language: tenant.language,
          }
        : null,
    };
  }
}
