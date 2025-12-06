import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsArray,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { MessageType, MessageStatus } from '../../messaging/entities/messaging.entity';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Participant user IDs',
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  participantIds: string[];

  @ApiPropertyOptional({
    description: 'Conversation title',
    example: 'Dr. Smith - Patient Consultation',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Related appointment ID',
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  conversationId: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how are you feeling today?',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiPropertyOptional({
    description: 'File attachments',
  })
  @IsOptional()
  @IsArray()
  attachments?: any[];

  @ApiPropertyOptional({
    description: 'Message priority',
    example: 'normal',
  })
  @IsOptional()
  @IsString()
  priority?: string;
}

export class UpdateMessageDto {
  @ApiPropertyOptional({
    description: 'Updated message content',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Message status',
    enum: MessageStatus,
  })
  @IsEnum(MessageStatus)
  status: MessageStatus;

  @ApiPropertyOptional({
    description: 'Read timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  readAt?: Date;
}

export class MarkMessagesReadDto {
  @ApiProperty({
    description: 'Message IDs to mark as read',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  messageIds: string[];
}

export class ConversationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by participant ID',
  })
  @IsOptional()
  @IsUUID()
  participantId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment ID',
  })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiPropertyOptional({
    description: 'Include archived conversations',
    example: false,
  })
  @IsOptional()
  includeArchived?: boolean;

  @ApiPropertyOptional({
    description: 'Search term',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class MessageQueryDto {
  @ApiProperty({
    description: 'Conversation ID',
  })
  @IsUUID()
  conversationId: string;

  @ApiPropertyOptional({
    description: 'Message type filter',
    enum: MessageType,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiPropertyOptional({
    description: 'Message status filter',
    enum: MessageStatus,
  })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2024-01-01',
  })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2024-01-31',
  })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Limit number of messages',
    example: 50,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    example: 0,
  })
  @IsOptional()
  offset?: number;
}

export class FileAttachmentDto {
  @ApiProperty({
    description: 'File name',
    example: 'medical_report.pdf',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://storage.example.com/files/medical_report.pdf',
  })
  @IsUrl()
  fileUrl: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
  })
  fileSize: number;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({
    description: 'File description',
    example: 'Latest lab results',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ConversationParticipantDto {
  @ApiProperty({
    description: 'User ID',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'User role in conversation',
    example: 'doctor',
  })
  @IsString()
  role: string;

  @ApiPropertyOptional({
    description: 'Join timestamp',
  })
  @IsOptional()
  joinedAt?: Date;

  @ApiPropertyOptional({
    description: 'Last seen timestamp',
  })
  @IsOptional()
  lastSeenAt?: Date;
}