import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Lease, LeaseStatus } from './lease.entity';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
  ) {}

  async findAll(): Promise<Lease[]> {
    return this.leaseRepository.find({ relations: ['property', 'tenant'] });
  }

  async findOne(id: number): Promise<Lease> {
    const lease = await this.leaseRepository.findOne({
      where: { id },
      relations: ['property', 'tenant'],
    });
    if (!lease) {
      throw new NotFoundException(`Lease #${id} not found`);
    }
    return lease;
  }

  async findActive(): Promise<Lease[]> {
    return this.leaseRepository.find({
      where: { status: LeaseStatus.ACTIVE },
      relations: ['property', 'tenant'],
    });
  }

  async findExpiringSoon(): Promise<Lease[]> {
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    return this.leaseRepository.find({
      where: {
        status: LeaseStatus.ACTIVE,
        endDate: LessThanOrEqual(sixtyDaysFromNow),
      },
      relations: ['property', 'tenant'],
    });
  }

  async create(dto: CreateLeaseDto): Promise<Lease> {
    const lease = this.leaseRepository.create(dto);
    return this.leaseRepository.save(lease);
  }

  async update(id: number, dto: UpdateLeaseDto): Promise<Lease> {
    const lease = await this.findOne(id);
    Object.assign(lease, dto);
    return this.leaseRepository.save(lease);
  }

  async remove(id: number): Promise<void> {
    const lease = await this.findOne(id);
    await this.leaseRepository.remove(lease);
  }

  calculateTotalCost(lease: Lease): number {
    return lease.calculateTotalCost();
  }

  isRenewable(lease: Lease): boolean {
    return lease.isRenewable();
  }
}
