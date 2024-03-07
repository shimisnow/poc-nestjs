import { AddressEntity } from '../../database/entities/address.entity';

/**
 * Mocks the addresses repository to use in tests
 */
export class AddressesRepositoryMock {
  async findOneById(addressId: number): Promise<AddressEntity | null> {
    return;
  }

  async findByUserId(userId: string): Promise<AddressEntity[]> {
    return;
  }
}
