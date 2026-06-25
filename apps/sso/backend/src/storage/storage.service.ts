import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as path from 'path';

export type StorageFolder =
  | 'profiles'
  | 'documents'
  | 'branding'
  | 'academic'
  | 'lms'
  | 'finance'
  | 'hr'
  | 'research'
  | 'public';

@Injectable()
export class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = 'pendidikanmaster';

    this.client = new S3Client({
      region: 'us-east-1',
      endpoint: `http://${this.configService.get('MINIO_HOST', 'localhost')}:${this.configService.get('MINIO_PORT_API', '9000')}`,
      credentials: {
        accessKeyId: this.configService.get('MINIO_ROOT_USER', 'pmmaster'),
        secretAccessKey: this.configService.get(
          'MINIO_ROOT_PASSWORD',
          'pmmaster_dev_secret',
        ),
      },
      forcePathStyle: true, // wajib untuk MinIO
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  // ── Pastikan bucket ada ────────────────────────────────────
  private async ensureBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      console.log(`[MinIO] Bucket '${this.bucket}' created ✅`);
    }
  }

  // ── Upload file ────────────────────────────────────────────
  async upload(
    file: Express.Multer.File,
    folder: StorageFolder,
    tenantId: string,
  ): Promise<{ key: string; url: string; size: number; mimeType: string }> {
    const ext = path.extname(file.originalname);
    const key = `tenants/${tenantId}/${folder}/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          tenantId,
        },
      }),
    );

    // Buat signed URL yang valid 7 hari
    const url = await this.getSignedUrl(key);

    return {
      key,
      url,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  // ── Upload public (tanpa tenant, untuk aset umum) ──────────
  async uploadPublic(
    file: Express.Multer.File,
    subfolder: string,
  ): Promise<{ key: string; url: string }> {
    const ext = path.extname(file.originalname);
    const key = `public/${subfolder}/${randomUUID()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const url = await this.getSignedUrl(key);
    return { key, url };
  }

  // ── Generate signed URL (akses sementara) ─────────────────
  async getSignedUrl(key: string, expiresIn = 604800): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  // ── Hapus file ─────────────────────────────────────────────
  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  // ── Validasi tipe file ─────────────────────────────────────
  static validateMimeType(
    file: { mimetype: string },
    allowed: string[],
  ): boolean {
    return allowed.includes(file.mimetype);
  }

  static readonly ALLOWED_IMAGES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  static readonly ALLOWED_DOCUMENTS = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  static readonly ALLOWED_VIDEOS = ['video/mp4', 'video/webm', 'video/ogg'];
  static readonly MAX_SIZE_IMAGE = 5 * 1024 * 1024; // 5 MB
  static readonly MAX_SIZE_DOCUMENT = 20 * 1024 * 1024; // 20 MB
  static readonly MAX_SIZE_VIDEO = 500 * 1024 * 1024; // 500 MB
}
