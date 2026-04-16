import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lease } from './lease.entity';
import { LeasesService } from './leases.service';
import { LeasesController } from './leases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lease])],
  controllers: [LeasesController],
  providers: [LeasesService],
  exports: [LeasesService],
})
export class LeasesModule {}
