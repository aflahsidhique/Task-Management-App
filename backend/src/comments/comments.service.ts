/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/activity.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

const MANAGE_ROLES = ['Super Admin', 'Admin', 'Project Manager'];

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly activitiesService: ActivitiesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(query: ListCommentsQueryDto): Promise<Comment[]> {
    if (!query.taskId && !query.projectId) {
      throw new BadRequestException(
        'Provide a taskId or projectId to list comments',
      );
    }
    return this.commentRepository.find({
      where: {
        ...(query.taskId ? { task: { id: query.taskId } } : {}),
        ...(query.projectId ? { project: { id: query.projectId } } : {}),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async create(dto: CreateCommentDto, authorId: number): Promise<Comment> {
    if ((dto.taskId && dto.projectId) || (!dto.taskId && !dto.projectId)) {
      throw new BadRequestException(
        'Provide exactly one of taskId or projectId',
      );
    }

    const mentions = dto.mentionedUserIds?.length
      ? await this.userRepository.find({
          where: { id: In(dto.mentionedUserIds) },
        })
      : [];

    const comment = this.commentRepository.create({
      content: dto.content,
      author: { id: authorId } as any,
      task: dto.taskId ? ({ id: dto.taskId } as any) : null,
      project: dto.projectId ? ({ id: dto.projectId } as any) : null,
      mentions,
    });
    const saved = await this.commentRepository.save(comment);
    const full = await this.findById(saved.id);

    const entityType = dto.taskId ? 'task' : 'project';
    const entityId = dto.taskId ?? dto.projectId;

    await this.activitiesService.log({
      userId: authorId,
      type: ActivityType.COMMENT_ADDED,
      entityType,
      entityId,
      description: `commented on ${entityType} #${entityId}`,
    });

    await this.notifyMentions(full, entityType, entityId);

    return full;
  }

  async update(
    id: number,
    dto: UpdateCommentDto,
    currentUser: User,
  ): Promise<Comment> {
    const existing = await this.findById(id);
    if (existing.author.id !== currentUser.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    const mentions =
      dto.mentionedUserIds !== undefined
        ? dto.mentionedUserIds.length
          ? await this.userRepository.find({
              where: { id: In(dto.mentionedUserIds) },
            })
          : []
        : existing.mentions;

    await this.commentRepository.save({
      id,
      content: dto.content,
      mentions,
    });
    const updated = await this.findById(id);

    const entityType = updated.task ? 'task' : 'project';
    const entityId = updated.task?.id ?? updated.project?.id;
    const newlyMentioned = updated.mentions.filter(
      (m) => !existing.mentions.some((em) => em.id === m.id),
    );
    if (newlyMentioned.length > 0) {
      await this.notifyMentions(
        { ...updated, mentions: newlyMentioned },
        entityType,
        entityId,
      );
    }

    return updated;
  }

  async remove(id: number, currentUser: User): Promise<void> {
    const existing = await this.findById(id);
    const canManage =
      existing.author.id === currentUser.id ||
      MANAGE_ROLES.includes(currentUser.role?.name);
    if (!canManage) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }
    await this.commentRepository.softDelete(id);

    const entityType = existing.task ? 'task' : 'project';
    const entityId = existing.task?.id ?? existing.project?.id;
    await this.activitiesService.log({
      userId: currentUser.id,
      type: ActivityType.COMMENT_DELETED,
      entityType,
      entityId,
      description: `deleted a comment on ${entityType} #${entityId}`,
    });
  }

  private async notifyMentions(
    comment: Comment,
    entityType: string,
    entityId: number,
  ): Promise<void> {
    for (const mentioned of comment.mentions) {
      if (mentioned.id === comment.author.id) continue;
      await this.notificationsService.create({
        userId: mentioned.id,
        type: NotificationType.MENTION,
        title: 'You were mentioned in a comment',
        message: `${comment.author.fullName} mentioned you: "${truncate(comment.content)}"`,
        link: `/${entityType}s/${entityId}`,
      });
    }
  }
}
