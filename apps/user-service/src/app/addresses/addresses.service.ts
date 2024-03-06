import { Injectable } from '@nestjs/common';
import { AddressesRepository } from '../repositories/addresses/addresses.repository';

@Injectable()
export class AddressesService {
  constructor(private addressesRepository: AddressesRepository) {}

  async findOneById(addressId: number) {
    return await this.addressesRepository.findOneById(addressId);
  }

  async findByUserId(userId: string) {
    return await this.addressesRepository.findByUserId(userId);
  }
}
