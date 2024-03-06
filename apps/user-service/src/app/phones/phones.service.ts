import { Injectable } from '@nestjs/common';
import { PhonesRepository } from '../repositories/phones/phones.repository';

@Injectable()
export class PhonesService {
  constructor(private phonesRepository: PhonesRepository) {}

  async findOneById(phoneId: number) {
    return await this.phonesRepository.findOneById(phoneId);
  }
}
