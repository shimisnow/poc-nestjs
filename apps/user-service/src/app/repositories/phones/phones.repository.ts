import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhoneEntity } from '../../database/entities/phone.entity';

@Injectable()
export class PhonesRepository {
  constructor(
    @InjectRepository(PhoneEntity)
    private repository: Repository<PhoneEntity>,
  ) {}

  async findOneById(phoneId: number): Promise<PhoneEntity | null> {
    return await this.repository.findOneBy({
      phoneId,
    });
  }

  async findByUserId(userId: string): Promise<PhoneEntity[]> {
    return await this.repository
      .createQueryBuilder()
      .select()
      .where('user_id = :userId', { userId })
      .getMany();
  }
}
