import { Test, TestingModule } from '@nestjs/testing';
import { AddressesResolver } from './addresses.resolver';

describe('AddressesResolver', () => {
  let resolver: AddressesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressesResolver],
    }).compile();

    resolver = module.get<AddressesResolver>(AddressesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
