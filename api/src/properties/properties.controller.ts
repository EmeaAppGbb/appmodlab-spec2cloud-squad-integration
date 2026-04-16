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
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './property.entity';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'List available properties' })
  @ApiResponse({ status: 200, type: [Property] })
  findAll(): Promise<Property[]> {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by ID' })
  @ApiResponse({ status: 200, type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Property> {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, type: Property })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  create(@Body() dto: CreatePropertyDto): Promise<Property> {
    return this.propertiesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({ status: 200, type: Property })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 422, description: 'Validation failed' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 204, description: 'Property deleted' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.propertiesService.remove(id);
  }
}
