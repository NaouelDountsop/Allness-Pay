import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../role/role.service';

describe('KycController', () => {
  let controller: KycController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KycController],
      providers: [
        { provide: KycService, useValue: {} },
        { provide: Reflector, useValue: {} },
        { provide: RolesService, useValue: {} },
      ],
    }).compile();

    controller = module.get<KycController>(KycController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
