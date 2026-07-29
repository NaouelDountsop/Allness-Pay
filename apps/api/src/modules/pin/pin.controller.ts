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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PinService } from './pin.service';
import { CreatePinDto, ChangePinDto, ForgotPinDto, ResetPinDto, VerifyPinDto } from './dto/pin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('wallets/:id/pin')
export class PinController {
  constructor(private readonly pinService: PinService) {}

  @Get('status')
  getPinStatus(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.pinService.getPinStatus(id, req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePinDto,
  ) {
    return this.pinService.createPin(id, req.user.id, dto);
  }

  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  changePin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangePinDto,
  ) {
    return this.pinService.changePin(id, req.user.id, dto);
  }

  @Post('forgot')
  @HttpCode(HttpStatus.NO_CONTENT)
  requestPinReset(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ForgotPinDto,
  ) {
    return this.pinService.requestPinReset(id, req.user.id, dto);
  }

  @Post('reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPinDto,
  ) {
    return this.pinService.resetPin(id, req.user.id, dto);
  }

  @Post('verify')
  verifyPin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyPinDto,
  ) {
    return this.pinService.verifyPin(id, req.user.id, dto);
  }
}