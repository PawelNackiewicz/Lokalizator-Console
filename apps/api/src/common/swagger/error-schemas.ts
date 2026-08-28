import type { SchemaObject } from '@nestjs/swagger';

/** Shape thrown by `ZodValidationPipe` on a failed `safeParse`. */
export const validationErrorSchema: SchemaObject = {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'Invalid input data' },
    errors: {
      type: 'object',
      additionalProperties: { type: 'array', items: { type: 'string' } },
    },
  },
  required: ['message', 'errors'],
};

/** Shape of Nest's default `UnauthorizedException` body. */
export const unauthorizedErrorSchema: SchemaObject = {
  type: 'object',
  properties: {
    statusCode: { type: 'number', example: 401 },
    message: { type: 'string', example: 'Session expired or invalid' },
  },
  required: ['statusCode', 'message'],
};
