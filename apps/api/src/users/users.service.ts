import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type Database } from '../db/db.tokens';
import { users, type UserRow } from '../db/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  /** Returns the full row, password hash included — used only by AuthService. */
  findByUsername(username: string): Promise<UserRow | undefined> {
    return this.db.query.users.findFirst({ where: eq(users.username, username) });
  }

  findById(id: string): Promise<UserRow | undefined> {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
  }
}
