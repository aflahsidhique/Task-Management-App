/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from './activity.entity';

export interface LogActivityInput {
  userId: number;
  type: ActivityType;
  entityType: string;
  entityId: number;
  description: string;
  createdAt?: Date;
}

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async log(input: LogActivityInput): Promise<Activity> {
    const activity = this.activityRepository.create({
      user: { id: input.userId } as any,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      description: input.description,
      ...(input.createdAt ? { createdAt: input.createdAt } : {}),
    });
    return this.activityRepository.save(activity);
  }

  async getRecent(limit = 20): Promise<Activity[]> {
    return this.activityRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
