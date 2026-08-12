import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { RolesService } from './role.service';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: RolesService, useValue: {} }],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
