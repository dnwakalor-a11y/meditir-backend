import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './provider.entity';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(providerData: Partial<Provider>): Promise<Provider> {
    const provider = this.providerRepository.create(providerData);
    return this.providerRepository.save(provider);
  }

  async find(): Promise<Provider[]> {
    return this.providerRepository.find({
      relations: ['user'],
    });
  }

  async findOneBy(criteria: any): Promise<Provider | null> {
    return this.providerRepository.findOne({
      where: criteria,
      relations: ['user'],
    });
  }

  async update(criteria: any, updateData: Partial<Provider>): Promise<void> {
    await this.providerRepository.update(criteria, updateData);
  }

  async delete(criteria: any): Promise<void> {
    await this.providerRepository.delete(criteria);
  }
}
