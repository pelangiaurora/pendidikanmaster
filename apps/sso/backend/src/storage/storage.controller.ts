import {
  Controller,
  Post,
  Delete,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Request,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { StorageService, StorageFolder } from './storage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  // ── Upload foto profil ─────────────────────────────────────
  @Post('profile-photo')
  @ApiOperation({ summary: 'Upload foto profil user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: StorageService.MAX_SIZE_IMAGE },
      fileFilter: (_, file, cb) => {
        if (
          StorageService.validateMimeType(file, StorageService.ALLOWED_IMAGES)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Hanya file gambar yang diizinkan (JPEG, PNG, WebP)',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('File tidak ditemukan');
    const result = await this.storageService.upload(
      file,
      'profiles',
      req.user.tenantId,
    );
    return { message: 'Foto profil berhasil diupload', ...result };
  }

  // ── Upload dokumen (KTP, KK, ijazah, dll) ─────────────────
  @Post('document')
  @ApiOperation({ summary: 'Upload dokumen (KTP, KK, ijazah, transkrip, dll)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: StorageService.MAX_SIZE_DOCUMENT },
      fileFilter: (_, file, cb) => {
        const allowed = [
          ...StorageService.ALLOWED_IMAGES,
          ...StorageService.ALLOWED_DOCUMENTS,
        ];
        if (StorageService.validateMimeType(file, allowed)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Format file tidak didukung'), false);
        }
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('File tidak ditemukan');
    const result = await this.storageService.upload(
      file,
      'documents',
      req.user.tenantId,
    );
    return { message: 'Dokumen berhasil diupload', ...result };
  }

  // ── Upload logo/branding institusi ────────────────────────
  @Post('branding')
  @ApiOperation({ summary: 'Upload logo atau branding institusi' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: StorageService.MAX_SIZE_IMAGE },
      fileFilter: (_, file, cb) => {
        if (
          StorageService.validateMimeType(file, StorageService.ALLOWED_IMAGES)
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Hanya file gambar yang diizinkan'),
            false,
          );
        }
      },
    }),
  )
  async uploadBranding(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('File tidak ditemukan');
    const result = await this.storageService.upload(
      file,
      'branding',
      req.user.tenantId,
    );
    return { message: 'Branding berhasil diupload', ...result };
  }

  // ── Upload materi LMS ──────────────────────────────────────
  @Post('lms')
  @ApiOperation({ summary: 'Upload materi pembelajaran (PDF, video, dll)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: StorageService.MAX_SIZE_VIDEO },
      fileFilter: (_, file, cb) => {
        const allowed = [
          ...StorageService.ALLOWED_DOCUMENTS,
          ...StorageService.ALLOWED_VIDEOS,
          ...StorageService.ALLOWED_IMAGES,
          'audio/mpeg',
          'audio/ogg',
        ];
        if (StorageService.validateMimeType(file, allowed)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Format file tidak didukung untuk materi LMS',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadLms(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('File tidak ditemukan');
    const result = await this.storageService.upload(
      file,
      'lms',
      req.user.tenantId,
    );
    return { message: 'Materi LMS berhasil diupload', ...result };
  }

  // ── Dapatkan signed URL dari key ──────────────────────────
  @Get('signed-url')
  @ApiOperation({ summary: 'Dapatkan URL sementara untuk akses file' })
  async getSignedUrl(@Query('key') key: string) {
    if (!key) throw new BadRequestException('Key file diperlukan');
    const url = await this.storageService.getSignedUrl(key);
    return { url, expiresIn: '7 hari' };
  }

  // ── Hapus file ─────────────────────────────────────────────
  @Delete('file')
  @ApiOperation({ summary: 'Hapus file dari storage' })
  async deleteFile(@Query('key') key: string, @Request() req: any) {
    if (!key) throw new BadRequestException('Key file diperlukan');
    // Validasi tenant ownership dari key
    if (!key.includes(`tenants/${req.user.tenantId}`)) {
      throw new BadRequestException(
        'Tidak diizinkan menghapus file tenant lain',
      );
    }
    await this.storageService.delete(key);
    return { message: 'File berhasil dihapus' };
  }
}
