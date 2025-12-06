import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  Headers,
  UseGuards,
  HttpStatus,
  HttpCode,
  UploadedFile,
  UseInterceptors,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { MedicalRecordService } from '../services/medical-record.service';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  MedicalRecordQueryDto,
  GenerateAIInsightsDto,
} from '../dto/medical-record.dto';

@ApiTags('Medical Records')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant ID',
  required: true,
})
@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new medical record' })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
  })
  async create(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @Query('providerId') providerId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.create(
      createMedicalRecordDto,
      providerId,
      tenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical records with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
  })
  async findAll(
    @Query() query: MedicalRecordQueryDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.findAll(query, tenantId);
  }

  @Get('patient/:patientId/history')
  @ApiOperation({ summary: "Get patient's medical history" })
  @ApiResponse({
    status: 200,
    description: 'Medical history retrieved successfully',
  })
  async getPatientHistory(
    @Param('patientId') patientId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.getPatientHistory(
      patientId,
      tenantId,
    );
  }

  @Get('provider/:providerId/recent')
  @ApiOperation({ summary: 'Get recent records for a provider' })
  @ApiResponse({
    status: 200,
    description: 'Recent records retrieved successfully',
  })
  async getRecentRecords(
    @Param('providerId') providerId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.getRecentRecords(
      providerId,
      tenantId,
      limit,
    );
  }

  @Get('provider/:providerId/statistics')
  @ApiOperation({ summary: 'Get medical record statistics for provider' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(
    @Param('providerId') providerId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.getStatistics(providerId, tenantId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search medical records by content' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchRecords(
    @Query('term') searchTerm: string,
    @Query('providerId') providerId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.searchRecords(
      searchTerm,
      tenantId,
      providerId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical record by ID' })
  @ApiResponse({
    status: 200,
    description: 'Medical record retrieved successfully',
  })
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medical record' })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.update(
      id,
      updateMedicalRecordDto,
      tenantId,
    );
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate medical record' })
  @ApiResponse({
    status: 200,
    description: 'Medical record activated successfully',
  })
  async activate(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.activate(id, tenantId);
  }

  @Post(':id/ai-insights')
  @ApiOperation({ summary: 'Generate AI insights for medical record' })
  @ApiResponse({
    status: 200,
    description: 'AI insights generated successfully',
  })
  async generateAIInsights(
    @Param('id') id: string,
    @Body() generateAIInsightsDto: GenerateAIInsightsDto,
    @Request() req: any,
  ) {
    const insights = await this.medicalRecordService.generateAIInsights(
      generateAIInsightsDto,
    );
    return {
      success: true,
      data: insights,
    };
  }

  @Put(':id/ai-update')
  @ApiOperation({ summary: 'Update medical record with AI insights' })
  @ApiResponse({
    status: 200,
    description: 'Record updated with AI insights successfully',
  })
  async updateWithAIInsights(@Param('id') id: string, @Request() req: any) {
    const updatedRecord = await this.medicalRecordService.updateWithAIInsights(
      id,
      req.user.tenantId,
    );
    return {
      success: true,
      data: updatedRecord,
    };
  }

  @Put(':id/comprehensive-analysis')
  @ApiOperation({
    summary: 'Generate comprehensive AI analysis for medical record',
  })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive AI analysis completed successfully',
  })
  async generateComprehensiveAnalysis(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const analyzedRecord =
      await this.medicalRecordService.generateComprehensiveAIAnalysis(
        id,
        req.user.tenantId,
      );
    return {
      success: true,
      data: analyzedRecord,
    };
  }

  @Get(':id/entities')
  @ApiOperation({
    summary:
      'Extract medical entities from record using AWS Comprehend Medical',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical entities extracted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            medications: { type: 'array' },
            conditions: { type: 'array' },
            anatomy: { type: 'array' },
            procedures: { type: 'array' },
            analysisMetadata: { type: 'object' },
          },
        },
      },
    },
  })
  async getMedicalEntities(@Param('id') id: string, @Request() req: any) {
    const entities = await this.medicalRecordService.getMedicalEntities(
      id,
      req.user.tenantId,
    );
    return entities;
  }

  @Post('ai-insights/analyze')
  @ApiOperation({ summary: 'Generate AI insights for content' })
  @ApiResponse({
    status: 200,
    description: 'AI analysis completed successfully',
  })
  async analyzeContent(@Body() generateAIInsightsDto: GenerateAIInsightsDto) {
    return await this.medicalRecordService.generateAIInsights(
      generateAIInsightsDto,
    );
  }

  @Post(':id/upload-report')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload medical report file' })
  @ApiResponse({ status: 200, description: 'Report uploaded successfully' })
  async uploadReport(
    @Param('id') recordId: string,
    @UploadedFile() file: any,
    @Body('reportType') reportType: string,
    @Body('description') description: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    // This would integrate with a file storage service like AWS S3
    const fileUrl = `https://storage.example.com/reports/${file.filename}`;

    const reportData = {
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      reportType,
      description,
      uploadedAt: new Date(),
    };

    // For now, we'll add the report info to content
    const updateDto: UpdateMedicalRecordDto = {
      content: `Report uploaded: ${file.originalname} (${reportType})`,
    };

    return await this.medicalRecordService.update(
      recordId,
      updateDto,
      tenantId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete medical record' })
  @ApiResponse({
    status: 204,
    description: 'Medical record deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return await this.medicalRecordService.remove(id, tenantId);
  }
}
