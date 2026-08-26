import { Controller, Get, Post, Body, Param, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CampayService } from './campay.service';
import { CampayPaymentDto } from './dto/campay-payment.dto';
import { CampayWithdrawDto } from './dto/campay-withdraw.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators';

interface AuthenticatedRequest extends Request {
  user: { id: number };
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

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retirer des fonds vers un compte mobile money via Campay' })
  async createWithdraw(@Req() req: AuthenticatedRequest, @Body() dto: CampayWithdrawDto) {
    return this.campayService.requestWithdraw(dto, req.user.id);
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
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: 'Callback webhook Campay (pas de JWT)' })
  async handleCallback(@Body() body: Record<string, unknown>) {
    this.logger.log(`Callback Campay reçu: ${JSON.stringify(body)}`);

    try {
      const reference = (body?.reference ?? body?.id) as string | undefined;
      const status = (body?.status ?? 'UNKNOWN') as string;

      if (!reference) {
        this.logger.warn(`Callback Campay sans reference: ${JSON.stringify(body)}`);
        return { success: false, message: 'Missing reference' };
      }

      return await this.campayService.handleCallback(reference, status);
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(`Erreur traitement callback Campay: ${err.message}`);
      return { success: false, message: err.message ?? 'Internal error' };
    }
  }

  @Post('sync')
  //@UseGuards(JwtAuthGuard)
  //@ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Synchroniser les transactions PENDING avec Campay (polling manuel)' })
  async syncPending() {
    return this.campayService.syncPendingTransactions();
  }

@Post('webhook')
@Public()
@SkipThrottle()
@ApiOperation({ summary: 'Webhook Campay — confirmation automatique de paiement' })
async webhook(@Body() payload: Record<string, unknown>) {
  this.logger.log(`========== WEBHOOK CAMPAY REÇU ==========`);
  this.logger.log(JSON.stringify(payload));

  try {
    const reference = (payload?.reference ?? payload?.id) as string | undefined;
    const status = (payload?.status ?? 'UNKNOWN') as string;

    if (!reference) {
      this.logger.warn(`Webhook Campay sans reference: ${JSON.stringify(payload)}`);
      return { success: false, message: 'Missing reference' };
    }

    return await this.campayService.handleCallback(reference, status);
  } catch (error: unknown) {
    const err = error as { message?: string };
    this.logger.error(`Erreur traitement webhook Campay: ${err.message}`);
    return { success: false, message: err.message ?? 'Internal error' };
  }
}
}

