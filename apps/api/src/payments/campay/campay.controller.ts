import { Controller, Get, Post, Body, Param, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampayService } from './campay.service';
import { CampayPaymentDto } from './dto/campay-payment.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

interface CampayCallbackBody {
  reference?: string;
  status?: string;
  id?: string;
}

@ApiTags('campay')
@Controller('payments/campay')
export class CampayController {
  private readonly logger = new Logger(CampayController.name);

  constructor(private readonly campayService: CampayService) {}

  @Get('test-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Tester l'authentification Campay" })
  async testToken() {
    const token = await this.campayService.getAccessToken();

    return {
      success: true,
      message: 'Authentification Campay réussie',
      tokenReceived: !!token,
    };
  }

  @Post('test-payment')
  @ApiOperation({ summary: 'Tester la création de paiement Campay' })
  async testPayment() {
    return this.campayService.requestPayment(
      {
        walletNumber: 'WLT0000000000',
        amount: '1000',
        phone_number: '237680657567',
        description: 'Test dépôt AllnessPay',
      },
      0,
    );
  }

  @Post('payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initier un paiement via Campay (mobile money)' })
  async createPayment(@Req() req: AuthenticatedRequest, @Body() dto: CampayPaymentDto) {
    return this.campayService.requestPayment(dto, req.user.id);
  }

  @Get('status/:transactionId')
  @ApiOperation({ summary: "Récupérer le statut d'une transaction (pour polling frontend)" })
  async getStatus(@Param('transactionId') transactionId: string) {
    return this.campayService.getPaymentStatusByTransactionId(transactionId);
  }

  @Post('verify/:transactionId')
  @ApiOperation({ summary: 'Vérifier directement le statut auprès de Campay (fallback)' })
  async verifyPayment(@Param('transactionId') transactionId: string) {
    return this.campayService.verifyAndConfirmPayment(transactionId);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Callback webhook Campay (pas de JWT)' })
  async handleCallback(@Body() body: CampayCallbackBody) {
    this.logger.log(`Callback Campay reçu: ${JSON.stringify(body)}`);

    const reference = body?.reference ?? body?.id;
    const status = body?.status;

    if (!reference) {
      this.logger.warn(`Callback Campay sans reference: ${JSON.stringify(body)}`);
      return { success: false, message: 'Missing reference' };
    }

    return this.campayService.handleCallback(reference, status ?? 'UNKNOWN');
  }
}
