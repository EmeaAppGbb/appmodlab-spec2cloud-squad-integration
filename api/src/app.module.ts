import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesModule } from './properties/properties.module';
import { TenantsModule } from './tenants/tenants.module';
import { LeasesModule } from './leases/leases.module';
import { MaintenanceModule } from './maintenance/maintenance.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'urbannest_dev',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    PropertiesModule,
    TenantsModule,
    LeasesModule,
    MaintenanceModule,
  ],
})
export class AppModule {}
