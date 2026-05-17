import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsDate, IsOptional, IsString } from 'class-validator';

export class GetUsersDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'search by username or diplay name',
  })
  @IsString()
  @IsOptional()
  search: string;

  @ApiPropertyOptional({
    description: 'format date {YYYY-MM-DD}',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate: Date;

  @ApiPropertyOptional({
    description: 'format date {YYYY-MM-DD}',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate: Date;
}
