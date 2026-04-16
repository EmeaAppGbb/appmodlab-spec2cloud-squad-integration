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

export enum LeaseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
}

@Entity('leases')
export class Lease {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ name: 'property_id' })
  propertyId: number;

  @ApiProperty()
  @Column({ name: 'tenant_id' })
  tenantId: number;

  @ApiProperty()
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @ApiProperty()
  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @ApiProperty()
  @Column({ name: 'monthly_rent', type: 'decimal', precision: 10, scale: 2 })
  monthlyRent: number;

  @ApiProperty({ enum: LeaseStatus })
  @Column({ type: 'enum', enum: LeaseStatus })
  status: LeaseStatus;

  @ManyToOne(() => Property, (property) => property.leases)
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @ManyToOne(() => Tenant, (tenant) => tenant.leases)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /** Estimates total lease cost: ceil((endDate - startDate) / 30) × monthlyRent */
  calculateTotalCost(): number {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const months = Math.ceil(diffDays / 30);
    return months * Number(this.monthlyRent);
  }

  /** Returns true if endDate > 30 days from now AND status is active */
  isRenewable(): boolean {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(this.endDate) > thirtyDaysFromNow && this.status === LeaseStatus.ACTIVE;
  }
}
