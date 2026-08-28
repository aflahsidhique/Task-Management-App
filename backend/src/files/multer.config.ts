/* eslint-disable prettier/prettier */
import { BadRequestException } from '@nestjs/common';
import { diskStorage, Options } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

export const MAX_UPLOAD_SIZE_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_BYTES) || 10 * 1024 * 1024; // 10 MB default

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // PDF
  'application/pdf',
  // Documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
]);

export const multerConfig: Options = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueName = `${uuid()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new BadRequestException(
          `Unsupported file type "${file.mimetype}". Allowed: images (jpg/png/gif/webp), PDF, Word/Excel/PowerPoint documents, and plain text/CSV.`,
        ),
      );
      return;
    }
    callback(null, true);
  },
};
