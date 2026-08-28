import type { SchemaObject } from '@nestjs/swagger';
import { z, type ZodType } from 'zod';

/**
 * Converts an existing zod schema into an OpenAPI 3.0 schema object, so the API
 * docs describe the same contract that `ZodValidationPipe` enforces at runtime —
 * no parallel DTO classes to keep in sync.
 */
export function zodSchema(schema: ZodType, description?: string): SchemaObject {
  const jsonSchema = z.toJSONSchema(schema, { target: 'openapi-3.0' }) as SchemaObject;

  return description === undefined ? jsonSchema : { ...jsonSchema, description };
}
