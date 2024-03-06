import { PhoneEntity } from '../../database/entities/phone.entity';

export class PhonesRepositoryMock {
  async findOneById(phoneId: number): Promise<PhoneEntity | null> {
    return;
  }

  async findByUserId(userId: string): Promise<PhoneEntity[]> {
    return;
  }
}
