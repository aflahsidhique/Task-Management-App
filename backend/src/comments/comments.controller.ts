/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ListCommentsQueryDto } from './dto/list-comments-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'List comments for a task or project' })
  @ApiResponse({ status: 200, description: 'List of comments', type: [Comment] })
  @Get()
  findAll(@Query() query: ListCommentsQueryDto): Promise<Comment[]> {
    return this.commentsService.findAll(query);
  }

  @ApiOperation({ summary: 'Add a comment to a task or project' })
  @ApiResponse({ status: 201, description: 'Comment created', type: Comment })
  @Post()
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: User): Promise<Comment> {
    return this.commentsService.create(dto, user.id);
  }

  @ApiOperation({ summary: 'Edit a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated', type: Comment })
  @ApiResponse({ status: 403, description: 'Only the author can edit this comment' })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentsService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.commentsService.remove(id, user);
  }
}
