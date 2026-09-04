import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { join } from 'path';
import { mkdirSync } from 'fs';

const TONTINE_UPLOADS_DIR = join(__dirname, '..', '..', '..', 'uploads', 'tontines');
mkdirSync(TONTINE_UPLOADS_DIR, { recursive: true });

export const tontineMulterConfig: MulterOptions = {
  storage: diskStorage({
    destination: TONTINE_UPLOADS_DIR,
    filename: (_req, file, callback) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  fileFilter: (_req, file, callback) => {
    const allowedTypes = /jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx/;
    const isValid = allowedTypes.test(extname(file.originalname).toLowerCase());
    if (!isValid) {
      return callback(
        new BadRequestException(
          'Types de fichiers acceptés : JPG, PNG, GIF, WebP, PDF, DOC, DOCX, XLS, XLSX',
        ),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 Mo max
  },
};
