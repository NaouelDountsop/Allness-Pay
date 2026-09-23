import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WalletsService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { ResolveQrDto } from './dto/resolve-qr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
  };
}

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.walletsService.findAllForUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.walletsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletsService.update(id, req.user.sub, dto);
  }

  @Patch(':id/close')
  close(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.walletsService.close(id, req.user.sub);
  }

  @Patch(':id/set-primary')
  setPrimary(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.walletsService.setPrimary(id, req.user.sub);
  }

  @Patch(':id/activate')
  activate(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.walletsService.activate(id, req.user.sub);
  }

  @Get(':id/qr-code')
  getQrCode(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.walletsService.getQrCodeData(id, req.user.sub);
  }

  @Post('resolve-qr')
  resolveQr(@Body() dto: ResolveQrDto) {
    return this.walletsService.resolveQrCode(dto.walletNumber);
  }

  @Get('validate/:walletNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  validateByWalletNumber(@Req() req: AuthenticatedRequest, @Param('walletNumber') walletNumber: string) {
    return this.walletsService.validateByWalletNumber(walletNumber, req.user.sub);
  }
}
