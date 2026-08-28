/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';

@Entity()
export class FileAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  storedFileName: string;

  @Column()
  mimeType: string;

  @Column()
  sizeBytes: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn()
  uploadedBy: User;

  @ManyToOne(() => Project, { eager: true, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  project: Project;

  @ManyToOne(() => Task, { eager: true, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  task: Task;

  @CreateDateColumn()
  createdAt: Date;
}
