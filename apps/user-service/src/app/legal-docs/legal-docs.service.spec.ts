import { Test, TestingModule } from '@nestjs/testing';
import { LegalDocsService } from './legal-docs.service';
import { LegalDocsRepository } from '../repositories/legal-docs/legal-docs.repository';
import { LegalDocsRepositoryMock } from './mocks/legal-docs-repository.mock';

describe('legal-docs.service', () => {
  let service: LegalDocsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalDocsService,
        {
          provide: LegalDocsRepository,
          useClass: LegalDocsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<LegalDocsService>(LegalDocsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
