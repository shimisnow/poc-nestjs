import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../../database/entities/address.entity';

@Injectable()
export class AddressesRepository {
  constructor(
    @InjectRepository(AddressEntity)
    private repository: Repository<AddressEntity>,
  ) {}

  async findOneById(addressId: number): Promise<AddressEntity | null> {
    return await this.repository.findOneBy({
      addressId,
    });
  }

  async findByUserId(userId: string): Promise<AddressEntity[]> {
    return await this.repository
      .createQueryBuilder()
      .select()
      .where('user_id = :userId', { userId })
      .getMany();
  }
}
