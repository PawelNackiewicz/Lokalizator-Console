import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser, JwtPayload, LoginInput } from '@lokalizator/shared-types';
import { compare } from 'bcryptjs';

import { UsersService } from '../users/users.service';

/**
 * Hash of a password that belongs to nobody. Compared against when the user does
 * not exist, so response timing does not reveal which logins are taken.
 */
const DUMMY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.7SbCFRfvbG9Q9pUKgqXhCkTPBvOWMLu';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Returns the same error whether the username or the password is wrong. */
  async validateCredentials({ username, password }: LoginInput): Promise<AuthUser> {
    const user = await this.users.findByUsername(username);
    const passwordMatches = await compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Nieprawidłowy login lub hasło');
    }

    return { id: user.id, username: user.username };
  }

  /** No refresh tokens — see the TODO in README. */
  issueAccessToken(user: AuthUser): Promise<string> {
    const payload: JwtPayload = { sub: user.id, username: user.username };

    return this.jwtService.signAsync(payload);
  }
}
