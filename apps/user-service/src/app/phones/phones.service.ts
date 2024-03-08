import { Injectable } from '@nestjs/common';
import { PhonesRepository } from '../repositories/phones/phones.repository';
import { PhoneEntity } from '../database/entities/phone.entity';

@Injectable()
export class PhonesService {
  constructor(private phonesRepository: PhonesRepository) {}

  async findOneById(
    phoneId: number,
    queryFields: string[] = null,
  ): Promise<PhoneEntity | null> {
    return await this.phonesRepository.findOneById(
      phoneId,
      queryFields as [keyof PhoneEntity],
    );
  }

  async findByUserId(
    userId: string,
    queryFields: string[] = null,
  ): Promise<PhoneEntity[]> {
    return await this.phonesRepository.findByUserId(
      userId,
      queryFields as [keyof PhoneEntity],
    );
  }
}
