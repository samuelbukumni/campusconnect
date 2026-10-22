import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepo: NotificationsRepository) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsRepo.create(dto);
  }

  async getUserNotifications(
    userId: string,
    unreadOnly = false,
  ): Promise<Notification[]> {
    return this.notificationsRepo.findByUser(userId, unreadOnly);
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationsRepo.findById(notificationId);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to modify this notification',
      );
    }

    const updated = await this.notificationsRepo.markAsRead(notificationId, userId);
    return updated!;
  }

  async markAllAsRead(userId: string): Promise<{ message: string }> {
    await this.notificationsRepo.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const count = await this.notificationsRepo.countUnread(userId);
    return { unreadCount: count };
  }
}
