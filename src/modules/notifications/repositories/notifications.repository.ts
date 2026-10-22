import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.repo.create({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type || NotificationType.SYSTEM,
      metadata: dto.metadata,
      isRead: false,
    });
    return this.repo.save(notification);
  }

  async findByUser(userId: string, unreadOnly = false): Promise<Notification[]> {
    const qb = this.repo
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (unreadOnly) {
      qb.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return qb.orderBy('notification.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repo.findOne({ where: { id } });
  }

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    await this.repo.update({ id, userId }, { isRead: true });
    return this.findById(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({
      where: { userId, isRead: false },
    });
  }
}
