import { Body, Controller, Get, Param, Post, Req, UseGuards, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators';
import { CreateStripePaymentIntentDto } from './dto/create-stripe-payment-intent.dto';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

@ApiTags('stripe')
@Controller('payments/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un PaymentIntent Stripe pour créditer un wallet' })
  async createPaymentIntent(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateStripePaymentIntentDto,
  ) {
    return this.stripeService.createPaymentIntent(dto, req.user.id);
  }

  @Get('status/:paymentIntentId')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Récupérer le statut d\'un paiement Stripe' })
  async getPaymentStatus(@Param('paymentIntentId') paymentIntentId: string) {
    // Defensive check: ensure caller passes a Stripe PaymentIntent id (starts with "pi_")
    if (!paymentIntentId || !paymentIntentId.startsWith('pi_')) {
      throw new BadRequestException('paymentIntentId invalide: attendez un identifiant Stripe (commençant par "pi_")');
    }

    return this.stripeService.getPaymentStatus(paymentIntentId);
  }

  @Post('webhook')
  @Public()
  @SkipThrottle()
  @ApiOperation({ summary: 'Webhook Stripe — confirmation du paiement' })
  async webhook(@Req() req: Request & { rawBody?: Buffer }) {
    const signatureHeader = req.headers['stripe-signature'];
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
    if (!req.rawBody) {
      throw new InternalServerErrorException('Raw body manquant pour la vérification de signature Stripe');
    }
    return this.stripeService.handleWebhook(req.rawBody, signature);
  }
}
