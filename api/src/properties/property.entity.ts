import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Lease } from '../leases/lease.entity';
import { MaintenanceRequest } from '../maintenance/maintenance-request.entity';

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  CONDO = 'condo',
  TOWNHOUSE = 'townhouse',
}

@Entity('properties')
export class Property {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  address: string;

  @ApiProperty()
  @Column()
  city: string;

  @ApiProperty()
  @Column()
  state: string;

  @ApiProperty()
  @Column({ name: 'zip_code' })
  zipCode: string;

  @ApiProperty({ enum: PropertyType })
  @Column({ name: 'property_type', type: 'enum', enum: PropertyType })
  propertyType: PropertyType;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  bedrooms: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  bathrooms: number;

  @ApiProperty({ required: false })
  @Column({ name: 'square_feet', nullable: true })
  squareFeet: number;

  @ApiProperty()
  @Column({ name: 'monthly_rent', type: 'decimal', precision: 10, scale: 2 })
  monthlyRent: number;

  @ApiProperty()
  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @OneToMany(() => Lease, (lease) => lease.property)
  leases: Lease[];

  @OneToMany(() => MaintenanceRequest, (mr) => mr.property)
  maintenanceRequests: MaintenanceRequest[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
