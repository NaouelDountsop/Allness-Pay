import type { Request } from 'express';

export function buildPublicFileUrl(req: Request, filename: string, folder: string): string {
  if (!filename) {
    return '';
  }

  if (/^https?:\/\//i.test(filename)) {
    return filename;
  }

  const protocol = req.protocol ?? 'http';
  const host = req.get?.('host');

  if (!host) {
    return `/uploads/${folder}/${filename}`;
  }

  return `${protocol}://${host}/uploads/${folder}/${filename}`;
}
