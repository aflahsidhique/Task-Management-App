/* eslint-disable prettier/prettier */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { FileAsset } from './file-asset.entity';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/activity.entity';
import { User } from '../users/user.entity';

const UPLOAD_DIR = './uploads';
const MANAGE_ROLES = ['Super Admin', 'Admin', 'Project Manager'];

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileAsset)
    private readonly fileRepository: Repository<FileAsset>,
    private readonly activitiesService: ActivitiesService,
  ) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  async saveUploadedFile(
    file: Express.Multer.File,
    uploadedById: number,
    projectId?: number,
    taskId?: number,
  ): Promise<FileAsset> {
    const fileAsset = this.fileRepository.create({
      originalName: file.originalname,
      storedFileName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: { id: uploadedById } as any,
      ...(projectId ? { project: { id: projectId } as any } : {}),
      ...(taskId ? { task: { id: taskId } as any } : {}),
    });
    const saved = await this.fileRepository.save(fileAsset);

    await this.activitiesService.log({
      userId: uploadedById,
      type: ActivityType.FILE_UPLOADED,
      entityType: 'file',
      entityId: saved.id,
      description: `uploaded file '${saved.originalName}'`,
    });

    return saved;
  }

  async findAll(projectId?: number, taskId?: number): Promise<FileAsset[]> {
    const where: any = {};
    if (projectId) where.project = { id: projectId };
    if (taskId) where.task = { id: taskId };
    return this.fileRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findById(id: number): Promise<FileAsset> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async remove(id: number, currentUser: User): Promise<void> {
    const file = await this.findById(id);
    const isOwner = file.uploadedBy?.id === currentUser.id;
    const canManage = MANAGE_ROLES.includes(currentUser.role?.name);
    if (!isOwner && !canManage) {
      throw new ForbiddenException(
        'You do not have permission to delete this file',
      );
    }
    // Soft delete only: the row disappears from listings but the physical
    // file is kept on disk so the deletion is recoverable.
    await this.fileRepository.softDelete(id);
  }
}
