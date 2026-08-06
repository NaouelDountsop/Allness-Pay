import { join } from 'path';
import { mkdirSync } from 'fs';

/**
 * Shared uploads directory path.
 * Resolves relative to the compiled output (dist/) so that both
 * multer (diskStorage) and the static-asset middleware serve from
 * the same location regardless of process.cwd().
 *
 * __dirname at runtime = apps/api/dist/common/config/
 * We need apps/api/uploads/
 */
const uploadsRoot = join(__dirname, '..', '..', '..', 'uploads');
mkdirSync(uploadsRoot, { recursive: true });

export const KYC_UPLOADS_DIR = join(uploadsRoot, 'kyc');
mkdirSync(KYC_UPLOADS_DIR, { recursive: true });
