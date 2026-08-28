import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  schoolIdParamSchema,
  schoolListSchema,
  schoolSchema,
  type School,
  type SchoolIdParam,
} from '@lokalizator/shared-types';

import { unauthorizedErrorSchema, validationErrorSchema } from '../common/swagger/error-schemas';
import { zodSchema } from '../common/swagger/zod-schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SchoolsService } from './schools.service';

/**
 * Protected by the global `JwtCookieGuard` — the absence of `@Public()` means
 * every endpoint requires a valid session cookie.
 *
 * The MVP exposes reads only. Room for POST/PATCH/DELETE is prepared (service +
 * mapper), but those endpoints were deliberately left out — see README.
 */
@ApiTags('schools')
@ApiCookieAuth()
@ApiUnauthorizedResponse({ schema: unauthorizedErrorSchema })
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  @ApiOperation({ summary: 'List of all schools' })
  @ApiOkResponse({ schema: zodSchema(schoolListSchema) })
  findAll(): Promise<School[]> {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Details of a single school' })
  @ApiParam({ name: 'id', schema: zodSchema(schoolIdParamSchema.shape.id) })
  @ApiOkResponse({ schema: zodSchema(schoolSchema) })
  @ApiNotFoundResponse({ description: 'No school exists with the given id' })
  @ApiBadRequestResponse({ schema: validationErrorSchema, description: 'Invalid id format' })
  findOne(
    @Param(new ZodValidationPipe(schoolIdParamSchema)) params: SchoolIdParam,
  ): Promise<School> {
    return this.schoolsService.findById(params.id);
  }
}
