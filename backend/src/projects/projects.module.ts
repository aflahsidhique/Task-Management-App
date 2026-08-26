/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, User, Task]), ActivitiesModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
