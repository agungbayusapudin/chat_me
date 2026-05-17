import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { hash } from 'bcrypt';
import { PaginatedResultDto } from './dto/pagenation.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { GetUsersDto } from './dto/get-req-users.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { password, ...userData } = createUserDto;

    const conditions = [
      userData.username && { username: userData.username },
      userData.email && { email: userData.email },
      userData.phone && { phone: userData.phone },
    ].filter(
      (
        condition,
      ): condition is
        | { username: string }
        | { email: string }
        | { phone: string } => Boolean(condition),
    );

    const existingUser = await this.prisma.user.findFirst({
      where: conditions.length > 0 ? { OR: conditions } : undefined,
    });

    if (existingUser) {
      throw new Error('Username, email, atau nomor telepon sudah digunakan');
    }

    try {
      const saltRounds = 10;
      const passwordHash = await hash(password, saltRounds);

      const newUser = await this.prisma.user.create({
        data: {
          ...userData,
          password: passwordHash,
        },
      });

      return new UserResponseDto(newUser);
    } catch (error: unknown) {
      console.error(error);
      throw new InternalServerErrorException('Gagal membuat pengguna baru');
    }
  }

  async findAll(
    fillterDto: GetUsersDto,
  ): Promise<PaginatedResultDto<UserResponseDto>> {
    const { page, limit, search, startDate, endDate } = fillterDto;

    const skip = (page - 1) * limit;

    // defind where condition dinamic Search and StartDate&endDate
    const whereCondition: Prisma.UserWhereInput = {};

    if (search) {
      whereCondition.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt.gte = startDate;

      if (endDate) whereCondition.createdAt.lte = endDate;
    }

    // get rawUser and totalDate use dinamic condition and order by DSC
    const [rawUsers, totalData] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),

      this.prisma.user.count({
        where: whereCondition,
      }),
    ]);

    // change rawUser to format Response dto (Serialized)
    const serializedUserData = rawUsers.map(
      (user) => new UserResponseDto(user),
    );

    const totalPage = Math.ceil(totalData / limit);

    return new PaginatedResultDto<UserResponseDto>({
      data: serializedUserData,
      pagenation: {
        totalData: totalData,
        totalPage: totalPage,
        currentPage: page,
        limit,
      },
    });
  }

  async findOne(idUser: string): Promise<UserResponseDto> {
    const userData = await this.prisma.user.findUnique({
      where: { id: idUser },
    });

    if (!userData) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return new UserResponseDto(userData);
  }

  async update(
    idUser: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const isUserExist = await this.prisma.user.findUnique({
      where: {
        id: idUser,
      },
    });

    if (!isUserExist) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const updateUser = await this.prisma.user.update({
      where: {
        id: idUser,
      },
      data: updateUserDto,
    });

    return new UserResponseDto(updateUser);
  }

  async remove(idUser: string): Promise<void> {
    const isUserExist = await this.prisma.user.findUnique({
      where: {
        id: idUser,
      },
    });

    if (!isUserExist) {
      throw new NotFoundException('User tidak ditemukan');
    }

    await this.prisma.user.delete({
      where: {
        id: idUser,
      },
    });
  }
}
