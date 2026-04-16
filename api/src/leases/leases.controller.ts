import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';
import { Lease } from './lease.entity';

@ApiTags('Leases')
@Controller('leases')
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Get()
  @ApiOperation({ summary: 'List all leases' })
  @ApiResponse({ status: 200, type: [Lease] })
  findAll(): Promise<Lease[]> {
    return this.leasesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'List active leases' })
  @ApiResponse({ status: 200, type: [Lease] })
  findActive(): Promise<Lease[]> {
    return this.leasesService.findActive();
  }

  @Get('expiring-soon')
  @ApiOperation({ summary: 'List active leases expiring within 60 days' })
  @ApiResponse({ status: 200, type: [Lease] })
  findExpiringSoon(): Promise<Lease[]> {
    return this.leasesService.findExpiringSoon();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lease by ID' })
  @ApiResponse({ status: 200, type: Lease })
  @ApiResponse({ status: 404, description: 'Lease not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lease> {
    return this.leasesService.findOne(id);
  }

  @Get(':id/total-cost')
  @ApiOperation({ summary: 'Calculate total cost of a lease' })
  @ApiResponse({ status: 200, description: 'Returns { totalCost: number }' })
  @ApiResponse({ status: 404, description: 'Lease not found' })
  async getTotalCost(@Param('id', ParseIntPipe) id: number) {
    const lease = await this.leasesService.findOne(id);
    return { totalCost: lease.calculateTotalCost() };
  }

  @Get(':id/renewable')
  @ApiOperation({ summary: 'Check if a lease is renewable' })
  @ApiResponse({ status: 200, description: 'Returns { renewable: boolean }' })
  @ApiResponse({ status: 404, description: 'Lease not found' })
  async checkRenewable(@Param('id', ParseIntPipe) id: number) {
    const lease = await this.leasesService.findOne(id);
    return { renewable: lease.isRenewable() };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lease' })
  @ApiResponse({ status: 201, type: Lease })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  create(@Body() dto: CreateLeaseDto): Promise<Lease> {
    return this.leasesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a lease' })
  @ApiResponse({ status: 200, type: Lease })
  @ApiResponse({ status: 404, description: 'Lease not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeaseDto,
  ): Promise<Lease> {
    return this.leasesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lease' })
  @ApiResponse({ status: 204, description: 'Lease deleted' })
  @ApiResponse({ status: 404, description: 'Lease not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leasesService.remove(id);
  }
}
