import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('In-App Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve notifications for current student' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of student notifications' })
  async getMyNotifications(
    @CurrentUser() user: User,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.getUserNotifications(
      user.id,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread notification count badge' })
  @ApiResponse({ status: 200, description: 'Unread notification count' })
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all student notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
