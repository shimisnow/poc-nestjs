import { Test, TestingModule } from '@nestjs/testing';
import { PhonesResolver } from './phones.resolver';

describe('PhonesResolver', () => {
  let resolver: PhonesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhonesResolver],
    }).compile();

    resolver = module.get<PhonesResolver>(PhonesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
