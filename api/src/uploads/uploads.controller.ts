import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const ALLOWED_IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const ALLOWED_IMAGE_EXTS = new Set(['.png', '.jpg', '.webp']);
const ALLOWED_DOCUMENT_MIMES = new Set(['application/pdf']);

async function saveUpload(
  buffer: Buffer,
  allowedMimes: Set<string>,
  allowedExts: Set<string>,
): Promise<string> {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !allowedMimes.has(detected.mime)) {
    throw new BadRequestException('Tipo de archivo no permitido');
  }
  const ext = '.' + detected.ext;
  if (allowedExts.size && !allowedExts.has(ext)) {
    throw new BadRequestException('Tipo de archivo no permitido');
  }
  const filename = randomUUID() + ext;
  mkdirSync('./uploads', { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const ws = createWriteStream(join('./uploads', filename));
    ws.on('finish', resolve);
    ws.on('error', reject);
    ws.end(buffer);
  });
  return filename;
}

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió archivo');
    const filename = await saveUpload(file.buffer, ALLOWED_IMAGE_MIMES, ALLOWED_IMAGE_EXTS);
    const base = process.env.PUBLIC_API_URL ?? 'https://grafi.digital';
    return { url: `${base}/uploads/${filename}` };
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió archivo');
    const filename = await saveUpload(file.buffer, ALLOWED_DOCUMENT_MIMES, new Set(['.pdf']));
    const base = process.env.PUBLIC_API_URL ?? 'https://grafi.digital';
    return { url: `${base}/uploads/${filename}` };
  }
}
