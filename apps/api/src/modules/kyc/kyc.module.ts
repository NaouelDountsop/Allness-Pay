import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { Kyc } from './entities/kyc.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesModule } from '../role/role.module';

@Module({
  imports: [TypeOrmModule.forFeature([Kyc]), AuthModule, RolesModule],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
