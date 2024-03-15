import { PhoneEntity } from '../../database/entities/phone.entity';

/**
 * Mocks the phones repository to use in tests
 */
export class PhonesRepositoryMock {
  async findOneById(phoneId: number): Promise<PhoneEntity | null> {
    return;
  }

  async findByUserId(userId: string): Promise<PhoneEntity[]> {
    return;
  }
}
