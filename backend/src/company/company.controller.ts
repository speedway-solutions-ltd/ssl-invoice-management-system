import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private svc: CompanyService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.svc.create(dto);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCompanyDto>) {
    return this.svc.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(Number(id));
  }
}
