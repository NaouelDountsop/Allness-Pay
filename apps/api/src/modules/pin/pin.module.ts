import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../wallet/entities/wallet.entity';
import { PinService } from './pin.service';
import { PinController } from './pin.controller';
import { WalletsModule } from '../wallet/wallet.module';
import { OtpModule } from '../otp/otp.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), WalletsModule, OtpModule, MailModule],
  controllers: [PinController],
  providers: [PinService],
  exports: [PinService],
})
export class PinModule {}
