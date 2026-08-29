/* eslint-disable prettier/prettier */
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/test-app';

// Seeded by SeedService against the freshly-migrated test database.
const ADMIN = { email: 'admin@example.com', password: 'Demo@12345' };
const DEVELOPER = { email: 'sarah.khan@example.com', password: 'Demo@12345' };

async function login(app: INestApplication, creds: { email: string; password: string }) {
  const res = await request(app.getHttpServer()).post('/api/v1/auth/login').send(creds);
  return res.body.data as { accessToken: string; user: { id: number } };
}

describe('Projects, Tasks & Comments (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let adminId: number;
  let developerToken: string;
  let projectId: number;
  let taskId: number;

  beforeAll(async () => {
    app = await createTestApp();
    const admin = await login(app, ADMIN);
    adminToken = admin.accessToken;
    adminId = admin.user.id;
    developerToken = (await login(app, DEVELOPER)).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects project creation from a role without manage_projects permission', () => {
    return request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${developerToken}`)
      .send({
        name: 'Unauthorized project',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
        ownerId: adminId,
      })
      .expect(403);
  });

  it('creates a project as Admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'E2E Test Project',
        startDate: '2026-01-01',
        endDate: '2026-06-01',
        ownerId: adminId,
      })
      .expect(201);

    expect(res.body.data.name).toBe('E2E Test Project');
    projectId = res.body.data.id;
  });

  it('creates a task under the project, reporter set to the creator', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'E2E Test Task',
        description: 'Created by the e2e suite',
        projectId,
      })
      .expect(201);

    expect(res.body.data.reporter.id).toBe(adminId);
    taskId = res.body.data.id;
  });

  it('paginates the task list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/tasks?limit=1&page=1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.meta.itemsPerPage).toBe(1);
    expect(res.body.data.meta.totalItems).toBeGreaterThan(0);
  });

  it('adds a comment to the task', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Looks good so far', taskId })
      .expect(201);

    expect(res.body.data.task.id).toBe(taskId);
    expect(res.body.data.author.id).toBe(adminId);
  });

  it('rejects a comment with neither taskId nor projectId', () => {
    return request(app.getHttpServer())
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Orphan comment' })
      .expect(400);
  });

  it('bulk-updates task status and stamps completedAt', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/v1/tasks/bulk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ids: [taskId], changes: { status: 'DONE' } })
      .expect(200);

    expect(res.body.data[0].status).toBe('DONE');
    expect(res.body.data[0].completedAt).not.toBeNull();
  });

  it('soft-deletes the task, which then disappears from the task list', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/tasks/${taskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/tasks?search=E2E Test Task`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.items.find((t: any) => t.id === taskId)).toBeUndefined();
  });
});
