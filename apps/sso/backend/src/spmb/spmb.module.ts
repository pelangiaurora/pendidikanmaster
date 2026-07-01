import { Module } from '@nestjs/common';
import { SpmbService } from './spmb.service';
import { SpmbController } from './spmb.controller';
import { PrismaService } from '../prisma.service';
import { NotificationModule } from '../notification/notification.module';
import { RedisService } from '../redis.service';

@Module({
  imports: [NotificationModule],
  controllers: [SpmbController],
  providers: [SpmbService, PrismaService, RedisService],
  exports: [SpmbService],
})
export class SpmbModule {}
