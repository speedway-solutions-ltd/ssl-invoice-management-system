import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceModule } from './invoice/invoice.module';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './config/typeorm.config';
@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST || 'localhost',
    //   port: Number(process.env.DB_PORT || 5432),
    //   username: process.env.DB_USER || 'speedway',
    //   password: process.env.DB_PASS || 'speedway',
    //   database: process.env.DB_NAME || 'speedway',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true
    // }),
    TypeOrmModule.forRoot(typeOrmConfig),
    InvoiceModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
