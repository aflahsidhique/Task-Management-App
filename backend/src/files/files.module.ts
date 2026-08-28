/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FileAsset } from './file-asset.entity';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileAsset]), ActivitiesModule],
  providers: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
