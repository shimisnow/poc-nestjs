import { Injectable } from '@nestjs/common';
import { AddressesRepository } from '../repositories/addresses/addresses.repository';
import { AddressEntity } from '../database/entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(private addressesRepository: AddressesRepository) {}

  async findOneById(
    addressId: number,
    queryFields: string[] = null,
  ): Promise<AddressEntity | null> {
    return await this.addressesRepository.findOneById(
      addressId,
      queryFields as [keyof AddressEntity],
    );
  }

  async findByUserId(userId: string): Promise<AddressEntity[]> {
    return await this.addressesRepository.findByUserId(userId);
  }
}
