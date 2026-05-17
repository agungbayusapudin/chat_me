// src/users/dto/user-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID unik pengguna (di-generate oleh database)',
  })
  id: string | number;

  @ApiProperty({
    example: 'agung_bayu',
    description: 'Username unik untuk pengguna',
  })
  username: string;

  @ApiPropertyOptional({
    example: 'agung@example.com',
    description: 'Alamat email pengguna',
  })
  email?: string | null;

  @ApiPropertyOptional({
    example: '+6281234567890',
    description: 'Nomor telepon pengguna',
  })
  phone?: string | null;

  @Exclude()
  passwordHash?: string | null;

  @ApiProperty({
    example: 'Agung Bayu Sapudin',
    description: 'Nama tampilan atau nama lengkap pengguna',
  })
  displayName: string;

  @ApiPropertyOptional({
    example: 'Backend Developer & Junior Data Engineer',
    description: 'Biodata singkat pengguna',
  })
  bio?: string | null;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'URL foto profil pengguna',
  })
  avatarUrl?: string | null;

  @ApiPropertyOptional({
    example: 'Asia/Jakarta',
    description: 'Zona waktu pengguna',
  })
  timezone?: string | null;

  @ApiPropertyOptional({
    example: 'id',
    description: 'Preferensi bahasa / locale pengguna',
  })
  locale?: string | null;

  @ApiProperty({
    example: '2026-05-17T02:26:12.000Z',
    description: 'Waktu kapan akun dibuat',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-17T02:26:12.000Z',
    description: 'Waktu kapan akun terakhir diperbarui',
  })
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
