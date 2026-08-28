/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_DUE = 'TASK_DUE',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  MENTION = 'MENTION',
  SYSTEM = 'SYSTEM',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Index()
  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn()
  createdAt: Date;
}
