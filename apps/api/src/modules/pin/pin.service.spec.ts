import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PinService } from './pin.service';
import { Wallet } from '../wallet/entities/wallet.entity';
import { WalletsService } from '../wallet/wallet.service';
import { RedisService } from '../../modules/otp/redis.service';
import { MailService } from '../mail/mail.service';

describe('PinService', () => {
  let service: PinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinService,
        { provide: getRepositoryToken(Wallet), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: WalletsService, useValue: {} },
        { provide: RedisService, useValue: {} },
        { provide: MailService, useValue: {} },
      ],
    }).compile();

    service = module.get<PinService>(PinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
