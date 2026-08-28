/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { Project } from '../projects/project.entity';
import { Notification } from '../notifications/notification.entity';
import { FileAsset } from '../files/file-asset.entity';
import { Activity } from '../activities/activity.entity';
import { Comment } from '../comments/comment.entity';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Task, User, Role, Project, Notification, FileAsset, Activity, Comment],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
};

// Used by the TypeORM CLI (npm run typeorm / migration:*) and by
// AppModule, so the schema definition has a single source of truth.
export default new DataSource(dataSourceOptions);
