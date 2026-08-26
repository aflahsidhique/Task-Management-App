/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { Task, TaskStatus } from '../tasks/task.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/activity.entity';

export interface ProjectWithProgress extends Project {
  progressPercent: number;
  memberCount: number;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async computeProgress(projectId: number): Promise<number> {
    const total = await this.taskRepository.count({
      where: { project: { id: projectId } },
    });
    if (total === 0) return 0;
    const done = await this.taskRepository.count({
      where: { project: { id: projectId }, status: TaskStatus.DONE },
    });
    return Math.round((done / total) * 100);
  }

  private async withProgress(project: Project): Promise<ProjectWithProgress> {
    const progressPercent = await this.computeProgress(project.id);
    return {
      ...project,
      progressPercent,
      memberCount: project.members?.length ?? 0,
    };
  }

  async getAllProjects(status?: string, search?: string): Promise<ProjectWithProgress[]> {
    const where: any = {};
    if (status) where.status = status;
    if (search) where.name = Like(`%${search}%`);
    const projects = await this.projectRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return Promise.all(projects.map((p) => this.withProgress(p)));
  }

  async getProjectById(id: number): Promise<ProjectWithProgress> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return this.withProgress(project);
  }

  async createProject(dto: CreateProjectDto, currentUserId: number): Promise<ProjectWithProgress> {
    const owner = await this.userRepository.findOne({ where: { id: dto.ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with ID ${dto.ownerId} not found`);
    }
    const members = dto.memberIds?.length
      ? await this.userRepository.find({ where: { id: In(dto.memberIds) } })
      : [];
    const project = this.projectRepository.create({
      name: dto.name,
      description: dto.description,
      status: dto.status,
      startDate: dto.startDate as any,
      endDate: dto.endDate as any,
      owner,
      members,
    });
    const saved = await this.projectRepository.save(project);
    await this.activitiesService.log({
      userId: currentUserId,
      type: ActivityType.PROJECT_CREATED,
      entityType: 'project',
      entityId: saved.id,
      description: `created project '${saved.name}'`,
    });
    return this.withProgress(saved);
  }

  async updateProject(
    id: number,
    dto: UpdateProjectDto,
    currentUserId: number,
  ): Promise<ProjectWithProgress> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    const { ownerId, memberIds, ...rest } = dto;
    if (ownerId) {
      const owner = await this.userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        throw new NotFoundException(`User with ID ${ownerId} not found`);
      }
      project.owner = owner;
    }
    if (memberIds) {
      project.members = memberIds.length
        ? await this.userRepository.find({ where: { id: In(memberIds) } })
        : [];
    }
    Object.assign(project, rest);
    const saved = await this.projectRepository.save(project);
    await this.activitiesService.log({
      userId: currentUserId,
      type: ActivityType.PROJECT_UPDATED,
      entityType: 'project',
      entityId: saved.id,
      description: `updated project '${saved.name}'`,
    });
    return this.withProgress(saved);
  }

  async deleteProject(id: number): Promise<void> {
    const result = await this.projectRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async addMember(projectId: number, userId: number): Promise<ProjectWithProgress> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (!project.members.some((m) => m.id === userId)) {
      project.members.push(user);
      await this.projectRepository.save(project);
    }
    return this.withProgress(project);
  }

  async removeMember(projectId: number, userId: number): Promise<ProjectWithProgress> {
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    project.members = project.members.filter((m) => m.id !== userId);
    await this.projectRepository.save(project);
    return this.withProgress(project);
  }
}
