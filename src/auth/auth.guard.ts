// src/auth/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../common/config';

const JWKS = createRemoteJWKSet(new URL(config.cognito.jwksUri));

@Injectable() // <-- sin providedIn
export class AuthGuard implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const auth = (req.headers['authorization'] as string) || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: config.cognito.issuer,
        audience: config.cognito.clientId, // si envías ID token
      });
      (req as any).user = payload; // sub, email, etc.
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
