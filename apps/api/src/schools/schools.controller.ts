import { Controller, Get, Param } from '@nestjs/common';
import { schoolIdParamSchema, type School, type SchoolIdParam } from '@lokalizator/shared-types';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SchoolsService } from './schools.service';

/**
 * Chroniony przez globalny `JwtCookieGuard` — brak dekoratora `@Public()`
 * oznacza, że każdy endpoint wymaga ważnego ciasteczka sesyjnego.
 *
 * MVP wystawia tylko odczyt. Miejsce na POST/PATCH/DELETE jest przygotowane
 * (serwis + mapper), ale endpointy świadomie nie powstały — patrz README.
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
