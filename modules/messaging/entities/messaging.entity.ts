import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/user.entity';
import { Tenant } from '../../tenants/tenant.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
  VIDEO = 'video',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum ConversationType {
  DOCTOR_PATIENT = 'doctor_patient',
  DOCTOR_DOCTOR = 'doctor_doctor',
  GROUP_CONSULTATION = 'group_consultation',
  SUPPORT = 'support',
}

@Entity('conversations')
export class Conversation {
  @ApiProperty({ description: 'Conversation unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  conversationId: string;

  @ApiProperty({ description: 'Conversation type', enum: ConversationType })
  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DOCTOR_PATIENT,
  })
  type: ConversationType;

  @ApiProperty({ description: 'Conversation title' })
  @Column({ length: 255, nullable: true })
  title: string;

  @ApiProperty({ description: 'Participant IDs' })
  @Column('simple-array')
  participantIds: string[];

  @ApiProperty({ description: 'Last message content' })
  @Column('text', { nullable: true })
  lastMessage: string;

  @ApiProperty({ description: 'Last message timestamp' })
  @Column('timestamp', { nullable: true })
  lastMessageAt: Date;

  @ApiProperty({ description: 'Conversation metadata' })
  @Column('jsonb', { nullable: true })
  metadata: any;

  @ApiProperty({ description: 'Tenant ID for multi-tenancy' })
  @Column('uuid')
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('messages')
export class Message {
  @ApiProperty({ description: 'Message unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @ApiProperty({ description: 'Conversation ID' })
  @Column('uuid')
  conversationId: string;

  @ApiProperty({ description: 'Sender user ID' })
  @Column('uuid')
  senderId: string;

  @ApiProperty({ description: 'Message type', enum: MessageType })
  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @ApiProperty({ description: 'Message content' })
  @Column('text')
  content: string;

  @ApiProperty({ description: 'Message status', enum: MessageStatus })
  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @ApiProperty({ description: 'File attachments' })
  @Column('jsonb', { nullable: true })
  attachments: any;

  @ApiProperty({ description: 'Message metadata' })
  @Column('jsonb', { nullable: true })
  metadata: any;

  @ApiProperty({ description: 'Reply to message ID' })
  @Column('uuid', { nullable: true })
  replyToId: string;

  @ApiProperty({ description: 'Message read by user IDs' })
  @Column('simple-array', { nullable: true })
  readBy: string[];

  @ApiProperty({ description: 'Tenant ID for multi-tenancy' })
  @Column('uuid')
  tenantId: string;

  // Relations
  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'replyToId' })
  replyTo: Message;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isRead(): boolean {
    return this.status === MessageStatus.READ;
  }

  isDelivered(): boolean {
    return [MessageStatus.DELIVERED, MessageStatus.READ].includes(this.status);
  }

  hasAttachments(): boolean {
    return !!this.attachments && Object.keys(this.attachments).length > 0;
  }
}