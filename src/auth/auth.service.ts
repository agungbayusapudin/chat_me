import { Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { UserResponseDto } from '@/users/dto/response-user.dto';
import { UsersService } from '@/users/users.service';
import { RegisterAuthDto } from './dto/resgister.auth.dto';
import { TokenUtils } from './utils/token.utils';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly tokenUtils: TokenUtils,
  ) {}

  async login(
    loginAuthDto: LoginAuthDto,
  ): Promise<AuthResponseDto<UserResponseDto>> {
    const { username, email, password } = loginAuthDto;

    const whereCondition: Prisma.UserWhereInput = {};

    if (username || email) {
      whereCondition.OR = [
        { username: { contains: username, mode: 'insensitive' } },
        { email: { contains: email, mode: 'insensitive' } },
      ];
    }

    try {
      const isUserExist = await this.prisma.user.findFirst({
        where: whereCondition,
      });

      if (!isUserExist) {
        throw new NotFoundException('User not found');
      }

      const passwordHash = isUserExist.passwordHash || '';

      const isPasswordValid = await compare(password, passwordHash);

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      const accessToken = await this.tokenUtils.generateAccessToken(
        isUserExist.id,
        isUserExist.username,
        isUserExist.email || '',
      );

      const refreshToken = await this.tokenUtils.generateRefreshToken(
        isUserExist.id,
      );

      return new AuthResponseDto<UserResponseDto>({
        data: [new UserResponseDto(isUserExist)],
        accessToken,
        accesTokenExpiresIn: 15 * 60, // 15 minutes in seconds
        refreshToken,
        refreshTokenExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Gagal login pengguna');
    }
  }

  async register(registerAuthDto: RegisterAuthDto): Promise<UserResponseDto> {
    const { username, email, phone, password, displayName } = registerAuthDto;

    // use external service to create user
    const user = await this.usersService.create({
      username,
      email,
      phone,
      password,
      displayName,
    });

    if (!user) {
      throw new BadRequestException('Gagal mendaftarkan pengguna');
    }

    return new UserResponseDto(user);
  }

  async refreshToken(refreshToken: string): Promise<{ refreshToken: string }> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    // Verify the refresh token
    const isTokenValid = await this.tokenUtils.verifyRefreshToken(refreshToken);

    if (!isTokenValid) {
      throw new BadRequestException('Invalid refresh token');
    }

    const userId = this.tokenUtils.decodeRefreshToken(refreshToken);

    const userData = await this.usersService.findOne(userId);

    if (!userData) {
      throw new NotFoundException('User not found');
    }

    // Generate a new access token
    const newAccessToken = await this.tokenUtils.generateAccessToken(
      userId,
      userData.username,
      userData.email || '',
    );

    return { refreshToken: newAccessToken };
  }
}
