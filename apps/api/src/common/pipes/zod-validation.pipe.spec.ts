import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ZodValidationPipe } from './zod-validation.pipe';

const schema = z.object({
  username: z.string().trim().min(1),
  age: z.coerce.number().int(),
});

describe('ZodValidationPipe', () => {
  it('zwraca sparsowaną wartość (z transformacjami)', () => {
    const pipe = new ZodValidationPipe(schema);

    expect(pipe.transform({ username: '  admin  ', age: '42' })).toEqual({
      username: 'admin',
      age: 42,
    });
  });

  it('rzuca BadRequestException z listą błędów per pole', () => {
    const pipe = new ZodValidationPipe(schema);

    try {
      pipe.transform({ username: '', age: 'nie-liczba' });
      expect.unreachable('pipe powinien rzucić wyjątek');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        errors: Record<string, string[]>;
      };
      expect(Object.keys(response.errors)).toEqual(expect.arrayContaining(['username', 'age']));
    }
  });
});
