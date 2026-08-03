import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto/wallet-operation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

@ApiTags('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('wallets/:id')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Lister les transactions d\'un portefeuille' })
  listTransactions(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.listByWallet(id);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Déposer sur un portefeuille' })
  deposit(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DepositDto,
  ) {
    return this.transactionsService.deposit(id, req.user.id, dto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Retirer d\'un portefeuille' })
  withdraw(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WithdrawDto,
  ) {
    return this.transactionsService.withdraw(id, req.user.id, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transférer entre portefeuilles' })
  transfer(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferDto,
  ) {
    return this.transactionsService.transfer(id, req.user.id, dto);
  }
}