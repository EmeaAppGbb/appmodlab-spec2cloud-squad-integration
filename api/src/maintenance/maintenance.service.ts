import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
} from './maintenance-request.entity';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private readonly maintenanceRepository: Repository<MaintenanceRequest>,
  ) {}

  async findAll(): Promise<MaintenanceRequest[]> {
    return this.maintenanceRepository.find({
      relations: ['property', 'tenant'],
    });
  }

  async findOne(id: number): Promise<MaintenanceRequest> {
    const request = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['property', 'tenant'],
    });
    if (!request) {
      throw new NotFoundException(`Maintenance request #${id} not found`);
    }
    return request;
  }

  async findOpen(): Promise<MaintenanceRequest[]> {
    return this.maintenanceRepository.find({
      where: { status: MaintenanceStatus.OPEN },
      relations: ['property', 'tenant'],
    });
  }

  async findHighPriority(): Promise<MaintenanceRequest[]> {
    return this.maintenanceRepository.find({
      where: {
        priority: In([MaintenancePriority.HIGH, MaintenancePriority.EMERGENCY]),
      },
      relations: ['property', 'tenant'],
    });
  }

  async create(dto: CreateMaintenanceRequestDto): Promise<MaintenanceRequest> {
    const request = this.maintenanceRepository.create(dto);
    return this.maintenanceRepository.save(request);
  }

  async update(id: number, dto: UpdateMaintenanceRequestDto): Promise<MaintenanceRequest> {
    const request = await this.findOne(id);
    Object.assign(request, dto);
    return this.maintenanceRepository.save(request);
  }

  async remove(id: number): Promise<void> {
    const request = await this.findOne(id);
    await this.maintenanceRepository.remove(request);
  }
}
