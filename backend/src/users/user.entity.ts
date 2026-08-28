/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../roles/role.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  mobile: string;

  @ManyToOne(() => Role, { eager: true, nullable: true })
  @JoinColumn()
  role: Role;

  @Index()
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ select: false, nullable: true })
  refreshTokenHash: string | null;

  @Column({ select: false, nullable: true })
  passwordResetTokenHash: string | null;

  @Column({ select: false, nullable: true, type: 'timestamp' })
  passwordResetExpiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
