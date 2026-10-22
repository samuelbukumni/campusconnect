import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationType } from '../entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsRepo: any;

  beforeEach(async () => {
    notificationsRepo = {
      create: jest.fn(),
      findByUser: jest.fn(),
      findById: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      countUnread: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsRepository, useValue: notificationsRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markAsRead', () => {
    it('should throw NotFoundException if notification does not exist', async () => {
      notificationsRepo.findById.mockResolvedValue(null);

      await expect(service.markAsRead('user-1', 'notif-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not notification recipient', async () => {
      notificationsRepo.findById.mockResolvedValue({
        id: 'notif-1',
        userId: 'other-user',
      });

      await expect(service.markAsRead('user-1', 'notif-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should mark notification as read successfully', async () => {
      notificationsRepo.findById.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        isRead: false,
      });
      notificationsRepo.markAsRead.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        isRead: true,
      });

      const result = await service.markAsRead('user-1', 'notif-1');
      expect(result.isRead).toBe(true);
      expect(notificationsRepo.markAsRead).toHaveBeenCalledWith('notif-1', 'user-1');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for user', async () => {
      notificationsRepo.countUnread.mockResolvedValue(4);

      const result = await service.getUnreadCount('user-1');
      expect(result.unreadCount).toBe(4);
    });
  });
});
