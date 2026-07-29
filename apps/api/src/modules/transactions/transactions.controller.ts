import {
  Controller,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet-operation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('wallets/:id')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  deposit(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DepositDto,
  ) {
    return this.transactionsService.deposit(id, req.user.id, dto);
  }

  @Post('withdraw')
  withdraw(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WithdrawDto,
  ) {
    return this.transactionsService.withdraw(id, req.user.id, dto);
  }

  @Post('transfer')
  transfer(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferDto,
  ) {
    return this.transactionsService.transfer(id, req.user.id, dto);
  }
}