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

@Entity('tenants')
export class Tenant {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty()
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  phone: string;

  @OneToMany(() => Lease, (lease) => lease.tenant)
  leases: Lease[];

  @OneToMany(() => MaintenanceRequest, (mr) => mr.tenant)
  maintenanceRequests: MaintenanceRequest[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
