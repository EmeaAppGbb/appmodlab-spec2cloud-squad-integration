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
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';
import { MaintenanceRequest } from './maintenance-request.entity';

@ApiTags('Maintenance Requests')
@Controller('maintenance/requests')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @ApiOperation({ summary: 'List all maintenance requests' })
  @ApiResponse({ status: 200, type: [MaintenanceRequest] })
  findAll(): Promise<MaintenanceRequest[]> {
    return this.maintenanceService.findAll();
  }

  @Get('open')
  @ApiOperation({ summary: 'List open maintenance requests' })
  @ApiResponse({ status: 200, type: [MaintenanceRequest] })
  findOpen(): Promise<MaintenanceRequest[]> {
    return this.maintenanceService.findOpen();
  }

  @Get('high-priority')
  @ApiOperation({ summary: 'List high priority and emergency maintenance requests' })
  @ApiResponse({ status: 200, type: [MaintenanceRequest] })
  findHighPriority(): Promise<MaintenanceRequest[]> {
    return this.maintenanceService.findHighPriority();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a maintenance request by ID' })
  @ApiResponse({ status: 200, type: MaintenanceRequest })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<MaintenanceRequest> {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new maintenance request' })
  @ApiResponse({ status: 201, type: MaintenanceRequest })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  create(@Body() dto: CreateMaintenanceRequestDto): Promise<MaintenanceRequest> {
    return this.maintenanceService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a maintenance request' })
  @ApiResponse({ status: 200, type: MaintenanceRequest })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaintenanceRequestDto,
  ): Promise<MaintenanceRequest> {
    return this.maintenanceService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a maintenance request' })
  @ApiResponse({ status: 204, description: 'Maintenance request deleted' })
  @ApiResponse({ status: 404, description: 'Maintenance request not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.maintenanceService.remove(id);
  }
}
