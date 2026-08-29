/* eslint-disable prettier/prettier */
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { Project } from '../projects/project.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn()
  author: User;

  @Index()
  @ManyToOne(() => Task, { eager: true, nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  task: Task | null;

  @Index()
  @ManyToOne(() => Project, {
    eager: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  project: Project | null;

  /** Users @mentioned in this comment, selected client-side via @-autocomplete. */
  @ManyToMany(() => User, { eager: true })
  @JoinTable({ name: 'comment_mentions' })
  mentions: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
