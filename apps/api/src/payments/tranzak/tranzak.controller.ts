import { Controller, Get, Post, Body, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TranzakService } from './tranzak.service';
import { TranzakPaymentDto } from './dto/tranzak-payment.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

@ApiTags('tranzak')
@Controller('payments/tranzak')
export class TranzakController {
  private readonly logger = new Logger(TranzakController.name);

  constructor(private readonly tranzakService: TranzakService) {}

  @Get('test-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Tester l'authentification Tranzak" })
  async testToken() {
    const token = await this.tranzakService.getAccessToken();

    return {
      success: true,
      message: 'Authentification Tranzak réussie',
      tokenReceived: !!token,
    };
  }

  @Post('test-payment')
  //@UseGuards(JwtAuthGuard)
  //@ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tester la création de paiement Tranzak' })
  async testPayment() {
    return this.tranzakService.createPayment({
      amount: 1000,
      currencyCode: 'XAF',
      description: 'Test dépôt AfriLinkPay',
      mchTransactionRef: `TEST-${Date.now()}`,
      returnUrl: 'http://localhost:5173/payment/return',
    });
  }

  @Post('payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initier un paiement via Tranzak' })
  async createPayment(@Req() req: AuthenticatedRequest, @Body() dto: TranzakPaymentDto) {
    return this.tranzakService.initiatePayment(dto, req.user.id);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Callback de confirmation Tranzak (pas de JWT)' })
  async handleCallback(@Body() body: any) {
    this.logger.log(`Callback Tranzak reçu: ${JSON.stringify(body)}`);

    // Tranzak envoie les données dans body.resource
    const resource = body?.resource ?? body;

    const requestId = resource?.requestId ?? resource?.data?.requestId;

    const transactionId = resource?.transactionId ?? resource?.data?.transactionId;

    const status = resource?.status ?? resource?.transactionStatus ?? resource?.data?.status;

    if (!requestId && !transactionId) {
      this.logger.warn(`Callback Tranzak sans requestId ni transactionId: ${JSON.stringify(body)}`);
      return { success: false, message: 'Missing requestId or transactionId' };
    }

    // Priorité au requestId (REQ...) car c'est ce qu'on stocke au moment de la création
    const identifier = requestId ?? transactionId;
    return this.tranzakService.handleCallback(identifier, status ?? 'UNKNOWN', !!requestId);
  }
}
