import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../properties/property.entity';
import { Tenant } from '../tenants/tenant.entity';

export enum MaintenanceCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HVAC = 'hvac',
  APPLIANCE = 'appliance',
  OTHER = 'other',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency',
}

export enum MaintenanceStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

@Entity('maintenance_requests')
export class MaintenanceRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ name: 'property_id' })
  propertyId: number;

  @ApiProperty()
  @Column({ name: 'tenant_id' })
  tenantId: number;

  @ApiProperty({ required: false })
  @Column({ name: 'vendor_id', nullable: true })
  vendorId: number | null;

  @ApiProperty({ enum: MaintenanceCategory })
  @Column({ type: 'enum', enum: MaintenanceCategory })
  category: MaintenanceCategory;

  @ApiProperty({ enum: MaintenancePriority })
  @Column({ type: 'enum', enum: MaintenancePriority })
  priority: MaintenancePriority;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ enum: MaintenanceStatus })
  @Column({ type: 'enum', enum: MaintenanceStatus, default: MaintenanceStatus.OPEN })
  status: MaintenanceStatus;

  @ManyToOne(() => Property, (property) => property.maintenanceRequests)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => Tenant, (tenant) => tenant.maintenanceRequests)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
