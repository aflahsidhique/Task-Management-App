/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

// A root (path-less) @Controller() cannot be combined with URI versioning +
// a global prefix in Nest 10 — the route silently fails to register — so
// this doubles as a simple, unauthenticated health check at /api/v1/health.
@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
