import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(@InjectRepository(Company) private repo: Repository<Company>) {}

  create(dto: CreateCompanyDto) {
    const c = this.repo.create(dto as any);
    return this.repo.save(c);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: Partial<CreateCompanyDto>) {
    await this.repo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    const c = await this.findOne(id);
    if (!c) return null;
    return this.repo.remove(c);
  }
}
