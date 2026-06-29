import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

class TestEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  name: string;
}

@ApiTags('Notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('test/welcome')
  @ApiOperation({ summary: 'Test kirim email welcome' })
  async testWelcome(@Body() dto: TestEmailDto) {
    const sent = await this.notificationService.sendWelcome(
      dto.to,
      dto.name,
      'Sekolah Demo',
    );
    return { sent, message: sent ? 'Email terkirim' : 'Gagal kirim email' };
  }

  @Post('test/invoice')
  @ApiOperation({ summary: 'Test kirim email tagihan' })
  async testInvoice(@Body() dto: TestEmailDto) {
    const sent = await this.notificationService.sendInvoice(dto.to, dto.name, {
      invoiceNo: 'INV-2026-001',
      amount: 1500000,
      dueDate: '30 Juni 2026',
      description: 'SPP Bulan Juli 2026',
      tenantName: 'Sekolah Demo',
    });
    return { sent, message: sent ? 'Email terkirim' : 'Gagal kirim email' };
  }
}
