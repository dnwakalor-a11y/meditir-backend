import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum OtpType {
  EMAIL_VERIFICATION = 'email_verification',
  TWO_FACTOR_AUTH = 'two_factor_auth',
  PASSWORD_RESET = 'password_reset',
}

export enum OtpStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  USED = 'used',
}

@Entity('otps')
@Index(['userId', 'type', 'status'])
@Index(['code', 'type'])
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  otpId: string;

  @Column()
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: OtpType,
  })
  type: OtpType;

  @Column({ length: 6 })
  code: string;

  @Column({
    type: 'enum',
    enum: OtpStatus,
    default: OtpStatus.PENDING,
  })
  status: OtpStatus;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 3 })
  maxAttempts: number;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Helper method to check if OTP is valid
  isValid(): boolean {
    return (
      this.status === OtpStatus.PENDING &&
      this.expiresAt > new Date() &&
      this.attempts < this.maxAttempts
    );
  }

  // Helper method to check if OTP is expired
  isExpired(): boolean {
    return this.expiresAt <= new Date();
  }
}