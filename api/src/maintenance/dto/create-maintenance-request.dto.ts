import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import {
  MaintenanceCategory,
  MaintenancePriority,
  MaintenanceStatus,
} from '../maintenance-request.entity';

export class CreateMaintenanceRequestDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  propertyId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  tenantId: number;

  @ApiProperty({ required: false, example: null })
  @IsOptional()
  @IsNumber()
  vendorId?: number;

  @ApiProperty({ enum: MaintenanceCategory, example: MaintenanceCategory.PLUMBING })
  @IsEnum(MaintenanceCategory)
  category: MaintenanceCategory;

  @ApiProperty({ enum: MaintenancePriority, example: MaintenancePriority.HIGH })
  @IsEnum(MaintenancePriority)
  priority: MaintenancePriority;

  @ApiProperty({ example: 'Kitchen sink is leaking under the cabinet' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: MaintenanceStatus, required: false, default: MaintenanceStatus.OPEN })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;
}
