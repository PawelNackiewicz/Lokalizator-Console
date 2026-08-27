import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { z, type ZodType } from 'zod';

/**
 * Validates input with any zod schema and returns the parsed (transformed) value,
 * so the handler receives data already in its target type.
 *
 * zod rather than class-validator, because the same schemas are shared with the
 * web app through `@lokalizator/shared-types` — one contract, no duplication.
 */
@Injectable()
export class ZodValidationPipe<TOutput> implements PipeTransform<unknown, TOutput> {
  constructor(private readonly schema: ZodType<TOutput>) {}

  transform(value: unknown): TOutput {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Nieprawidłowe dane wejściowe',
        errors: z.flattenError(result.error).fieldErrors,
      });
    }

    return result.data;
  }
}
