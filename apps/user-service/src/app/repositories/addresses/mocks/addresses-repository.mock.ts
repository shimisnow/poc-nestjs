import { AddressEntity } from '../../../database/entities/address.entity';
import {
  AddressOneEntityMock,
  AddressTwoEntityMock,
  AddressThreeEntityMock,
} from '.';

/**
 * Mocks the addresses repository to use in tests
 */
export class AddressesRepositoryMock {
  addresses = [
    AddressOneEntityMock,
    AddressTwoEntityMock,
    AddressThreeEntityMock,
  ];

  async findOneById(
    addressId: number,
    queryFields: [keyof AddressEntity] = null,
  ): Promise<AddressEntity | null> {
    return this.addresses.find((value) => value.addressId == addressId);
  }

  async findOneByIdWithUserId(
    addressId: number,
    userId: string,
    queryFields: [keyof AddressEntity] = null,
  ): Promise<AddressEntity | null> {
    return this.addresses.find((value) => {
      return value.addressId == addressId && value.user.userId == userId;
    });
  }

  async findByUserId(
    userId: string,
    queryFields: [keyof AddressEntity] = null,
  ): Promise<AddressEntity[]> {
    return this.addresses.filter((value) => {
      value.user.userId == userId;
    });
  }
}
