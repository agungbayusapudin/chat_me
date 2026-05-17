import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenUtils {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateAccessToken(
    userId: string,
    username: string,
    email: string,
  ): Promise<string> {
    const secretKeyEnv = this.configService.get<string>(
      'JWT_ACCES_TOKEN_SECRET',
    );
    const expiresInEnv =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '';

    const payload = { userId, username, email } as any;

    const accessToken = this.jwtService.sign(payload, {
      secret: secretKeyEnv,
      expiresIn: expiresInEnv as any,
    });

    return Promise.resolve(accessToken);
  }

  generateRefreshToken(userId: string): Promise<string> {
    const secretKeyEnv = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    const expiresInEnv =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') || '';

    const payload = { userId } as any;

    const refreshToken = this.jwtService.sign(payload, {
      secret: secretKeyEnv,
      expiresIn: expiresInEnv as any,
    });

    return Promise.resolve(refreshToken);
  }

  verifyAccessToken(token: string): boolean {
    const secretKeyEnv = this.configService.get<string>(
      'JWT_ACCES_TOKEN_SECRET',
    );

    try {
      this.jwtService.verify(token, { secret: secretKeyEnv });
      return true;
    } catch (error) {
      return false;
    }
  }

  verifyRefreshToken(token: string): boolean {
    const secretKeyEnv = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );

    try {
      this.jwtService.verify(token, { secret: secretKeyEnv });
      return true;
    } catch (error) {
      return false;
    }
  }

  decodeRefreshToken(refreshToken: string) {
    const secretKeyEnv = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    );

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: secretKeyEnv,
      });
      return payload.userId;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
