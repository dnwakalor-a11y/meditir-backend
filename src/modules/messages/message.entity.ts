import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { User } from '../users/user.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @Column({ type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ type: 'uuid', nullable: false })
  senderId: string;

  @Column({ type: 'uuid', nullable: false })
  receiverId: string;

  @Column({ type: 'uuid', nullable: true })
  appointmentId: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  messageType: MessageType;

  @Column({ type: 'boolean', default: false })
  isLiveChat: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  sentAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  readAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.userId)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, (user) => user.userId)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @ManyToOne(() => Appointment, (appointment) => appointment.appointmentId, {
    nullable: true,
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;
}
