import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'JwtRefreshStrategy',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_SECRET') as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: string }) {
    const bearerToken = (req.get('Authorization') as string)
      .replace('Bearer ', '')
      .trim();
    console.log('validate called', payload.sub);
    const signature = bearerToken.split('.').pop() as string;
    // eslint-disable-next-line no-useless-catch
    try {
      console.log(`in validate: ${Date.now()}`);
      const validToken = await this.authService.validRefreshToken(
        payload.sub,
        signature,
      );
      if (validToken) {
        console.log(`jwt-refresh.strategy: token is valid: ${validToken}`);
        return { id: payload.sub, refreshToken: bearerToken };
      }
    } catch (error) {
      throw error;
    }
    return null;
  }
}
