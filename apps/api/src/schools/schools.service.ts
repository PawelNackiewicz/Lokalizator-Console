import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { School } from '@lokalizator/shared-types';
import { asc, eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../db/db.tokens';
import { schools } from '../db/schema';
import { toSchoolDto } from './school.mapper';

@Injectable()
export class SchoolsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /**
   * MVP zwraca pełną listę bez paginacji — przy kilkunastu rekordach to
   * najprostsze rozwiązanie, a mapa i tak potrzebuje wszystkich pinezek naraz.
   * Paginacja/filtrowanie: patrz TODO w README.
   */
  async findAll(): Promise<School[]> {
    const rows = await this.db.select().from(schools).orderBy(asc(schools.name));

    return rows.map(toSchoolDto);
  }

  async findById(id: string): Promise<School> {
    const row = await this.db.query.schools.findFirst({ where: eq(schools.id, id) });

    if (!row) {
      throw new NotFoundException(`Szkoła o identyfikatorze ${id} nie istnieje`);
    }

    return toSchoolDto(row);
  }
}
