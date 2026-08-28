/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { multerConfig } from './multer.config';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body('projectId') projectId?: string,
    @Body('taskId') taskId?: string,
  ) {
    return this.filesService.saveUploadedFile(
      file,
      user.id,
      projectId ? parseInt(projectId, 10) : undefined,
      taskId ? parseInt(taskId, 10) : undefined,
    );
  }

  @ApiOperation({ summary: 'Retrieve all files' })
  @Get()
  findAll(@Query('projectId') projectId?: string, @Query('taskId') taskId?: string) {
    return this.filesService.findAll(
      projectId ? parseInt(projectId, 10) : undefined,
      taskId ? parseInt(taskId, 10) : undefined,
    );
  }

  @ApiOperation({ summary: 'Download a file' })
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.filesService.findById(id);
    const filePath = path.join('./uploads', file.storedFileName);
    res.set({
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Type': file.mimeType,
    });
    return new StreamableFile(fs.createReadStream(filePath));
  }

  @ApiOperation({ summary: 'Delete a file' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.filesService.remove(id, user);
  }
}
