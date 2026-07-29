import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { Kyc } from './entities/kyc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kyc])],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
