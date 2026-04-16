import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { PropertyType } from '../property.entity';

export class CreatePropertyDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Seattle' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'WA' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '98101' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.APARTMENT })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiProperty({ required: false, example: 850 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareFeet?: number;

  @ApiProperty({ example: 1500.0 })
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
