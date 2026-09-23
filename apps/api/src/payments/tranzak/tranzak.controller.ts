import { Controller, Get, Post, Body, Param, Req, UseGuards, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TranzakService } from './tranzak.service';
import { TranzakPaymentDto } from './dto/tranzak-payment.dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

interface TranzakCallbackBody {
  resource?: {
    requestId?: string;
    transactionId?: string;
    status?: string;
    transactionStatus?: string;
    data?: {
      requestId?: string;
      transactionId?: string;
      status?: string;
    };
  };
  requestId?: string;
  transactionId?: string;
  status?: string;
  transactionStatus?: string;
  data?: {
    requestId?: string;
    transactionId?: string;
    status?: string;
  };
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
  @ApiOperation({ summary: 'Tester la création de paiement Tranzak (redirection web)' })
  async testPayment() {
    return this.tranzakService.createPayment({
      amount: 1000,
      currencyCode: 'XAF',
      description: 'Test dépôt AllnessPay',
      mchTransactionRef: `TEST-${Date.now()}`,
      returnUrl: 'http://localhost:5173/payment/return',
    });
  }

  @Post('payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initier un paiement via Tranzak (charge directe mobile money)' })
  async createPayment(@Req() req: AuthenticatedRequest, @Body() dto: TranzakPaymentDto) {
    return this.tranzakService.initiatePayment(dto, req.user.id);
  }

  @Get('status/:transactionId')
  @ApiOperation({ summary: "Récupérer le statut d'une transaction (pour polling frontend, pas de JWT)" })
  async getStatus(@Param('transactionId') transactionId: string) {
    return this.tranzakService.getPaymentStatusByTransactionId(transactionId);
  }

  @Post('verify/:transactionId')
  @ApiOperation({ summary: 'Vérifier directement le statut auprès de Tranzak (pour fallback si callback absent)' })
  async verifyPayment(@Param('transactionId') transactionId: string) {
    return this.tranzakService.verifyAndConfirmPayment(transactionId);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Callback de confirmation Tranzak (pas de JWT)' })
  async handleCallback(@Body() body: TranzakCallbackBody) {
    this.logger.log(`Callback Tranzak reçu: ${JSON.stringify(body)}`);

    const resource = body?.resource ?? body;

    const requestId = resource?.requestId ?? resource?.data?.requestId;

    const transactionId = resource?.transactionId ?? resource?.data?.transactionId;

    const status = resource?.status ?? resource?.transactionStatus ?? resource?.data?.status;

    if (!requestId && !transactionId) {
      this.logger.warn(`Callback Tranzak sans requestId ni transactionId: ${JSON.stringify(body)}`);
      return { success: false, message: 'Missing requestId or transactionId' };
    }

    const identifier = requestId ?? transactionId ?? '';
    return this.tranzakService.handleCallback(identifier, status ?? 'UNKNOWN', !!requestId);
  }
}


// import { Controller, Get, Post, Body, Req, UseGuards, Logger } from '@nestjs/common';
// import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
// import { TranzakService } from './tranzak.service';
// import { TranzakPaymentDto } from './dto/tranzak-payment.dto';
// import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

// interface AuthenticatedRequest extends Request {
//   user: { id: number };
// }

// interface TranzakCallbackBody {
//   resource?: {
//     requestId?: string;
//     transactionId?: string;
//     status?: string;
//     transactionStatus?: string;
//     data?: {
//       requestId?: string;
//       transactionId?: string;
//       status?: string;
//     };
//   };
//   requestId?: string;
//   transactionId?: string;
//   status?: string;
//   transactionStatus?: string;
//   data?: {
//     requestId?: string;
//     transactionId?: string;
//     status?: string;
//   };
// }

// @ApiTags('tranzak')
// @Controller('payments/tranzak')
// export class TranzakController {
//   private readonly logger = new Logger(TranzakController.name);

//   constructor(private readonly tranzakService: TranzakService) {}

//   @Get('test-token')
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth('access-token')
//   @ApiOperation({ summary: "Tester l'authentification Tranzak" })
//   async testToken() {
//     const token = await this.tranzakService.getAccessToken();

//     return {
//       success: true,
//       message: 'Authentification Tranzak réussie',
//       tokenReceived: !!token,
//     };
//   }

//   @Post('test-payment')
//   //@UseGuards(JwtAuthGuard)
//   //@ApiBearerAuth('access-token')
//   @ApiOperation({ summary: 'Tester la création de paiement Tranzak' })
//   async testPayment() {
//     return this.tranzakService.createPayment({
//       amount: 1000,
//       currencyCode: 'XAF',
//       description: 'Test dépôt AllnessPay',
//       mchTransactionRef: `TEST-${Date.now()}`,
//       returnUrl: 'http://localhost:5173/payment/return',
//     });
//   }

//   @Post('payment')
//   @UseGuards(JwtAuthGuard)
//   @ApiBearerAuth('access-token')
//   @ApiOperation({ summary: 'Initier un paiement via Tranzak' })
//   async createPayment(@Req() req: AuthenticatedRequest, @Body() dto: TranzakPaymentDto) {
//     return this.tranzakService.initiatePayment(dto, req.user.id);
//   }

//   @Post('callback')
//   @ApiOperation({ summary: 'Callback de confirmation Tranzak (pas de JWT)' })
//   async handleCallback(@Body() body: TranzakCallbackBody) {
//     this.logger.log(`Callback Tranzak reçu: ${JSON.stringify(body)}`);

//     // Tranzak envoie les données dans body.resource
//     const resource = body?.resource ?? body;

//     const requestId = resource?.requestId ?? resource?.data?.requestId;

//     const transactionId = resource?.transactionId ?? resource?.data?.transactionId;

//     const status = resource?.status ?? resource?.transactionStatus ?? resource?.data?.status;

//     if (!requestId && !transactionId) {
//       this.logger.warn(`Callback Tranzak sans requestId ni transactionId: ${JSON.stringify(body)}`);
//       return { success: false, message: 'Missing requestId or transactionId' };
//     }

//     // Priorité au requestId (REQ...) car c'est ce qu'on stocke au moment de la création
//     const identifier = requestId ?? transactionId ?? '';
//     return this.tranzakService.handleCallback(identifier, status ?? 'UNKNOWN', !!requestId);
//   }
// }
