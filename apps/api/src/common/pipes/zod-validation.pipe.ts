import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { z, type ZodType } from 'zod';

/**
 * Waliduje wejście dowolnym schematem zod i zwraca sparsowaną (przetransformowaną)
 * wartość, więc handler dostaje już dane w docelowym typie.
 *
 * Używamy zod zamiast class-validatora, bo te same schematy współdzielimy
 * z frontendem przez `@lokalizator/shared-types` — jeden kontrakt, zero duplikacji.
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
