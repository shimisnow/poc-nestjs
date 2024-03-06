import { Injectable } from '@nestjs/common';
import { PhonesRepository } from '../repositories/phones/phones.repository';
import { PhoneEntity } from '../database/entities/phone.entity';

@Injectable()
export class PhonesService {
  constructor(private phonesRepository: PhonesRepository) {}

  async findOneById(phoneId: number): Promise<PhoneEntity | null> {
    return await this.phonesRepository.findOneById(phoneId);
  }

  async findByUserId(userId: string): Promise<PhoneEntity[]> {
    return await this.phonesRepository.findByUserId(userId);
  }
}
