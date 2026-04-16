import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find({ where: { isAvailable: true } });
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException(`Property #${id} not found`);
    }
    return property;
  }

  async create(dto: CreatePropertyDto): Promise<Property> {
    const property = this.propertyRepository.create(dto);
    return this.propertyRepository.save(property);
  }

  async update(id: number, dto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    Object.assign(property, dto);
    return this.propertyRepository.save(property);
  }

  async remove(id: number): Promise<void> {
    const property = await this.findOne(id);
    await this.propertyRepository.remove(property);
  }
}
