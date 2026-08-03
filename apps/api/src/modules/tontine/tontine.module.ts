import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TontineService } from './tontine.service';
import { TontineController } from './tontine.controller';
import { Tontine, TontineMember } from './entities/tontine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tontine, TontineMember])],
  controllers: [TontineController],
  providers: [TontineService],
  exports: [TontineService],
})
export class TontineModule {}
