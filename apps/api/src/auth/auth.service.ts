import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthUser, JwtPayload, LoginInput } from '@lokalizator/shared-types';
import { compare } from 'bcryptjs';

import { UsersService } from '../users/users.service';

/**
 * Hash nieistniejącego hasła. Porównujemy z nim, gdy użytkownik nie istnieje,
 * żeby czas odpowiedzi nie zdradzał, które loginy są zajęte (user enumeration).
 */
const DUMMY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.7SbCFRfvbG9Q9pUKgqXhCkTPBvOWMLu';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Weryfikuje login i hasło. Celowo zwraca ten sam błąd niezależnie od tego,
   * czy nie zgadza się login, czy hasło.
   */
  async validateCredentials({ username, password }: LoginInput): Promise<AuthUser> {
    const user = await this.users.findByUsername(username);
    const passwordMatches = await compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Nieprawidłowy login lub hasło');
    }

    return { id: user.id, username: user.username };
  }

  /** Podpisuje access token. Brak refresh tokenów — patrz TODO w README. */
  issueAccessToken(user: AuthUser): Promise<string> {
    const payload: JwtPayload = { sub: user.id, username: user.username };

    return this.jwtService.signAsync(payload);
  }
}
