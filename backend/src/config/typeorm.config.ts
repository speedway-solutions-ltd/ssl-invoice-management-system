import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Invoice } from '../invoice/entity/invoice.entity';
import { InvoiceItem } from '../invoice/entity/invoice-item.entity';
import { PlanType } from '../entities/PlanType.entity';
import { ExperienceTier } from '../entities/ExperienceTier.entity';
import { ResourcePrice } from '../entities/ResourcePrice.entity';
import { ProjectService } from '../entities/ProjectService.entity';
import { ActuarialPackage } from '../entities/ActuarialPackage.entity';
dotenv.config();

// Explicitly list entity classes only (not enums)
const entityList = [
  Invoice,
  InvoiceItem,
  PlanType,
  ExperienceTier,
  ResourcePrice,
  ProjectService,
  ActuarialPackage,
];

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // entities: ['dist/**/*.entity{.ts,.js}'],
  entities: entityList,
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV == 'production',
};
