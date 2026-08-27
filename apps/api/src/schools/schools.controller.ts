import { Controller, Get, Param } from '@nestjs/common';
import { schoolIdParamSchema, type School, type SchoolIdParam } from '@lokalizator/shared-types';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SchoolsService } from './schools.service';

/**
 * Protected by the global `JwtCookieGuard` — the absence of `@Public()` means
 * every endpoint requires a valid session cookie.
 *
 * The MVP exposes reads only. Room for POST/PATCH/DELETE is prepared (service +
 * mapper), but those endpoints were deliberately left out — see README.
 */
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  findAll(): Promise<School[]> {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param(new ZodValidationPipe(schoolIdParamSchema)) params: SchoolIdParam,
  ): Promise<School> {
    return this.schoolsService.findById(params.id);
  }
}
