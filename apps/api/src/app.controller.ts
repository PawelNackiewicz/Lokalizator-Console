import { Controller, Get } from '@nestjs/common';

import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  /** Prosty probe do sprawdzenia, czy API wstało (używany w README). */
  @Public()
  @Get('health')
  health(): { status: 'ok'; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
