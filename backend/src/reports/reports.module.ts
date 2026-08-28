/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Task } from '../tasks/task.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project, User])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
