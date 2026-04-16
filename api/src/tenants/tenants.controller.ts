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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant } from './tenant.entity';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  @ApiResponse({ status: 200, type: [Tenant] })
  findAll(): Promise<Tenant[]> {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  @ApiResponse({ status: 200, type: Tenant })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Tenant> {
    return this.tenantsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, type: Tenant })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  create(@Body() dto: CreateTenantDto): Promise<Tenant> {
    return this.tenantsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiResponse({ status: 200, type: Tenant })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTenantDto,
  ): Promise<Tenant> {
    return this.tenantsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiResponse({ status: 204, description: 'Tenant deleted' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tenantsService.remove(id);
  }
}
