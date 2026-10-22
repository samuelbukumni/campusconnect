import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsRepository, NotificationsService],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
