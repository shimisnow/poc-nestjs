import { AddressEntity } from '../../database/entities/address.entity';

export class AddressesRepositoryMock {
  async findOneById(addressId: number): Promise<AddressEntity | null> {
    return;
  }

  async findByUserId(userId: string): Promise<AddressEntity[]> {
    return;
  }
}
