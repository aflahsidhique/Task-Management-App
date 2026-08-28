/* eslint-disable prettier/prettier */
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role } from '../roles/role.entity';
import { User } from '../users/user.entity';
import { Project, ProjectStatus } from '../projects/project.entity';
import { Task, TaskPriority, TaskStatus } from '../tasks/task.entity';
import { Notification, NotificationType } from '../notifications/notification.entity';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/activity.entity';

const DEMO_PASSWORD = 'Demo@12345';

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existing = await this.userRepository.count();
    if (existing > 0) {
      return;
    }
    this.logger.log('No users found — seeding demo data...');

    const roles = await this.seedRoles();
    const users = await this.seedUsers(roles);
    const projects = await this.seedProjects(users);
    await this.seedTasks(projects, users);
    await this.seedNotifications(users[0]);

    this.logger.log(
      `Seed complete. Demo login: ${users[0].email} / ${DEMO_PASSWORD}`,
    );
  }

  private async seedRoles(): Promise<Role[]> {
    const definitions = [
      {
        name: 'Super Admin',
        description: 'Unrestricted access to every module (implicitly bypasses role checks)',
        permissions: [
          'manage_users',
          'manage_roles',
          'manage_projects',
          'manage_tasks',
          'manage_files',
          'view_reports',
          'manage_settings',
        ],
      },
      {
        name: 'Admin',
        description: 'Full access to all modules',
        permissions: [
          'manage_users',
          'manage_roles',
          'manage_projects',
          'manage_tasks',
          'manage_files',
          'view_reports',
          'manage_settings',
        ],
      },
      {
        name: 'Project Manager',
        description: 'Manages projects, tasks and reports',
        permissions: ['manage_projects', 'manage_tasks', 'view_reports', 'manage_files'],
      },
      {
        name: 'Team Lead',
        description: 'Leads a team, manages tasks and reviews progress',
        permissions: ['manage_tasks', 'manage_files', 'view_reports'],
      },
      {
        name: 'Developer',
        description: 'Works on assigned tasks',
        permissions: ['manage_tasks', 'manage_files'],
      },
      {
        name: 'Designer',
        description: 'Works on assigned design tasks',
        permissions: ['manage_tasks', 'manage_files'],
      },
      {
        name: 'QA',
        description: 'Tests and verifies tasks',
        permissions: ['manage_tasks'],
      },
    ];
    const roles = definitions.map((d) => this.roleRepository.create(d));
    return this.roleRepository.save(roles);
  }

  private async seedUsers(roles: Role[]): Promise<User[]> {
    const byName = (name: string) => roles.find((r) => r.name === name);
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const definitions = [
      { fullName: 'Muhammed N.', email: 'aflahgraphy@gmail.com', jobTitle: 'Project Manager', role: byName('Project Manager') },
      { fullName: 'Sarah Khan', email: 'sarah.khan@example.com', jobTitle: 'Frontend Developer', role: byName('Developer') },
      { fullName: 'Hisham Ali', email: 'hisham.ali@example.com', jobTitle: 'Backend Developer', role: byName('Developer') },
      { fullName: 'Fathima Noor', email: 'fathima.noor@example.com', jobTitle: 'UI/UX Designer', role: byName('Designer') },
      { fullName: 'Ramees P.', email: 'ramees.p@example.com', jobTitle: 'Full Stack Developer', role: byName('Developer') },
      { fullName: 'Aneesha F.', email: 'aneesha.f@example.com', jobTitle: 'QA Engineer', role: byName('QA') },
      { fullName: 'Navas K.', email: 'navas.k@example.com', jobTitle: 'Backend Developer', role: byName('Developer') },
      { fullName: 'Layla S.', email: 'layla.s@example.com', jobTitle: 'Product Designer', role: byName('Designer') },
      { fullName: 'Admin User', email: 'admin@example.com', jobTitle: 'System Administrator', role: byName('Admin') },
      { fullName: 'Yusuf Rahman', email: 'yusuf.rahman@example.com', jobTitle: 'Super Administrator', role: byName('Super Admin') },
      { fullName: 'Zainab Kutty', email: 'zainab.kutty@example.com', jobTitle: 'Team Lead', role: byName('Team Lead') },
    ];

    const users = definitions.map((d) =>
      this.userRepository.create({ ...d, passwordHash }),
    );
    return this.userRepository.save(users);
  }

  private async seedProjects(users: User[]): Promise<Project[]> {
    const today = new Date();
    const owner = users[0];
    const definitions = [
      {
        name: 'Website Redesign',
        description: 'Redesign the company marketing website',
        status: ProjectStatus.ON_TRACK,
        startDate: addDays(today, -45),
        endDate: addDays(today, 20),
        members: [users[1], users[3], users[7]],
      },
      {
        name: 'Mobile App Development',
        description: 'Build the cross-platform mobile app',
        status: ProjectStatus.AT_RISK,
        startDate: addDays(today, -60),
        endDate: addDays(today, 35),
        members: [users[2], users[4], users[6]],
      },
      {
        name: 'CRM Integration',
        description: 'Integrate the CRM with internal systems',
        status: ProjectStatus.ON_HOLD,
        startDate: addDays(today, -30),
        endDate: addDays(today, 45),
        members: [users[4], users[5]],
      },
      {
        name: 'Marketing Campaign',
        description: 'Q3 multi-channel marketing campaign',
        status: ProjectStatus.ON_TRACK,
        startDate: addDays(today, -15),
        endDate: addDays(today, 30),
        members: [users[3], users[7], users[1]],
      },
      {
        name: 'Internal Tool Development',
        description: 'Internal admin dashboard tooling',
        status: ProjectStatus.DELAYED,
        startDate: addDays(today, -50),
        endDate: addDays(today, -5),
        members: [users[2], users[6], users[5]],
      },
      {
        name: 'API Migration',
        description: 'Migrate legacy API to the new gateway',
        status: ProjectStatus.COMPLETED,
        startDate: addDays(today, -90),
        endDate: addDays(today, -20),
        members: [users[2], users[4]],
      },
    ];

    const projects = definitions.map((d) =>
      this.projectRepository.create({ ...d, owner }),
    );
    const saved = await this.projectRepository.save(projects);

    for (const project of saved) {
      await this.activitiesService.log({
        userId: owner.id,
        type: ActivityType.PROJECT_CREATED,
        entityType: 'project',
        entityId: project.id,
        description: `created project '${project.name}'`,
        createdAt: addDays(today, -Math.floor(Math.random() * 14)),
      });
    }

    return saved;
  }

  private async seedTasks(projects: Project[], users: User[]): Promise<void> {
    const today = new Date();
    const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE];
    const priorities = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];
    const titles = [
      'Design login page', 'API integration', 'Database optimization', 'UI/UX improvements',
      'Write API documentation', 'Fix authentication bug', 'Update project documentation',
      'User testing & feedback', 'Set up CI/CD pipeline', 'Refactor state management',
      'Implement dark mode', 'Optimize image loading', 'Create onboarding flow',
      'Add unit tests', 'Fix responsive layout issues', 'Set up error tracking',
      'Design email templates', 'Build settings page', 'Improve search performance',
      'Create user analytics dashboard',
    ];

    const tasksToInsert: Task[] = [];
    let titleIndex = 0;
    let userIndex = 0;

    for (const project of projects) {
      const taskCount = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < taskCount; i++) {
        const status = statuses[(titleIndex + i) % statuses.length];
        const priority = priorities[(titleIndex + i) % priorities.length];
        const assignee = users[userIndex % users.length];
        userIndex++;
        const dueOffset = -10 + Math.floor(Math.random() * 40);
        const dueDate = addDays(today, dueOffset);

        const task = this.taskRepository.create({
          title: titles[titleIndex % titles.length],
          description: `${titles[titleIndex % titles.length]} for ${project.name}`,
          status,
          priority,
          dueDate,
          project,
          assignee,
          reporter: project.owner,
          completedAt: status === TaskStatus.DONE ? addDays(dueDate, -2) : null,
        } as Partial<Task>);
        tasksToInsert.push(task);
        titleIndex++;
      }
    }

    const saved = await this.taskRepository.save(tasksToInsert);

    for (const task of saved) {
      await this.activitiesService.log({
        userId: task.reporter?.id ?? task.assignee?.id,
        type: task.status === TaskStatus.DONE ? ActivityType.TASK_COMPLETED : ActivityType.TASK_CREATED,
        entityType: 'task',
        entityId: task.id,
        description:
          task.status === TaskStatus.DONE
            ? `completed task '${task.title}'`
            : `created task '${task.title}'`,
        createdAt: addDays(today, -Math.floor(Math.random() * 14)),
      });
    }
  }

  private async seedNotifications(user: User): Promise<void> {
    const definitions = [
      { type: NotificationType.TASK_ASSIGNED, title: 'New task assigned', message: "You were assigned 'Design login page'", isRead: false },
      { type: NotificationType.PROJECT_UPDATE, title: 'Project updated', message: "'Website Redesign' status changed to On Track", isRead: false },
      { type: NotificationType.TASK_DUE, title: 'Task due soon', message: "'API integration' is due in 2 days", isRead: true },
      { type: NotificationType.SYSTEM, title: 'Welcome to SNEC', message: 'Your account has been set up successfully', isRead: true },
      { type: NotificationType.MENTION, title: 'You were mentioned', message: "Sarah Khan mentioned you in 'Database optimization'", isRead: false },
      { type: NotificationType.PROJECT_UPDATE, title: 'New member added', message: "Fathima Noor joined 'Marketing Campaign'", isRead: true },
    ];
    const notifications = definitions.map((d) =>
      this.notificationRepository.create({ ...d, user }),
    );
    await this.notificationRepository.save(notifications);
  }
}
