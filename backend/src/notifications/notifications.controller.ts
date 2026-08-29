/* eslint-disable prettier/prettier */
import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: "Retrieve the current user's notifications" })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: [Notification],
  })
  @Get()
  getMyNotifications(@CurrentUser() user: User): Promise<Notification[]> {
    return this.notificationsService.findForUser(user.id);
  }

  @ApiOperation({
    summary: "Retrieve the current user's unread notification count",
  })
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.notificationsService.unreadCount(user.id);
    return { count };
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @Put(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @ApiOperation({ summary: 'Mark all notifications as read' })
  @Put('read-all')
  markAllAsRead(@CurrentUser() user: User): Promise<void> {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @ApiOperation({ summary: 'Delete a notification' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.notificationsService.remove(id, user.id);
  }
}
