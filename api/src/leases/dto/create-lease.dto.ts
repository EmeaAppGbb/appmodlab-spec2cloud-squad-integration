import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { LeaseStatus } from '../lease.entity';

export class CreateLeaseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  propertyId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  tenantId: number;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2027-04-30' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @ApiProperty({ enum: LeaseStatus, example: LeaseStatus.ACTIVE })
  @IsEnum(LeaseStatus)
  status: LeaseStatus;
}
