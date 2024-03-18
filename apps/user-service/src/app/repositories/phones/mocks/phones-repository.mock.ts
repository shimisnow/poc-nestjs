import { PhoneEntity } from '../../../database/entities/phone.entity';
import {
  PhoneOneEntityMock,
  PhoneTwoEntityMock,
  PhoneThreeEntityMock,
  PhoneFourEntityMock,
} from '.';

/**
 * Mocks the phones repository to use in tests
 */
export class PhonesRepositoryMock {
  phones = [
    PhoneOneEntityMock,
    PhoneTwoEntityMock,
    PhoneThreeEntityMock,
    PhoneFourEntityMock,
  ];

  async findOneById(
    phoneId: number,
    queryFields: [keyof PhoneEntity] = null,
  ): Promise<PhoneEntity | null> {
    return this.phones.find((value) => value.phoneId == phoneId) ?? null;
  }

  async findOneByIdWithUserId(
    phoneId: number,
    userId: string,
    queryFields: [keyof PhoneEntity] = null,
  ): Promise<PhoneEntity | null> {
    return (
      this.phones.find((value) => {
        return value.phoneId == phoneId && value.user.userId == userId;
      }) ?? null
    );
  }

  async findByUserId(
    userId: string,
    queryFields: [keyof PhoneEntity] = null,
  ): Promise<PhoneEntity[]> {
    return this.phones.filter((value) => value.user.userId == userId);
  }
}
