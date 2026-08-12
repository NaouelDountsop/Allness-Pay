import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KycService } from './kyc.service';
import { Kyc } from './entities/kyc.entity';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { WalletsService } from '../wallet/wallet.service';

describe('KycService', () => {
  let service: KycService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycService,
        { provide: getRepositoryToken(Kyc), useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: UsersService, useValue: {} },
        { provide: WalletsService, useValue: {} },
      ],
    }).compile();

    service = module.get<KycService>(KycService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
