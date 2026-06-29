import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { NotificationEvent } from './notification.constants';

export interface NotificationPayload {
  to: string | string[];
  subject: string;
  event: NotificationEvent;
  data: Record<string, any>;
  tenantId: string;
  tenantName?: string;
}

@Injectable()
export class NotificationService {
  private queue: Queue;
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // ── BullMQ Queue ──────────────────────────────────────────
    this.queue = new Queue('notification', {
      connection: {
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6380),
      },
    });

    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER', ''),
        pass: this.configService.get('SMTP_PASS', ''),
      },
    });
  }

  // ── Kirim ke queue (async, tidak blocking) ────────────────
  async send(payload: NotificationPayload) {
    await this.queue.add(payload.event, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }

  // ── Kirim email langsung (sync, untuk testing) ────────────
  async sendEmailDirect(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"PendidikanMaster" <${this.configService.get('SMTP_USER')}>`,
        to,
        subject,
        html,
      });
      return true;
    } catch (err) {
      console.error('[Email] Failed to send:', err.message);
      return false;
    }
  }

  // ── Template: Welcome email ───────────────────────────────
  async sendWelcome(to: string, name: string, tenantName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6C63D8; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">PendidikanMaster</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Selamat Datang, ${name}! 🎉</h2>
          <p style="color: #666; line-height: 1.6;">
            Akun Anda di <strong>${tenantName}</strong> telah berhasil dibuat.
            Anda sekarang dapat mengakses semua fitur PendidikanMaster.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #6C63D8; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Masuk Sekarang
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          © 2026 PendidikanMaster. Semua hak dilindungi.
        </div>
      </div>
    `;
    return this.sendEmailDirect(
      to,
      'Selamat Datang di PendidikanMaster! 🎓',
      html,
    );
  }

  // ── Template: Password Reset ──────────────────────────────
  async sendPasswordReset(to: string, name: string, resetUrl: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6C63D8; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">PendidikanMaster</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Reset Password</h2>
          <p style="color: #666; line-height: 1.6;">
            Halo <strong>${name}</strong>, kami menerima permintaan untuk mereset password akun Anda.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #6C63D8; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">
            Link ini akan kadaluarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
          </p>
        </div>
      </div>
    `;
    return this.sendEmailDirect(to, 'Reset Password PendidikanMaster', html);
  }

  // ── Template: Invoice/Tagihan ─────────────────────────────
  async sendInvoice(
    to: string,
    name: string,
    invoiceData: {
      invoiceNo: string;
      amount: number;
      dueDate: string;
      description: string;
      tenantName: string;
    },
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6C63D8; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">${invoiceData.tenantName}</h1>
          <p style="color: #E0DCFF; margin: 5px 0 0;">Tagihan Pembayaran</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="color: #666;">Halo <strong>${name}</strong>,</p>
          <p style="color: #666;">Berikut adalah tagihan pembayaran Anda:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">No. Invoice</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${invoiceData.invoiceNo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Keterangan</td>
                <td style="padding: 8px 0; text-align: right;">${invoiceData.description}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Jatuh Tempo</td>
                <td style="padding: 8px 0; text-align: right; color: #e53e3e;">${invoiceData.dueDate}</td>
              </tr>
              <tr style="border-top: 2px solid #eee;">
                <td style="padding: 12px 0; font-weight: bold; font-size: 16px;">Total</td>
                <td style="padding: 12px 0; font-weight: bold; font-size: 16px; text-align: right; color: #6C63D8;">
                  Rp ${invoiceData.amount.toLocaleString('id-ID')}
                </td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #6C63D8; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Bayar Sekarang
            </a>
          </div>
        </div>
      </div>
    `;
    return this.sendEmailDirect(
      to,
      `Tagihan ${invoiceData.description} - ${invoiceData.tenantName}`,
      html,
    );
  }

  // ── Template: Pengumuman SPMB ─────────────────────────────
  async sendSpmbResult(
    to: string,
    name: string,
    data: {
      status: 'LULUS' | 'CADANGAN' | 'TIDAK_LULUS';
      programStudi: string;
      tenantName: string;
    },
  ) {
    const statusColor =
      data.status === 'LULUS'
        ? '#38a169'
        : data.status === 'CADANGAN'
          ? '#d69e2e'
          : '#e53e3e';
    const statusText =
      data.status === 'LULUS'
        ? 'DITERIMA ✅'
        : data.status === 'CADANGAN'
          ? 'CADANGAN ⏳'
          : 'TIDAK DITERIMA ❌';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6C63D8; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">${data.tenantName}</h1>
          <p style="color: #E0DCFF; margin: 5px 0 0;">Pengumuman Penerimaan</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9; text-align: center;">
          <h2 style="color: #333;">Halo, ${name}!</h2>
          <p style="color: #666;">Hasil seleksi penerimaan untuk program studi <strong>${data.programStudi}</strong>:</p>
          <div style="background: ${statusColor}; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold;">
            ${statusText}
          </div>
          ${
            data.status === 'LULUS'
              ? `
            <p style="color: #666;">Selamat! Segera lakukan daftar ulang sesuai jadwal yang ditentukan.</p>
            <div style="margin: 20px 0;">
              <a href="#" style="background: #6C63D8; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Daftar Ulang Sekarang
              </a>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
    return this.sendEmailDirect(
      to,
      `Pengumuman Hasil Seleksi - ${data.tenantName}`,
      html,
    );
  }
}
