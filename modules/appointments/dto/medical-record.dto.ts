import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { RecordType, RecordStatus } from '../entities/medical-record.entity';

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'Patient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({
    description: 'Associated appointment ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({
    description: 'Medical record type',
    enum: RecordType,
    example: RecordType.CONSULTATION,
  })
  @IsEnum(RecordType)
  type: RecordType;

  @ApiProperty({
    description: 'Record title',
    example: 'Annual Physical Examination',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Medical record content',
    example: 'Patient presents with...',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Chief complaint',
    example: 'Chest pain and shortness of breath',
  })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'History of present illness',
    example: 'Patient reports onset of symptoms 3 days ago...',
  })
  @IsOptional()
  @IsString()
  historyOfPresentIllness?: string;

  @ApiPropertyOptional({
    description: 'Past medical history',
    example: 'Hypertension, diabetes mellitus type 2',
  })
  @IsOptional()
  @IsString()
  pastMedicalHistory?: string;

  @ApiPropertyOptional({
    description: 'Current medications',
  })
  @IsOptional()
  @IsObject()
  medications?: any;

  @ApiPropertyOptional({
    description: 'Known allergies',
  })
  @IsOptional()
  @IsObject()
  allergies?: any;

  @ApiPropertyOptional({
    description: 'Vital signs',
  })
  @IsOptional()
  @IsObject()
  vitalSigns?: any;

  @ApiPropertyOptional({
    description: 'Physical examination findings',
  })
  @IsOptional()
  @IsString()
  physicalExamination?: string;

  @ApiPropertyOptional({
    description: 'Assessment and diagnosis',
  })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({
    description: 'Treatment plan',
  })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiPropertyOptional({
    description: 'Follow-up instructions',
  })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @ApiPropertyOptional({
    description: 'Record tags for categorization',
    example: ['cardiology', 'follow-up'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Record date',
    example: '2024-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  recordDate?: string;
}

export class UpdateMedicalRecordDto {
  @ApiPropertyOptional({
    description: 'Record title',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Medical record content',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Record status',
    enum: RecordStatus,
  })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @ApiPropertyOptional({
    description: 'Chief complaint',
  })
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'History of present illness',
  })
  @IsOptional()
  @IsString()
  historyOfPresentIllness?: string;

  @ApiPropertyOptional({
    description: 'Past medical history',
  })
  @IsOptional()
  @IsString()
  pastMedicalHistory?: string;

  @ApiPropertyOptional({
    description: 'Current medications',
  })
  @IsOptional()
  @IsObject()
  medications?: any;

  @ApiPropertyOptional({
    description: 'Known allergies',
  })
  @IsOptional()
  @IsObject()
  allergies?: any;

  @ApiPropertyOptional({
    description: 'Vital signs',
  })
  @IsOptional()
  @IsObject()
  vitalSigns?: any;

  @ApiPropertyOptional({
    description: 'Physical examination findings',
  })
  @IsOptional()
  @IsString()
  physicalExamination?: string;

  @ApiPropertyOptional({
    description: 'Assessment and diagnosis',
  })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({
    description: 'Treatment plan',
  })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiPropertyOptional({
    description: 'Follow-up instructions',
  })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @ApiPropertyOptional({
    description: 'AI-generated insights',
  })
  @IsOptional()
  @IsString()
  aiInsights?: string;

  @ApiPropertyOptional({
    description: 'AI-generated summary',
  })
  @IsOptional()
  @IsString()
  aiSummary?: string;

  @ApiPropertyOptional({
    description: 'Record tags',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class MedicalRecordQueryDto {
  @ApiPropertyOptional({
    description: 'Patient ID to filter records',
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Provider ID to filter records',
  })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'Record type filter',
    enum: RecordType,
  })
  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

  @ApiPropertyOptional({
    description: 'Record status filter',
    enum: RecordStatus,
  })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Search term for content',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Tags to filter by',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class GenerateAIInsightsDto {
  @ApiProperty({
    description: 'Medical record content for AI analysis',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Patient context for better insights',
  })
  @IsOptional()
  @IsObject()
  patientContext?: any;

  @ApiPropertyOptional({
    description: 'Type of insights requested',
    example: ['summary', 'risk_assessment', 'recommendations'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  insightTypes?: string[];
}