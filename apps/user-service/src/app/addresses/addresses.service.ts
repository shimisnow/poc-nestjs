import { Injectable } from '@nestjs/common';
import { AddressesRepository } from '../repositories/addresses/addresses.repository';
import { AddressEntity } from '../database/entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(private addressesRepository: AddressesRepository) {}

  async findOneById(addressId: number): Promise<AddressEntity | null> {
    return await this.addressesRepository.findOneById(addressId);
  }

  async findByUserId(userId: string): Promise<AddressEntity[]> {
    return await this.addressesRepository.findByUserId(userId);
  }
}
