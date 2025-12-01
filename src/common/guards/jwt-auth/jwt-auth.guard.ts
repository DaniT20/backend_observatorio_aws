import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Request } from 'express';

// ⚙️ CONFIGURA ESTOS VALORES SEGÚN TU POOL DE COGNITO
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';

// ✅ Creamos un verificador de tokens de acceso de Cognito
/* const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
  tokenUse: 'access', // puede ser "id" si tu frontend envía el idToken
}); */
const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  clientId: COGNITO_CLIENT_ID,
  tokenUse: 'id',   // 👈 ahora validamos ID tokens
});

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new UnauthorizedException('Token ausente o inválido');

    const token = authHeader.slice(7);

    try {
      const payload = await verifier.verify(token);
      // Guardamos info útil del usuario en la request
      (req as any).user = payload;
      return true;
    } catch (err) {
      console.error('❌ JWT verification failed:', err);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
