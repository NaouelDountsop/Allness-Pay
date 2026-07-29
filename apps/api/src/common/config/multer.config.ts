import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const kycMulterConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/kyc',
    filename: (_req, file, callback) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (_req, file, callback) => {
    const allowedTypes = /jpg|jpeg|png|pdf/;
    const isValid = allowedTypes.test(extname(file.originalname).toLowerCase());
    if (!isValid) {
      return callback(
        new BadRequestException('Seuls les fichiers JPG, PNG et PDF sont acceptés'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo max
  },
};