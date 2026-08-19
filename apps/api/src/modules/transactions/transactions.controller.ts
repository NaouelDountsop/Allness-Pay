import { Controller, Get, Post, Param, Body, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
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
  @ApiOperation({ summary: "Lister les transactions d'un portefeuille" })
  listTransactions(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.listByWallet(id);
  }

  @Get('transactions/monthly-summary')
  @ApiOperation({ summary: 'Résumé mensuel des transactions' })
  getMonthlySummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.getMonthlySummary(id);
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
